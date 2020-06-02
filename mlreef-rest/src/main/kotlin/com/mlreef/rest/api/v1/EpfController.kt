package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.experiment.ExperimentService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.ZonedDateTime
import java.util.UUID
import java.util.logging.Logger

const val EPF_HEADER = "EPF-BOT-TOKEN"

@RestController
@RequestMapping("/api/v1/epf")
class EpfController(
    val service: ExperimentService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val experimentRepository: ExperimentRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)
    private val dataProjectNotFound = "Experiment with UUID was not found or visible"

    private fun beforeGetExperiment(experimentId: UUID, token: String): Experiment {
        val findByIdOrNull = experimentRepository.findByIdOrNull(experimentId)
            ?: throw NotFoundException(dataProjectNotFound)

        return when {
            (findByIdOrNull.pipelineJobInfo == null) -> {
                log.warning("Experiment exists, but PipelineJobInfo is null!")
                throw NotFoundException(dataProjectNotFound)
            }
            (findByIdOrNull.pipelineJobInfo!!.secret != token) -> {
                log.warning("Experiment and PipelineJobInfo exist, but a wrong token is provided!")
                throw NotFoundException(dataProjectNotFound)
            }
            else -> findByIdOrNull
        }
    }

    @PutMapping("/experiments/{id}/update")
    fun epfUpdateExperiment(@PathVariable id: UUID, @RequestHeader(EPF_HEADER) token: String, @RequestBody jsonBlob: String): PipelineJobInfoDto {
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

    @PutMapping("/experiments/{id}/finish")
    fun epfFinishExperiment(@PathVariable id: UUID, @RequestHeader(EPF_HEADER) token: String): PipelineJobInfoDto {
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
}

