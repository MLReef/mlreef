package com.mlreef.rest.api.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.mlreef.rest.PipelineConfigurationRepository
import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.*
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.feature.project.ProjectService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.*
import java.util.logging.Logger
import javax.transaction.Transactional
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping(value = ["/api/v1/data-projects/{dataProjectId}/pipelines", "/api/v1/data-projects/{dataProjectId}/pipelines-configs"]) //TODO: Remove /pipelines path as it doesn't reflect the sense
class PipelineConfigsController(
    val pipelineService: PipelineService,
    val dataProjectService: ProjectService<DataProject>,
    val currentUserService: CurrentUserService,
    val pipelinesRepository: PipelinesRepository,
    val pipelineConfigurationRepository: PipelineConfigurationRepository,
    val projectResolverService: ProjectResolverService,
) {
    private val log: Logger = Logger.getLogger(PipelineConfigsController::class.simpleName)

    @GetMapping
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getAllPipelineConfig(@PathVariable dataProjectId: UUID): List<PipelineConfigDto> {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        return pipelineConfigurationRepository.findAllByDataProject(dataProject).map(PipelineConfiguration::toDto)
    }


    @GetMapping("/{id}")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getPipelineConfig(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PipelineConfigDto {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Project $dataProjectId not found")

        val config = pipelineConfigurationRepository.findOneByDataProjectAndId(dataProject, id)
            ?: throw NotFoundException(ErrorCode.NotFound, "Experiment not found")

        return config.toDto()
    }

    @PostMapping
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun createPipelineConfig(
        @PathVariable dataProjectId: UUID,
        @Valid @RequestBody createRequest: PipelineConfigCreateRequest,
        tokenDetails: TokenDetails,
    ): PipelineConfigDto {
        return pipelineService.createNewPipelineConfig(dataProjectId, createRequest, tokenDetails.accountId).toDto()
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun updatePipelineConfig(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID,
        @Valid @RequestBody updateRequest: PipelineConfigUpdateRequest,
        tokenDetails: TokenDetails,
    ): PipelineConfigDto {
        log.info(updateRequest.toString())
        return pipelineService.updatePipelineConfig(
            dataProjectId,
            id,
            updateRequest.dataOperations,
            updateRequest.inputFiles,
            tokenDetails.accountId,
        ).toDto()
    }

    @PostMapping("/create-start-instance")
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'MAINTAINER')")
    @Transactional
    fun createPipelineConfigAndPipelineAndStartIt(
        @PathVariable dataProjectId: UUID,
        @Valid @RequestBody createRequest: PipelineConfigCreateRequest,
        tokenDetails: TokenDetails,
        account: Account,
    ): PipelineDto {
        val newPipelineConfig = pipelineService.createNewPipelineConfig(
            dataProjectId = dataProjectId,
            createRequest = createRequest,
            accountId = tokenDetails.accountId,
        )

        val pipeline = pipelineService.createPipelineFromConfig(newPipelineConfig, 1, account)

        pipelineService.startPipeline(
            account,
            tokenDetails.accessToken,
            dataProjectId,
            pipeline,
            tokenDetails.accountId,
        )

        return pipelineService.getPipelineById(pipeline.id)?.toDto()
            ?: throw InternalException("Pipeline ${pipeline.id} not found after creation for configuration ${newPipelineConfig.id}")
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
class PipelineConfigCreateRequest(
    @NotEmpty val name: String?,
    @NotEmpty val sourceBranch: String,
    @NotEmpty val pipelineType: String,
    @Deprecated("unused") val targetBranchPattern: String?,
    @Deprecated("unused") val slug: String?,
    @Valid val dataOperations: List<ProcessorInstanceDto> = arrayListOf(),
    @Valid val inputFiles: List<FileLocationDto> = arrayListOf()
)

@JsonIgnoreProperties(ignoreUnknown = true)
class PipelineConfigUpdateRequest(
    val sourceBranch: String?,
    val name: String?,
    @Valid val dataOperations: List<ProcessorInstanceDto> = arrayListOf(),
    @Valid val inputFiles: List<FileLocationDto> = arrayListOf()
)
