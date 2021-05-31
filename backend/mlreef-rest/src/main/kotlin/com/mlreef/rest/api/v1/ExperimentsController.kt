package com.mlreef.rest.api.v1

import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.ProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Experiment
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.Person
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.utils.Slugs
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
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
    val experimentService: ExperimentService,
    val pipelineService: PipelineService,
    val experimentRepository: ExperimentRepository,
    val projectResolverService: ProjectResolverService,
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)

    private fun beforeGetExperiment(idOrNumber: String, dataProjectId: UUID? = null, dataProject: DataProject? = null): Experiment {
        val id: UUID? = idOrNumber.tryToUUID()
        val number: Int? = if (id == null) idOrNumber.toIntOrNull() else null

        val project = dataProject
            ?: projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        return when {
            number != null -> experimentRepository.findOneByDataProjectAndNumber(project, number)
            id != null -> experimentRepository.findOneByDataProjectAndId(project, id)
            else -> throw NotFoundException(ErrorCode.NotFound, "Experiment not found: '$idOrNumber' neither a valid UUID nor number")
        } ?: throw NotFoundException(ErrorCode.NotFound, "Experiment with id/number $idOrNumber not found")
    }

    @GetMapping
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getAllExperiments(@PathVariable dataProjectId: UUID): List<ExperimentDto> {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        return experimentRepository.findAllByDataProject(dataProject).map(Experiment::toDto)
    }

    @GetMapping("/{idOrNumber}")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperiment(@PathVariable dataProjectId: UUID, @PathVariable idOrNumber: String): ExperimentDto =
        beforeGetExperiment(idOrNumber, dataProjectId).toDto()


    @GetMapping("/{idOrNumber}/info")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperimentMetrics(@PathVariable dataProjectId: UUID, @PathVariable idOrNumber: String): PipelineJobInfoDto =
        beforeGetExperiment(idOrNumber, dataProjectId)
            .pipelineJobInfo
            ?.toDto()
            ?: throw NotFoundException(ErrorCode.NotFound, "Experiment $idOrNumber does not have a PipelineJobInfo (yet)")


    @GetMapping("/{idOrNumber}/mlreef-file", produces = [MediaType.TEXT_PLAIN_VALUE])
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperimentYaml(
        @PathVariable dataProjectId: UUID,
        @PathVariable idOrNumber: String,
        account: Account
    ): String {
        val experiment = beforeGetExperiment(idOrNumber, dataProjectId)
        return experimentService.createExperimentFile(
            experiment = experiment,
            author = account,
            secret = experiment.pipelineJobInfo?.secret ?: "***censored***"
        )
    }

    @PostMapping
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun createExperiment(
        @PathVariable dataProjectId: UUID,
        @Valid @RequestBody experimentCreateRequest: ExperimentCreateRequest,
        person: Person
    ): ExperimentDto {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        log.info(experimentCreateRequest.toString())

        val slug = Slugs.toSlug(experimentCreateRequest.slug)

        if (experimentRepository.findOneByDataProjectAndSlug(dataProject, slug) != null) {
            throw ConflictException(ErrorCode.ExperimentSlugAlreadyInUse, "Duplicate! The slug $slug for Experiment already exists in the DataProject $dataProjectId!")
        }

        val postProcessors = experimentCreateRequest.postProcessing.map { processor ->
            experimentService.newProcessorInstance(processor.id, processor.slug, processor.projectId, processor.branch, processor.version).apply {
                processor.parameters.forEach { parameter ->
                    experimentService.addParameterInstance(this, parameter.name, parameter.value)
                }
            }
        }

        val processorInstance = experimentCreateRequest.processing.let { processor ->
            experimentService.newProcessorInstance(processor.id, processor.slug, processor.projectId, processor.branch, processor.version).apply {
                processor.parameters.forEach { parameter ->
                    experimentService.addParameterInstance(this, parameter.name, parameter.value)
                }
            }
        }

        val newExperiment = experimentService.createExperiment(
            authorId = person.id,
            dataProjectId = dataProject.id,
            pipelineId = experimentCreateRequest.dataInstanceId,
            slug = slug,
            name = experimentCreateRequest.name,
            sourceBranch = experimentCreateRequest.sourceBranch,
            targetBranch = experimentCreateRequest.targetBranch,
            postProcessors = postProcessors,
            inputFiles = experimentCreateRequest.inputFiles
                .map { FileLocation.fromDto(it.location, it.locationType) },
            processorInstance = processorInstance,
        )

        val persisted = experimentRepository.findOneByDataProjectAndId(dataProject, newExperiment.id)!!
        return persisted.toDto()
    }

    @PostMapping("/{idOrNumber}/start")
    @PreAuthorize("canViewProject(#dataProjectId)")
    @Transactional
    fun startExperiment(
        @PathVariable dataProjectId: UUID,
        @PathVariable idOrNumber: String,
        account: Account,
        userToken: TokenDetails,
    ): PipelineJobInfoDto {
        val experiment = beforeGetExperiment(idOrNumber, dataProjectId)

        return experimentService
            .startExperiment(experiment, userToken.accessToken, userToken.personId)
            .pipelineJobInfo!!
            .toDto()
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun cancelExperiment(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID,
        userToken: TokenDetails,
    ): ExperimentDto {
        return experimentService.cancelExperiment(dataProjectId, id).toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun deleteExperiment(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID,
        userToken: TokenDetails,
    ) {
        experimentService.deleteExperiment(dataProjectId, id)
    }
}


data class ExperimentCreateRequest(
    val dataInstanceId: UUID?,
    @NotEmpty val slug: String = "",
    @NotEmpty val name: String,
    @NotEmpty val sourceBranch: String,
    @NotEmpty val targetBranch: String = "",
    @NotEmpty val inputFiles: List<FileLocationDto> = listOf(),
    @Valid val processing: ProcessorInstanceDto,
    @Valid val postProcessing: List<ProcessorInstanceDto> = arrayListOf()
)
