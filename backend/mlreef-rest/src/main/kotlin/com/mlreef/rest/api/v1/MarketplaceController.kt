package com.mlreef.rest.api.v1

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataType
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.SearchResultDto
import com.mlreef.rest.api.v1.dto.SearchableTagDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.feature.marketplace.SearchResult
import com.mlreef.rest.marketplace.SearchableType
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/explore")
class MarketplaceController(
    val marketplaceService: MarketplaceService,
    val searchableTagRepository: SearchableTagRepository,
    val currentUserService: CurrentUserService,
    val publicProjectsCacheService: PublicProjectsCacheService,
) {
    @PostMapping("/entries/search")
    fun searchEntries(
        @RequestBody filter: FilterRequest?,
        @RequestParam("searchable_type") searchableType: SearchableType?,
        @RequestParam("query") query: String? = "",
        @RequestParam("query_and") queryAnd: Boolean? = false,
        @RequestParam("input_data_types") inputDataTypes: List<DataType>? = null,
        @RequestParam("output_data_types") outputDataTypes: List<DataType>? = null,
        @RequestParam("tags") tags: List<String>? = null,
        @RequestParam("max_stars") maxStars: Int? = null,
        @RequestParam("min_stars") minStars: Int? = null,
        pageable: Pageable,
    ): Page<SearchResultDto> {

        val finalFilter = filter?.copy(
            searchableType = searchableType ?: filter.searchableType,
            query = query ?: filter.query,
            queryAnd = queryAnd ?: filter.queryAnd,
            inputDataTypes = inputDataTypes ?: filter.inputDataTypes,
            outputDataTypes = outputDataTypes ?: filter.outputDataTypes,
            tags = tags ?: filter.tags,
            maxStars = maxStars ?: filter.maxStars,
            minStars = minStars ?: filter.minStars
        ) ?: FilterRequest(
            searchableType = searchableType ?: SearchableType.CODE_PROJECT,
            query = query ?: "",
            queryAnd = queryAnd ?: false,
            inputDataTypes = inputDataTypes,
            outputDataTypes = outputDataTypes,
            tags = tags,
            maxStars = maxStars,
            minStars = minStars
        )
        val accountOrNull = currentUserService.accountOrNull()
        val publicProjectMap = publicProjectsCacheService.getPublicProjectsIdsMap()

        val results = if (accountOrNull != null) {
            val projectsMap = publicProjectMap.plus(currentUserService.projectsMap(AccessLevel.GUEST))
            marketplaceService.performSearch(pageable, finalFilter, projectsMap)
        } else {
            marketplaceService.performSearch(pageable, finalFilter, publicProjectMap)
        }
        val dtos = results.map(SearchResult::toDto)
        return PageImpl(dtos, pageable, dtos.size.toLong())
    }

    @GetMapping("/entries")
    fun getAllEntries(pageable: Pageable): List<ProjectDto> = currentUserService.projectsMap(AccessLevel.GUEST)
        .let { marketplaceService.findEntriesForProjects(pageable, it) }
        .map { it.toDto() }

    @GetMapping("/entries/{slug}")
    fun getEntry(@PathVariable slug: String): ProjectDto =
        currentUserService.projectsMap(AccessLevel.GUEST)
            .let { marketplaceService.findEntriesForProjectsBySlug(it, slug) }
            .toDto()

    @GetMapping("/tags")
    fun getTags(): List<SearchableTagDto> =
        currentUserService.groupsMap()
            .keys.toList()
            .let { searchableTagRepository.findAllByPublicTrueOrOwnerIdIn(it) }
            .map { it.toDto() }
}

data class FilterRequest(
    val searchableType: SearchableType = SearchableType.CODE_PROJECT,
    val query: String = "",
    val queryAnd: Boolean = false,
    val inputDataTypes: List<DataType>? = null,
    val outputDataTypes: List<DataType>? = null,
    val tags: List<String>? = null,
    val maxStars: Int? = null,
    val minStars: Int? = null,
)
