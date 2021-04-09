package com.mlreef.rest.feature

import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.EPF_CONTROLLER_PATH
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.Project
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.PublishingMachineType
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.IncorrectApplicationConfiguration
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.PipelineStartException
import com.mlreef.rest.exceptions.ProjectPublicationException
import com.mlreef.rest.exceptions.PythonFileParsingException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.feature.data_processors.DataProcessorService
import com.mlreef.rest.feature.data_processors.PythonParserService
import com.mlreef.rest.feature.data_processors.RepositoryService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.project.ProjectResolverService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.io.ClassPathResource
import org.springframework.data.repository.findByIdOrNull
import org.springframework.expression.ExpressionParser
import org.springframework.expression.common.TemplateParserContext
import org.springframework.expression.spel.standard.SpelExpressionParser
import org.springframework.expression.spel.support.StandardEvaluationContext
import org.springframework.stereotype.Service
import java.net.URI
import java.time.ZonedDateTime
import java.util.UUID
import java.util.stream.Collectors
import javax.annotation.PostConstruct

const val TARGET_BRANCH = "master"
const val DOCKERFILE_NAME = "Dockerfile"
const val MLREEF_NAME = ".mlreef.yml"
const val PUBLISH_COMMIT_MESSAGE = "Publish: Adding $DOCKERFILE_NAME and $MLREEF_NAME files for publishing"
const val UNPUBLISH_COMMIT_MESSAGE = "Unpublish: Removing $DOCKERFILE_NAME and $MLREEF_NAME files from repository"
const val NEWLINE = "\n"

const val PROJECT_NAME_VARIABLE = "CI_PROJECT_SLUG"
const val IMAGE_NAME_VARIABLE = "IMAGE_NAME"
const val MAIN_SCRIPT_NAME_VARIABLE = "MAIN_SCRIPT"
const val EPF_PUBLISH_URL = "EPF_PUBLISH_URL"
const val EPF_PUBLISH_SECRET = "EPF_PUBLISH_SECRET"
const val PIP_SERVER_URL = "PIP_SERVER_URL"


val dockerfileTemplate: String = ClassPathResource("code-publishing-dockerfile-template")
    .inputStream.bufferedReader().use {
        it.lines().collect(Collectors.joining(NEWLINE))
    }

val mlreefTemplate: String = ClassPathResource("code-publishing-mlreef-file-template.yml")
    .inputStream.bufferedReader().use {
        it.lines().collect(Collectors.joining(NEWLINE))
    }

