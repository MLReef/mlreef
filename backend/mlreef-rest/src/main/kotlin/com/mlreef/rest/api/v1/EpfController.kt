package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.api.v1.dto.toPublishingPipelineDto
import com.mlreef.rest.domain.*
import com.mlreef.rest.exceptions.*
import com.mlreef.rest.feature.PublishingService
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.feature.project.ProjectResolverService
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.*

const val EPF_HEADER = "EPF-BOT-TOKEN"

@RestController
@RequestMapping("/api/v1/epf")
class EpfController(
    val service: ExperimentService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val pipelineRepository: PipelinesRepository,
    val experimentRepository: ExperimentRepository,
    private val publishingService: PublishingService,
    private val processorService: ProcessorsService,
    private val projectResolverService: ProjectResolverService,
    private val pipelineService: PipelineService,
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private val dataProjectNotFound = "Experiment with UUID was not found or visible"

    private fun beforeGetExperiment(experimentId: UUID, token: String): Experiment {
        val experiment = experimentRepository.findByIdOrNull(experimentId)
            ?: throw NotFoundException(ErrorCode.NotFound, dataProjectNotFound)
        return getGuardedInstance(experiment.pipelineJobInfo, token, experiment)
    }

    private fun beforeGetPipelineInstance(instanceId: UUID, token: String): Pipeline {
        val instance = pipelineRepository.findByIdOrNull(instanceId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Pipeline $instanceId not found")
        return getGuardedInstance(instance.pipelineJobInfo, token, instance)
    }

    private fun beforeGetPublishing(
        projectId: UUID,
        token: String,
        branch: String? = null,
        version: String? = null,
        processorId: UUID? = null
    ): Processor {
        val codeProject = projectResolverService.resolveCodeProject(projectId)
            ?: throw NotFoundException("Code project $projectId not found")

        val dataProcessor = if (branch != null && version != null) {
            processorService.getProcessorForProjectAndBranchAndVersion(codeProject, branch, version)
                ?: throw NotFoundException("Project $projectId has no data processor for branch $branch and version $version. Probably it was published incorrectly")
        } else if (processorId != null) {
            processorService.getProcessorById(processorId)
                ?: throw NotFoundException("Project $projectId has no processor $processorId. Probably it was published incorrectly")
        } else throw BadRequestException("Either branch+version or processor id must be provided")

        if (dataProcessor.secret != token) throw BadRequestException("Token is incorrect")

        return dataProcessor
    }

    private fun <T> getGuardedInstance(pipelineJobInfo: PipelineJobInfo?, token: String, guardedInstance: T): T {
        return when {
            (pipelineJobInfo == null) -> {
                log.warn("Experiment/Pipeline exists, but PipelineJobInfo is null!")
                throw PipelineStateException(message = "Experiment/Pipeline exists, but PipelineJobInfo is null!")
            }
            (pipelineJobInfo.secret != token) -> {
                log.warn("Experiment/Pipeline and PipelineJobInfo exist, but a wrong token is provided!")
                throw AccessDeniedException("Invalid token $token for pipeline")
            }
            else -> guardedInstance
        }
    }

    @PutMapping("/experiments/{id}/update")
    fun epfUpdateExperiment(
        @PathVariable id: UUID,
        @RequestHeader(EPF_HEADER) token: String,
        @RequestBody jsonBlob: String
    ): PipelineJobInfoDto {
        val experiment = beforeGetExperiment(id, token)
        service.guardStatusChange(experiment, newStatus = ExperimentStatus.RUNNING)
        val pipelineJobInfo = experiment.pipelineJobInfo?.copy(
            updatedAt = Instant.now()
        )
        val experimentUpdate = experiment.copy(
            pipelineJobInfo = pipelineJobInfo,
            status = ExperimentStatus.RUNNING,
            jsonBlob = jsonBlob
        )
        val saved = experimentRepository.save(experimentUpdate)
        return saved.pipelineJobInfo!!.toDto()
    }

    @PutMapping("/pipeline_instance/{id}/update")
    fun epfUpdatePipelineInstance(
        @PathVariable id: UUID,
        @RequestHeader(EPF_HEADER) token: String,
        @RequestBody jsonBlob: String
    ): PipelineJobInfoDto {
        beforeGetPipelineInstance(id, token)
        return pipelineService.pipelineJobUpdated(id).toDto()
    }

    @PutMapping("/experiments/{id}/finish")
    fun epfFinishExperiment(
        @PathVariable id: UUID,
        @RequestHeader(EPF_HEADER) token: String
    ): PipelineJobInfoDto {
        val experiment = beforeGetExperiment(id, token)

        service.guardStatusChange(experiment, newStatus = ExperimentStatus.SUCCESS)

        val pipelineJobInfo = experiment.pipelineJobInfo?.copy(
            finishedAt = Instant.now()
        )
        val experimentUpdate = experiment.copy(
            pipelineJobInfo = pipelineJobInfo,
            status = ExperimentStatus.SUCCESS
        )
        val saved = experimentRepository.save(experimentUpdate)
        return saved.pipelineJobInfo!!.toDto()
    }

    @PutMapping("/pipeline_instance/{id}/finish")
    fun epfFinishPipelineInstance(
        @PathVariable id: UUID,
        @RequestHeader(EPF_HEADER) token: String
    ): PipelineJobInfoDto {
        beforeGetPipelineInstance(id, token)
        return pipelineService.pipelineJobFinished(id).toDto()
    }

    @PutMapping("/code-projects/{id}/publish/job-start")
    fun jobStartPublishing(
        @PathVariable id: UUID,
        @RequestParam(value = "branch", required = true) branch: String,
        @RequestParam(value = "version", required = true) version: String,
        @RequestHeader(EPF_HEADER) token: String,
    ): CodeProjectPublishingDto {
        log.debug("Publication started for:")
        log.debug("Project: $id")
        log.debug("Branch: $branch")
        log.debug("Version: $version")
        beforeGetPublishing(id, token, branch, version)
        return publishingService.publicationJobStarted(id, branch, version).toPublishingPipelineDto()
    }

    @PutMapping("/code-projects/{id}/publish/finish")
    fun jobFinishPublishing(
        @PathVariable id: UUID,
        @RequestParam(value = "image", required = true) imageName: String,
        @RequestParam(value = "branch", required = true) branch: String,
        @RequestParam(value = "version", required = true) version: String,
        @RequestHeader(EPF_HEADER) token: String,
    ): CodeProjectPublishingDto {
        log.debug("Publication finished for:")
        log.debug("Project: $id")
        log.debug("Docker image name: $imageName")
        log.debug("Branch: $branch")
        log.debug("Version: $version")
        beforeGetPublishing(id, token, branch, version)
        return publishingService.publicationJobFinished(id, branch, version, imageName).toPublishingPipelineDto()
    }

    @PutMapping("/code-projects/{projectId}/unpublish/job-start")
    fun jobStartUnpublishing(
        @PathVariable projectId: UUID,
        @RequestParam(value = "id", required = true) processorId: UUID,
        @RequestHeader(EPF_HEADER) token: String,
    ): CodeProjectPublishingDto {
        log.debug("Unpublishing started for:")
        log.debug("Project: $projectId")
        log.debug("Processor: $processorId")
        beforeGetPublishing(projectId, token, processorId = processorId)
        return publishingService.unPublishingJobStarted(projectId, processorId).toPublishingPipelineDto()
    }

    @PutMapping("/code-projects/{projectId}/unpublish/finish")
    fun jobFinishUnpublishing(
        @PathVariable projectId: UUID,
        @RequestParam(value = "id", required = true) processorId: UUID,
        @RequestHeader(EPF_HEADER) token: String,
    ): CodeProjectPublishingDto {
        log.debug("Unpublishing finished for:")
        log.debug("Project: $projectId")
        log.debug("Processor: $processorId")
        beforeGetPublishing(projectId, token, processorId = processorId)
        return publishingService.unPublishingJobFinished(projectId, processorId).toPublishingPipelineDto()
    }
}

