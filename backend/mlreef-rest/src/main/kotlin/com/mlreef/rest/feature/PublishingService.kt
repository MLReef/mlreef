package com.mlreef.rest.feature

import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.EPF_CONTROLLER_PATH
import com.mlreef.rest.ParametersRepository
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.domain.BaseEnvironments
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.PipelineStatus
import com.mlreef.rest.domain.PipelineStatus.CANCELED
import com.mlreef.rest.domain.PipelineStatus.FAILED
import com.mlreef.rest.domain.PipelineStatus.PENDING
import com.mlreef.rest.domain.PipelineStatus.RUNNING
import com.mlreef.rest.domain.PipelineStatus.SUCCESS
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.PublishStatus
import com.mlreef.rest.domain.PublishStatus.INCONSISTENT
import com.mlreef.rest.domain.PublishStatus.OTHER
import com.mlreef.rest.domain.PublishStatus.OUTDATED
import com.mlreef.rest.domain.PublishStatus.PIPELINE_MISSING
import com.mlreef.rest.domain.PublishStatus.PUBLISHED
import com.mlreef.rest.domain.PublishStatus.PUBLISH_CREATED
import com.mlreef.rest.domain.PublishStatus.PUBLISH_CREATION_FAIL
import com.mlreef.rest.domain.PublishStatus.PUBLISH_FAILED
import com.mlreef.rest.domain.PublishStatus.PUBLISH_FINISHING
import com.mlreef.rest.domain.PublishStatus.PUBLISH_PENDING
import com.mlreef.rest.domain.PublishStatus.PUBLISH_STARTED
import com.mlreef.rest.domain.PublishStatus.PUBLISH_STARTING
import com.mlreef.rest.domain.PublishStatus.REPUBLISH
import com.mlreef.rest.domain.PublishStatus.UNPUBLISHED
import com.mlreef.rest.domain.PublishStatus.UNPUBLISH_CREATED
import com.mlreef.rest.domain.PublishStatus.UNPUBLISH_FAILED
import com.mlreef.rest.domain.PublishStatus.UNPUBLISH_FINISHING
import com.mlreef.rest.domain.PublishStatus.UNPUBLISH_PENDING
import com.mlreef.rest.domain.PublishStatus.UNPUBLISH_STARTED
import com.mlreef.rest.domain.PublishStatus.UNPUBLISH_STARTING
import com.mlreef.rest.domain.PublishingMachineType
import com.mlreef.rest.exceptions.AccessDeniedException
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.IncorrectApplicationConfiguration
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.PipelineCreateException
import com.mlreef.rest.exceptions.ProjectPublicationException
import com.mlreef.rest.exceptions.PublicationCommonException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.feature.processors.PythonParserService
import com.mlreef.rest.feature.processors.RepositoryService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.utils.Slugs
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.io.ClassPathResource
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.expression.ExpressionParser
import org.springframework.expression.common.TemplateParserContext
import org.springframework.expression.spel.standard.SpelExpressionParser
import org.springframework.expression.spel.support.StandardEvaluationContext
import org.springframework.scheduling.TaskScheduler
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.net.URI
import java.time.Instant
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ScheduledFuture
import java.util.stream.Collectors
import javax.annotation.PostConstruct
import javax.persistence.EntityManagerFactory
import javax.persistence.LockModeType
import javax.persistence.PersistenceUnit

const val DEFAULT_BRANCH = "master"
const val DOCKERFILE_NAME = "Dockerfile"
const val MLREEF_NAME = ".mlreef.yml"
const val PUBLISH_COMMIT_MESSAGE = "Publish: Adding $DOCKERFILE_NAME and $MLREEF_NAME files for publishing"
const val UNPUBLISH_COMMIT_MESSAGE = "Unpublish: Removing $DOCKERFILE_NAME and $MLREEF_NAME files from repository"
const val NEWLINE = "\n"
const val DEFAULT_VERSION = "1"

const val MAX_SLUG_LENGTH = 100

const val PROJECT_NAME_VARIABLE = "CI_PROJECT_SLUG"
const val IMAGE_NAME_VARIABLE = "IMAGE_NAME"
const val MAIN_SCRIPT_NAME_VARIABLE = "MAIN_SCRIPT"
const val EPF_PUBLISH_URL = "EPF_PUBLISH_URL"
const val EPF_PUBLISH_SECRET = "EPF_PUBLISH_SECRET"
const val PUBLISH_BRANCH = "PUBLISH_BRANCH"
const val PUBLISH_VERSION = "PUBLISH_VERSION"
const val PIP_SERVER_URL = "PIP_SERVER_URL"
const val DOCKER_HOST_PARAMETER = "DOCKER_HOST"
const val REQUIREMENTS_FILE = "REQUIREMENTS_FILE"

const val UNPUBLISH_PROCESSOR_ID = "UNPUBLISH_PROCESSOR_ID"
const val UNPUBLISH_IMAGE = "UNPUBLISH_IMAGE"

const val DOCKER_HOST_VALUE = "DOCKER_HOST: \"tcp://docker:2375\""
const val DEFAULT_REQUIREMENTS_FILE_NAME = "requirements.txt"


val dockerfileTemplate: String = ClassPathResource("code-publishing-dockerfile-template")
    .inputStream.bufferedReader().use {
        it.lines().collect(Collectors.joining(NEWLINE))
    }

val publishMlreefTemplate: String = ClassPathResource("code-publishing-mlreef-file-template.yml")
    .inputStream.bufferedReader().use {
        it.lines().collect(Collectors.joining(NEWLINE))
    }

val unPublishMlreefTemplate: String = ClassPathResource("code-unpublishing-mlreef-file-template.yml")
    .inputStream.bufferedReader().use {
        it.lines().collect(Collectors.joining(NEWLINE))
    }

