package com.mlreef.rest.feature.experiment

import com.mlreef.rest.Account
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineJobInfo
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.ExperimentCreateException
import com.mlreef.rest.exceptions.ExperimentUpdateException
import com.mlreef.rest.feature.pipeline.YamlFileGenerator
import com.mlreef.utils.Slugs
import lombok.RequiredArgsConstructor
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.UUID.randomUUID

@Service
@RequiredArgsConstructor
class ExperimentService(
    private val experimentRepository: ExperimentRepository,
    private val subjectRepository: SubjectRepository,
    private val dataProjectRepository: DataProjectRepository,
    private val dataProcessorRepository: DataProcessorRepository,
    private val pipelineInstanceRepository: PipelineInstanceRepository,
    private val processorParameterRepository: ProcessorParameterRepository,
    @Value("\${mlreef.gitlab.rootUrl}") val gitlabRootUrl: String
) {

    val log = LoggerFactory.getLogger(this::class.java)

    fun createExperiment(
        authorId: UUID,
        dataProjectId: UUID,
        dataInstanceId: UUID?,
        slug: String,
        name: String,
        sourceBranch: String,
        targetBranch: String,
        postProcessors: List<DataProcessorInstance> = listOf(),
        processorInstance: DataProcessorInstance? = null
    ): Experiment {

        subjectRepository.findByIdOrNull(authorId) ?: throw IllegalArgumentException("Owner is missing!")
        dataProjectRepository.findByIdOrNull(dataProjectId) ?: throw IllegalArgumentException("DataProject is missing!")

        dataInstanceId?.let {
            pipelineInstanceRepository.findByIdOrNull(dataInstanceId)
                ?: throw IllegalArgumentException("DataPipelineInstance is missing!")
        }

        require(!name.isBlank()) { "name is missing!" }
        require(!sourceBranch.isBlank()) { "sourceBranch is missing!" }

        val validSlug = if (slug.isBlank()) {
            Slugs.toSlug(name)
        } else {
            Slugs.toSlug(slug)
        }

        require(!validSlug.isBlank() && Slugs.isValid(validSlug)) { "slug name is not valid!" }

//        require(!targetBranch.isBlank()) { "targetBranch is missing!" }
        require(processorInstance != null) { "algorithm/model is missing!" }

        val id = randomUUID()
        val experiment = Experiment(
            id,
            dataProjectId = dataProjectId,
            dataInstanceId = dataInstanceId,
            slug = validSlug,
            name = name,
            sourceBranch = sourceBranch,
            targetBranch = targetBranch
        )

        postProcessors.forEach {
            experiment.addPostProcessor(it)
        }
        processorInstance.let {
            experiment.setProcessor(it)
        }

        return experimentRepository.save(experiment)
    }

    fun createExperimentFile(author: Account, experiment: Experiment, secret: String): String {
        val dataProject = dataProjectRepository.findByIdOrNull(experiment.dataProjectId)
            ?: throw IllegalArgumentException("DataProject is missing!")

        val list: MutableList<DataProcessorInstance> = arrayListOf()
        experiment.getProcessor()?.let { list.add(it) }
        list.addAll(experiment.postProcessing)

        return YamlFileGenerator().generateYamlFile(author, dataProject, secret, gitlabRootUrl, experiment.sourceBranch, experiment.targetBranch, list)
    }

    fun guardStatusChange(experiment: Experiment, newStatus: ExperimentStatus) {
        if (experiment.status.canUpdateTo(newStatus)) {
            log.info("Update status of Experiment to $newStatus")
        } else {
            log.warn("Update status of Experiment to $newStatus not possible, already has ${experiment.status}")
            throw ExperimentUpdateException("Cannot increase ExperimentStatus to $newStatus")
        }
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

    fun savePipelineInfo(experiment: Experiment, pipelineJobInfo: PipelineJobInfo): Experiment {
        return experimentRepository.save(experiment.copy(
            status = ExperimentStatus.PENDING,
            pipelineJobInfo = pipelineJobInfo
        ))
    }
}
