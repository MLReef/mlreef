package com.mlreef.rest.api.v1

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataAlgorithmRepository
import com.mlreef.rest.DataOperationRepository
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualizationRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProcessorDto
import com.mlreef.rest.api.v1.dto.ParameterDto
import com.mlreef.rest.api.v1.dto.ProcessorVersionDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.data_processors.DataProcessorService
import com.mlreef.rest.feature.project.ProjectService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.UUID.randomUUID
import java.util.logging.Logger
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/")
class DataProcessorsController(
    val codeProjectRepository: CodeProjectRepository,
    val dataProcessorRepository: DataProcessorRepository,
    val processorVersionRepository: ProcessorVersionRepository,
    val dataOperationRepository: DataOperationRepository,
    val dataAlgorithmRepository: DataAlgorithmRepository,
    val dataVisualizationRepository: DataVisualizationRepository,
    val codeProjectService: ProjectService<CodeProject>,
    val dataProcessorService: DataProcessorService,
    val currentUserService: CurrentUserService
) {
    private val log: Logger = Logger.getLogger(DataProcessorsController::class.simpleName)

    @GetMapping("data-processors")
    @PostFilter("postCanViewProcessor()")
    fun getAllProcessors(
        @RequestParam("type", required = false) type: DataProcessorType?,
        @RequestParam("input_data_type", required = false) inputDataType: DataType?,
        @RequestParam("output_data_type", required = false) outputDataType: DataType?
    ): List<DataProcessorDto> {
        val list = if (inputDataType != null && outputDataType != null) {
            dataProcessorRepository.findAllByTypeAndInputDataTypeAndOutputDataType(type, inputDataType, outputDataType)
        } else {
            if (type != null) {
                dataProcessorRepository.findAllByType(type)
            } else {
                dataOperationRepository.findAll()
            }.let {
                if (inputDataType != null) it.filter { it.inputDataType == inputDataType } else it
            }.let {
                if (outputDataType != null) it.filter { it.outputDataType == outputDataType } else it
            }
        }

        return list.map(DataProcessor::toDto)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("data-processors/id/{id}")
    @PostAuthorize("postCanViewProcessor()")
    fun getDataProcessorById(@PathVariable id: UUID): DataProcessorDto {
        val dataProcessor = dataProcessorRepository.findByIdOrNull(id)
            ?: throw NotFoundException("Data processor not found by id: $id")
        return dataProcessor.toDto()
    }

    @GetMapping("data-processors/id/{id}/versions")
    @PreAuthorize("canViewProcessor(#id)")
    fun getDataProcessorByIdVersions(@PathVariable id: UUID): List<ProcessorVersionDto> {
        val dataProcessor = dataProcessorRepository.findByIdOrNull(id)
            ?: throw NotFoundException("Data processor not found by id: $id")
        val versions = processorVersionRepository.findAllByDataProcessorId(id)

        return versions.map(ProcessorVersion::toDto)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("data-processors/slug/{slug}")
    @PostAuthorize("postCanViewProcessor()")
    fun getDataProcessorBySlug(@PathVariable slug: String): DataProcessorDto {
        val dataProcessor = dataProcessorRepository.findBySlug(slug)
            ?: throw NotFoundException("Data processor not found by slug: $slug")
        return dataProcessor.toDto()
    }

    @GetMapping("code-projects/{codeProjectId}/processor")
    @PreAuthorize("canViewProject(#codeProjectId)")
    fun getByCodeProjects(@PathVariable codeProjectId: UUID): DataProcessorDto {
        val dataProcessor = dataProcessorRepository.findAllByCodeProjectId(codeProjectId).firstOrNull()
            ?: throw NotFoundException("processor not found: $codeProjectId")
        return dataProcessor.toDto()
    }

    @PostMapping("code-projects/{codeProjectId}/processor")
    @PreAuthorize("isProjectOwner(#codeProjectId)")
    fun createDataProcessor(
        @PathVariable codeProjectId: UUID,
        @Valid @RequestBody createRequest: DataProcessorCreateRequest,
        owner: Person
    ): DataProcessorDto {
        val codeProject = codeProjectService.getProjectById(codeProjectId)
            ?: throw NotFoundException("Code project with id $codeProjectId not found")
        val dataProcessorId = randomUUID()
        val mapIndexed = createRequest.parameters.mapIndexed { index, it ->
            createParameterFromDto(it, dataProcessorId = dataProcessorId, order = index)
        }
        val dataProcessor = dataProcessorService.createForCodeProject(
            id = dataProcessorId,
            codeProjectId = codeProject.id,
            slug = createRequest.slug,
            name = createRequest.name,
            description = createRequest.description,
            type = createRequest.type,
            author = owner,
            inputDataType = createRequest.inputDataType,
            outputDataType = createRequest.outputDataType,
            visibilityScope = createRequest.visibilityScope,
            parameters = mapIndexed
        )
        return dataProcessor.toDto()
    }

    fun createParameterFromDto(parameterDto: ParameterDto, dataProcessorId: UUID, order: Int): ProcessorParameter =
        ProcessorParameter(
            name = parameterDto.name,
            type = ParameterType.fromValue(parameterDto.type),
            required = parameterDto.required,
            defaultValue = parameterDto.defaultValue,
            order = order,
            description = parameterDto.description,
            id = randomUUID(),
            processorVersionId = dataProcessorId
        )
}


class DataProcessorCreateRequest(
    @NotEmpty val slug: String,
    @NotEmpty val name: String,
    @NotEmpty val inputDataType: DataType,
    @NotEmpty val outputDataType: DataType,
    @NotEmpty val type: DataProcessorType,
    @NotEmpty val visibilityScope: VisibilityScope,
    val description: String = "",
    @Valid val parameters: List<ParameterDto> = arrayListOf()
)

class DataProcessorUpdateRequest(
    @NotEmpty val name: String
)
