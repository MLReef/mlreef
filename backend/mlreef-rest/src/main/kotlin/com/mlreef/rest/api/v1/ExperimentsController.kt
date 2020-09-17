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
class ExperimentsController(
    val service: ExperimentService,
    val dataProjectService: ProjectService<DataProject>,
    val pipelineService: PipelineService,
    val dataProjectRepository: DataProjectRepository,
    val experimentRepository: ExperimentRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)

    private fun beforeGetExperiment(experimentId: UUID): Experiment {
        return experimentRepository.findByIdOrNull(experimentId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Experiment with id $experimentId not found")
    }

    private fun beforeGetExperiment(dataProjectId: UUID, idOrNumber: String): Experiment {
        val number: Int? = tryOrNull { idOrNumber.toInt() }
        val id: UUID? = tryOrNull { UUID.fromString(idOrNumber) }

        val found = when {
            number != null -> experimentRepository.findOneByDataProjectIdAndNumber(dataProjectId, number)
            id != null -> experimentRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            else -> throw NotFoundException(ErrorCode.NotFound, "Experiment not found: '$idOrNumber' not a valid id/number")
        }
        return found ?: throw NotFoundException(ErrorCode.NotFound, "Experiment with id/number $idOrNumber not found")
    }

    @GetMapping
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getAllExperiments(@PathVariable dataProjectId: UUID): List<ExperimentDto> {
        val experiments: List<Experiment> = experimentRepository.findAllByDataProjectId(dataProjectId).toList()
        return experiments.map(Experiment::toDto)
    }

    @GetMapping("/{idOrNumber}")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperiment(@PathVariable dataProjectId: UUID, @PathVariable idOrNumber: String): ExperimentDto {
        val experiment = beforeGetExperiment(dataProjectId, idOrNumber)
        return experiment.toDto()
    }

    fun <R> tryOrNull(func: () -> R): R? = try {
        func.invoke()
    } catch (e: Exception) {
        null
    }

    @GetMapping("/{idOrNumber}/info")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperimentMetrics(@PathVariable dataProjectId: UUID, @PathVariable idOrNumber: String): PipelineJobInfoDto {
        val experiment = beforeGetExperiment(dataProjectId, idOrNumber)
        return experiment.pipelineJobInfo?.toDto()
            ?: throw NotFoundException(ErrorCode.NotFound, "Experiment does not have a PipelineJobInfo (yet)")
    }

    @GetMapping("/{idOrNumber}/mlreef-file", produces = [MediaType.TEXT_PLAIN_VALUE])
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getExperimentYaml(@PathVariable dataProjectId: UUID, @PathVariable idOrNumber: String, account: Account): String {
        val experiment = beforeGetExperiment(dataProjectId, idOrNumber)
        return service.createExperimentFile(experiment = experiment, author = account, secret = experiment.pipelineJobInfo?.secret
            ?: "***censored***")
    }

    @PostMapping("/{idOrNumber}/start")
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun startExperiment(@PathVariable dataProjectId: UUID,
                        @PathVariable idOrNumber: String,
                        account: Account,
                        userToken: TokenDetails): PipelineJobInfoDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

        val experiment = beforeGetExperiment(dataProjectId, idOrNumber)

        service.guardStatusChange(experiment, newStatus = ExperimentStatus.PENDING)

        val secret = pipelineService.createSecret()
        val fileContent = service.createExperimentFile(experiment = experiment, author = account, secret = secret)

        val pipelineJobInfo = pipelineService.createStartGitlabPipeline(userToken = userToken.accessToken, projectGitlabId = dataProject.gitlabId,
            targetBranch = experiment.targetBranch, fileContent = fileContent, sourceBranch = experiment.sourceBranch, secret = secret)

        val experimentWithPipeline = service.savePipelineInfo(experiment, pipelineJobInfo)

        return experimentWithPipeline.pipelineJobInfo!!.toDto()
    }

    @PostMapping
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun createExperiment(
        @PathVariable dataProjectId: UUID,
        @Valid @RequestBody experimentCreateRequest: ExperimentCreateRequest,
        person: Person
    ): ExperimentDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

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

        val processorInstance = experimentCreateRequest.processing.let { processorInstanceDto ->
            service.newDataProcessorInstance(processorInstanceDto.slug).apply {
                processorInstanceDto.parameters.forEach { dto ->
                    service.addParameterInstance(this, dto.name, dto.value)
                }
            }
        }

        val inputFiles = experimentCreateRequest.inputFiles.map { FileLocation.fromPath(it) }
        val newExperiment = service.createExperiment(
            authorId = person.id,
            dataProjectId = dataProject.id,
            dataInstanceId = experimentCreateRequest.dataInstanceId,
            slug = slug,
            name = experimentCreateRequest.name,
            sourceBranch = experimentCreateRequest.sourceBranch,
            targetBranch = experimentCreateRequest.targetBranch,
            postProcessors = postProcessors,
            inputFiles = inputFiles,
            processorInstance = processorInstance
        )

        val persisted = experimentRepository.findOneByDataProjectIdAndId(dataProjectId, newExperiment.id)!!
        return persisted.toDto()
    }

    // Please avoid fanboy-usage of kotlin expression functions! They are nice, and advised for short expressions, which are *single* expression or can be concateneted simpliy!
    // If you need "let", it is actually a sign, that is not a "natural" single expression, but a forced one. Please keep it readable and respects the maintainers

    // also "let" inverses the flow of reading the code. Code is beautiful when it is easy and readable,
    // not just because the amount of forced usage of expression functions is maximized, nobody in the style guides suggests that
    @Deprecated("This is a workaround solution and should be removed ASAP ") //TODO //FIXME
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    // FIXME think about a return value? usually UPDATE might return the new object in case of success
    fun updateExperimentStatus(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID
    ) = experimentRepository.save(beforeGetExperiment(id).copy(status = ExperimentStatus.CANCELED)).toDto()

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun deleteExperiment(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID
    ) {
        //Kotlin style guide: "Prefer using an expression body for functions with the body consisting of a *single* expression", and please not for Unit, that is misleading
        beforeGetExperiment(id)
        experimentRepository.deleteById(id)
    }
}

class ExperimentCreateRequest(
    val dataInstanceId: UUID?,
    @NotEmpty val slug: String = "",
    @NotEmpty val name: String,
    @NotEmpty val sourceBranch: String,
    @NotEmpty val targetBranch: String = "",
    @NotEmpty val inputFiles: List<String> = listOf(),
    @Valid val processing: DataProcessorInstanceDto,
    @Valid val postProcessing: List<DataProcessorInstanceDto> = arrayListOf()
)
