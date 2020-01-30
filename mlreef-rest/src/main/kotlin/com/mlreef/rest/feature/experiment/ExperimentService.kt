package com.mlreef.rest.feature.experiment

import com.mlreef.rest.Account
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.ExperimentCreateException
import com.mlreef.rest.exceptions.ExperimentStartException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.Commit
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.findById2
import lombok.RequiredArgsConstructor
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.*
import java.util.UUID.randomUUID

@Service
@RequiredArgsConstructor
class ExperimentService(
    private val experimentRepository: ExperimentRepository,
    private val subjectRepository: SubjectRepository,
    private val dataProjectRepository: DataProjectRepository,
    private val dataProcessorRepository: DataProcessorRepository,
    private val processorParameterRepository: ProcessorParameterRepository,
    private val gitlabRestClient: GitlabRestClient,
    @Value("\${mlreef.gitlab.rootUrl}") val gitlabRootUrl: String

) {

    val log = LoggerFactory.getLogger(this::class.java)

    fun createExperiment(authorId: UUID, dataProjectId: UUID, sourceBranch: String, targetBranch: String): Experiment {
        subjectRepository.findById2(authorId) ?: throw IllegalArgumentException("Owner is missing!")
        dataProjectRepository.findById2(dataProjectId) ?: throw IllegalArgumentException("DataProject is missing!")

        require(!sourceBranch.isBlank()) { "sourceBranch name is missing!" }
        require(!targetBranch.isBlank()) { "targetBranch name is missing!" }

        val experiment = Experiment(
            randomUUID(),
            dataProjectId = dataProjectId,
            sourceBranch = sourceBranch,
            targetBranch = targetBranch
        )
        return experimentRepository.save(experiment)
    }

    fun createExperimentFile(author: Account, experiment: Experiment): String {
        val dataProject = dataProjectRepository.findById2(experiment.dataProjectId)
            ?: throw IllegalArgumentException("DataProject is missing!")

        val experimentFileGenerator = ExperimentFileGenerator()
        experimentFileGenerator.init()
        experimentFileGenerator.replaceAllSingleStrings(
            epfTag = "latest",
            confEmail = author.email,
            confName = author.username,
            gitlabGroup = dataProject.gitlabGroup,
            gitlabRootUrl = gitlabRootUrl,
            gitlabProject = dataProject.gitlabProject,
            sourceBranch = experiment.sourceBranch,
            targetBranch = experiment.targetBranch
        )
        val list: MutableList<DataProcessorInstance> = arrayListOf()
        list.addAll(experiment.preProcessing)
        experiment.getProcessor()?.let { list.add(it) }
        list.addAll(experiment.postProcessing)
        experimentFileGenerator.replacePipeline(list)

        return experimentFileGenerator.output
    }

    fun newDataProcessorInstance(processorSlug: String): DataProcessorInstance {
        val findBySlug = dataProcessorRepository.findBySlug(processorSlug)
            ?: throw ExperimentCreateException(ErrorCode.DataProcessorNotUsable, processorSlug)

        return DataProcessorInstance(randomUUID(), findBySlug, parameterInstances = arrayListOf())
    }

    fun addParameterInstance(processorInstance: DataProcessorInstance, name: String, value: String): ParameterInstance {
        val processorParameter = processorParameterRepository.findByDataProcessorIdAndName(processorInstance.dataProcessor.id, name)
            ?: throw ExperimentCreateException(ErrorCode.ProcessorParameterNotUsable, name)

        return processorInstance.addParameterInstances(processorParameter, value)
    }

    fun commitExperimentFile(userToken: String, projectId: Int, targetBranch: String, fileContent: String, sourceBranch: String = "master"): Commit {
        val commitMessage = "pipeline execution"
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
                commitMessage = commitMessage, fileContents = fileContents)
            commitFiles
        } catch (e: RestException) {
            throw ExperimentStartException("Cannot commit mlreef file to branch $targetBranch for project $projectId")
        }
    }
}
