package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineJobInfo
import com.mlreef.rest.PipelineStatus
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.experiment.ExperimentService
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.ZonedDateTime
import java.util.UUID

const val EPF_HEADER = "EPF-BOT-TOKEN"

@RestController
@RequestMapping("/api/v1/epf")
class EpfController(
    val service: ExperimentService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val pipelineInstanceRepository: PipelineInstanceRepository,
    val experimentRepository: ExperimentRepository
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private val dataProjectNotFound = "Experiment with UUID was not found or visible"

    private fun beforeGetExperiment(experimentId: UUID, token: String): Experiment {
        val experiment = experimentRepository.findByIdOrNull(experimentId)
            ?: throw NotFoundException(dataProjectNotFound)
        return getGuardedInstance(experiment.pipelineJobInfo, token, experiment)
    }

    private fun beforeGetPipelineInstance(instanceId: UUID, token: String): PipelineInstance {
        val instance = pipelineInstanceRepository.findByIdOrNull(instanceId)
            ?: throw NotFoundException(dataProjectNotFound)
        return getGuardedInstance(instance.pipelineJobInfo, token, instance)
    }

    private fun <T> getGuardedInstance(pipelineJobInfo: PipelineJobInfo?, token: String, guardedInstance: T): T {
        return when {
            (pipelineJobInfo == null) -> {
                log.warn("Experiment/Pipeline exists, but PipelineJobInfo is null!")
                throw NotFoundException(dataProjectNotFound)
            }
            (pipelineJobInfo.secret != token) -> {
                log.warn("Experiment/Pipeline and PipelineJobInfo exist, but a wrong token is provided!")
                throw NotFoundException(dataProjectNotFound)
            }
            else -> guardedInstance
        }
    }

    @PutMapping("/experiments/{id}/update")
    fun epfUpdateExperiment(@PathVariable id: UUID,
                            @RequestHeader(EPF_HEADER) token: String,
                            @RequestBody jsonBlob: String
    ): PipelineJobInfoDto {
        val experiment = beforeGetExperiment(id, token)
        service.guardStatusChange(experiment, newStatus = ExperimentStatus.RUNNING)
        val pipelineJobInfo = experiment.pipelineJobInfo?.copy(
            updatedAt = ZonedDateTime.now()
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
    fun epfUpdatePipelineInstance(@PathVariable id: UUID,
                                  @RequestHeader(EPF_HEADER) token: String,
                                  @RequestBody jsonBlob: String
    ): PipelineJobInfoDto {
        val pipelineInstance = beforeGetPipelineInstance(id, token)
        val pipelineJobInfo = pipelineInstance.pipelineJobInfo?.copy(
            updatedAt = ZonedDateTime.now()
        )
        val experimentUpdate = pipelineInstance.copy(
            pipelineJobInfo = pipelineJobInfo
        )
        val saved = pipelineInstanceRepository.save(experimentUpdate)
        return saved.pipelineJobInfo!!.toDto()
    }

    @PutMapping("/experiments/{id}/finish")
    fun epfFinishExperiment(@PathVariable id: UUID,
                            @RequestHeader(EPF_HEADER) token: String
    ): PipelineJobInfoDto {
        val experiment = beforeGetExperiment(id, token)

        service.guardStatusChange(experiment, newStatus = ExperimentStatus.SUCCESS)

        val pipelineJobInfo = experiment.pipelineJobInfo?.copy(
            finishedAt = ZonedDateTime.now()
        )
        val experimentUpdate = experiment.copy(
            pipelineJobInfo = pipelineJobInfo,
            status = ExperimentStatus.SUCCESS
        )
        val saved = experimentRepository.save(experimentUpdate)
        return saved.pipelineJobInfo!!.toDto()
    }

    @PutMapping("/pipeline_instance/{id}/finish")
    fun epfFinishPipelineInstance(@PathVariable id: UUID,
                                  @RequestHeader(EPF_HEADER) token: String
    ): PipelineJobInfoDto {
        val pipelineInstance = beforeGetPipelineInstance(id, token)

        val pipelineJobInfo = pipelineInstance.pipelineJobInfo?.copy(
            finishedAt = ZonedDateTime.now()
        )
        val instanceUpdate = pipelineInstance.copy(
            pipelineJobInfo = pipelineJobInfo,
            status = PipelineStatus.SUCCESS
        )
        val saved = pipelineInstanceRepository.save(instanceUpdate)
        return saved.pipelineJobInfo!!.toDto()
    }
}

