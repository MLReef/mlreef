package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.Account
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorRepository
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
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
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
    private val subjectRepository: SubjectRepository,
    private val dataProjectRepository: DataProjectRepository,
    private val pipelineConfigRepository: PipelineConfigRepository,
    private val pipelineInstanceRepository: PipelineInstanceRepository,
    private val dataProcessorRepository: DataProcessorRepository,
    private val processorParameterRepository: ProcessorParameterRepository,
    private val gitlabRestClient: GitlabRestClient,
    @Value("\${mlreef.gitlab.rootUrl}") val gitlabRootUrl: String
) {

    val log = LoggerFactory.getLogger(this::class.java)

    fun createPipelineConfig(authorId: UUID, dataProjectId: UUID, pipelineType: String, slug: String, name: String, sourceBranch: String, targetBranchPattern: String, dataOperations: List<DataProcessorInstance>, inputFiles: List<FileLocation>): PipelineConfig {
        subjectRepository.findByIdOrNull(authorId) ?: throw IllegalArgumentException("Owner is missing!")
        dataProjectRepository.findByIdOrNull(dataProjectId) ?: throw IllegalArgumentException("DataProject is missing!")
        pipelineConfigRepository.findOneByDataProjectIdAndSlug(dataProjectId, slug)?.let { throw IllegalArgumentException("Slug is already used in DataProject!") }

        require(!sourceBranch.isBlank()) { "sourceBranch is missing!" }
        require(!pipelineType.isBlank()) { "pipelineType is missing!" }
        require(!slug.isBlank()) { "slug is missing!" }
        require(Slugs.isValid(slug)) { "slug is invalid!" }
        require(!name.isBlank()) { "name is missing!" }

        val type = PipelineType.fromString(pipelineType)

        val pipelineConfig = PipelineConfig(
            id = randomUUID(),
            slug = slug,
            name = name,
            pipelineType = type,
            dataProjectId = dataProjectId,
            sourceBranch = sourceBranch,
            targetBranchPattern = targetBranchPattern,
            dataOperations = dataOperations.toMutableList(),
            inputFiles = inputFiles.toMutableList()
        )
        return pipelineConfigRepository.save(pipelineConfig)
    }

    fun newDataProcessorInstance(processorSlug: String): DataProcessorInstance {
        val findBySlug = dataProcessorRepository.findBySlug(processorSlug)
            ?: throw PipelineCreateException(ErrorCode.DataProcessorNotUsable, processorSlug)

        return DataProcessorInstance(randomUUID(), findBySlug, parameterInstances = arrayListOf())
    }

    fun addParameterInstance(processorInstance: DataProcessorInstance, name: String, value: String): ParameterInstance {
        val processorParameter = processorParameterRepository.findByDataProcessorIdAndName(processorInstance.dataProcessor.id, name)
            ?: throw PipelineCreateException(ErrorCode.ProcessorParameterNotUsable, name)

        return processorInstance.addParameterInstances(processorParameter, value)
    }

    fun createPipelineInstanceFile(author: Account, pipelineInstance: PipelineInstance, secret: String): String {
        val dataProject = dataProjectRepository.findByIdOrNull(pipelineInstance.dataProjectId)
            ?: throw IllegalArgumentException("DataProject is missing!")

        return YamlFileGenerator().generateYamlFile(author, dataProject, secret, gitlabRootUrl, pipelineInstance.sourceBranch, pipelineInstance.targetBranch, pipelineInstance.dataOperations)
    }

    fun commitYamlFile(userToken: String, projectId: Long, targetBranch: String, fileContent: String, sourceBranch: String = "master"): Commit {
        val commitMessage = "[skip ci] create .mlreef.yml"
        val fileContents = mapOf(Pair(".mlreef.yml", fileContent))
        try {
            gitlabRestClient.createBranch(
                token = userToken, projectId = projectId,
                targetBranch = targetBranch, sourceBranch = sourceBranch
            )
        } catch (e: RestException) {
            log.info(e.message)
        }
        return try {
            val commitFiles = gitlabRestClient.commitFiles(
                token = userToken, projectId = projectId, targetBranch = targetBranch,
                commitMessage = commitMessage, fileContents = fileContents, action = "create")
            log.info("Committed Yaml file in commit ${commitFiles.shortId}")
            commitFiles
        } catch (e: RestException) {
            throw PipelineStartException("Cannot commit mlreef file to branch $targetBranch for project $projectId")
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

    fun createStartGitlabPipeline(userToken: String, projectId: Long, targetBranch: String, fileContent: String, sourceBranch: String, secret: String): PipelineJobInfo {
        commitYamlFile(
            userToken = userToken,
            projectId = projectId,
            sourceBranch = sourceBranch,
            targetBranch = targetBranch,
            fileContent = fileContent)

        val variablesMap = hashMapOf(
            "EPF_BOT_SECRET" to secret
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
        val gitlabPipeline = createStartGitlabPipeline(
            userToken = userToken, projectId = gitlabProjectId,
            targetBranch = instance.targetBranch, sourceBranch = instance.sourceBranch,
            fileContent = fileContent, secret = secret)
        return instance.copy(
            status = PipelineStatus.PENDING,
            pipelineJobInfo = gitlabPipeline
        )
            .let { pipelineInstanceRepository.save(it) }
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
            log.info("Created gitlab pipeline ${pipeline.id} with variables ${variables}")
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

    fun createSecret(): String {
        val md5Hex: String = DigestUtils.md5DigestAsHex(BCrypt.gensalt().toByteArray(Charset.defaultCharset()))
        return md5Hex
    }
}
