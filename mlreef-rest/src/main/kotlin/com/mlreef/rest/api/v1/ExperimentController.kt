package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.PerformanceMetricsDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.api.v1.dto.toExperimentDtoList
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.findById2
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*
import java.util.logging.Logger
import javax.validation.Valid

@RestController
@RequestMapping("/api/v1/data-projects/{dataProjectId}/experiments")
class ExperimentController(
    val service: ExperimentService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val experimentRepo: ExperimentRepository
) {
    private val logger: Logger = Logger.getLogger(ExperimentController::class.simpleName)

    private fun beforeGetDataProject(dataProjectId: UUID): DataProject {
        return dataProjectRepository.findById2(dataProjectId)
            ?: throw NotFoundException("dataProject was not found")
    }

    private fun beforeGetExperiment(experimentId: UUID): Experiment {
        return experimentRepo.findById2(experimentId)
            ?: throw NotFoundException("dataProject was not found")
    }

    @GetMapping
    fun getAllExperiments(@PathVariable dataProjectId: UUID): List<ExperimentDto> {
        beforeGetDataProject(dataProjectId)
        val experiments: List<Experiment> = experimentRepo.findAllByDataProjectId(dataProjectId).toList()
        return experiments.toExperimentDtoList()
    }

    @GetMapping("/{id}")
    fun getExperiment(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): ExperimentDto {
        beforeGetDataProject(dataProjectId)
        val findOneByDataProjectIdAndId = experimentRepo.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException("Experiment not found")
        return findOneByDataProjectIdAndId.toDto()
    }

    @GetMapping("/{id}/metrics")
    fun getExperimentMetrics(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PerformanceMetricsDto? {
        beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)
        val performanceMetrics = experiment.performanceMetrics
        return performanceMetrics.toDto()
    }

    @PutMapping("/{id}/metrics")
    fun updateExperimentMetrics(@PathVariable dataProjectId: UUID, @PathVariable id: UUID, @RequestBody jsonBlob: String): PerformanceMetricsDto? {
        beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)
        experiment.performanceMetrics.jsonBlob = jsonBlob
        val saved = experimentRepo.save(experiment)
        return saved.performanceMetrics.toDto()
    }

    @PostMapping
    fun createExperiment(@PathVariable dataProjectId: UUID, @Valid @RequestBody experimentCreateRequest: ExperimentCreateRequest): ExperimentDto {
        val dataProject = beforeGetDataProject(dataProjectId)
        val person = currentUserService.person()
        logger.info(experimentCreateRequest.toString())
        val branch = experimentCreateRequest.branch

        val newExperiment = service.createExperiment(person.id, dataProject.id, branch)

        experimentCreateRequest.preProcessing.forEach { processorInstanceDto ->
            val preProcessorInstance = service.newDataProcessorInstance(processorInstanceDto.slug)
            newExperiment.addPreProcessor(preProcessorInstance)
            serviceAddParameter(processorInstanceDto, preProcessorInstance)
        }

        experimentCreateRequest.postProcessing.forEach { processorInstanceDto ->
            val postProcessorInstance = service.newDataProcessorInstance(processorInstanceDto.slug)
            newExperiment.addPostProcessor(postProcessorInstance)
            serviceAddParameter(processorInstanceDto, postProcessorInstance)
        }

        experimentCreateRequest.processing?.let { processorInstanceDto ->
            val algorithm = service.newDataProcessorInstance(processorInstanceDto.slug)
            newExperiment.setProcessor(algorithm)
            serviceAddParameter(processorInstanceDto, algorithm)
        }

        experimentRepo.save(newExperiment)
        val persisted = experimentRepo.findOneByDataProjectIdAndId(dataProjectId, newExperiment.id)!!
        val toDto = persisted.toDto()
        return toDto
    }

    private fun serviceAddParameter(processorInstanceDto: DataProcessorInstanceDto, preProcessorInstance: DataProcessorInstance) {
        processorInstanceDto.parameters.forEach { parameterInstanceDto ->
            service.addParameterInstance(preProcessorInstance,
                parameterInstanceDto.name,
                parameterInstanceDto.value
            )
        }
    }
}

class ExperimentCreateRequest(
    @Valid val branch: String,
    @Valid val preProcessing: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val postProcessing: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val processing: DataProcessorInstanceDto? = null
)
