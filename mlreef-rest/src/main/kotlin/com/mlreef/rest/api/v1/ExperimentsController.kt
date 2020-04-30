package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.utils.Slugs
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.logging.Logger
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects/{dataProjectId}/experiments")
class ExperimentsController(
    val service: ExperimentService,
    val pipelineService: PipelineService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val experimentRepository: ExperimentRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)
    private val dataProjectNotFound = "dataProject was not found"

    private fun beforeGetDataProject(dataProjectId: UUID): DataProject {
        val dataProject = (dataProjectRepository.findByIdOrNull(dataProjectId)
            ?: throw NotFoundException(dataProjectNotFound))

        val id = currentUserService.person().id
        if (dataProject.ownerId != id) {
            log.warning("User $id requested an DataProject of ${dataProject.ownerId}")
            throw NotFoundException(dataProjectNotFound)
        }
        return dataProject
    }

    private fun beforeGetExperiment(experimentId: UUID): Experiment {
        return experimentRepository.findByIdOrNull(experimentId)
            ?: throw NotFoundException(dataProjectNotFound)
    }

    @GetMapping
    fun getAllExperiments(@PathVariable dataProjectId: UUID): List<ExperimentDto> {
        beforeGetDataProject(dataProjectId)
        val experiments: List<Experiment> = experimentRepository.findAllByDataProjectId(dataProjectId).toList()
        return experiments.map(Experiment::toDto)
    }

    @GetMapping("/{id}")
    fun getExperiment(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): ExperimentDto {
        beforeGetDataProject(dataProjectId)
        val findOneByDataProjectIdAndId = experimentRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException("Experiment not found")
        return findOneByDataProjectIdAndId.toDto()
    }

    @GetMapping("/{id}/metrics")
    fun getExperimentMetrics(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PipelineJobInfoDto {
        beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)
        val pipelineJobInfo = experiment.pipelineJobInfo
        return pipelineJobInfo!!.toDto()
    }

    @GetMapping("/{id}/mlreef-file")
    fun getExperimentYaml(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): String {
        beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)

        val account = currentUserService.account()
        return service.createExperimentFile(experiment = experiment, author = account, secret = "deprecated")
    }

    @PostMapping("/{id}/start")
    fun startExperiment(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PipelineJobInfoDto {
        val dataProject = beforeGetDataProject(dataProjectId)
        val experiment = beforeGetExperiment(id)

        service.guardStatusChange(experiment, newStatus = ExperimentStatus.PENDING)

        val account = currentUserService.account()
        val userToken = currentUserService.permanentToken()

        val secret = pipelineService.createSecret()
        val fileContent = service.createExperimentFile(experiment = experiment, author = account,secret = secret)

        val pipelineJobInfo = pipelineService.createStartGitlabPipeline(userToken = userToken, sourceBranch = experiment.sourceBranch,
            targetBranch = experiment.targetBranch, projectId = dataProject.gitlabId, secret = secret,fileContent = fileContent)

        val experimentWithPipeline = service.savePipelineInfo(experiment, pipelineJobInfo)
        return experimentWithPipeline.pipelineJobInfo!!.toDto()
    }

    @PostMapping
    fun createExperiment(@PathVariable dataProjectId: UUID, @Valid @RequestBody experimentCreateRequest: ExperimentCreateRequest): ExperimentDto {
        val dataProject = beforeGetDataProject(dataProjectId)
        val person = currentUserService.person()
        log.info(experimentCreateRequest.toString())

        val slug = Slugs.toSlug(experimentCreateRequest.slug)
        val findAllByDataProjectIdAndSlug = experimentRepository.findOneByDataProjectIdAndSlug(dataProjectId, slug)
        findAllByDataProjectIdAndSlug?.let {
            throw ConflictException(ErrorCode.ExperimentSlugAlreadyInUse, "Duplicate! There exists already an Experiment in this DataProject for this slug: $slug !")
        }

        val postProcessors = experimentCreateRequest.postProcessing.map { processorInstanceDto ->
            service.newDataProcessorInstance(processorInstanceDto.slug).apply {
                processorInstanceDto.parameters.forEach { dto ->
                    service.addParameterInstance(this, dto.name, dto.value)
                }
            }
        }

        val processorInstance = experimentCreateRequest.processing?.let { processorInstanceDto ->
            service.newDataProcessorInstance(processorInstanceDto.slug).apply {
                processorInstanceDto.parameters.forEach { dto ->
                    service.addParameterInstance(this, dto.name, dto.value)
                }
            }
        }

        val newExperiment = service.createExperiment(
            authorId = person.id,
            dataProjectId = dataProject.id,
            dataInstanceId = experimentCreateRequest.dataInstanceId,
            slug = slug,
            name = experimentCreateRequest.name,
            sourceBranch = experimentCreateRequest.sourceBranch,
            targetBranch = experimentCreateRequest.targetBranch,
            postProcessors = postProcessors,
            processorInstance = processorInstance
        )

        val persisted = experimentRepository.findOneByDataProjectIdAndId(dataProjectId, newExperiment.id)!!
        val toDto = persisted.toDto()
        return toDto
    }
}

class ExperimentCreateRequest(
    val dataInstanceId: UUID?,
    @NotEmpty val slug: String = "",
    @NotEmpty val name: String,
    @NotEmpty val sourceBranch: String,
    @NotEmpty val targetBranch: String = "",
    @Valid val processing: DataProcessorInstanceDto? = null,
    @Valid val postProcessing: List<DataProcessorInstanceDto> = arrayListOf()
)
