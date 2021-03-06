package com.mlreef.rest.api.v1

import com.mlreef.rest.Account
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.FileLocation
import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.utils.Slugs
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.logging.Logger
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects/{dataProjectId}/experiments")
internal class ExperimentsController(
    val service: ExperimentService,
    val dataProjectService: ProjectService<DataProject>,
    val pipelineService: PipelineService,
    val dataProjectRepository: DataProjectRepository,
    val experimentRepository: ExperimentRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)

    private fun beforeGetExperiment(dataProjectId: UUID, idOrNumber: String): Experiment {
        val number: Int? = idOrNumber.toIntOrNull()
        val id: UUID? =
            try {
                { UUID.fromString(idOrNumber) }.invoke()
            } catch (e: Exception) {
                null
            }

        val found = when {
            number != null -> experimentRepository.findOneByDataProjectIdAndNumber(dataProjectId, number)
            id != null -> experimentRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            else -> throw NotFoundException(ErrorCode.NotFound, "Experiment not found: '$idOrNumber' neither a valid UUID nor number")
        }
        return found ?: throw NotFoundException(ErrorCode.NotFound, "Experiment with id/number $idOrNumber not found")
    }

    @GetMapping
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getAllExperiments(@PathVariable dataProjectId: UUID): List<ExperimentDto> =
        experimentRepository.findAllByDataProjectId(dataProjectId)
            .map { it.toDto() }


    @GetMapping("/{idOrNumber}")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperiment(@PathVariable dataProjectId: UUID, @PathVariable idOrNumber: String): ExperimentDto =
        beforeGetExperiment(dataProjectId, idOrNumber).toDto()


    @GetMapping("/{idOrNumber}/info")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperimentMetrics(@PathVariable dataProjectId: UUID, @PathVariable idOrNumber: String): PipelineJobInfoDto =
        beforeGetExperiment(dataProjectId, idOrNumber)
            .pipelineJobInfo
            ?.toDto()
            ?: throw NotFoundException(ErrorCode.NotFound, "Experiment does not have a PipelineJobInfo (yet)")


    @GetMapping("/{idOrNumber}/mlreef-file", produces = [MediaType.TEXT_PLAIN_VALUE])
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperimentYaml(
        @PathVariable dataProjectId: UUID,
        @PathVariable idOrNumber: String,
        account: Account
    ): String {
        val experiment = beforeGetExperiment(dataProjectId, idOrNumber)
        return service.createExperimentFile(
            experiment = experiment,
            author = account,
            secret = experiment.pipelineJobInfo?.secret ?: "***censored***"
        )
    }

    @PostMapping("/{idOrNumber}/start")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun startExperiment(
        @PathVariable dataProjectId: UUID,
        @PathVariable idOrNumber: String,
        account: Account,
        userToken: TokenDetails,
    ): PipelineJobInfoDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

        val experiment = beforeGetExperiment(dataProjectId, idOrNumber)

        service.guardStatusChange(experiment, newStatus = ExperimentStatus.PENDING)

        val secret = pipelineService.createSecret()
        val fileContent = service.createExperimentFile(experiment = experiment, author = account, secret = secret)

        val pipelineJobInfo = pipelineService.createStartGitlabPipeline(userToken = userToken.accessToken, projectGitlabId = dataProject.gitlabId,
            targetBranch = experiment.targetBranch, fileContent = fileContent, sourceBranch = experiment.sourceBranch, secret = secret)

        return service.savePipelineInfo(experiment, pipelineJobInfo)
            .pipelineJobInfo!!
            .toDto()
    }

    @PostMapping
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun createExperiment(
        @PathVariable dataProjectId: UUID,
        @Valid @RequestBody experimentCreateRequest: ExperimentCreateRequest,
        person: Person
    ): ExperimentDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

        log.info(experimentCreateRequest.toString())

        val slug = Slugs.toSlug(experimentCreateRequest.slug)
        if (experimentRepository.findOneByDataProjectIdAndSlug(dataProjectId, slug) != null) {
            throw ConflictException(ErrorCode.ExperimentSlugAlreadyInUse, "Duplicate! There exists already an Experiment in this DataProject for this slug: $slug !")
        }

        val postProcessors = experimentCreateRequest.postProcessing.map { processorInstanceDto ->
            service.newDataProcessorInstance(processorInstanceDto.slug).apply {
                processorInstanceDto.parameters.forEach { dto ->
                    service.addParameterInstance(this, dto.name, dto.value)
                }
            }
        }

        val processorInstance = experimentCreateRequest.processing.let { processorInstanceDto ->
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
            inputFiles = experimentCreateRequest.inputFiles
                .map { FileLocation.fromDto(it.location, it.locationType) },
            processorInstance = processorInstance,
        )

        val persisted = experimentRepository.findOneByDataProjectIdAndId(dataProjectId, newExperiment.id)!!
        return persisted.toDto()
    }


    @Deprecated("This is a workaround solution and should be removed ASAP ") //TODO //FIXME
    @PostMapping("/{id}/cancel")
    @PreAuthorize("canViewProject(#dataProjectId)")
    // FIXME think about a return value? usually UPDATE might return the new object in case of success
    fun updateExperimentStatus(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID
    ) = experimentRepository.findByIdOrNull(id)
        ?.copy(status = ExperimentStatus.CANCELED)
        ?.let { experimentRepository.save(it) }
        ?.toDto()
        ?: throw NotFoundException(ErrorCode.NotFound, "Experiment with id $id not found")


    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun deleteExperiment(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID
    ) {
        if (experimentRepository.findByIdOrNull(id) != null) {
            experimentRepository.deleteById(id)
        }
    }
}


class ExperimentCreateRequest(
    val dataInstanceId: UUID?,
    @NotEmpty val slug: String = "",
    @NotEmpty val name: String,
    @NotEmpty val sourceBranch: String,
    @NotEmpty val targetBranch: String = "",
    @NotEmpty val inputFiles: List<FileLocationDto> = listOf(),
    @Valid val processing: DataProcessorInstanceDto,
    @Valid val postProcessing: List<DataProcessorInstanceDto> = arrayListOf()
)
