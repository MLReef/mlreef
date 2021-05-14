package com.mlreef.rest.api.v1

import com.mlreef.rest.PipelineConfigurationRepository
import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.Pipeline
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.exceptions.MethodNotAllowedException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.pipeline.PipelineService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.logging.Logger

@RestController
@RequestMapping("/api/v1/pipelines")
class PipelineController(
    val pipelineService: PipelineService,
    val pipelinesRepository: PipelinesRepository,
    val pipelineConfigurationRepository: PipelineConfigurationRepository,
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)

    private fun beforeGetPipelineConfig(id: UUID): PipelineConfiguration {
        return pipelineConfigurationRepository.findByIdOrNull(id)
            ?: throw NotFoundException(ErrorCode.NotFound, "PipelineConfig was not found")
    }

    @GetMapping
    @PostFilter("postCanViewPipelineConfig()")
    fun getAllPipelineConfigs(): List<PipelineConfigDto> {
        return pipelineConfigurationRepository.findAll().map { it.toDto() }
    }

    @GetMapping("/{configId}")
    @PreAuthorize("canViewPipelineConfig(#configId)")
    fun getPipelineConfig(@PathVariable configId: UUID): PipelineConfigDto {
        return beforeGetPipelineConfig(configId).toDto()
    }

    @GetMapping("/{configId}/instances")
    @PreAuthorize("canViewPipelineConfig(#configId)")
    fun getAllPipelinesFromConfig(@PathVariable configId: UUID): List<PipelineDto> {
        return beforeGetPipelineConfig(configId).pipelines.map(Pipeline::toDto)
    }

    @GetMapping("/{configId}/instances/{pipelineId}")
    @PreAuthorize("canViewPipelineConfig(#configId)")
    fun getPipelineByIdFromConfig(@PathVariable configId: UUID, @PathVariable pipelineId: UUID): PipelineDto {
        return beforeGetPipelineConfig(configId).pipelines.find { it.id == pipelineId }?.toDto()
            ?: throw NotFoundException(ErrorCode.NotFound, "Pipeline $pipelineId was not found for configuration $configId")
    }

    @PostMapping("/{configId}/instances")
    @PreAuthorize("hasAccessToPipelineConfig(#configId,'DEVELOPER')")
    fun createPipelineForConfig(
        @PathVariable configId: UUID,
        tokenDetails: TokenDetails,
    ): PipelineDto {
        val pipelineConfig = beforeGetPipelineConfig(configId)
        return pipelineService.createPipelineForConfig(tokenDetails.personId, pipelineConfig).toDto()
    }

    @PutMapping("/{configId}/instances/{pipelineId}/{action}")
    @PreAuthorize("hasAccessToPipeline(#pipelineId,'DEVELOPER')")
    fun applyActionToPipeline(
        @PathVariable configId: UUID,
        @PathVariable pipelineId: UUID,
        @PathVariable action: String,
        tokenDetails: TokenDetails,
        account: Account,
    ): PipelineDto {
        val pipelineConfig = beforeGetPipelineConfig(configId)

        val pipeline = pipelineConfig.pipelines.find { it.id == pipelineId }
            ?: throw NotFoundException(ErrorCode.NotFound, "Pipeline $pipelineId was not found for configuration $configId")

        pipelineConfig.dataProject
            ?: throw InternalException("Pipeline config ${pipelineConfig.id} is detached from Data project ")

        val adaptedInstance = when (action.trim().toLowerCase()) {
            "start" -> pipelineService.startPipeline(
                account,
                tokenDetails.accessToken,
                pipelineConfig.dataProject!!.id,
                pipeline,
                secret = pipelineService.createSecret()
            )
            "archive" -> pipelineService.archivePipeline(pipeline)
            "cancel" -> pipelineService.cancelPipeline(pipeline)
            else -> throw MethodNotAllowedException(ErrorCode.NotFound, "Not valid action: '$action'")
        }

        return adaptedInstance.toDto()
    }

    @GetMapping("/{configId}/instances/{pipelineId}/mlreef-file", produces = [MediaType.TEXT_PLAIN_VALUE])
    @PreAuthorize("hasAccessToPipeline(#pipelineId,'DEVELOPER')")
    fun getExperimentYaml(
        @PathVariable configId: UUID,
        @PathVariable pipelineId: UUID,
        account: Account,
    ): String {
        val pipelineConfig = beforeGetPipelineConfig(configId)

        val pipeline = pipelineConfig.pipelines.find { it.id == pipelineId }
            ?: throw NotFoundException(ErrorCode.NotFound, "Pipeline $pipelineId was not found for configuration $configId")

        return pipelineService.createPipelineInstanceFile(
            pipeline = pipeline,
            author = account,
            secret = pipeline.pipelineJobInfo?.secret ?: "***censored***"
        )
    }

    @DeleteMapping("/{configId}/instances/{pipelineId}")
    @PreAuthorize("hasAccessToPipeline(#pipelineId,'DEVELOPER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deletePipelineFromConfig(
        @PathVariable configId: UUID,
        @PathVariable pipelineId: UUID,
        tokenDetails: TokenDetails,
    ) {
        val pipelineConfig = beforeGetPipelineConfig(configId)

        val pipeline = pipelineConfig.pipelines.find { it.id == pipelineId }
            ?: throw NotFoundException(ErrorCode.NotFound, "Pipeline $pipelineId was not found for configuration $configId")

        pipelineService.deletePipeline(pipeline)
    }
}