@Service
class PublishingService(
    private val conf: ApplicationConfiguration,
    private val gitlabRestClient: GitlabRestClient,
    private val projectResolverService: ProjectResolverService,
    private val dataProcessorService: DataProcessorService,
    private val pythonParserService: PythonParserService,
    private val baseEnvironmentsRepository: BaseEnvironmentsRepository,
    private val repositoryService: RepositoryService,
    private val subjectRepository: SubjectRepository,
    private val pipelineService: PipelineService,
) {
    final val log: Logger = LoggerFactory.getLogger(this::class.java)

    @PostConstruct
    fun init() {
        if (conf.epf.epfImagePath.isNullOrBlank()) throw IncorrectApplicationConfiguration("No epf image path was provided")
    }

    fun getPublishingInfo(projectId: UUID): ProcessorVersion {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        if (!isProjectPublished(project)) throw ProjectPublicationException(
            ErrorCode.ProjectIsInIncorrectState,
            "Project is not published"
        )

        return dataProcessorService.getProcessorVersionByProjectId(project.id)
            ?: throw NotFoundException(ErrorCode.NotFound, "Data processor for $projectId not found")
    }

    //TODO: the chanin CodeProject->DataProcessor->ProcessorVersion needs to be reviewed and maybe totally refactored!!!!
    // https://docs.gitlab.com/ee/user/packages/container_registry/index.html#build-and-push-images-using-gitlab-cicd
    /**
     * A new code is "unpublished" (==> no mlreef.yml)
     * Start publishing creates a pipeline which will publish every new commit in "master" as "latest" version
     *   1. create mlreef.yml & Dockerfile
     *   2. parse data processor
     *   3. ... ?
     */
    fun startPublishing(
        mainFilePath: String?,
        environmentId: UUID,
        modelType: String?,
        mlCategory: String?,
        publisherSubjectId: UUID,
        userToken: String,
        projectId: UUID,
    ): ProcessorVersion {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val publisher = subjectRepository.findByIdOrNull(publisherSubjectId)

        if (projectHasActivePublishPipeline(project)) throw ProjectPublicationException(ErrorCode.ProjectIsInIncorrectState, "Project is in publishing state")
        if (isProjectPublished(project, userToken)) throw ConflictException(ErrorCode.Conflict, "Project is already published")

        val baseEnvironment = baseEnvironmentsRepository.findByIdOrNull(environmentId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Environment $environmentId not found")

        val parsedProcessor = pythonParserService.findAndParseDataProcessorInProject(projectId, mainFilePath)
        val parsedVersion = parsedProcessor.processorVersion
            ?: throw PythonFileParsingException("No processor version found in script")

        val dataProcessorId = UUID.randomUUID()

        // DATA PROCESSOR
        var existingDataProcessor = dataProcessorService.getProcessorByProjectId(project.id)
            ?: dataProcessorService.createForCodeProject(
                id = dataProcessorId,
                name = parsedProcessor.name,
                slug = "data-proc-$dataProcessorId",
                parameters = listOf(),
                author = parsedProcessor.author,
                description = parsedProcessor.description,
                visibilityScope = parsedProcessor.visibilityScope,
                outputDataType = parsedProcessor.outputDataType,
                inputDataType = parsedProcessor.inputDataType,
                codeProject = project as CodeProject,
                command = "command $dataProcessorId",
                type = parsedProcessor.type,
            )

        // PROCESSOR VERSION
        val existingDataProcessorVersion = dataProcessorService.getProcessorVersionByProjectId(project.id)
            ?: parsedVersion

        val secret = pipelineService.createSecret()
        val finishUrl = "${conf.epf.backendUrl}$EPF_CONTROLLER_PATH/code-projects/${project.id}"

        val commitMessage = try {
            gitlabRestClient.commitFiles(
                token = userToken,
                projectId = project.gitlabId,
                targetBranch = TARGET_BRANCH,
                commitMessage = PUBLISH_COMMIT_MESSAGE,
                fileContents = mapOf(
                    DOCKERFILE_NAME to generateCodePublishingDockerFile(getEpfDockerImagePath()),
                    MLREEF_NAME to generateCodePublishingYAML(project.name, secret, finishUrl)
                ),
                action = "create"
            )
        } catch (e: RestException) {
            throw PipelineStartException("Cannot commit $DOCKERFILE_NAME file to branch $TARGET_BRANCH for project ${project.name}: ${e.errorName}")
        }

        existingDataProcessor = dataProcessorService.saveDataProcessor(existingDataProcessor)

        val newProcessorVersion = existingDataProcessorVersion.copy(
            dataProcessor = existingDataProcessor,
            baseEnvironment = baseEnvironment,
            baseEnvironmentId = baseEnvironment.id,
            modelType = modelType,
            mlCategory = mlCategory,
            publishingInfo = PublishingInfo(commitSha = commitMessage.id, publishedAt = ZonedDateTime.now(), secret = secret, publisher = publisher),
            path = parsedVersion.path,
            branch = parsedVersion.branch,
            command = "",
            parameters = parsedVersion.parameters.map { it.copy(processorVersionId = existingDataProcessorVersion.id) },
        )

        dataProcessorService.saveDataProcessor(
            existingDataProcessor.copy(processorVersion = newProcessorVersion)
        )

        return newProcessorVersion
    }

// https://docs.gitlab.com/ee/user/packages/container_registry/index.html#build-and-push-images-using-gitlab-cicd
    /**
     * A new code is "unpublished" (==> no mlreef.yml)
     * Start publishing creates a pipeline which will publish every new commit in "master" as "latest" version
     *   1. create mlreef.yml & Dockerfile
     *   2. parse data processor
     *   3. ... ?
     */
    fun unPublishProject(userToken: String, projectId: UUID, exceptionIfNotPublished: Boolean = true): Commit? {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        if (projectHasActivePublishPipeline(project)) throw ProjectPublicationException(ErrorCode.ProjectIsInIncorrectState, "Cannot unpublish. Project is publishing. Please wait until it is finished")

        if (isPublishingInCorruptedState(project)) {
            setProjectToUnpublishState(project, userToken)
        }

        val published = isProjectPublished(project, userToken)

        if (!published && exceptionIfNotPublished) {
            throw ProjectPublicationException(ErrorCode.ProjectIsInIncorrectState, "Project is not published yet")
        }

        return if (published) setProjectToUnpublishState(project, userToken).first else null
    }

    // Here we just set internal state of project to Unpublish. No any images are removed from registry
    private fun setProjectToUnpublishState(project: Project, userToken: String? = null, processorVersion: ProcessorVersion? = null): Pair<Commit?, ProcessorVersion?> {
        val commit = userToken?.let {
            try {
                gitlabRestClient.commitFiles(
                    token = it,
                    projectId = project.gitlabId,
                    targetBranch = TARGET_BRANCH,
                    commitMessage = UNPUBLISH_COMMIT_MESSAGE,
                    fileContents = mapOf(
                        DOCKERFILE_NAME to "",
                        MLREEF_NAME to ""
                    ),
                    action = "delete"
                )
            } catch (e: RestException) {
                log.error("Cannot delete $DOCKERFILE_NAME and $MLREEF_NAME files in branch $TARGET_BRANCH for project ${project.id}: ${e.errorName}")
                null
            }
        }

        val currentProcessorVersion = processorVersion
            ?: dataProcessorService.getProcessorVersionByProjectId(project.id)

        val resultProcessorVersion = currentProcessorVersion?.let {
            val publishInfo = it.publishingInfo?.copy(
                finishedAt = null,
            ) ?: PublishingInfo(finishedAt = null)

            dataProcessorService.saveProcessorVersion(
                it.copy(
                    path = null,
                    publishingInfo = publishInfo,
                    command = "",
                    parameters = listOf(),
                    contentSha256 = null
                )
            )
        }

        return Pair(commit, resultProcessorVersion)
    }

    private fun projectHasActivePublishPipeline(project: Project): Boolean {
        val pipelines = gitlabRestClient.adminGetPipelines(project.gitlabId).filter {
            it.status.equals("created", true) ||
                it.status.equals("pending", true) ||
                it.status.equals("preparing", true) ||
                it.status.equals("running", true)
        }

        return (pipelines.size > 0)
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

    fun rescanProcessorSource(projectId: UUID, dockerImageName: String?): ProcessorVersion {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val dataProcessorVersion = dataProcessorService.getProcessorVersionByProjectId(project.id)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no data process. Probably it was published incorrectly")

        val files = repositoryService.getFilesContentOfRepository(
            project.gitlabId,
            dataProcessorVersion.path
                ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId has no main script. Probably it was published incorrectly"),
            false)

        return if (files.size > 1) {
            throw InternalException("There was something wrong in data processor recognition for project $projectId. More than one file was returned from repository")
        } else if (files.size == 0) {
            log.warn("Main script was not found in repository for project $projectId. Data processor will be cleaned")

            setProjectToUnpublishState(project, processorVersion = dataProcessorVersion).second
                ?: dataProcessorVersion
        } else if (files[0].sha256 != dataProcessorVersion.contentSha256) {
            log.warn("Main script was changed for project $projectId. Data processor will be updated")

            val mainScript = files[0]

            val newDataProcessorVersion = pythonParserService.findAndParseDataProcessorInProject(projectId, mainScript.path).processorVersion
                ?: throw PythonFileParsingException("No processor version found in script")

            val publishInfo = dataProcessorVersion.publishingInfo?.copy(
                commitSha = mainScript.lastCommitId ?: "",
                publishedAt = ZonedDateTime.now(),
                finishedAt = ZonedDateTime.now(),
            ) ?: PublishingInfo(commitSha = mainScript.lastCommitId
                ?: "", publishedAt = ZonedDateTime.now(), finishedAt = ZonedDateTime.now())

            dataProcessorService.saveProcessorVersion(
                dataProcessorVersion.copy(
                    publishingInfo = publishInfo,
                    path = newDataProcessorVersion.path,
                    branch = newDataProcessorVersion.branch,
                    command = dockerImageName ?: "",
                    parameters = newDataProcessorVersion.parameters.map { it.copy(processorVersionId = dataProcessorVersion.id) },
                    contentSha256 = dataProcessorVersion.contentSha256
                )
            )
        } else {
            val publishInfo = dataProcessorVersion.publishingInfo?.copy(
                finishedAt = ZonedDateTime.now(),
            ) ?: PublishingInfo(finishedAt = ZonedDateTime.now())

            dataProcessorService.saveProcessorVersion(
                dataProcessorVersion.copy(
                    publishingInfo = publishInfo,
                    command = dockerImageName ?: "",
                )
            )
        }
    }

    private fun isPublishingInCorruptedState(project: Project): Boolean {
        val mlreefInRepo = repositoryService.findFileInRepository(project.gitlabId, MLREEF_NAME) != null
        val publishTimePresent = dataProcessorService.getProcessorVersionByProjectId(project.id)?.publishingInfo?.finishedAt != null

        return (mlreefInRepo && !publishTimePresent || !mlreefInRepo && publishTimePresent)
    }

    private fun isProjectPublished(project: Project, userToken: String? = null): Boolean {
        val mlreefInRepo = repositoryService.findFileInRepository(project.gitlabId, MLREEF_NAME) != null
        val publishTimePresent = dataProcessorService.getProcessorVersionByProjectId(project.id)?.publishingInfo?.finishedAt != null

        if (!mlreefInRepo && !publishTimePresent) return false
        if (mlreefInRepo && publishTimePresent) return true

        throw ProjectPublicationException(ErrorCode.ProjectIsInIncorrectState, "Project was not published successfully or publishing is still running")
    }

    private fun generateCodePublishingYAML(projectName: String, secret: String, finishUrl: String): String {
        val expressionParser: ExpressionParser = SpelExpressionParser()
        val context = StandardEvaluationContext()

        context.setVariable(PROJECT_NAME_VARIABLE, adaptProjectName(projectName))
        context.setVariable(EPF_PUBLISH_URL, finishUrl)
        context.setVariable(EPF_PUBLISH_SECRET, secret)

        val template = try {
            val expression = expressionParser.parseExpression(mlreefTemplate, TemplateParserContext())
            expression.getValue(context) as String
        } catch (ex: Exception) {
            log.error("Cannot parse file $mlreefTemplate: $ex")
            null
        }

        return template ?: throw InternalException("Template cannot be parsed")
    }

    private fun generateCodePublishingDockerFile(imageName: String): String {
        val expressionParser: ExpressionParser = SpelExpressionParser()
        val context = StandardEvaluationContext()

        context.setVariable(IMAGE_NAME_VARIABLE, adaptProjectName(imageName))
        context.setVariable(PIP_SERVER_URL, getPipServerUrl())

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
        return if (!conf.epf.pipServer.isNullOrBlank()) {
            val pipHost = URI(conf.epf.pipServer!!).host
            " -i ${conf.epf.pipServer} --trusted-host $pipHost "
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
}

