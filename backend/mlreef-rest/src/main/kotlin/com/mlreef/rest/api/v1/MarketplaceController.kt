package com.mlreef.rest.api.v1

import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.SearchableTagDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.config.DEFAULT_PAGE_SIZE
import com.mlreef.rest.config.MAX_PAGE_SIZE
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.ProjectType
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.marketplace.SearchableType
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.feature.project.RecentProjectService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.web.bind.annotation.*
import java.util.*
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/api/v1/explore")
class MarketplaceController(
    val marketplaceService: MarketplaceService,
    val searchableTagRepository: SearchableTagRepository,
    val currentUserService: CurrentUserService,
    val publicProjectsCacheService: PublicProjectsCacheService,
    private val recentProjectService: RecentProjectService,
    private val projectService: ProjectService<Project>,
) {
    @PostMapping("/entries/search")
    fun searchEntries(
        @RequestBody filter: SearchRequest?,
        @RequestParam("searchable_type") searchableType: SearchableType?,
        @RequestParam("project_type") projectType: ProjectType?,
        @RequestParam("processor_type") processorType: String?,
        @RequestParam("visibility") visibility: VisibilityScope? = null,
        @RequestParam("model_type_or") modelTypeOr: List<String>?,
        @RequestParam("ml_category_or") mlCategoryOr: List<String>?,
        @RequestParam("owner_or") ownerIdsOr: List<UUID>?,
        @RequestParam("global_slug") globalSlug: String?,
        @RequestParam("global_slug_exact") globalSlugExact: String?,
        @RequestParam("slug") slug: String?,
        @RequestParam("slug_exact") slugExact: String?,
        @RequestParam("name") name: String?,
        @RequestParam("name_exact") nameExact: String?,
        @RequestParam("namespace") namespace: String?,
        @RequestParam("namespace_exact") namespaceExact: String?,
        @RequestParam("input_data_types") inputDataTypes: Set<String>? = null,
        @RequestParam("output_data_types") outputDataTypes: Set<String>? = null,
        @RequestParam("input_data_types_or") inputDataTypesOr: Set<String>? = null,
        @RequestParam("output_data_types_or") outputDataTypesOr: Set<String>? = null,
        @RequestParam("tags") tags: List<String>? = null,
        @RequestParam("tags_or") tagsOr: List<String>? = null,
        @RequestParam("max_stars") maxStars: Int? = null,
        @RequestParam("min_stars") minStars: Int? = null,
        @RequestParam("starred_by_me") starredByMe: Boolean? = null,
        @RequestParam("min_forks") minForksCount: Int? = null,
        @RequestParam("max_forks") maxForksCount: Int? = null,
        @RequestParam("published") published: Boolean? = null,
        @RequestParam("own") own: Boolean? = null,
        @RequestParam("participate") participate: Boolean? = null,
        @RequestParam("query") query: String? = "",
        @RequestParam("query_and") queryAnd: Boolean? = false,
        @PageableDefault(size = MAX_PAGE_SIZE) pageable: Pageable,
        profile: TokenDetails? = null,
    ): Page<ProjectDto> {

        val finalFilter = filter?.copy(
            searchableType = searchableType ?: filter.searchableType,
            projectType = projectType ?: filter.projectType,
            processorType = processorType ?: filter.processorType,
            visibility = visibility ?: filter.visibility,
            modelTypeOr = modelTypeOr ?: filter.modelTypeOr,
            mlCategoryOr = mlCategoryOr ?: filter.mlCategoryOr,
            ownerIdsOr = ownerIdsOr ?: filter.ownerIdsOr,
            globalSlug = globalSlug ?: filter.globalSlug,
            globalSlugExact = globalSlugExact ?: filter.globalSlugExact,
            slug = slug ?: filter.slug,
            slugExact = slugExact ?: filter.slugExact,
            name = name ?: filter.name,
            nameExact = nameExact ?: filter.nameExact,
            namespace = namespace ?: filter.namespace,
            namespaceExact = namespaceExact ?: filter.namespaceExact,
            inputDataTypes = inputDataTypes ?: filter.inputDataTypes,
            outputDataTypes = outputDataTypes ?: filter.outputDataTypes,
            inputDataTypesOr = inputDataTypesOr ?: filter.inputDataTypesOr,
            outputDataTypesOr = outputDataTypesOr ?: filter.outputDataTypesOr,
            tags = tags ?: filter.tags,
            tagsOr = tagsOr ?: filter.tagsOr,
            maxStars = maxStars ?: filter.maxStars,
            minStars = minStars ?: filter.minStars,
            minForksCount = minForksCount ?: filter.minForksCount,
            maxForksCount = maxForksCount ?: filter.maxForksCount,
            published = published ?: filter.published,
            own = own ?: filter.own,
            participate = participate ?: filter.participate,
            starredByMe = starredByMe ?: filter.starredByMe,
        ) ?: SearchRequest(
            searchableType = searchableType,
            projectType = projectType,
            processorType = processorType,
            visibility = visibility,
            modelTypeOr = modelTypeOr,
            mlCategoryOr = mlCategoryOr,
            ownerIdsOr = ownerIdsOr,
            globalSlug = globalSlug,
            globalSlugExact = globalSlugExact,
            slug = slug,
            slugExact = slugExact,
            name = name,
            nameExact = nameExact,
            namespace = namespace,
            namespaceExact = namespaceExact,
            inputDataTypes = inputDataTypes,
            outputDataTypes = outputDataTypes,
            inputDataTypesOr = inputDataTypesOr,
            outputDataTypesOr = outputDataTypesOr,
            tags = tags,
            tagsOr = tagsOr,
            maxStars = maxStars,
            minStars = minStars,
            minForksCount = minForksCount,
            maxForksCount = maxForksCount,
            published = published,
            own = own,
            participate = participate,
            starredByMe = starredByMe,
        )

        return marketplaceService.searchProjects(finalFilter, pageable, profile).map {
            it.toDto(forkedByUser = projectService.isProjectForkedByUser(it, profile?.personId))
        }
    }

    @Suppress("UNCHECKED_CAST")
    @PostMapping("/entries/search/text")
    fun searchEntriesByText(
        @RequestBody filter: SearchByTextRequest?,
        @RequestParam("query") query: String? = "",
        @RequestParam("query_and") queryAnd: Boolean? = false,
        @PageableDefault(size = MAX_PAGE_SIZE) pageable: Pageable,
        profile: TokenDetails? = null,
    ): Iterable<ProjectDto> {

        val finalFilter = filter?.copy(
            query = query ?: filter.query,
            queryAnd = queryAnd ?: filter.queryAnd,
        ) ?: SearchByTextRequest(
            query = query ?: "",
            queryAnd = queryAnd ?: false,
        )

        val result = marketplaceService.performSearchByText(
            pageable,
            finalFilter.query,
            finalFilter.queryAnd,
            profile
        ).map {
            it.toDto(forkedByUser = projectService.isProjectForkedByUser(it.project, profile?.personId))
        } as Iterable<ProjectDto>

        return result
    }

    @GetMapping("/entries")
    fun getAllEntries(
        @PageableDefault(size = MAX_PAGE_SIZE) pageable: Pageable,
        profile: TokenDetails? = null,
    ): Iterable<ProjectDto> = marketplaceService.searchProjects(
        SearchRequest(),
        pageable,
        profile
    ).map {
        it.toDto(forkedByUser = projectService.isProjectForkedByUser(it, profile?.personId))
    }

    @GetMapping("/entries/{slug}")
    fun getEntry(
        @PathVariable slug: String,
        pageable: Pageable,
        profile: TokenDetails? = null,
    ): ProjectDto {
        val project = marketplaceService.searchProjects(
            SearchRequest(globalSlugExact = slug),
            pageable,
            profile
        ).firstOrNull() ?: throw NotFoundException(ErrorCode.NotFound, "Project by slug $slug not found")

        return project.toDto(forkedByUser = projectService.isProjectForkedByUser(project, profile?.personId))
    }

    @GetMapping("/tags")
    fun getTags(): List<SearchableTagDto> =
        currentUserService.groupsMap()
            .keys.toList()
            .let { searchableTagRepository.findAllByPublicTrueOrOwnerIdIn(it) }
            .map { it.toDto() }

    @GetMapping("/recent")
    fun getRecentProjects(
        profile: TokenDetails,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
        @RequestParam("type", required = false) projectType: String?,
        request: HttpServletRequest,
    ): Page<ProjectDto> {
        val projectTypeParsed = projectType?.let { ProjectType.valueOf(it) }

        val projects = recentProjectService.getRecentProjectsForUser(profile.personId, pageable, projectTypeParsed)

        return projects.map { it.project.toDto(forkedByUser = projectService.isProjectForkedByUser(it.project, profile.personId)) }
    }
}

data class SearchByTextRequest(
    val query: String = "",
    val queryAnd: Boolean = false,
)

data class SearchRequest(
    val searchableType: SearchableType? = null,
    val projectType: ProjectType? = null,
    val processorType: String? = null,
    val inputDataTypes: Set<String>? = null,
    val outputDataTypes: Set<String>? = null,
    val inputDataTypesOr: Set<String>? = null,
    val outputDataTypesOr: Set<String>? = null,
    val tags: List<String>? = null,
    val tagsOr: List<String>? = null,
    val maxStars: Int? = null,
    val minStars: Int? = null,
    val starredByMe: Boolean? = null,
    val visibility: VisibilityScope? = null,
    val minForksCount: Int? = null,
    val maxForksCount: Int? = null,
    val modelTypeOr: List<String>? = null,
    val mlCategoryOr: List<String>? = null,
    val ownerIdsOr: List<UUID>? = null,
    val globalSlug: String? = null,
    val globalSlugExact: String? = null,
    val slug: String? = null,
    val slugExact: String? = null,
    val name: String? = null,
    val nameExact: String? = null,
    val namespace: String? = null,
    val namespaceExact: String? = null,
    val published: Boolean? = null,
    val own: Boolean? = null,
    val participate: Boolean? = null,
)

