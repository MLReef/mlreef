package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.EPF_CONTROLLER_PATH
import com.mlreef.rest.ParameterInstancesRepository
import com.mlreef.rest.ParametersRepository
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfigurationRepository
import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.ProcessorInstancesRepository
import com.mlreef.rest.ProcessorsRepository
import com.mlreef.rest.annotations.SaveRecentProject
import com.mlreef.rest.api.v1.PipelineConfigCreateRequest
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ProcessorInstanceDto
import com.mlreef.rest.config.censor
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.ParameterInstance
import com.mlreef.rest.domain.Person
import com.mlreef.rest.domain.Pipeline
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.domain.PipelineJobInfo
import com.mlreef.rest.domain.PipelineStatus
import com.mlreef.rest.domain.PipelineType
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.PublishStatus
import com.mlreef.rest.domain.repositories.PipelineTypesRepository
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabIncorrectAnswerException
import com.mlreef.rest.exceptions.InconsistentStateOfObject
import com.mlreef.rest.exceptions.IncorrectApplicationConfiguration
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.PipelineCreateException
import com.mlreef.rest.exceptions.PipelineStartException
import com.mlreef.rest.exceptions.PipelineStateException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.VariableType
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabVariable
import com.mlreef.rest.feature.MLREEF_NAME
import com.mlreef.rest.feature.UNPUBLISH_COMMIT_MESSAGE
import com.mlreef.rest.feature.auth.AuthService
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.feature.processors.RepositoryService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.utils.Slugs
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import lombok.RequiredArgsConstructor
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.util.DigestUtils
import java.nio.charset.Charset
import java.time.Instant
import java.util.UUID
import java.util.UUID.randomUUID
import javax.annotation.PostConstruct
import javax.persistence.EntityManagerFactory
import javax.persistence.LockModeType
import javax.persistence.PersistenceUnit


