package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProject
import com.mlreef.rest.FileLocation
import com.mlreef.rest.Person
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineInstanceDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.PipelineCreateException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.project.ProjectService
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
import javax.transaction.Transactional
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects/{dataProjectId}/pipelines")
class ProjectsPipelineConfigsController(
    val service: PipelineService,
    val dataProjectService: ProjectService<DataProject>,
    val pipelineConfigRepository: PipelineConfigRepository,
    val currentUserService: CurrentUserService,
    val pipelineInstanceRepository: PipelineInstanceRepository
) {
    private val log: Logger = Logger.getLogger(ProjectsPipelineConfigsController::class.simpleName)

    @GetMapping
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getAllPipelineConfig(@PathVariable dataProjectId: UUID) =
        pipelineConfigRepository.findAllByDataProjectId(dataProjectId).map {
            val instances = pipelineInstanceRepository.findAllByPipelineConfigId(it.id)
            it.toDto(instances.map(PipelineInstance::toDto))
        }


    @GetMapping("/{id}")
    @PreAuthorize("canViewProject(#dataProjectId)")
    fun getPipelineConfig(@PathVariable dataProjectId: UUID, @PathVariable id: UUID): PipelineConfigDto {
        val config = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException(ErrorCode.NotFound, "Experiment not found")
        val instances = pipelineInstanceRepository.findAllByPipelineConfigId(config.id)
        return config.toDto(instances.map(PipelineInstance::toDto))
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun updatePipelineConfig(
        @PathVariable dataProjectId: UUID,
        @PathVariable id: UUID,
        @Valid @RequestBody updateRequest: PipelineConfigUpdateRequest
    ): PipelineConfigDto {
        log.info(updateRequest.toString())

        val existingPipelineConfig = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, id)
            ?: throw NotFoundException(ErrorCode.NotFound, "PipelineConfig not found or not accessible")
        val newPipelineConfig = existingPipelineConfig.copy(
            dataOperations = arrayListOf(),
            inputFiles = arrayListOf()
        )
        appendProcessorsAndFiles(updateRequest.dataOperations, updateRequest.inputFiles, newPipelineConfig)

        pipelineConfigRepository.save(newPipelineConfig)
        val persisted = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, newPipelineConfig.id)!!
        val instances = pipelineInstanceRepository.findAllByPipelineConfigId(persisted.id)
        return persisted.toDto(instances.map(PipelineInstance::toDto))
    }

    @PostMapping
    @PreAuthorize("hasAccessToProject(#dataProjectId, 'DEVELOPER')")
    fun createPipelineConfig(
        @PathVariable dataProjectId: UUID,
        @Valid @RequestBody createRequest: PipelineConfigCreateRequest,
        person: Person
    ): PipelineConfigDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

        val newPipelineConfig = createNewPipelineConfig(dataProject, createRequest, person)
        appendProcessorsAndFiles(createRequest.dataOperations, createRequest.inputFiles, newPipelineConfig)

        pipelineConfigRepository.save(newPipelineConfig)
        val persisted = pipelineConfigRepository.findOneByDataProjectIdAndId(dataProjectId, newPipelineConfig.id)!!
        return persisted.toDto()
    }

    @PostMapping("/create-start-instance")
    @PreAuthorize("isProjectOwner(#dataProjectId)")
    @Transactional
    fun createPipelineConfigInstanceStart(
        @PathVariable dataProjectId: UUID,
        @Valid @RequestBody createRequest: PipelineConfigCreateRequest,
        person: Person,
    ): PipelineInstanceDto {
        val dataProject = dataProjectService.getProjectById(dataProjectId)
            ?: throw ProjectNotFoundException(projectId = dataProjectId)

        val newPipelineConfig = createNewPipelineConfig(
            dataProject = dataProject,
            createRequest = createRequest,
            person = person,
        )
        appendProcessorsAndFiles(createRequest.dataOperations, createRequest.inputFiles, newPipelineConfig)

        val pipelineConfig = pipelineConfigRepository.save(newPipelineConfig)
        val createInstance = pipelineInstanceRepository.save(pipelineConfig.createInstance(1))
        log.info("Created new Instance $createInstance for Pipeline $createInstance")


        service.startInstanceAsync(
            currentUserService.account(),
            currentUserService.accessToken(),
            dataProject.gitlabId,
            createInstance.copy(),
            secret = service.createSecret())
        return createInstance.toDto()
    }

    private fun createNewPipelineConfig(dataProject: DataProject, createRequest: PipelineConfigCreateRequest, person: Person): PipelineConfig {
        log.info(createRequest.toString())
        return try {
            service.createPipelineConfig(
                authorId = person.id,
                dataProjectId = dataProject.id,
                pipelineType = createRequest.pipelineType,
                name = createRequest.name,
                sourceBranch = createRequest.sourceBranch,
                dataOperations = listOf(), inputFiles = listOf())
        } catch (validationError: IllegalArgumentException) {
            throw PipelineCreateException(ErrorCode.PipelineCreationFilesMissing, validationError.message)
        }
    }

    private fun appendProcessorsAndFiles(dataOperations: List<DataProcessorInstanceDto>, inputFiles: List<FileLocationDto>, pipelineConfig: PipelineConfig) {
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
    @NotEmpty val name: String?,
    @NotEmpty val sourceBranch: String,
    @NotEmpty val pipelineType: String,
    @Deprecated("unused") val targetBranchPattern: String?,
    @Deprecated("unused") val slug: String?,
    @Valid val dataOperations: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val inputFiles: List<FileLocationDto> = arrayListOf()
)

class PipelineConfigUpdateRequest(
    val sourceBranch: String?,
    val name: String?,
    @Valid val dataOperations: List<DataProcessorInstanceDto> = arrayListOf(),
    @Valid val inputFiles: List<FileLocationDto> = arrayListOf()
)
