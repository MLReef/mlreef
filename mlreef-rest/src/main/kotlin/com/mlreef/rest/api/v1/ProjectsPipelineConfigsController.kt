package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.pipeline.PipelineService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*
import java.util.logging.Logger
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects/{dataProjectId}/pipelines")
class ProjectsPipelineConfigsController(
    val service: PipelineService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val pipelineConfigRepository: PipelineConfigRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)
    private val dataProjectNotFound = "dataProject was not found"

    private fun beforeGetDataProject(dataProjectId: UUID): DataProject {
        val dataProject = (dataProjectRepository.findByIdOrNull(dataProjectId)
            ?: throw NotFoundException(dataProjectNotFound))

        val id = currentUserService.person().id
        if (dataProject.ownerId != id) {
            log.warning("User $id requested an DataProject of ${dataProject.ownerId}")
            throw NotFoundException(dataProjectNotFound)
        }
        return dataProject
    }

    @GetMapping
    fun getAllPipelineConfig(@PathVariable dataProjectId: UUID): List<PipelineConfigDto> {
        beforeGetDataProject(dataProjectId)
        val list: List<PipelineConfig> = pipelineConfigRepository.findAllByDataProjectId(dataProjectId).toList()
        return list.map(PipelineConfig::toDto)
    }

    @GetMapping("/{id}")
    fun getPipelineConfig(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PipelineConfigDto {
        beforeGetDataProject(dataProjectId)
        val findOneByDataProjectIdAndId = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException("Experiment not found")
        return findOneByDataProjectIdAndId.toDto()
    }

    // TODO: maybe better just in scoped
    @PutMapping("/{id}")
    fun updatePipelineConfig(@PathVariable dataProjectId: UUID, @PathVariable id: UUID, @Valid @RequestBody updateRequest: PipelineConfigUpdateRequest): PipelineConfigDto {
        beforeGetDataProject(dataProjectId)
        currentUserService.person()
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
    fun createPipelineConfig(@PathVariable dataProjectId: UUID, @Valid @RequestBody createRequest: PipelineConfigCreateRequest): PipelineConfigDto {
        val dataProject = beforeGetDataProject(dataProjectId)
        val person = currentUserService.person()
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
