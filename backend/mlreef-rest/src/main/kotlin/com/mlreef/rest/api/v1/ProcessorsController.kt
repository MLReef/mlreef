package com.mlreef.rest.api.v1

import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.ProcessorDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.feature.project.ProjectService
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/data-processors", "/api/v1/processors")
class ProcessorsController(
    val codeProjectRepository: CodeProjectRepository,
    val codeProjectService: ProjectService<CodeProject>,
    val currentUserService: CurrentUserService,
    val processorsService: ProcessorsService,
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    companion object {
        private const val MAX_PAGE_SIZE = 20
    }

    @RequestMapping(method = [RequestMethod.GET, RequestMethod.POST])
    fun getAllProcessors(
        @RequestParam("type", required = false) type: String?,
        @RequestParam("input_data_type", required = false) inputDataType: String?,
        @RequestParam("output_data_type", required = false) outputDataType: String?,
        @PageableDefault(size = MAX_PAGE_SIZE) pageable: Pageable,
        @RequestBody(required = false) filter: SearchProcessorRequest? = null,
        profile: TokenDetails? = null,
    ): Page<ProcessorDto> {
        val finalFilter = filter?.copy(
            processorTypesOr = if (type != null) listOf(type) else filter.processorTypesOr,
            inputDataTypesOr = if (inputDataType != null) setOf(inputDataType) else filter.inputDataTypesOr,
            outputDataTypes = if (outputDataType != null) setOf(outputDataType) else filter.outputDataTypes,
        ) ?: SearchProcessorRequest(
            processorTypesOr = if (type != null) listOf(type) else null,
            inputDataTypesOr = if (inputDataType != null) setOf(inputDataType) else null,
            outputDataTypes = if (outputDataType != null) setOf(outputDataType) else null,
        )

        return processorsService.searchProcessor(
            finalFilter,
            pageable,
            profile
        ).map { it.toDto() }
    }

    @GetMapping("/id/{id}")
    fun getDataProcessorById(
        @PathVariable id: UUID,
        profile: TokenDetails? = null,
    ): ProcessorDto {
        return processorsService.searchProcessor(
            SearchProcessorRequest(
                processorIdsOr = listOf(id),
            ),
            Pageable.unpaged(),
            profile
        ).map { it.toDto() }.firstOrNull() ?: throw NotFoundException("Processor $id not found")
    }

    @GetMapping("/slug/{slug}")
    fun getDataProcessorBySlug(
        @PathVariable slug: String,
        profile: TokenDetails? = null,
    ): ProcessorDto {
        return processorsService.searchProcessor(
            SearchProcessorRequest(
                slugExact = slug,
            ),
            Pageable.unpaged(),
            profile
        ).map { it.toDto() }.firstOrNull() ?: throw NotFoundException("Processor not found")
    }

}

data class SearchProcessorRequest(
    val processorIdsOr: List<UUID>? = null,
    val projectIdsOr: List<UUID>? = null,
    val processorTypesOr: List<String>? = null,
    val inputDataTypes: Set<String>? = null,
    val outputDataTypes: Set<String>? = null,
    val inputDataTypesOr: Set<String>? = null,
    val outputDataTypesOr: Set<String>? = null,
    val visibility: VisibilityScope? = null,
    val modelTypeOr: List<String>? = null,
    val mlCategoryOr: List<String>? = null,
    val publishersOr: List<String>? = null,
    val slug: String? = null,
    val slugExact: String? = null,
    val name: String? = null,
    val nameExact: String? = null,
    val branch: String? = null,
    val branchExact: String? = null,
    val statusesOr: List<String>? = null,
    val environmentsOr: List<String>? = null,
)