@Service
class PublishingService(
    private val conf: ApplicationConfiguration,
    private val gitlabRestClient: GitlabRestClient,
    private val projectResolverService: ProjectResolverService,
    private val pythonParserService: PythonParserService,
    private val baseEnvironmentsRepository: BaseEnvironmentsRepository,
    private val repositoryService: RepositoryService,
    private val personRepository: PersonRepository,
    private val pipelineService: PipelineService,
    private val processorsService: ProcessorsService,
    private val parametersRepository: ParametersRepository,
    @PersistenceUnit
    private val entityManagerFactory: EntityManagerFactory,
    private val taskScheduler: TaskScheduler,
    private val codeProjectRepository: CodeProjectRepository,
) {
    final val log: Logger = LoggerFactory.getLogger(this::class.java)
    final val scheduledCleanTasks: ConcurrentHashMap<UUID, ScheduledFuture<*>> = ConcurrentHashMap()
    private val publishStatuses = listOf(PUBLISHED, PUBLISH_FINISHING)

    @PostConstruct
    fun init() {
        if (conf.epf.epfImagePath.isNullOrBlank()) throw IncorrectApplicationConfiguration("No epf image path was provided")
    }

    fun getPublishingInfoById(projectId: UUID, processorId: UUID): Processor {
        val codeProject = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        return processorsService.getProcessorById(processorId).takeIf { it?.codeProject == codeProject }
            ?: throw NotFoundException("Processor $processorId not found")
    }

    fun getPublishingInfo(projectId: UUID, branch: String? = null, version: String? = null, pageable: Pageable? = null): Iterable<Processor> {
        val project = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        return processorsService.getProcessorsForProjectAndBranchOrVersion(projectId, branch, version, pageable)
    }

    // https://docs.gitlab.com/ee/user/packages/container_registry/index.html#build-and-push-images-using-gitlab-cicd
    /**
     * A new code is "unpublished" (==> no mlreef.yml)
     * Start publishing creates a pipeline which will publish every new commit in "master" as "latest" version
     *   1. create mlreef.yml & Dockerfile
     *   2. parse data processor
     *   3. ... ?
     */
    fun startPublishing(
        mainFilePath: String? = null,
        requirementsFilePath: String? = null,
        environmentId: UUID? = null,
        branch: String? = null,
        version: String? = null,
        modelType: String? = null,
        mlCategory: String? = null,
        publisherSubjectId: UUID? = null,
        userToken: String? = null,
        projectId: UUID? = null,
        slug: String? = null,
        republishingProcessor: Processor? = null,
    ): Processor {
         val project = republishingProcessor?.codeProject
             ?: projectResolverService.resolveCodeProject(projectId = (projectId ?: throw BadRequestException("Project id can not be null")))
             ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val processor = prepareProcessorForPublishing(
            mainFilePath,
            requirementsFilePath,
            environmentId,
            branch,
            version,
            modelType,
            mlCategory,
            publisherSubjectId,
            userToken,
            project,
            slug,
            republishingProcessor
        )

        removePublicationFiles(project, processor.branch, userToken, "Clean branch '${processor.branch}' before publishing")

        val finishUrl = "${conf.epf.backendUrl}$EPF_CONTROLLER_PATH/code-projects/${project.id}"

        val filesToCommit = mapOf(
            DOCKERFILE_NAME to generateCodePublishingDockerFile(getEpfDockerImagePath(), processor.requirementsFilePath),
            MLREEF_NAME to generateCodePublishingYAML(project.name, processor.secret!!, finishUrl, processor.branch, processor.version!!, conf.epf.useDockerHost)
        )

        val commitMessage = "Publish project '${project.name}' for branch '${processor.branch}' and version '${processor.version}'"
        val commit = commitPublicationFiles(project, processor.branch, filesToCommit, userToken, commitMessage)

        if (commit == null) {
            processor.log.add(Instant.now().toString() to "Cannot commit files: $DOCKERFILE_NAME and $MLREEF_NAME")
            processorsService.saveProcessor(processor.copy(status = PUBLISH_CREATION_FAIL))
            throw PublicationCommonException(message = "Cannot commit files: $DOCKERFILE_NAME and $MLREEF_NAME")
        }

        processor.commitSha = commit.id

        return processorsService.saveProcessor(processor)
    }

    @Transactional
    fun prepareProcessorForPublishing(
        mainFilePath: String? = null,
        requirementsFilePath: String? = null,
        environmentId: UUID? = null,
        branch: String? = null,
        version: String? = null,
        modelType: String? = null,
        mlCategory: String? = null,
        publisherSubjectId: UUID? = null,
        userToken: String? = null,
        project: CodeProject,
        slug: String? = null,
        republishingProcessor: Processor? = null,
    ): Processor {
        val finalBranch = republishingProcessor?.branch ?: (branch ?: DEFAULT_BRANCH).trim()

        val finalVersion = republishingProcessor?.version
            ?: (version ?: getActualVersionForPublishing(project, finalBranch))?.trim()
            ?: throw BadRequestException("No version is provided, cannot generate autoversion")

        val existingProcessor = processorsService.getProcessorForProjectAndBranchAndVersion(project, finalBranch, finalVersion)

        val publisher = republishingProcessor?.publisher
            ?: personRepository.findByIdOrNull(publisherSubjectId ?: throw BadRequestException("Publisher id can not be null"))
            ?: throw NotFoundException("Person $publisherSubjectId not found")

        if (projectHasActivePublishPipeline(project) && republishingProcessor?.republish != true) {
            throw ProjectPublicationException(ErrorCode.ProjectIsInIncorrectState, "Cannot publish. Project has active jobs")
        }

        if (existingProcessor != null && existingProcessor.status == PUBLISHED) {
            throw ConflictException(ErrorCode.Conflict, "Project '${project.name}' (${project.id}) is already published for branch $finalBranch and version $finalVersion")
        }

        val finalScriptPath = republishingProcessor?.mainScriptPath
            ?: mainFilePath
            ?: throw NotFoundException(ErrorCode.NotFound, "No script was provided. Publishing is not available")

        val finalRequirementsPath = republishingProcessor?.requirementsFilePath ?: requirementsFilePath

        val fileInRepo = repositoryService.getFilesContentOfRepository(
            project.gitlabId,
            finalScriptPath,
            false,
            branch = finalBranch
        ).apply {
            if (this.size == 0) throw NotFoundException("No file $finalScriptPath for project '${project.name}' (${project.id}) in branch $finalBranch")
        }.first()

        val baseEnvironment = republishingProcessor?.baseEnvironment
            ?: baseEnvironmentsRepository.findByIdOrNull(environmentId ?: throw BadRequestException("Base environment id can not be null"))
            ?: throw NotFoundException(ErrorCode.NotFound, "Environment $environmentId not found")

        val parsedProcessor = pythonParserService.findAndParseDataProcessorInProject(finalBranch, finalScriptPath, project)

        if (modelType != null) {
            if (project.modelType != null && !project.modelType.equals(modelType.trim(), true)) {
                throw ConflictException("Project already has model type assigned")
            } else {
                project.modelType = modelType.trim()
            }
        }

        if (mlCategory != null) {
            if (project.mlCategory != null && !project.mlCategory.equals(mlCategory.trim(), true)) {
                throw ConflictException("Project already has ML category assigned")
            } else {
                project.mlCategory = mlCategory.trim()
            }
        }

        val secret = pipelineService.createSecret()
        val finalSlug = generateUniqueSlugForPipeline(
            Slugs.toSlug(slug ?: parsedProcessor.slug ?: "${project.slug}-processor-$finalBranch-$finalVersion", MAX_SLUG_LENGTH),
            existingProcessor?.id,
        )

        val name = parsedProcessor.name ?: project.name

        val logdate = Instant.now().toString()

        val logs = existingProcessor?.log ?: mutableListOf()
        existingProcessor?.commitSha?.let { logs.add(logdate to "Previous commit sha $it") }
        existingProcessor?.gitlabPipelineId?.let { logs.add(logdate to "Previous pipeline id $it") }
        existingProcessor?.publishedAt?.let { logs.add(logdate to "Previous publish/unpublish date $it") }
        existingProcessor?.jobStartedAt?.let { logs.add(logdate to "Previous publish/unpublish job start $it") }
        existingProcessor?.jobFinishedAt?.let { logs.add(logdate to "Previous publish/unpublish job finish $it") }
        existingProcessor?.publisher?.let { logs.add(logdate to "Previous publisher/unpublisher id ${it.id}") }
        existingProcessor?.status?.let { logs.add(logdate to "Previous status ${it.name}") }

        // PROCESSOR
        val processor = (existingProcessor ?: Processor(UUID.randomUUID())).apply {
            this.codeProject = project
            this.mainScriptPath = finalScriptPath
            this.requirementsFilePath = finalRequirementsPath
            this.name = name
            this.slug = finalSlug
            this.description = parsedProcessor.description
            this.branch = finalBranch
            this.version = finalVersion
            this.secret = secret
            this.contentSha256 = fileInRepo.sha256
            this.publishedAt = Instant.now()
            this.jobStartedAt = null
            this.jobFinishedAt = null
            this.status = PUBLISH_CREATED
            this.publisher = publisher
            this.baseEnvironment = baseEnvironment
            this.metricSchema = parsedProcessor.metricSchema
            this.log = logs
            this.gitlabPipelineId = null
            this.republish = false
        }

        val savedProcessor = processorsService.saveProcessor(processor)

        val paramsToKeep = savedProcessor.parameters.mapNotNull { param ->
            val foundParameter = parsedProcessor.parameters.find { it.name.trim().equals(param.name.trim(), true) }
            foundParameter?.let {
                param.copy(
                    group = it.group,
                    defaultValue = it.defaultValue,
                    description = it.description,
                    name = it.name,
                    parameterType = it.parameterType,
                    required = it.required,
                    order = it.order,
                    processor = savedProcessor
                )
            }
        }

        val paramsToAdd = parsedProcessor.parameters.mapNotNull { param ->
            val foundParameter = savedProcessor.parameters.find { it.name.trim().equals(param.name.trim(), true) }
            if (foundParameter == null) param.copy(processor = savedProcessor) else null
        }

        val paramsToDelete = savedProcessor.parameters.mapNotNull { param ->
            val foundParameter = parsedProcessor.parameters.find { it.name.trim().equals(param.name.trim(), true) }
            if (foundParameter == null) param else null
        }

        parametersRepository.deleteAll(paramsToDelete.map { it.copy(processor = null) })

        val savedParameters = parametersRepository.saveAll(paramsToKeep + paramsToAdd)

        savedProcessor.apply {
            this.parameters.clear()
        }.apply {
            this.parameters.addAll(savedParameters)
        }

        return processorsService.saveProcessor(processor)
    }

// https://docs.gitlab.com/ee/user/packages/container_registry/index.html#build-and-push-images-using-gitlab-cicd
    /**
     * A new code is "unpublished" (==> no mlreef.yml)
     * Start publishing creates a pipeline which will publish every new commit in "master" as "latest" version
     *   1. create mlreef.yml & Dockerfile
     *   2. parse data processor
     *   3. ... ?
     */
    @Transactional
    fun unPublishProcessor(
        userToken: String?,
        projectId: UUID?,
        branch: String,
        version: String,
        unpublisherSubjectId: UUID?,
        isProjectOwner: Boolean,
    ): Processor {
        val project = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        if (projectHasActivePublishPipeline(project)) {
            throw ProjectPublicationException(ErrorCode.ProjectIsInIncorrectState, "Cannot unpublish. Project has active jobs. Please wait until it is finished")
        }

        val processor = processorsService.getProcessorForProjectAndBranchAndVersion(project, branch, version)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no published processor for branch $branch and version $version. Probably it was published incorrectly")

        val unpublisher = unpublisherSubjectId?.let {
            personRepository.findByIdOrNull(it)
                ?: throw NotFoundException("Person $it not found")
        } ?: processor.publisher

        if (processor.status.isUnpublishing()) {
            throw ConflictException("Project $projectId is already unpublished for branch $branch and version $version")
        }

        unpublisher?.let {
            if (!isProjectOwner && processor.publisher != unpublisher) {
                throw AccessDeniedException("Processor ${processor.id} for project $projectId ($branch:$version) was not published by ${unpublisher.id}")
            }
        }

        removePublicationFiles(project, branch, userToken, "Clean branch '$branch' due to unpublish")

        val logdate = Instant.now().toString()

        val logs = processor.log
        processor.commitSha?.let { logs.add(logdate to "Previous commit sha $it") }
        processor.gitlabPipelineId?.let { logs.add(logdate to "Previous pipeline id $it") }
        processor.publishedAt?.let { logs.add(logdate to "Previous publish/unpublish date $it") }
        processor.jobStartedAt?.let { logs.add(logdate to "Previous publish/unpublish job start $it") }
        processor.jobFinishedAt?.let { logs.add(logdate to "Previous publish/unpublish job finish $it") }
        processor.publisher?.let { logs.add(logdate to "Previous publisher/unpublisher id ${it.id}") }
        processor.status.let { logs.add(logdate to "Previous status ${it.name}") }

        //We don't replace publisher, as it can be unpublished by project owner, but we need to know who was initial publisher and not to loose the owner
        if (unpublisher != processor.publisher) logs.add(logdate to "Unpublished by ${unpublisher?.id}")

        val reposList = gitlabRestClient.adminGetRepositoriesList(project.gitlabId)

        if (reposList.size == 0) throw PublicationCommonException(message = "Project ${project.name} (${project.id}) has no registry")
        if (reposList.size > 1) throw PublicationCommonException(message = "Project ${project.name} (${project.id}) has too many registries")

        gitlabRestClient.adminDeleteTagFromRepository(project.gitlabId, reposList.first().id, "${processor.branch}-${processor.version}")

        return processorsService.saveProcessor(
            processor.copy(
                //publisher = unpublisher,
                publishedAt = Instant.now(),
                jobStartedAt = null,
                jobFinishedAt = null,
                status = UNPUBLISHED,
                gitlabPipelineId = null,
                log = logs,
            )
        )
    }

    @Transactional
    fun republishProcessor(
        userToken: String,
        projectId: UUID,
        mainFilePath: String? = null,
        requirementsFilePath: String? = null,
        environmentId: UUID? = null,
        slug: String? = null,
        branch: String,
        version: String,
        republisherSubjectId: UUID,
        isProjectOwner: Boolean,
    ): Processor {
        val project = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        if (projectHasActivePublishPipeline(project)) {
            throw ProjectPublicationException(ErrorCode.ProjectIsInIncorrectState, "Cannot republish. Project has active job. Please wait until it is finished")
        }

        val processor = processorsService.getProcessorForProjectAndBranchAndVersion(project, branch, version)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no published processor for branch $branch and version $version. Probably it was published incorrectly")

        val baseEnvironment = environmentId?.let {
            baseEnvironmentsRepository.findByIdOrNull(it)
                ?: throw NotFoundException(ErrorCode.NotFound, "Environment $it not found")
        }

        val republisher = republisherSubjectId.let {
            personRepository.findByIdOrNull(it)
                ?: throw NotFoundException("Person $it not found")
        }

        if (processor.publisher != republisher && !isProjectOwner) {
            throw AccessDeniedException("Processor ${processor.id} for project $projectId ($branch:$version) was not published by ${republisher.id}")
        }

        val logdate = Instant.now().toString()

        val logs = processor.log
        mainFilePath?.let { logs.add(logdate to "Previous main script ${processor.mainScriptPath}") }
        baseEnvironment?.let { logs.add(logdate to "Previous base environment ${processor.baseEnvironment?.id}") }
        slug?.let { logs.add(logdate to "Previous slug") }

        processorsService.saveProcessor(
            processor.copy(
                mainScriptPath = mainFilePath ?: processor.mainScriptPath,
                requirementsFilePath = requirementsFilePath ?: processor.requirementsFilePath,
                baseEnvironment = baseEnvironment ?: processor.baseEnvironment,
                log = logs,
                republish = true,
            )
        )

        return unPublishProcessor(userToken, projectId, branch, version, republisherSubjectId, isProjectOwner).copy(status = REPUBLISH)
    }

    // Here we just set internal state of project to Unpublish. No any images are removed from registry
    private fun setProjectToUnpublishState(
        project: CodeProject,
        branch: String,
        version: String,
        userToken: String? = null,
        processor: Processor? = null
    ): Commit? {
        val commit = removePublicationFiles(project, branch, userToken)

        val currentProcessor = processor
            ?: processorsService.getProcessorForProjectAndBranchAndVersion(project, branch, version)

        currentProcessor?.let {
            processorsService.deleteProcessor(it)
        }

        return commit
    }

    private fun commitPublicationFiles(project: CodeProject, branch: String, fileContents: Map<String, String>, token: String? = null, message: String? = null): Commit? {
        return try {
            if (token != null) {
                gitlabRestClient.commitFiles(
                    token = token,
                    projectId = project.gitlabId,
                    targetBranch = branch,
                    commitMessage = message ?: PUBLISH_COMMIT_MESSAGE,
                    fileContents = fileContents,
                    action = "create"
                )
            } else {
                gitlabRestClient.adminCommitFiles(
                    projectId = project.gitlabId,
                    targetBranch = branch,
                    commitMessage = message ?: PUBLISH_COMMIT_MESSAGE,
                    fileContents = fileContents,
                    action = "create"
                )
            }
        } catch (e: RestException) {
            log.error("Cannot commit files ${fileContents.keys.joinToString(", ")} to branch $branch for project ${project.name}: ${e.errorName}")
            null
        }
    }

    private fun removePublicationFiles(project: CodeProject, branch: String, token: String? = null, message: String? = null): Commit? {
        val fileContents = mutableMapOf<String, String>()

        if (isPublicationFilePresent(project, branch, MLREEF_NAME)) fileContents[MLREEF_NAME] = ""
        if (isPublicationFilePresent(project, branch, DOCKERFILE_NAME)) fileContents[DOCKERFILE_NAME] = ""

        return if (fileContents.isNotEmpty()) {
            try {
                if (token != null) {
                    gitlabRestClient.commitFiles(
                        token = token,
                        projectId = project.gitlabId,
                        targetBranch = branch,
                        commitMessage = "[skip ci] ${message ?: UNPUBLISH_COMMIT_MESSAGE}",
                        fileContents = fileContents,
                        action = "delete"
                    )
                } else {
                    gitlabRestClient.adminCommitFiles(
                        projectId = project.gitlabId,
                        targetBranch = branch,
                        commitMessage = "[skip ci] ${message ?: UNPUBLISH_COMMIT_MESSAGE}",
                        fileContents = fileContents,
                        action = "delete"
                    )
                }
            } catch (e: RestException) {
                log.error("Cannot delete ${fileContents.keys.joinToString(", ")} file(s) in branch $branch for project ${project.id}: ${e.errorName}")
                null
            }
        } else null
    }

    private fun projectHasActivePublishPipeline(project: Project): Boolean {
        return gitlabRestClient.adminGetPipelines(project.gitlabId)
            .mapNotNull { PipelineStatus.fromGitlabStatusString(it.status) }
            .any { it.isActivePipeline() }
    }

    fun getBaseEnvironmentsList(): List<BaseEnvironments> {
        return baseEnvironmentsRepository.findAll().toList()
    }

    fun createBaseEnvironment(
        title: String,
        dockerImage: String,
        description: String?,
        requirements: String?,
        machineType: PublishingMachineType?,
        sdkVersion: String?
    ): BaseEnvironments {
        return baseEnvironmentsRepository.save(
            BaseEnvironments(
                UUID.randomUUID(),
                title,
                dockerImage,
                description,
                requirements,
                machineType ?: PublishingMachineType.default(),
                sdkVersion
            )
        )
    }

    fun deleteBaseEnvironment(id: UUID) {
        baseEnvironmentsRepository.delete(
            baseEnvironmentsRepository.findByIdOrNull(id)
                ?: throw NotFoundException(ErrorCode.BadParametersRequest, "Environment $id not found")
        )
    }

    @Transactional
    fun publicationJobStarted(projectId: UUID, branch: String, version: String): Processor {
        val project = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val processor = processorsService.getProcessorForProjectAndBranchAndVersion(project, branch, version)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no published processor for branch $branch and version $version. Probably it was published incorrectly")

        if (processor.status.isUnpublishing() == true) {
            processor.log.add(Instant.now().toString() to "Processor is unpublished")
            return processorsService.saveProcessor(processor)
        }

        if (processor.publishedAt == null) {
            processor.log.add(Instant.now().toString() to "Processor was not publication initiated but 'Started' was executed")
            return processorsService.saveProcessor(processor)
        }

        if (processor.jobStartedAt != null) {
            processor.log.add(Instant.now().toString() to "Publication job has already been started")
            return processorsService.saveProcessor(processor)
        }

        if (processor.jobFinishedAt != null) {
            processor.log.add(Instant.now().toString() to "Project is already published")
            return processorsService.saveProcessor(processor)
        }

        val pipeline = getPipelineForPublication(
            project.gitlabId,
            branch = branch,
            commitSha = processor.commitSha
                ?: throw InternalException("Publication has inconsistency internal state")
        )

        val em = entityManagerFactory.createEntityManager()

        em.transaction.begin()

        try {
            val processorForUpdate = em.find(Processor::class.java, processor.id, LockModeType.PESSIMISTIC_WRITE)

            val oldStatus = processorForUpdate.status

            processorForUpdate.gitlabPipelineId = pipeline?.id ?: processor.gitlabPipelineId
            processorForUpdate.jobStartedAt = Instant.now()
            processorForUpdate.status = PUBLISH_STARTING

            em.persist(processorForUpdate)
            em.flush()
            em.transaction.commit()
            val updatedProcessor = em.find(Processor::class.java, processorForUpdate.id)

            log.debug("Publishing started: ${updatedProcessor.name} [$branch:$version]  ${oldStatus.name} -> ${updatedProcessor.status.name} - (${updatedProcessor.updatedTimes})")
        } catch (ex: Exception) {
            log.error("$ex")
            em.transaction.rollback()
        } finally {
            em.close()
        }

        return processorsService.getProcessorById(processor.id)
            ?: throw InternalException("Cannot find processor ${processor.id}")
    }

    @Transactional
    fun publicationJobFinished(projectId: UUID, branch: String, version: String, dockerImageName: String?): Processor {
        val project = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val processor = processorsService.getProcessorForProjectAndBranchAndVersion(project, branch, version)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no published processor for branch $branch and version $version. Probably it was published incorrectly")

        if (processor.status.isUnpublishing() == true) {
            processor.log.add(Instant.now().toString() to "Processor is unpublished")
            return processorsService.saveProcessor(processor)
        }

        if (processor.jobFinishedAt != null) {
            processor.log.add(Instant.now().toString() to "Incorrect 'Finish' publication command. Project is already published")
            return processorsService.saveProcessor(processor)
        }

        if (processor.publishedAt == null) {
            processor.log.add(Instant.now().toString() to "Processor was not publication initiated but 'Finish' was executed")
            return processorsService.saveProcessor(processor)
        }

        if (processor.jobStartedAt == null) {
            processor.log.add(Instant.now().toString() to "Publication job was not started")
            processor.jobStartedAt = Instant.now()
        }

        val files = repositoryService.getFilesContentOfRepository(
            project.gitlabId,
            processor.mainScriptPath
                ?: throw NotFoundException(
                    ErrorCode.NotFound,
                    "Project $projectId has no file ${processor.mainScriptPath}. Probably it was published incorrectly"
                ),
            false,
            branch = branch
        )

        val pipeline = getPipelineForPublication(
            project.gitlabId,
            branch = branch,
            commitSha = processor.commitSha ?: throw InternalException("Publication has inconsistency internal state")
        )

        val em = entityManagerFactory.createEntityManager()

        em.transaction.begin()

        try {
            val processorForUpdate = em.find(Processor::class.java, processor.id, LockModeType.PESSIMISTIC_WRITE)

            val oldStatus = processorForUpdate.status

            processorForUpdate.jobFinishedAt = Instant.now()
            processorForUpdate.imageName = dockerImageName
            processorForUpdate.gitlabPipelineId = pipeline?.id ?: processor.gitlabPipelineId

            if (files.size > 1) {
                processorForUpdate.log.add(Instant.now().toString() to "There was something wrong in data processor recognition for project $projectId. More than one file was returned from repository")
                processorForUpdate.status = INCONSISTENT
            } else if (files.size == 0) {
                processorForUpdate.log.add(Instant.now().toString() to "Main script was not found in repository for project $projectId during 'Finish publish' command.")
                processorForUpdate.status = INCONSISTENT
            } else if (files[0].sha256 != processor.contentSha256) {
                processorForUpdate.log.add(Instant.now().toString() to "Main script was changed for project $projectId after last publish. 'Outdated' status will be set")
                processorForUpdate.status = OUTDATED
            } else {
                processorForUpdate.status = PUBLISH_FINISHING
            }

            removePublicationFiles(project, branch, message = "Clean branch '$branch' after success publication")
                ?: log.warn("Publication was not cleaned after finish for branch '$branch'")

            em.persist(processorForUpdate)
            em.flush()
            em.transaction.commit()
            val updatedProcessor = em.find(Processor::class.java, processor.id)

            log.debug("Publication finished: ${updatedProcessor.name} [${updatedProcessor.branch}:${updatedProcessor.version}] ${oldStatus.name} -> ${updatedProcessor.status.name} - (${updatedProcessor.updatedTimes})")
        } catch (ex: Exception) {
            log.error("$ex")
            em.transaction.rollback()
        } finally {
            em.close()
        }

        return processorsService.getProcessorById(processor.id)
            ?: throw InternalException("Cannot find processor ${processor.id}")
    }

    @Transactional
    fun unPublishingJobStarted(projectId: UUID, processorId: UUID): Processor {
        val project = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val processor = processorsService.getProcessorById(processorId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no published processor $processorId")

        val pipeline = getPipelineForPublication(
            project.gitlabId,
            branch = processor.branch,
            commitSha = processor.commitSha
                ?: throw InternalException("Unpublishing has inconsistency internal state")
        )

        val em = entityManagerFactory.createEntityManager()

        em.transaction.begin()

        try {
            val processorForUpdate = em.find(Processor::class.java, processor.id, LockModeType.PESSIMISTIC_WRITE)

            val oldStatus = processorForUpdate.status

            processorForUpdate.gitlabPipelineId = pipeline?.id ?: processor.gitlabPipelineId
            processorForUpdate.jobStartedAt = Instant.now()
            processorForUpdate.status = UNPUBLISH_STARTED

            em.persist(processorForUpdate)
            em.flush()
            em.transaction.commit()
            val updatedProcessor = em.find(Processor::class.java, processorForUpdate.id)

            log.debug("Unpublishing started: ${updatedProcessor.name} [$processorId]  ${oldStatus.name} -> ${updatedProcessor.status.name} - (${updatedProcessor.updatedTimes})")
        } catch (ex: Exception) {
            log.error("$ex")
            em.transaction.rollback()
        } finally {
            em.close()
        }

        return processorsService.getProcessorById(processor.id)
            ?: throw InternalException("Cannot find processor ${processor.id}")
    }

    @Transactional
    fun unPublishingJobFinished(projectId: UUID, processorId: UUID): Processor {
        val project = projectResolverService.resolveCodeProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val processor = processorsService.getProcessorById(processorId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no published processor $processorId")

        val pipeline = getPipelineForPublication(
            project.gitlabId,
            branch = processor.branch,
            commitSha = processor.commitSha ?: throw InternalException("Unpublishing has inconsistency internal state")
        )

        val em = entityManagerFactory.createEntityManager()

        em.transaction.begin()

        try {
            val processorForUpdate = em.find(Processor::class.java, processor.id, LockModeType.PESSIMISTIC_WRITE)

            val oldStatus = processorForUpdate.status

            processorForUpdate.jobFinishedAt = Instant.now()
            processorForUpdate.gitlabPipelineId = pipeline?.id ?: processor.gitlabPipelineId
            processorForUpdate.status = UNPUBLISH_FINISHING

            removePublicationFiles(project, processorForUpdate.branch, message = "Clean branch '${processorForUpdate.branch}' after success unpublishing")
                ?: log.warn("Publication was not cleaned after finish for branch '${processorForUpdate.branch}'")

            em.persist(processorForUpdate)
            em.flush()
            em.transaction.commit()
            val updatedProcessor = em.find(Processor::class.java, processor.id)

            log.debug("Unpublishing finished: ${updatedProcessor.name} [${updatedProcessor.branch}:${updatedProcessor.version}] ${oldStatus.name} -> ${updatedProcessor.status.name} - (${updatedProcessor.updatedTimes})")
        } catch (ex: Exception) {
            log.error("$ex")
            em.transaction.rollback()
        } finally {
            em.close()
        }

        val updatedProcessor = processorsService.getProcessorById(processor.id)
            ?: throw InternalException("Cannot find processor ${processor.id}")

        return if (updatedProcessor.republish) {
            this.startPublishing(republishingProcessor = updatedProcessor)
        } else {
            updatedProcessor
        }
    }

    private fun isProjectPublished(project: CodeProject): Boolean {
        return processorsService.getProcessorsForProjectAndBranchOrVersion(project.id).any { it.status == PUBLISHED }
    }

    private fun isProjectPublishedForBranch(project: CodeProject, branch: String): Boolean {
        return processorsService.getProcessorsForProjectAndBranchOrVersion(project.id, branch).any { it.status == PUBLISHED }
    }

    private fun isProjectPublishedForBranchAndVersion(project: CodeProject, branch: String, version: String): Boolean {
        return processorsService.getProcessorsForProjectAndBranchOrVersion(project.id, branch, version).any { it.status == PUBLISHED }
    }

    private fun isPublicationFilePresent(project: Project, branch: String, fileName: String): Boolean {
        return repositoryService.findFileInRepository(project.gitlabId, fileName, branch = branch) != null
    }

    private fun generateCodePublishingYAML(
        projectName: String,
        secret: String,
        finishUrl: String,
        branch: String,
        version: String,
        userDockerHost: Boolean
    ): String {
        val expressionParser: ExpressionParser = SpelExpressionParser()
        val context = StandardEvaluationContext()

        context.setVariable(PROJECT_NAME_VARIABLE, adaptProjectName(projectName))
        context.setVariable(EPF_PUBLISH_URL, finishUrl)
        context.setVariable(EPF_PUBLISH_SECRET, secret)
        context.setVariable(PUBLISH_BRANCH, branch)
        context.setVariable(PUBLISH_VERSION, version)
        context.setVariable(DOCKER_HOST_PARAMETER, if (userDockerHost) DOCKER_HOST_VALUE else "")

        val template = try {
            val expression = expressionParser.parseExpression(publishMlreefTemplate, TemplateParserContext())
            expression.getValue(context) as String
        } catch (ex: Exception) {
            log.error("Cannot parse file $publishMlreefTemplate: $ex")
            null
        }

        return template ?: throw InternalException("Template cannot be parsed")
    }

    private fun generateUnpublishingYAML(
        projectName: String,
        secret: String,
        finishUrl: String,
        processorId: String,
        imageName: String,
        branch: String,
        userDockerHost: Boolean,
    ): String {
        val expressionParser: ExpressionParser = SpelExpressionParser()
        val context = StandardEvaluationContext()

        context.setVariable(PROJECT_NAME_VARIABLE, adaptProjectName(projectName))
        context.setVariable(EPF_PUBLISH_URL, finishUrl)
        context.setVariable(EPF_PUBLISH_SECRET, secret)
        context.setVariable(UNPUBLISH_PROCESSOR_ID, processorId)
        context.setVariable(UNPUBLISH_IMAGE, imageName)
        context.setVariable(PUBLISH_BRANCH, branch)
        context.setVariable(DOCKER_HOST_PARAMETER, if (userDockerHost) DOCKER_HOST_VALUE else "")

        val template = try {
            val expression = expressionParser.parseExpression(unPublishMlreefTemplate, TemplateParserContext())
            expression.getValue(context) as String
        } catch (ex: Exception) {
            log.error("Cannot parse file $unPublishMlreefTemplate: $ex")
            null
        }

        return template ?: throw InternalException("Template cannot be parsed")
    }

    private fun generateCodePublishingDockerFile(imageName: String, requirementsFileName: String?): String {
        val expressionParser: ExpressionParser = SpelExpressionParser()
        val context = StandardEvaluationContext()

        context.setVariable(IMAGE_NAME_VARIABLE, adaptProjectName(imageName))
        context.setVariable(PIP_SERVER_URL, getPipServerUrl())
        context.setVariable(REQUIREMENTS_FILE, requirementsFileName ?: DEFAULT_REQUIREMENTS_FILE_NAME)

        val template = try {
            val expression = expressionParser.parseExpression(dockerfileTemplate, TemplateParserContext())
            expression.getValue(context) as String
        } catch (ex: Exception) {
            log.error("Cannot parse file $dockerfileTemplate: $ex")
            null
        }

        return template ?: throw InternalException("Template cannot be parsed")
    }

    private fun adaptProjectName(projectName: String): String =
        projectName
            .replace(" ", "_")
            .toLowerCase()

    private fun getEpfDockerImagePath(): String {
        return conf.epf.epfImagePath!!
    }

    private fun getPipServerUrl(): String {
        val pipServerUrl = conf.epf.pipServer?.trim()
        return if (!pipServerUrl.isNullOrBlank()) {
            try {
                val pipHost = URI(pipServerUrl).host
                " -i ${pipServerUrl} --trusted-host $pipHost "
            } catch (ex: Exception) {
                log.error("Cannot parse pip server URI $pipServerUrl")
                " "
            }
        } else " "
    }

    private fun getDomainName(): String {
        try {
            if (conf.epf.backendUrl.isBlank()) return ""
            val uri = URI(conf.epf.backendUrl)
            return if (uri.host.startsWith("backend.")) uri.host.substring(8) else uri.host
        } catch (ex: Exception) {
            log.error("Cannot get domain: $ex")
            return ""
        }
    }

    private fun getPipelineForPublication(
        projectId: Long,
        pipelineId: Long? = null,
        branch: String? = null,
        commitSha: String? = null
    ): GitlabPipeline? {
        return try {
            if (pipelineId != null) {
                gitlabRestClient.adminGetPipeline(projectId, pipelineId)
            } else if (branch != null && commitSha != null) {
                gitlabRestClient.adminGetPipelines(projectId, ref = branch, sha = commitSha)
                    .find { it.ref == branch && it.sha == commitSha }
            } else {
                throw BadRequestException("Either pipeline id or branch with commit sha must be present")
            }
        } catch (ex: Exception) {
            log.error("Cannot get pipeline from gitlab: $ex")
            null
        }
    }

    private fun getActualVersionForPublishing(codeProject: CodeProject, branch: String): String? {
        val processors = processorsService.getProcessorsForProjectAndBranchOrVersion(codeProject.id, branch)
            .sortedByDescending { it.version?.toLongOrNull() }

        val maxVersion = processors.firstOrNull()?.version?.toLongOrNull()

        return try {
            if (processors.size == 0) {
                DEFAULT_VERSION
            } else if (maxVersion != null) {
                (maxVersion + 1L).toString()
            } else null
        } catch (ex: Exception) {
            log.error("Cannot generate auto version")
            null
        }
    }

    private fun generateUniqueSlugForPipeline(slug: String, ignoreId: UUID? = null): String {
        var processor = processorsService.getProcessorBySlug(slug)
        if (processor == null || ignoreId?.let { processor!!.id == it } == true) return slug

        for (i in 1..Long.MAX_VALUE) {
            val newSlug = if ((slug.length + i.toString().length + 1) > MAX_SLUG_LENGTH) {
                slug.substring(0, slug.length - i.toString().length - 1) + "-$i"
            } else {
                "$slug-$i"
            }
            processor = processorsService.getProcessorBySlug(newSlug)
            if (processor == null || ignoreId?.let { processor.id == it } == true) return newSlug
        }

        throw PipelineCreateException(message = "Cannot generate unique slug for processor $slug")
    }

    ///// ASYNC METHODS

    //TODO: Careful!!!!, the logic was checked but it still can be errorness because of rewriting entities
    @Scheduled(
        fixedRateString = "\${mlreef.epf.update-publish-pipeline-status-interval-msec:10000}",
        initialDelayString = "\${mlreef.epf.delay-scheduled-publish-tasks-msec:500}",
    )
    @Transactional //(propagation = Propagation.REQUIRES_NEW)
    fun updatePipelineStatuses() {
        try {
            val processorsInRunningState = processorsService.getProcessorsByPublishStatuses(
                listOf(
                    PUBLISH_CREATED,
                    PUBLISH_PENDING,
                    PUBLISH_STARTING,
                    PUBLISH_STARTED,
                    PUBLISH_FINISHING,
                    UNPUBLISH_CREATED,
                    UNPUBLISH_PENDING,
                    UNPUBLISH_STARTING,
                    UNPUBLISH_STARTED,
                    UNPUBLISH_FINISHING
                ),
            )

            val timeToFail = Instant.now().minusSeconds(conf.epf.timeToConsiderPipelineFailedSec)

            val updatedProcessors = processorsInRunningState.filter { it.codeProject != null }.map { processor ->
                val pipeline = getPipelineForPublication(
                    processor.codeProject!!.gitlabId,
                    processor.gitlabPipelineId,
                    processor.branch,
                    processor.commitSha
                )

                val processorIsOutdated =
                    (processor.publishedAt == null || processor.publishedAt!!.isBefore(timeToFail))

                if (pipeline == null && processorIsOutdated) {
                    processor.copy(status = PIPELINE_MISSING)
                } else if (pipeline != null) {
                    val pipelineStatus = PublishStatus.fromGitlabStatusString(pipeline.status)!!
                    val publishStatus = PublishStatus.pipelineToPublishStatus(pipelineStatus, processor.status.isPublishing() ?: true)

                    if (processorIsOutdated && (pipelineStatus == PENDING || pipelineStatus == PipelineStatus.OTHER)) {
                        if (processor.status.isUnpublishing() != false) {
                            processor.copy(status = UNPUBLISH_FAILED)
                        } else {
                            processor.copy(status = PUBLISH_FAILED)
                        }
                    } else if (!processor.status.canUpdateTo(publishStatus)) {
                        null
                    } else if (pipelineStatus == PENDING || pipelineStatus == RUNNING || pipelineStatus == SUCCESS || pipelineStatus == FAILED || pipelineStatus == CANCELED) {
                        processor.copy(status = publishStatus)
                    } else null
                } else null
            }.filterNotNull()

            updatedProcessors.forEach { processor ->
                val em = entityManagerFactory.createEntityManager()
                em.transaction.begin()
                try {
                    val processorForUpdate = em.find(Processor::class.java, processor.id, LockModeType.PESSIMISTIC_WRITE)

                    log.debug("Update processor: ${processorForUpdate.name} [${processorForUpdate.branch}:${processorForUpdate.version}] ${processorForUpdate.status.name} -> ${processor.status.name} - (${processorForUpdate.updatedTimes})")

                    if (processorForUpdate.status.canUpdateTo(processor.status)) {
                        processorForUpdate.status = processor.status
                        em.persist(processorForUpdate)
                        em.flush()
                        em.transaction.commit()
                        val updatedProcessor = em.find(Processor::class.java, processor.id)
                        log.debug("Release processor: ${updatedProcessor.name} [${updatedProcessor.branch}:${updatedProcessor.version}] - ${updatedProcessor.status} (${updatedProcessor.updatedTimes}) --- $${updatedProcessor.jobStartedAt}")
                    } else {
                        log.debug("Release processor: ${processorForUpdate.name} [${processorForUpdate.branch}:${processorForUpdate.version}] - NO UPDATE")
                        em.transaction.rollback()
                    }
                } catch (ex: Exception) {
                    log.error("$ex")
                    em.transaction.rollback()
                } finally {
                    em.close()
                }
            }
        } catch (ex: Exception) {
            log.error("Exception during publishing status update. $ex")
        }
    }

    @Scheduled(
        fixedRateString = "\${mlreef.epf.update-published-processors-exceed-limit-msec:10000}",
        initialDelayString = "\${mlreef.epf.delay-scheduled-publish-tasks-msec:1000}",
    )
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun cleanProcessorsExceedLimits() {
        val exceedProcessorsMainBranch = processorsService.getProjectsWithProcessorsExceedNumber(conf.epf.maxProcessorsForMainBranch, forBranch = conf.epf.mainPublishBranch, statuses = listOf(PUBLISHED))

        exceedProcessorsMainBranch.forEach {
            if (!scheduledCleanTasks.containsKey(it.first)) {
                log.debug("Clean project ${it.first} for branch ${it.second}. Processors count ${it.third} exceeds the limit ${conf.epf.maxProcessorsForMainBranch}")
                val cleanTask = CleanProcessors(it.first, it.second, conf.epf.maxProcessorsForMainBranch)
                scheduledCleanTasks.put(it.first, taskScheduler.schedule(cleanTask, Instant.now()))
            }
        }

        val exceedProcessorsNotMainBranch = processorsService.getProjectsWithProcessorsExceedNumber(conf.epf.maxProcessorsForNonmainBranch, notForBranch = conf.epf.mainPublishBranch, statuses = listOf(PUBLISHED))

        exceedProcessorsNotMainBranch.forEach {
            if (!scheduledCleanTasks.containsKey(it.first)) {
                log.debug("Clean project ${it.first} for branch ${it.second}. Processors count ${it.third} exceeds the limit ${conf.epf.maxProcessorsForNonmainBranch}")
                val cleanTask = CleanProcessors(it.first, it.second, conf.epf.maxProcessorsForNonmainBranch)
                scheduledCleanTasks.put(it.first, taskScheduler.schedule(cleanTask, Instant.now()))
            }
        }
    }

    private inner class CleanProcessors(
        private val codeProjectId: UUID,
        private val branch: String,
        private val limit: Int,
    ) : Runnable {
        private val pauseBetweenStatusCheckMsec = 10000L
        private val timeToWaitForUnpublishSec = 60L * 30L //30 minutes
        private val statusesForBreak = setOf(UNPUBLISHED, UNPUBLISH_FAILED, OTHER, UNPUBLISH_FINISHING, PIPELINE_MISSING, OUTDATED, INCONSISTENT, PUBLISHED, PUBLISH_FAILED)

        //        @Transactional
        // Transaction doesn't work here. Don't use internal objects. Also be careful calling unPublishProcessor, the method also is being run out of Transactional annotation. STUPID Hibernate!
        override fun run() {
            val publishedProcessors = processorsService
                .getProcessorsForProjectAndBranchAndStatuses(codeProjectId, branch, listOf(PUBLISHED))
                .sortedBy { it.publishedAt }

            var cleanedCount = 0
            val cleanCount = publishedProcessors.size - limit
            var commonResult = true

            while (cleanedCount < cleanCount) {
                val processorForUnpublish = publishedProcessors.getOrNull(cleanedCount)
                val result = try {
                    val unpublishStart = Instant.now()

                    unPublishProcessor(
                        userToken = null,
                        projectId = codeProjectId,
                        branch = branch,
                        version = processorForUnpublish?.version ?: throw InternalException("Processor has no version"),
                        unpublisherSubjectId = null,
                        isProjectOwner = true,
                    )

                    while (Instant.now().minusSeconds(timeToWaitForUnpublishSec).isBefore(unpublishStart)) {
                        val currentStatus = processorsService.getProcessorById(processorForUnpublish.id)?.status ?: OTHER
                        if (statusesForBreak.contains(currentStatus)) {
                            break
                        } else {
                            Thread.sleep(pauseBetweenStatusCheckMsec)
                        }
                    }

                    statusesForBreak.contains(processorsService.getProcessorById(processorForUnpublish.id)?.status)
                } catch (ex: Exception) {
                    log.error("Cannot unpublish processor for project $codeProjectId processor ${processorForUnpublish?.id}. Exception: $ex")
                    false
                } finally {
                    cleanedCount++
                }

                commonResult = commonResult && result
            }

            scheduledCleanTasks.remove(codeProjectId)
        }
    }
}