@Service
@RequiredArgsConstructor
class PipelineService(
    private val conf: ApplicationConfiguration,
    private val personRepository: PersonRepository,
    private val pipelineConfigRepository: PipelineConfigurationRepository,
    private val pipelinesRepository: PipelinesRepository,
    private val processorsRepository: ProcessorsRepository,
    private val gitlabRestClient: GitlabRestClient,
    private val projectResolverService: ProjectResolverService,
    private val parametersRepository: ParametersRepository,
    private val parameterInstancesRepository: ParameterInstancesRepository,
    private val processorInstancesRepository: ProcessorInstancesRepository,
    private val pipelineTypesRepository: PipelineTypesRepository,
    private val authService: AuthService,
    private val yamlFileGenerator: YamlFileGenerator,
    @PersistenceUnit
    private val entityManagerFactory: EntityManagerFactory,
    private val processorsService: ProcessorsService,
    private val repositoryService: RepositoryService,
) {
    private val DEFAULT_BASE_IMAGE_PATH = "registry.gitlab.com/mlreef/mlreef/experiment:master"

    @Value("\${mlreef.bot-management.epf-bot-email-domain:\"\"}")
    private val botEmailDomain: String = ""

    @Value("\${mlreef.bot-management.epf-bot-password-length}")
    private val botPasswordLength: Int = 0

    val log: Logger = LoggerFactory.getLogger(this::class.java)

    @PostConstruct
    fun init() {
        if (conf.epf.experimentImagePath.isNullOrBlank()) throw IncorrectApplicationConfiguration("No experiment image path was provided")
    }

    fun getPipelineConfigurationsForProject(projectId: UUID): Set<PipelineConfiguration> {
        val dataProject = projectResolverService.resolveDataProject(projectId)
            ?: throw NotFoundException(ErrorCode.PipelineCreationProjectMissing, "DataProject $projectId not found!")

        return dataProject.pipelineConfigurations
    }

    fun getPipelineConfigurationById(projectId: UUID, pipelineConfigId: UUID): PipelineConfiguration? {
        val dataProject = projectResolverService.resolveDataProject(projectId)
            ?: throw NotFoundException(ErrorCode.PipelineCreationProjectMissing, "DataProject $projectId is missing!")

        return pipelineConfigRepository.findOneByDataProjectAndId(dataProject, pipelineConfigId)
    }

    fun getPipelineById(pipelineId: UUID): Pipeline? {
        return pipelinesRepository.findByIdOrNull(pipelineId)
    }

    @SaveRecentProject(projectId = "#dataProjectId", userId = "#person.id", operation = "createPipelineConfig")
    @Transactional
    fun createNewPipelineConfig(
        dataProjectId: UUID,
        createRequest: PipelineConfigCreateRequest,
        person: Person
    ): PipelineConfiguration {
        log.info(createRequest.toString())

        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        return try {
            val newPipelineConfig = this.createPipelineConfig(
                personId = person.id,
                dataProjectId = dataProject.id,
                pipelineType = createRequest.pipelineType,
                name = createRequest.name,
                sourceBranch = createRequest.sourceBranch,
                processorInstances = listOf(),
                inputFiles = listOf()
            )

            createRequest.dataOperations.forEach { instanceDto ->
                val processor = processorsService.findProcessor(instanceDto.id, instanceDto.slug, instanceDto.projectId, instanceDto.branch, instanceDto.version)
                    ?.takeIf { it.status in listOf(PublishStatus.PUBLISHED, PublishStatus.PUBLISH_FINISHING) }
                    ?: throw NotFoundException("Processor ${instanceDto.id ?: instanceDto.slug ?: instanceDto.projectId?.let { "$it ${instanceDto.branch} ${instanceDto.version}" }} not found")

                val processorInstance = newPipelineConfig.createProcessorInstance(processor)
                processorInstancesRepository.save(processorInstance)
                val parameterInstances = createNewParameters(instanceDto, processorInstance)
                parameterInstancesRepository.saveAll(parameterInstances)
                processorInstancesRepository.save(processorInstance)
            }
            createRequest.inputFiles.forEach { fileLocationDto ->
                val fileLocation = FileLocation.fromDto(fileLocationDto.location, fileLocationDto.locationType)
                newPipelineConfig.addInputFile(fileLocation)
            }

            pipelineConfigRepository.save(newPipelineConfig)
        } catch (validationError: IllegalArgumentException) {
            throw PipelineCreateException(ErrorCode.PipelineCreationFilesMissing, validationError.message)
        }
    }

    @Transactional
    fun createPipelineFromConfig(pipelineConfig: PipelineConfiguration, number: Int, person: Person): Pipeline {
        val pipeline = pipelinesRepository.save(pipelineConfig.createPipeline(person, number))
        processorInstancesRepository.saveAll(pipeline.processorInstances)

        log.info("Created new Instance $pipeline for Pipeline Configuration $pipelineConfig")

        return pipelinesRepository.findByIdOrNull(pipeline.id)
            ?: throw InternalException("Pipeline ${pipeline.id} not found after creation for configuration ${pipelineConfig.id}")
    }


    @Transactional
    fun createPipelineConfig(
        personId: UUID,
        dataProjectId: UUID,
        pipelineType: String,
        name: String?,
        sourceBranch: String,
        processorInstances: List<ProcessorInstance>,
        inputFiles: List<FileLocation>
    ): PipelineConfiguration {
        val subject = personRepository.findByIdOrNull(personId)
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationOwnerMissing, "Owner is missing!")

        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationProjectMissing, "DataProject $dataProjectId is missing!")

        require(!pipelineType.isBlank()) { "pipelineType is missing!" }

        val type = pipelineTypesRepository.findByNameIgnoreCase(parsePipelineType(pipelineType))
            ?: throw PipelineCreateException(message = "Not a valid PipelineType: $pipelineType")

        val prefix = pipelinePrefix(type)

        val finalName = if (name.isNullOrEmpty()) NameGenerator.getRandomNameWithDate() else name
        val finalSlug = Slugs.toSlug(finalName)

        val startsWithTypePrefix = finalName.startsWith(prefix, false)
        var finalNamePrefixed = if (!startsWithTypePrefix) "${prefix}/$finalName" else finalName
        var finalSlugPrefixed = if (!startsWithTypePrefix) "${prefix}-$finalSlug" else finalSlug
        val finalTargetBranchPattern = "${prefix}/$finalSlug-\$NUMBER"

        val uniqueIndex = generateUniquePipelineConfigName(dataProject, finalNamePrefixed)

        if (uniqueIndex != null) {
            finalNamePrefixed = "$finalNamePrefixed $uniqueIndex"
            finalSlugPrefixed = "$finalSlugPrefixed-$uniqueIndex"
        }

        finalSlugPrefixed = Slugs.cutToValidLength(finalSlugPrefixed)

        log.info("Creating new PipelineConfig with $finalSlugPrefixed $finalNamePrefixed -> $finalTargetBranchPattern")

        require(!sourceBranch.isBlank()) { "sourceBranch is missing!" }
        require(!finalTargetBranchPattern.isBlank()) { "targetBranchPattern is missing!" }
        require(!finalSlugPrefixed.isBlank()) { "slug is missing!" }
        require(Slugs.isValid(finalSlugPrefixed)) { "slug is invalid!" }
        require(!finalNamePrefixed.isBlank()) { "name is missing!" }

        dataProject.pipelineConfigurations.find { it.slug.equals(finalSlugPrefixed) }
            ?.let {
                throw PipelineCreateException(ErrorCode.PipelineSlugAlreadyInUse, "Slug $finalSlugPrefixed is already used in DataProject!")
            }

        val pipelineConfig = PipelineConfiguration(
            id = randomUUID(),
            slug = finalSlugPrefixed,
            name = finalNamePrefixed,
            pipelineType = type,
            dataProject = dataProject,
            sourceBranch = sourceBranch,
            targetBranchPattern = finalTargetBranchPattern,
            processorInstances = processorInstances.toMutableSet(),
            inputFiles = inputFiles.toMutableSet(),
            creator = subject,
        )
        return pipelineConfigRepository.save(pipelineConfig)
    }

    @SaveRecentProject(projectId = "#dataProjectId", userId = "#person.id", operation = "updatePipelineProject")
    @Transactional
    fun updatePipelineConfig(
        dataProjectId: UUID,
        pipelineConfigId: UUID,
        processorInstancesDtos: List<ProcessorInstanceDto>,
        inputFiles: List<FileLocationDto>,
        person: Person,
    ): PipelineConfiguration {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        val existingPipelineConfig = pipelineConfigRepository.findOneByDataProjectAndId(dataProject, pipelineConfigId)
            ?: throw NotFoundException(
                ErrorCode.NotFound, "PipelineConfig $pipelineConfigId not found or not accessible"
            )

        val newPipelineConfig = existingPipelineConfig.copy(
            pipelines = mutableSetOf(),
            inputFiles = mutableSetOf(),
        )

        processorInstancesDtos.forEach { instanceDto ->
            val processor = processorsService.findProcessor(instanceDto.id, instanceDto.slug, instanceDto.projectId, instanceDto.branch, instanceDto.version)
                ?.takeIf { it.status in listOf(PublishStatus.PUBLISHED, PublishStatus.PUBLISH_FINISHING) }
                ?: throw NotFoundException("Processor ${instanceDto.id ?: instanceDto.slug ?: instanceDto.projectId?.let { "$it ${instanceDto.branch} ${instanceDto.version}" }} not found")
            val processorInstance = newPipelineConfig.createProcessorInstance(processor)
            processorInstancesRepository.save(processorInstance)
            val parameterInstances = createNewParameters(instanceDto, processorInstance)
            parameterInstancesRepository.saveAll(parameterInstances)
        }
        inputFiles.forEach { fileLocationDto ->
            val fileLocation = FileLocation.fromDto(fileLocationDto.location, fileLocationDto.locationType)
            newPipelineConfig.addInputFile(fileLocation)
        }

        return pipelineConfigRepository.save(newPipelineConfig)
    }

    private inline fun require(value: Boolean, lazyMessage: () -> Any) {
        if (!value) {
            val message = lazyMessage()
            throw PipelineCreateException(ErrorCode.PipelineCreationInvalid, message.toString())
        }
    }


    fun createNewProcessorInstance(processor: Processor): ProcessorInstance {
        return ProcessorInstance(
            randomUUID(),
            processor,
            parameterInstances = arrayListOf()
        )
    }

    fun createNewParameterInstance(
        processorInstance: ProcessorInstance,
        name: String,
        value: String,
    ): ParameterInstance {
        val parameter = parametersRepository.findByProcessorAndName(processorInstance.processor, name)
            ?: throw PipelineCreateException(ErrorCode.ProcessorParameterNotUsable, "Parameter '$name' not found for processor ${processorInstance.processor.name}")

        return processorInstance.createParameterInstances(parameter, value)
    }

    //Prefer using an expression body for functions with the body consisting of a *single* expression, not just for everything and respect clean histories and code readability
    fun createPipelineInstanceFile(author: Account, pipeline: Pipeline, secret: String): String =
        when {
            pipeline.inputFiles.isEmpty() -> throw PipelineCreateException(ErrorCode.PipelineCreationFilesMissing, "No input files")
            pipeline.processorInstances.isEmpty() -> throw PipelineCreateException(ErrorCode.PipelineCreationInvalid, "No processors defined for pipeline")
            else -> yamlFileGenerator.renderYaml(
                author = author,
                epfPipelineSecret = secret,
                epfPipelineUrl = "${conf.epf.backendUrl}$EPF_CONTROLLER_PATH/pipeline_instance/${pipeline.id}",
                epfGitlabUrl = conf.epf.gitlabUrl,
                baseImagePath = getExperimentImagePath(),
                epfImageTag = conf.epf.imageTag,
                sourceBranch = pipeline.sourceBranch,
                targetBranch = pipeline.targetBranch,
                processorsInstances = pipeline.processorInstances,
                retries = conf.epf.retriesForPipeline,
            )
        }

    fun commitYamlFile(
        userToken: String,
        projectId: Long,
        targetBranch: String,
        fileContent: String,
        sourceBranch: String = "master"
    ): Commit {
        val commitMessage = "[skip ci] create $MLREEF_NAME"
        val fileContents = mapOf(Pair(MLREEF_NAME, fileContent))
        try {
            gitlabRestClient.createBranch(
                token = userToken,
                projectId = projectId,
                targetBranch = targetBranch,
                sourceBranch = sourceBranch,
            )
        } catch (e: RestException) {
            throw PipelineStartException("Cannot create branch $targetBranch for project $projectId, check the source_branch $sourceBranch: ${e.message}")
        }
        try {
            this.removePipelineFiles(gitlabProjectId = projectId, branch = targetBranch, message = "Clean branch $targetBranch before pipeline start")
        } catch (ex: Exception) {
            log.error("Cannot delete pipeline file from repo")
        }
        return try {
            val commitFiles = gitlabRestClient.commitFiles(
                token = userToken,
                projectId = projectId,
                targetBranch = targetBranch,
                commitMessage = commitMessage,
                fileContents = fileContents,
                action = "create",
            )
            log.info("Committed Yaml file in commit ${commitFiles.shortId}")
            commitFiles
        } catch (e: RestException) {
            throw PipelineStartException("Cannot commit mlreef file to branch $targetBranch for project $projectId: ${e.errorName}")
        }
    }

    fun getBranch(gitlabProjectId: Long, branch: String): Branch? {
        return try {
            gitlabRestClient.adminGetBranch(projectId = gitlabProjectId, branch = branch)
        } catch (e: RestException) {
            log.error("Could not get branch $branch for project $gitlabProjectId")
            null
        }
    }

    fun deleteBranch(gitlabProjectId: Long, targetBranch: String): Boolean {
        return try {
            gitlabRestClient.adminDeleteBranch(projectId = gitlabProjectId, targetBranch = targetBranch)
            log.info("Branch $targetBranch deleted")
            true
        } catch (e: RestException) {
            log.error("Could not delete branch $targetBranch for project $gitlabProjectId")
            false
        }
    }

    fun createStartGitlabPipeline(
        userToken: String,
        projectGitlabId: Long,
        targetBranch: String,
        fileContent: String,
        sourceBranch: String,
        secret: String
    ): PipelineJobInfo {
        commitYamlFile(
            userToken = userToken,
            projectId = projectGitlabId,
            sourceBranch = sourceBranch,
            targetBranch = targetBranch,
            fileContent = fileContent
        )

        ensureProjectEpfBotUser(projectGitlabId = projectGitlabId)

        val variablesMap = hashMapOf(
            PIPELINE_TOKEN_SECRET to secret
        )

        val gitlabPipeline = createPipelineInGitlab(
            userToken = userToken,
            projectGitlabId = projectGitlabId,
            variables = variablesMap,
            commitRef = targetBranch
        )

        val pipelineJobInfo = PipelineJobInfo(
            gitlabId = gitlabPipeline.id,
            ref = gitlabPipeline.ref,
            secret = secret,
            commitSha = gitlabPipeline.sha,
            committedAt = gitlabPipeline.committedAt,
            createdAt = gitlabPipeline.createdAt,
            updatedAt = gitlabPipeline.updatedAt
        )

        log.info("Started pipeline for  with variables $variablesMap")
        log.info("$gitlabPipeline")
        return pipelineJobInfo
    }

    fun createPipelineForConfig(
        authorId: UUID,
        pipelineConfig: PipelineConfiguration? = null,
        pipelineConfigId: UUID? = null
    ): Pipeline {
        val subject = personRepository.findByIdOrNull(authorId)
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationOwnerMissing, "Owner is missing!")

        val finalPipelineConfig = pipelineConfig
            ?: pipelineConfigId?.let { pipelineConfigRepository.findByIdOrNull(it) }
            ?: throw NotFoundException("Pipeline configuration $pipelineConfigId not found")

        val nextNumber = (pipelinesRepository.maxNumberByPipelineConfig(finalPipelineConfig) ?: 0) + 1

        var pipeline = finalPipelineConfig.createPipeline(subject, nextNumber)

        pipeline = pipelinesRepository.save(pipeline)

        log.info("Created new pipline ${pipeline.id} for Pipeline configuration ${finalPipelineConfig.id}")

        return pipeline
    }

    @SaveRecentProject(projectId = "#dataProjectId", userId = "#starterId", operation = "startPipeline")
    fun startPipeline(
        author: Account,
        userToken: String,
        dataProjectId: UUID,
        pipeline: Pipeline,
        starterId: UUID? = null,
        secret: String? = null,
    ): Pipeline {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        val gitlabProjectId = dataProject.gitlabId

        val finalSecret = secret ?: this.createSecret()

        val fileContent = createPipelineInstanceFile(author = author, pipeline = pipeline, secret = finalSecret)

        val gitlabPipeline = createStartGitlabPipeline(
            userToken = userToken,
            projectGitlabId = gitlabProjectId,
            sourceBranch = pipeline.sourceBranch,
            targetBranch = pipeline.targetBranch,
            fileContent = fileContent,
            secret = finalSecret
        )

        pipeline.status = PipelineStatus.PENDING
        pipeline.pipelineJobInfo = gitlabPipeline

        return pipelinesRepository.save(pipeline)
    }

    fun startPipelineAsync(
        author: Account,
        userToken: String,
        dataProjectId: UUID,
        instance: Pipeline,
        secret: String,
        personId: UUID,
    ) {
        GlobalScope.launch {
            startPipeline(author, userToken, dataProjectId, instance, personId, secret)
        }
    }

    fun archivePipeline(instance: Pipeline): Pipeline {
        return instance.copy(status = PipelineStatus.ARCHIVED)
            .let { pipelinesRepository.save(it) }
    }

    private fun createPipelineInGitlab(
        userToken: String,
        projectGitlabId: Long,
        commitRef: String,
        variables: Map<String, String> = hashMapOf()
    ): GitlabPipeline {
        val toList = variables.map {
            GitlabVariable(it.key, it.value, VariableType.ENV_VAR)
        }.toList()
        return try {
            val pipeline = gitlabRestClient.createPipeline(userToken, projectGitlabId, commitRef, toList)
            log.info("Created gitlab pipeline ${pipeline.id} with variables $variables")
            try {
                val pipelineVariables =
                    gitlabRestClient.getPipelineVariables(userToken, projectGitlabId, pipelineId = pipeline.id)
                log.info(pipelineVariables.toString())
            } catch (e: Exception) {
                log.warn("Error controlling variables")
            }
            pipeline
        } catch (e: RestException) {
            throw PipelineStartException("Cannot start pipeline for commit $commitRef for project $projectGitlabId")
        }
    }

    fun pipelineJobUpdated(pipelineId: UUID): PipelineJobInfo {
        val em = entityManagerFactory.createEntityManager()

        em.transaction.begin()

        try {
            val pipelineForUpdate = em.find(Pipeline::class.java, pipelineId, LockModeType.PESSIMISTIC_WRITE)

            val oldStatus = pipelineForUpdate.status

            if (pipelineForUpdate.pipelineJobInfo == null) throw PipelineStateException(message = "Pipeline $pipelineId has invalid state")

            pipelineForUpdate.pipelineJobInfo!!.updatedAt = Instant.now()

            em.persist(pipelineForUpdate)
            em.flush()
            em.transaction.commit()
            val updatedPipeline = em.find(Pipeline::class.java, pipelineForUpdate.id)

            log.debug("Pipeline updated: ${updatedPipeline.name} [${updatedPipeline.targetBranch}]  ${oldStatus.name} -> ${updatedPipeline.status.name} - (${updatedPipeline.pipelineJobInfo?.updatedAt})")
        } catch (ex: Exception) {
            log.error("$ex")
            em.transaction.rollback()
        } finally {
            em.close()
        }

        return pipelinesRepository.findByIdOrNull(pipelineId)?.pipelineJobInfo
            ?: throw NotFoundException(ErrorCode.NotFound, "Pipeline $pipelineId not found")
    }

    fun pipelineJobFinished(pipelineId: UUID): PipelineJobInfo {
        val em = entityManagerFactory.createEntityManager()

        em.transaction.begin()

        try {
            val pipelineForUpdate = em.find(Pipeline::class.java, pipelineId, LockModeType.PESSIMISTIC_WRITE)

            val oldStatus = pipelineForUpdate.status

            if (pipelineForUpdate.pipelineJobInfo == null) throw PipelineStateException(message = "Pipeline $pipelineId has invalid state")

            pipelineForUpdate.pipelineJobInfo!!.finishedAt = Instant.now()
            pipelineForUpdate.status = PipelineStatus.FINISHING

            em.persist(pipelineForUpdate)
            em.flush()
            em.transaction.commit()
            val updatedPipeline = em.find(Pipeline::class.java, pipelineForUpdate.id)

            log.debug("Pipeline is finishing: ${updatedPipeline.name} [${updatedPipeline.targetBranch}]  ${oldStatus.name} -> ${updatedPipeline.status.name} - (${updatedPipeline.pipelineJobInfo?.updatedAt})")
        } catch (ex: Exception) {
            log.error("$ex")
            em.transaction.rollback()
        } finally {
            em.close()
        }

        return pipelinesRepository.findByIdOrNull(pipelineId)?.pipelineJobInfo
            ?: throw NotFoundException(ErrorCode.NotFound, "Pipeline $pipelineId not found")
    }

    fun createSecret(): String = DigestUtils.md5DigestAsHex(BCrypt.gensalt().toByteArray(Charset.defaultCharset()))

    private fun ensureProjectEpfBotUser(projectGitlabId: Long) {
        val botName = "mlreef-project-$projectGitlabId-bot"

        log.debug("Ensure EPF user for gitlab project $projectGitlabId exists: $botName")
        val botEmail = "$botName@$botEmailDomain" //we have to use unique email for user creation
        val botPassword = RandomUtils.generateRandomPassword(botPasswordLength)

        // ensure GitlabUser Bot exists
        val (gitlabUser, newToken) = authService.ensureBotExistsWithToken(botName, botEmail, botPassword)
        if (newToken != null) {
            log.info("Created new Token for EPF-Bot $botName")
            log.info("Must create GIT_PUSH_USER and GIT_PUSH_TOKEN, otherwise state information is lost!")
            val existingVariablesKeys =
                gitlabRestClient.adminGetProjectVariables(projectId = projectGitlabId).map { it.key }

            if (!existingVariablesKeys.contains(GIT_PUSH_TOKEN)) {
                try {
                    log.debug("Create GIT_PUSH_TOKEN with ${newToken.token.censor()}")
                    gitlabRestClient.adminCreateProjectVariable(
                        projectId = projectGitlabId, name = GIT_PUSH_TOKEN, value = newToken.token
                            ?: throw GitlabIncorrectAnswerException("Gitlab answered with empty token for bot user $gitlabUser")
                    )
                } catch (clientErrorException: RestException) {
                    log.error("PIPELINE MIGHT BE BROKEN: Could not save EPF Bot credentials")
                    log.error("Could not create EPF Tokens in Group ENV: ${clientErrorException.message}")
                }
            }

            if (!existingVariablesKeys.contains(GIT_PUSH_USER)) {
                try {
                    log.debug("Create GIT_PUSH_USER with ${gitlabUser.username}")
                    gitlabRestClient.adminCreateProjectVariable(
                        projectId = projectGitlabId,
                        name = GIT_PUSH_USER,
                        value = gitlabUser.username
                    )
                } catch (clientErrorException: RestException) {
                    log.error("PIPELINE MIGHT BE BROKEN: Could not save EPF Bot credentials")
                    log.error("Could not create EPF Tokens in Group ENV: ${clientErrorException.message}")
                }
            }
        } else {
            log.debug("EPF-Bot $botName already has a token")
        }
        try {
            if (gitlabRestClient.adminGetUsersInProjects(projectGitlabId, searchNameEmail = botName)
                    .firstOrNull() == null
            ) {
                addEPFBotToProject(projectGitlabId, gitlabUser.id)
            }
        } catch (clientErrorException: RestException) {
            log.error("PIPELINE MIGHT BE BROKEN: Could not attach EPF Bot to Project")
            log.error("Could not ensure that EPF-Bot $botName is in correct project: ${clientErrorException.message}")
        }
    }

    // TODO: Create or find
    private fun addEPFBotToProject(projectGitlabId: Long, userGitlabId: Long): GitlabUserInProject {
        return gitlabRestClient.adminAddUserToProject(
            projectId = projectGitlabId,
            userId = userGitlabId,
            accessLevel = GitlabAccessLevel.MAINTAINER
        )
    }

    fun cancelPipeline(pipeline: Pipeline? = null, pipelineId: UUID? = null): Pipeline {
        val finalPipeline = (
            pipeline
                ?: pipelineId?.let { pipelinesRepository.findByIdOrNull(it) }
                ?: throw NotFoundException("Pipeline $pipelineId was not found")
            ).takeIf {
                it.pipelineConfiguration?.dataProject?.gitlabId != null
            } ?: throw InconsistentStateOfObject("Pipeline $pipelineId is not attached to configuration or data project")

        finalPipeline.pipelineJobInfo?.gitlabId?.let {
            try {
                gitlabRestClient.adminCancelPipeline(finalPipeline.pipelineConfiguration?.dataProject?.gitlabId!!, it)
            } catch (ex: Exception) {
                log.error("Cannot cancel pipeline #${finalPipeline.pipelineJobInfo?.gitlabId} in gitlab: Exception: $ex")
            }
        }

        finalPipeline.status = PipelineStatus.CANCELED

        return pipelinesRepository.save(finalPipeline)
    }

    fun deletePipeline(pipeline: Pipeline? = null, pipelineId: UUID? = null) {
        val canceledPipeline = cancelPipeline(pipeline, pipelineId)

        canceledPipeline.pipelineJobInfo?.gitlabId?.let {
            try {
                gitlabRestClient.adminDeletePipeline(canceledPipeline.pipelineConfiguration?.dataProject?.gitlabId!!, it)
            } catch (ex: Exception) {
                log.error("Cannot delete pipeline #${canceledPipeline.pipelineJobInfo?.gitlabId} in gitlab: Exception: $ex")
            }
        }

        deleteBranch(canceledPipeline.pipelineConfiguration?.dataProject?.gitlabId!!, canceledPipeline.targetBranch)

        pipelinesRepository.delete(canceledPipeline)
    }


    fun appendProcessorsAndFiles(
        processorInstances: List<ProcessorInstanceDto>,
        inputFiles: List<FileLocationDto>,
        pipelineConfig: PipelineConfiguration
    ) {
        processorInstances.forEach { instanceDto ->
            val processor = processorsService.findProcessor(instanceDto.id, instanceDto.slug, instanceDto.projectId, instanceDto.branch, instanceDto.version)
                ?.takeIf { it.status in listOf(PublishStatus.PUBLISHED, PublishStatus.PUBLISH_FINISHING) }
                ?: throw NotFoundException("Processor ${instanceDto.id ?: instanceDto.slug ?: instanceDto.projectId?.let { "$it ${instanceDto.branch} ${instanceDto.version}" }} not found")
            val preProcessorInstance = this.createNewProcessorInstance(processor)
            pipelineConfig.addProcessorInstance(preProcessorInstance)
            createNewParameters(instanceDto, preProcessorInstance)
        }
        inputFiles.forEach { fileLocationDto ->
            val fileLocation = FileLocation.fromDto(fileLocationDto.location, fileLocationDto.locationType)
            pipelineConfig.addInputFile(fileLocation)
        }
    }

    private fun createNewParameters(
        processorInstanceDto: ProcessorInstanceDto,
        preProcessorInstance: ProcessorInstance
    ): List<ParameterInstance> {
        return processorInstanceDto.parameters.map { parameterInstanceDto ->
            this.createNewParameterInstance(
                preProcessorInstance,
                parameterInstanceDto.name,
                parameterInstanceDto.value
            )
        }
    }

    private fun getExperimentImagePath(): String {
        return conf.epf.experimentImagePath!!
    }

    private fun pipelinePrefix(value: PipelineType): String {
        return when (value.name.toUpperCase()) {
            "DATA" -> "data-pipeline"
            "EXPERIMENT" -> "experiment"
            "VISUALIZATION" -> "data-visualization"
            else -> "pipeline"
        }
    }

    private fun parsePipelineType(value: String): String {
        return when (value.trim().toUpperCase()) {
            "VISUAL" -> "VISUALIZATION"
            else -> value.trim().toUpperCase()
        }
    }

    private fun generateUniquePipelineConfigName(dataProject: DataProject, currentName: String): Long? {
        if (dataProject.pipelineConfigurations.find { it.name == currentName } == null) return null

        for (i in 1..Long.MAX_VALUE) {
            if (dataProject.pipelineConfigurations.find { it.name == "$currentName $i" } == null) return i
        }

        throw PipelineCreateException(message = "Cannot generate unique name for pipeline $currentName")
    }

    private fun getGitlabPipeline(
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

    private fun isPipelineFilePresent(projectGitlabId: Long, branch: String, fileName: String): Boolean {
        return repositoryService.findFileInRepository(projectGitlabId, fileName, branch = branch) != null
    }

    fun removePipelineFiles(project: Project? = null, gitlabProjectId: Long? = null, branch: String, token: String? = null, message: String? = null): Commit? {
        val fileContents = mutableMapOf<String, String>()

        val gitlabId = gitlabProjectId
            ?: project?.gitlabId
            ?: throw BadRequestException(ErrorCode.BadParametersRequest, "Gitlab project id is not present")

        if (isPipelineFilePresent(gitlabId, branch, MLREEF_NAME)) fileContents[MLREEF_NAME] = ""

        return if (fileContents.isNotEmpty()) {
            log.info("Deleting file(s) ${fileContents.keys.joinToString(", ")} in branch $branch for gitlab project $gitlabId")
            try {
                if (token != null) {
                    gitlabRestClient.commitFiles(
                        token = token,
                        projectId = gitlabId,
                        targetBranch = branch,
                        commitMessage = "[skip ci] ${message ?: UNPUBLISH_COMMIT_MESSAGE}",
                        fileContents = fileContents,
                        action = "delete"
                    )
                } else {
                    gitlabRestClient.adminCommitFiles(
                        projectId = gitlabId,
                        targetBranch = branch,
                        commitMessage = "[skip ci] ${message ?: UNPUBLISH_COMMIT_MESSAGE}",
                        fileContents = fileContents,
                        action = "delete"
                    )
                }
            } catch (e: RestException) {
                log.error("Cannot delete ${fileContents.keys.joinToString(", ")} file(s) in branch $branch for gitlab project $gitlabId: ${e.errorName}")
                null
            }
        } else {
            log.warn("No file $MLREEF_NAME in branch $branch for gitlab project $gitlabId")
            null
        }
    }

    /// Pipeline update

    //TODO: Careful!!!!, the logic was checked but it still can be errorness because of rewriting entities
    @Scheduled(
        fixedRateString = "\${mlreef.epf.update-experiment-pipeline-status-interval-msec:10000}",
        initialDelayString = "\${mlreef.epf.delay-scheduled-pipeline-tasks-msec:500}",
    )
    @Transactional
    fun updatePipelineStatuses() {
        try {
            val pipelinesInRunningState = pipelinesRepository.findByStatusIn(
                listOf(
                    PipelineStatus.CREATED,
                    PipelineStatus.PENDING,
                    PipelineStatus.RUNNING,
                    PipelineStatus.FINISHING,
                ),
            )

            val timeToFail = Instant.now().minusSeconds(conf.epf.timeToConsiderPipelineFailedSec)

            val updatedPipelines = pipelinesInRunningState.filter { it.dataProject != null }.map { pipeline ->
                val gitlabPipeline = getGitlabPipeline(
                    pipeline.dataProject!!.gitlabId,
                    pipeline.pipelineJobInfo?.gitlabId,
                    pipeline.targetBranch,
                    pipeline.pipelineJobInfo?.commitSha,
                )

                val anyPipelineDate = pipeline.pipelineJobInfo?.startedAt
                    ?: pipeline.pipelineJobInfo?.createdAt
                    ?: pipeline.pipelineJobInfo?.updatedAt
                    ?: pipeline.pipelineJobInfo?.finishedAt

                val processorIsOutdated =
                    (anyPipelineDate == null || anyPipelineDate.isBefore(timeToFail))

                if (gitlabPipeline == null && processorIsOutdated) {
                    pipeline.copy(status = PipelineStatus.OTHER)
                } else if (gitlabPipeline != null) {
                    val gitlabStatus = PipelineStatus.fromGitlabStatusString(gitlabPipeline.status) ?: PipelineStatus.OTHER

                    if (processorIsOutdated && (pipeline.status == PipelineStatus.PENDING || pipeline.status == PipelineStatus.OTHER)) {
                        pipeline.copy(status = PipelineStatus.FAILED)
                    } else if (!pipeline.status.canUpdateTo(gitlabStatus)) {
                        null
                    } else if (gitlabStatus == PipelineStatus.PENDING || gitlabStatus == PipelineStatus.RUNNING || gitlabStatus == PipelineStatus.SUCCESS || gitlabStatus == PipelineStatus.FAILED || gitlabStatus == PipelineStatus.CANCELED) {
                        pipeline.copy(status = gitlabStatus)
                    } else null
                } else null
            }.filterNotNull()

            updatedPipelines.forEach { pipeline ->
                val em = entityManagerFactory.createEntityManager()
                em.transaction.begin()
                try {
                    val pipelineForUpdate = em.find(Pipeline::class.java, pipeline.id, LockModeType.PESSIMISTIC_WRITE)

                    log.debug("Update pipeline: ${pipelineForUpdate.name} [${pipelineForUpdate.targetBranch}] ${pipelineForUpdate.status.name} -> ${pipeline.status.name}")

                    if (pipelineForUpdate.status.canUpdateTo(pipeline.status)) {
                        pipelineForUpdate.status = pipeline.status
                        em.persist(pipelineForUpdate)
                        em.flush()
                        em.transaction.commit()
                        val updatedPipeline = em.find(Pipeline::class.java, pipeline.id)
                        log.debug("Release processor: ${updatedPipeline.name} [${updatedPipeline.targetBranch}] - ${updatedPipeline.status} --- $${updatedPipeline.pipelineJobInfo?.startedAt}")
                    } else {
                        log.debug("Release processor: ${pipelineForUpdate.name} [${pipelineForUpdate.targetBranch}] - NO UPDATE")
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
}
