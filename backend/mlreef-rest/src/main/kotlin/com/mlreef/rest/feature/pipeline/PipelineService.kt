package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.Account
import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineJobInfo
import com.mlreef.rest.PipelineStatus
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.PipelineCreateException
import com.mlreef.rest.exceptions.PipelineStartException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.VariableType
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabVariable
import com.mlreef.utils.Slugs
import lombok.RequiredArgsConstructor
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Service
import org.springframework.util.DigestUtils
import java.nio.charset.Charset
import java.util.UUID
import java.util.UUID.randomUUID


@Service
@RequiredArgsConstructor
class PipelineService(
    private val conf: ApplicationConfiguration,
    private val subjectRepository: SubjectRepository,
    private val dataProjectRepository: DataProjectRepository,
    private val pipelineConfigRepository: PipelineConfigRepository,
    private val pipelineInstanceRepository: PipelineInstanceRepository,
    private val processorVersionRepository: ProcessorVersionRepository,
    private val processorParameterRepository: ProcessorParameterRepository,
    private val gitlabRestClient: GitlabRestClient
) {

    val log: Logger = LoggerFactory.getLogger(this::class.java)

    fun getPipelinesForProject(projectId: UUID): List<PipelineConfig> {
        return pipelineConfigRepository.findAllByDataProjectId(projectId)
    }

    fun getPipelineById(projectId: UUID, pipelineId: UUID): PipelineConfig? {
        return pipelineConfigRepository.findOneByDataProjectIdAndId(projectId, pipelineId)
    }


    fun createPipelineConfig(
        authorId: UUID,
        dataProjectId: UUID,
        pipelineType: String,
        name: String?,
        sourceBranch: String,
        dataOperations: List<DataProcessorInstance>,
        inputFiles: List<FileLocation>
    ): PipelineConfig {
        subjectRepository.findByIdOrNull(authorId)
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationOwnerMissing, "Owner is missing!")
        dataProjectRepository.findByIdOrNull(dataProjectId)
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationProjectMissing, "DataProject is missing!")

        require(!pipelineType.isBlank()) { "pipelineType is missing!" }
        val type = PipelineType.fromString(pipelineType)
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationInvalid, "Not a valid PipelineType: $pipelineType")

        val finalName = if (name.isNullOrEmpty()) NameGenerator.getRandomNameWithDate() else name
        val finalSlug = Slugs.toSlug(finalName)

        val startsWithTypePrefix = finalName.startsWith(type.prefix(), false)
        val finalNamePrefixed = if (!startsWithTypePrefix) "${type.prefix()}/$finalName" else finalName
        val finalSlugPrefixed = if (!startsWithTypePrefix) "${type.prefix()}-$finalSlug" else finalSlug
        val finalTargetBranchPattern = "${type.prefix()}/$finalSlug-\$NUMBER"

        log.info("Creating new PipelineConfig with $finalSlugPrefixed $finalNamePrefixed -> $finalTargetBranchPattern")

        require(!sourceBranch.isBlank()) { "sourceBranch is missing!" }
        require(!finalTargetBranchPattern.isBlank()) { "targetBranchPattern is missing!" }
        require(!finalSlug.isBlank()) { "slug is missing!" }
        require(Slugs.isValid(finalSlug)) { "slug is invalid!" }
        require(!finalName.isBlank()) { "name is missing!" }

        pipelineConfigRepository.findOneByDataProjectIdAndSlug(dataProjectId, finalSlugPrefixed)
            ?.let { throw PipelineCreateException(ErrorCode.PipelineSlugAlreadyInUse, "Slug is already used in DataProject!") }

        val pipelineConfig = PipelineConfig(
            id = randomUUID(),
            slug = finalSlugPrefixed,
            name = finalNamePrefixed,
            pipelineType = type,
            dataProjectId = dataProjectId,
            sourceBranch = sourceBranch,
            targetBranchPattern = finalTargetBranchPattern,
            dataOperations = dataOperations.toMutableList(),
            inputFiles = inputFiles.toMutableList()
        )
        return pipelineConfigRepository.save(pipelineConfig)
    }

    private inline fun require(value: Boolean, lazyMessage: () -> Any) {
        if (!value) {
            val message = lazyMessage()
            throw PipelineCreateException(ErrorCode.PipelineCreationInvalid, message.toString())
        }
    }

    fun newDataProcessorInstance(processorSlug: String): DataProcessorInstance {
        val findBySlug = processorVersionRepository.findAllBySlug(processorSlug, PageRequest.of(0, 1)).firstOrNull()
            ?: throw PipelineCreateException(ErrorCode.DataProcessorNotUsable, processorSlug)

        return DataProcessorInstance(randomUUID(), findBySlug, parameterInstances = arrayListOf())
    }

    fun addParameterInstance(processorInstance: DataProcessorInstance, name: String, value: String): ParameterInstance {
        val processorParameter = processorParameterRepository.findByProcessorVersionIdAndName(processorInstance.processorVersion.id, name)
            ?: throw PipelineCreateException(ErrorCode.ProcessorParameterNotUsable, name)

        return processorInstance.addParameterInstances(processorParameter, value)
    }

    fun createPipelineInstanceFile(author: Account, pipelineInstance: PipelineInstance, secret: String): String =
        if (pipelineInstance.inputFiles.isEmpty())
            throw PipelineCreateException(ErrorCode.PipelineCreationFilesMissing)
        else dataProjectRepository.findByIdOrNull(pipelineInstance.dataProjectId)
            ?.let { dataProject ->
                YamlFileGenerator(conf.epf.imageTag).generateYamlFile(
                    author = author,
                    dataProject = dataProject,
                    epfPipelineSecret = secret,
                    epfPipelineUrl = "ID:${pipelineInstance.id}",
                    epfGitlabUrl = conf.epf.gitlabUrl,
                    sourceBranch = pipelineInstance.sourceBranch,
                    targetBranch = pipelineInstance.targetBranch,
                    processors = pipelineInstance.dataOperations,
                    inputFileList = pipelineInstance.inputFiles.map { it.toYamlString() }
                )
            }
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationProjectMissing, "DataProject is missing!")

    fun commitYamlFile(userToken: String, projectId: Long, targetBranch: String, fileContent: String, sourceBranch: String = "master"): Commit {
        val commitMessage = "[skip ci] create .mlreef.yml"
        val fileContents = mapOf(Pair(".mlreef.yml", fileContent))
        try {
            gitlabRestClient.createBranch(
                token = userToken,
                projectId = projectId,
                targetBranch = targetBranch,
                sourceBranch = sourceBranch
            )
        } catch (e: RestException) {
            throw PipelineStartException("Cannot create branch $targetBranch for project $projectId, check the source_branch $sourceBranch: ${e.errorName}")
        }
        return try {
            val commitFiles = gitlabRestClient.commitFiles(
                token = userToken,
                projectId = projectId,
                targetBranch = targetBranch,
                commitMessage = commitMessage,
                fileContents = fileContents,
                action = "create")
            log.info("Committed Yaml file in commit ${commitFiles.shortId}")
            commitFiles
        } catch (e: RestException) {
            throw PipelineStartException("Cannot commit mlreef file to branch $targetBranch for project $projectId: ${e.errorName}")
        }
    }

    fun deletePipelineInstance(userToken: String, gitlabProjectId: Long, targetBranch: String) {
        try {
            gitlabRestClient.deleteBranch(token = userToken, projectId = gitlabProjectId, targetBranch = targetBranch)
        } catch (e: RestException) {
            log.warn("Could not delete branch: $targetBranch")
        }
        log.info("PipelineInstance deleted: $targetBranch")
    }

    fun createStartGitlabPipeline(
        userToken: String,
        projectId: Long,
        targetBranch: String,
        fileContent: String,
        sourceBranch: String,
        secret: String,
        gitPushUser: String,
        gitPushToken: String
    ): PipelineJobInfo {
        commitYamlFile(
            userToken = userToken,
            projectId = projectId,
            sourceBranch = sourceBranch,
            targetBranch = targetBranch,
            fileContent = fileContent)

        val variablesMap = hashMapOf(
            "EPF_BOT_SECRET" to secret,
            "GIT_PUSH_USER" to gitPushUser,
            "GIT_PUSH_TOKEN" to gitPushToken
        )

        val gitlabPipeline = createPipeline(
            userToken = userToken,
            projectId = projectId,
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

    fun startInstance(author: Account, userToken: String, gitlabProjectId: Long, instance: PipelineInstance, secret: String): PipelineInstance {
        val fileContent = createPipelineInstanceFile(author = author, pipelineInstance = instance, secret = secret)
        val username = author.username
        val bestToken = author.bestToken?.token ?: "empty"

        val gitlabPipeline = createStartGitlabPipeline(
            userToken = userToken,
            projectId = gitlabProjectId,
            targetBranch = instance.targetBranch,
            sourceBranch = instance.sourceBranch,
            fileContent = fileContent,
            secret = secret,
            gitPushUser = username,
            gitPushToken = bestToken)

        return instance.copy(
            status = PipelineStatus.PENDING,
            pipelineJobInfo = gitlabPipeline
        ).let { pipelineInstanceRepository.save(it) }
    }

    fun archiveInstance(instance: PipelineInstance): PipelineInstance {
        return instance.copy(status = PipelineStatus.ARCHIVED)
            .let { pipelineInstanceRepository.save(it) }
    }

    private fun createPipeline(userToken: String, projectId: Long, commitRef: String, variables: Map<String, String> = hashMapOf()): GitlabPipeline {
        val toList = variables.map {
            GitlabVariable(it.key, it.value, VariableType.ENV_VAR)
        }.toList()
        return try {
            val pipeline = gitlabRestClient.createPipeline(userToken, projectId, commitRef, toList)
            log.info("Created gitlab pipeline ${pipeline.id} with variables $variables")
            try {
                val pipelineVariables = gitlabRestClient.getPipelineVariables(userToken, projectId, pipelineId = pipeline.id)
                log.info(pipelineVariables.toString())
            } catch (e: Exception) {
                log.warn("Error controlling variables")
            }
            pipeline
        } catch (e: RestException) {
            throw PipelineStartException("Cannot start pipeline for commit $commitRef for project $projectId")
        }
    }

    fun createSecret(): String = DigestUtils.md5DigestAsHex(BCrypt.gensalt().toByteArray(Charset.defaultCharset()))
}
