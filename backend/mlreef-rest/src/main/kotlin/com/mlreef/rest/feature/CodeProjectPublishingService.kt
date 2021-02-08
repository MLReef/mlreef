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
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.PipelineStartException
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
import java.time.ZonedDateTime
import java.util.UUID
import java.util.stream.Collectors

const val TARGET_BRANCH = "master"
const val DOCKERFILE_NAME = "Dockerfile"
const val MLREEF_NAME = ".mlreef.yml"
const val PUBLISH_COMMIT_MESSAGE = "Publish: Adding $DOCKERFILE_NAME and $MLREEF_NAME files for publishing"
const val UNPUBLISH_COMMIT_MESSAGE = "Unpublish: Removing $DOCKERFILE_NAME and $MLREEF_NAME files from repository"
const val NEWLINE = "\n"

const val EPF_DOCKER_IMAGE = "registry.gitlab.com/mlreef/mlreef/epf:master"

const val PROJECT_NAME_VARIABLE = "CI_PROJECT_SLUG"
const val IMAGE_NAME_VARIABLE = "IMAGE_NAME"
const val MAIN_SCRIPT_NAME_VARIABLE = "MAIN_SCRIPT"
const val EPF_PUBLISH_URL = "EPF_PUBLISH_URL"
const val EPF_PUBLISH_SECRET = "EPF_PUBLISH_SECRET"


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
    val log: Logger = LoggerFactory.getLogger(this::class.java)

    fun getPublishingInfo(projectId: UUID): ProcessorVersion {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        if (!isProjectPublished(project)) throw NotFoundException(ErrorCode.NotFound, "Project is not published yet")

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

        if (isProjectPublished(project)) throw ConflictException(ErrorCode.Conflict, "Project is already published")

        val baseEnvironment = baseEnvironmentsRepository.findByIdOrNull(environmentId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Environment $environmentId not found")

        val parsedProcessor = pythonParserService.findAndParseDataProcessorInProject(projectId, mainFilePath)
        val parsedVersion = parsedProcessor.processorVersion
            ?: throw PythonFileParsingException("No processor version found in script")

        val dataProcessorId = UUID.randomUUID()

        var existingDataProcessor = project.dataProcessor
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

        val existingDataProcessorVersion = project.dataProcessor?.processorVersion
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
                    DOCKERFILE_NAME to generateCodePublishingDockerFile(EPF_DOCKER_IMAGE),
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
    fun unPublishProject(userToken: String, projectId: UUID): Commit {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        if (!isProjectPublished(project)) throw NotFoundException(ErrorCode.NotFound, "Project is not published yet")

//        val dataProcessorVersion = dataProcessorService.getProcessorVersionByProjectId(project.id)
//
//        dataProcessorVersion?.let {
//            dataProcessorService.deleteDataProcessor(it)
//        }

        return try {
            gitlabRestClient.commitFiles(
                token = userToken,
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
            throw PipelineStartException("Cannot delete $DOCKERFILE_NAME and $MLREEF_NAME files in branch $TARGET_BRANCH for project $projectId: ${e.errorName}")
        }
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

            val publishingInfo = dataProcessorVersion.publishingInfo?.copy(finishedAt = null)
                ?: PublishingInfo(finishedAt = null)

            dataProcessorService.saveProcessorVersion(
                dataProcessorVersion.copy(
                    path = null,
                    branch = dataProcessorVersion.branch,
                    publishingInfo = publishingInfo,
                    command = "",
                    parameters = listOf(),
                    contentSha256 = null
                )
            )
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

    private fun isProjectPublished(project: Project): Boolean {
        return repositoryService.findFileInRepository(project.gitlabId, MLREEF_NAME) != null
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

        return template ?: throw InternalException("Template cannot be not parsed")
    }

    private fun generateCodePublishingDockerFile(imageName: String): String {
        val expressionParser: ExpressionParser = SpelExpressionParser()
        val context = StandardEvaluationContext()

        context.setVariable(IMAGE_NAME_VARIABLE, adaptProjectName(imageName))

        val template = try {
            val expression = expressionParser.parseExpression(dockerfileTemplate, TemplateParserContext())
            expression.getValue(context) as String
        } catch (ex: Exception) {
            log.error("Cannot parse file $dockerfileTemplate: $ex")
            null
        }

        return template ?: throw InternalException("Template cannot be not parsed")
    }

    private fun adaptProjectName(projectName: String): String =
        projectName
            .replace(" ", "_")
            .toLowerCase()
}

