package com.mlreef.rest.feature.experiment

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.exceptions.CreateExperimentException
import com.mlreef.rest.exceptions.Error
import com.mlreef.rest.findById2
import lombok.RequiredArgsConstructor
import org.springframework.stereotype.Service
import java.util.*
import java.util.UUID.randomUUID

@Service
@RequiredArgsConstructor class ExperimentService(
    private val experimentRepository: ExperimentRepository,
    private val subjectRepository: SubjectRepository,
    private val dataProjectRepository: DataProjectRepository,
    private val dataProcessorRepository: DataProcessorRepository,
    private val processorParameterRepository: ProcessorParameterRepository
) {

    fun createExperiment(authorId: UUID, dataProjectId: UUID, branch: String): Experiment {
        subjectRepository.findById2(authorId) ?: throw IllegalArgumentException("Owner is missing!")
        dataProjectRepository.findById2(dataProjectId) ?: throw IllegalArgumentException("DataProject is missing!")

        require(!branch.isBlank()) { "branch name is missing!" }

        val experiment = Experiment(
            randomUUID(),
            dataProjectId = dataProjectId,
            branch = branch)
        return experimentRepository.save(experiment)
    }

    fun newDataProcessorInstance(processorSlug: String): DataProcessorInstance {
        val findBySlug = dataProcessorRepository.findBySlug(processorSlug)
            ?: throw CreateExperimentException(Error.DataProcessorNotUsable, processorSlug)

        return DataProcessorInstance(randomUUID(), findBySlug, parameterInstances = arrayListOf())
    }

    fun addParameterInstance(processorInstance: DataProcessorInstance, name: String, value: String): ParameterInstance {
        val processorParameter = processorParameterRepository.findByDataProcessorIdAndName(processorInstance.dataProcessor.id, name)
            ?: throw CreateExperimentException(Error.ProcessorParameterNotUsable, name)

        return processorInstance.addParameterInstances(processorParameter, value)
    }
}
