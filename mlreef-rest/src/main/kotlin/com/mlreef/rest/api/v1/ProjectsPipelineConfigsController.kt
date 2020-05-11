package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.FileLocation
import com.mlreef.rest.Person
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.project.DataProjectService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.logging.Logger
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects/{dataProjectId}/pipelines")
class ProjectsPipelineConfigsController(
    val service: PipelineService,
    val dataProjectService: DataProjectService,
    val pipelineConfigRepository: PipelineConfigRepository
) {
    private val log: Logger = Logger.getLogger(ProjectsPipelineConfigsController::class.simpleName)

    @GetMapping
    @PreAuthorize("isProjectOwner(#dataProjectId)")
    fun getAllPipelineConfig(@PathVariable dataProjectId: UUID): List<PipelineConfigDto> {
        val list: List<PipelineConfig> = pipelineConfigRepository.findAllByDataProjectId(dataProjectId).toList()
        return list.map(PipelineConfig::toDto)
    }

    @GetMapping("/{id}")
    @PreAuthorize("isProjectOwner(#dataProjectId)")
    fun getPipelineConfig(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PipelineConfigDto {
        val findOneByDataProjectIdAndId = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException("Experiment not found")
        return findOneByDataProjectIdAndId.toDto()
    }

    // TODO: maybe better just in scoped
    @PutMapping("/{id}")
    @PreAuthorize("isProjectOwner(#dataProjectId)")
    fun updatePipelineConfig(@PathVariable dataProjectId: UUID,
                             @PathVariable id: UUID,
                             @Valid @RequestBody updateRequest: PipelineConfigUpdateRequest): PipelineConfigDto {
        log.info(updateRequest.toString())

        val existingPipelineConfig = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException("PipelineConfig not found or not accessible")
        val newPipelineConfig = existingPipelineConfig.copy(
            dataOperations = arrayListOf(),
            inputFiles = arrayListOf()
        )
        executeRequest(updateRequest.dataOperations, updateRequest.inputFiles, newPipelineConfig)

        pipelineConfigRepository.save(newPipelineConfig)
        val persisted = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, newPipelineConfig.id)!!
        return persisted.toDto()
    }

    @PostMapping
    @PreAuthorize("isProjectOwner(#dataProjectId)")
    fun createPipelineConfig(@PathVariable dataProjectId: UUID,
                             @Valid @RequestBody createRequest: PipelineConfigCreateRequest,
                             person: Person): PipelineConfigDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

        log.info(createRequest.toString())

        val newPipelineConfig = service.createPipelineConfig(
            authorId = person.id,
            dataProjectId = dataProject.id,
            pipelineType = createRequest.pipelineType,
            slug = createRequest.slug,
            name = createRequest.name,
            sourceBranch = createRequest.sourceBranch,
            targetBranchPattern = createRequest.targetBranchPattern,
            dataOperations = listOf(), inputFiles = listOf())

        executeRequest(createRequest.dataOperations, createRequest.inputFiles, newPipelineConfig)

        pipelineConfigRepository.save(newPipelineConfig)
        val persisted = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, newPipelineConfig.id)!!
        return persisted.toDto()
    }

    private fun executeRequest(dataOperations: List<DataProcessorInstanceDto>, inputFiles: List<FileLocationDto>, pipelineConfig: PipelineConfig) {
        dataOperations.forEach { processorInstanceDto ->
            val preProcessorInstance = service.newDataProcessorInstance(processorInstanceDto.slug)
            pipelineConfig.addProcessor(preProcessorInstance)
            serviceAddParameters(processorInstanceDto, preProcessorInstance)
        }


        inputFiles.forEach { fileLocationDto ->
            val fileLocation = FileLocation.fromDto(fileLocationDto.location, fileLocationDto.locationType)
            pipelineConfig.addInputFile(fileLocation)
        }
    }

    private fun serviceAddParameters(processorInstanceDto: DataProcessorInstanceDto, preProcessorInstance: DataProcessorInstance) {
        processorInstanceDto.parameters.forEach { parameterInstanceDto ->
            service.addParameterInstance(preProcessorInstance,
                parameterInstanceDto.name,
                parameterInstanceDto.value
            )
        }
    }
}

class PipelineConfigCreateRequest(
    @NotEmpty val sourceBranch: String,
    @NotEmpty val targetBranchPattern: String,
    @NotEmpty val pipelineType: String,
    @NotEmpty val slug: String,
    @NotEmpty val name: String,
    @Valid val dataOperations: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val inputFiles: List<FileLocationDto> = arrayListOf()
)

class PipelineConfigUpdateRequest(
    val sourceBranch: String?,
    val targetBranchPattern: String?,
    val slug: String?,
    val name: String?,
    @Valid val dataOperations: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val inputFiles: List<FileLocationDto> = arrayListOf()
)
