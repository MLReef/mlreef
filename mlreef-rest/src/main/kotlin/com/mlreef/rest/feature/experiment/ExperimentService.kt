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
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.pipeline.YamlFileGenerator
import lombok.RequiredArgsConstructor
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
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
        subjectRepository.findByIdOrNull(authorId) ?: throw IllegalArgumentException("Owner is missing!")
        dataProjectRepository.findByIdOrNull(dataProjectId) ?: throw IllegalArgumentException("DataProject is missing!")

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
        val dataProject = dataProjectRepository.findByIdOrNull(experiment.dataProjectId)
            ?: throw IllegalArgumentException("DataProject is missing!")

        val list: MutableList<DataProcessorInstance> = arrayListOf()
        list.addAll(experiment.preProcessing)
        experiment.getProcessor()?.let { list.add(it) }
        list.addAll(experiment.postProcessing)

        return YamlFileGenerator().generateYamlFile(author, dataProject, gitlabRootUrl, experiment.sourceBranch, experiment.targetBranch, list)
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
}
