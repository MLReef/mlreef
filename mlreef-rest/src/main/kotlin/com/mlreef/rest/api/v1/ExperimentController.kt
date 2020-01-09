package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.PerformanceMetricsDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.api.v1.dto.toExperimentDtoList
import com.mlreef.rest.exceptions.ExperimentUpdateException
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
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects/{dataProjectId}/experiments")
class ExperimentController(
    val service: ExperimentService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val experimentRepo: ExperimentRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentController::class.simpleName)

    private fun beforeGetDataProject(dataProjectId: UUID): DataProject {
        val dataProject = (dataProjectRepository.findById2(dataProjectId)
            ?: throw NotFoundException("dataProject was not found"))

        // FIXME: ask Rainer/Christoph about best-practise with Spring Roles, Authorities and stuff
        val id = currentUserService.person().id
        if (dataProject.ownerId != id) {
            log.warning("User $id requested an DataProject of ${dataProject.ownerId}")
            throw NotFoundException("dataProject was not found")
        }
        return dataProject
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

    @PutMapping("/{id}/status")
    fun updateExperimentStatus(@PathVariable dataProjectId: UUID, @PathVariable id: UUID, @Valid @RequestBody newStatus: ExperimentStatus): ExperimentStatus {
        beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)
        if (experiment.status.canUpdateTo(newStatus)) {
            log.info("Update status of Experiment to $newStatus")
            val changeExperiment = experiment.copy(
                status = newStatus
            )
            val saved = experimentRepo.save(experiment)
            return saved.status
        } else {
            log.warning("Update status of Experiment to $newStatus not possible, already has ${experiment.status}")
            throw ExperimentUpdateException("Cannot increate ExperimentStatus to $newStatus")
        }

    }

    @GetMapping("/{id}/mlreef-file")
    fun getExperimentMlreefFile(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): String {
        beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)

        val account = currentUserService.account()
        return service.createExperimentFile(experiment = experiment, author = account)
    }

    @PostMapping("/{id}/mlreef-file")
    fun createExperimentMlreefFile(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): String {
        val dataProject = beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)

        val account = currentUserService.account()
        val fileContent = service.createExperimentFile(experiment = experiment, author = account)

        val userToken = currentUserService.token()
        service.commitExperimentFile(
            userToken = userToken, projectId = dataProject.gitlabId,
            targetBranch = experiment.targetBranch, sourceBranch = experiment.sourceBranch,
            fileContent = fileContent)
        return fileContent
    }

    @PostMapping
    fun createExperiment(@PathVariable dataProjectId: UUID, @Valid @RequestBody experimentCreateRequest: ExperimentCreateRequest): ExperimentDto {
        val dataProject = beforeGetDataProject(dataProjectId)
        val person = currentUserService.person()
        log.info(experimentCreateRequest.toString())

        val newExperiment = service.createExperiment(person.id, dataProject.id, "source", "target")

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
    @NotEmpty val sourceBranch: String,
    @NotEmpty val targetBranch: String,
    @Valid val preProcessing: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val postProcessing: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val processing: DataProcessorInstanceDto? = null
)
