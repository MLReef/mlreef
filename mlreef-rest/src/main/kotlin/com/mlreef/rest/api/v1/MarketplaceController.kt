package com.mlreef.rest.api.v1

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.MarketplaceEntryRepository
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.MarketplaceEntryDto
import com.mlreef.rest.api.v1.dto.SearchableTagDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.marketplace.MarketplaceEntry
import com.mlreef.rest.marketplace.SearchableTag
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/explore")
class MarketplaceController(
    val marketplaceService: MarketplaceService,
    val marketplaceEntryRepository: MarketplaceEntryRepository,
    val searchableTagRepository: SearchableTagRepository,
    val currentUserService: CurrentUserService
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    @GetMapping("/entries")
    fun getAllEntries(): List<MarketplaceEntryDto> {
        val projectsMap = currentUserService.projectsMap(AccessLevel.GUEST)
        val forProjects = marketplaceService.findEntriesForProjects(projectsMap)
        val dtos = forProjects.map(MarketplaceEntry::toDto)
        return dtos
    }

    @GetMapping("/entries/{slug}")
    fun getEntry(@PathVariable slug: String): MarketplaceEntryDto {
        val projectsMap = currentUserService.projectsMap(AccessLevel.GUEST)
        val forProjects = marketplaceService.findEntriesForProjectsBySlug(projectsMap, slug)
        val dto = forProjects.toDto()
        return dto
    }

    @GetMapping("/tags")
    fun getTags(): List<SearchableTagDto> {
        val groupsMap = currentUserService.groupsMap()
        val ids: List<UUID> = groupsMap.map { it.key }.toList()
        val tags = searchableTagRepository.findAllByPublicTrueOrOwnerIdIn(ids)
        val dtos = tags.map(SearchableTag::toDto)
        return dtos
    }

}
