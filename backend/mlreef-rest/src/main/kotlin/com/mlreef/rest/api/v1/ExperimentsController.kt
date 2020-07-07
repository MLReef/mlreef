package com.mlreef.rest.api.v1

import com.mlreef.rest.Account
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
import com.mlreef.rest.exceptions.UnknownProjectException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.project.DataProjectService
import com.mlreef.utils.Slugs
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.access.prepost.PreAuthorize
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
    val dataProjectService: DataProjectService,
    val pipelineService: PipelineService,
    val dataProjectRepository: DataProjectRepository,
    val experimentRepository: ExperimentRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)

    private fun beforeGetExperiment(experimentId: UUID): Experiment {
        return experimentRepository.findByIdOrNull(experimentId)
            ?: throw UnknownProjectException("Experiment with id $experimentId not found")
    }

    @GetMapping
    @PreAuthorize("userInProject(#dataProjectId) || projectIsPublic(#dataProjectId)")
    fun getAllExperiments(@PathVariable dataProjectId: UUID): List<ExperimentDto> {
        val experiments: List<Experiment> = experimentRepository.findAllByDataProjectId(dataProjectId).toList()
        return experiments.map(Experiment::toDto)
    }

    @GetMapping("/{id}")
    @PreAuthorize("userInProject(#dataProjectId) || projectIsPublic(#dataProjectId)")
    fun getExperiment(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): ExperimentDto {
        val findOneByDataProjectIdAndId = experimentRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException("Experiment not found")
        return findOneByDataProjectIdAndId.toDto()
    }

    @GetMapping("/{id}/info")
    @PreAuthorize("userInProject(#dataProjectId) || projectIsPublic(#dataProjectId)")
    fun getExperimentMetrics(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PipelineJobInfoDto {
        val experiment = beforeGetExperiment(id)
        val pipelineJobInfo = experiment.pipelineJobInfo
            ?: throw NotFoundException("Experiment does not have a PipelineJobInfo (yet)")
        return pipelineJobInfo.toDto()
    }

    @GetMapping("/{id}/mlreef-file")
    @PreAuthorize("userInProject(#dataProjectId) || projectIsPublic(#dataProjectId)")
    fun getExperimentYaml(@PathVariable dataProjectId: UUID, @PathVariable id: UUID, account: Account): String {
        val experiment = beforeGetExperiment(id)

        return service.createExperimentFile(experiment = experiment, author = account, secret = "deprecated")
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun startExperiment(@PathVariable dataProjectId: UUID,
                        @PathVariable id: UUID,
                        account: Account,
                        userToken: TokenDetails): PipelineJobInfoDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

        val experiment = beforeGetExperiment(id)

        service.guardStatusChange(experiment, newStatus = ExperimentStatus.PENDING)

        val secret = pipelineService.createSecret()
        val fileContent = service.createExperimentFile(experiment = experiment, author = account, secret = secret)

        val username = account.username
        val token = account.bestToken?.token ?: "empty"
        val pipelineJobInfo = pipelineService.createStartGitlabPipeline(userToken = userToken.permanentToken, projectId = dataProject.gitlabId,
            targetBranch = experiment.targetBranch, fileContent = fileContent, sourceBranch = experiment.sourceBranch, secret = secret, gitPushUser = username, gitPushToken = token)

        val experimentWithPipeline = service.savePipelineInfo(experiment, pipelineJobInfo)

        return experimentWithPipeline.pipelineJobInfo!!.toDto()
    }

    @PostMapping
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun createExperiment(@PathVariable dataProjectId: UUID,
                         @Valid @RequestBody experimentCreateRequest: ExperimentCreateRequest,
                         person: Person): ExperimentDto {
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
    @NotEmpty val inputFiles: List<String> = listOf(),
    @Valid val processing: DataProcessorInstanceDto,
    @Valid val postProcessing: List<DataProcessorInstanceDto> = arrayListOf()
)
