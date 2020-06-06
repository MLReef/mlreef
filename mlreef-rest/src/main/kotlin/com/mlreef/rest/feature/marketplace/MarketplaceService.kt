package com.mlreef.rest.feature.marketplace

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.MarketplaceEntryRepository
import com.mlreef.rest.Person
import com.mlreef.rest.Searchable
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.marketplace.MarketplaceEntry
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import com.mlreef.utils.Slugs
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Handles the creation and linking of Searchables with their Marketplace Entries
 * All Operations which are not only scoped into a single Entry are handled by this Service
 */
@Service
class MarketplaceService(
    private val marketplaceEntryRepository: MarketplaceEntryRepository,
    private val searchableTagRepository: SearchableTagRepository
) {
    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    /**
     * Creates a new Entry for a Searchable with a Subject as owner/author.
     * Searchable can be a DataProject or a DataProcessorr
     *
     */
    fun createEntry(searchable: Searchable, owner: Subject): MarketplaceEntry {
        val existing = marketplaceEntryRepository.findBySearchableId(searchable.getId())
        existing?.let { throw ConflictException(ErrorCode.Conflict, "This Entity already has a MarketplaceEntry") }

        val marketplaceEntry = when (searchable) {
            is DataProject -> createEntryForDataProject(searchable, owner)
            is DataProcessor -> createEntryForDataProcessor(searchable, owner)
            else -> throw NotImplementedError("Searchable does not support that type")
        }

        marketplaceEntryRepository.save(marketplaceEntry)
        log.info("Create new MarketplaceEntry for searchable id ${searchable.getId()} and owner $owner")
        return marketplaceEntry
    }

    fun updateEntry(
        marketplaceEntry: MarketplaceEntry,
        title: String? = null,
        description: String? = null,
        visibilityScope: VisibilityScope? = null,
        outputDataTypes: List<DataType> = emptyList(),
        inputDataTypes: List<DataType> = emptyList()
    ): MarketplaceEntry {

        marketplaceEntry.outputDataTypes
        val update = marketplaceEntry.copy(
            name = title ?: marketplaceEntry.name,
            description = description ?: marketplaceEntry.description,
            visibilityScope = visibilityScope ?: marketplaceEntry.visibilityScope
        )

        val afterDataTypes = update
            .addInputDataTypes(inputDataTypes)
            .addOutputDataTypes(outputDataTypes)

        return marketplaceEntryRepository.save(afterDataTypes)
    }

    /**
     * Adds a star from one Person
     */
    fun addStar(marketplaceEntry: MarketplaceEntry, person: Person): MarketplaceEntry {
        val adapted = marketplaceEntry.addStar(person)
        return marketplaceEntryRepository.save(adapted)
    }

    /**
     * Adds a preexisting Tag to this Entry, Tags are stored just once per Entry
     */
    fun addTags(marketplaceEntry: MarketplaceEntry, tags: List<SearchableTag>): MarketplaceEntry {
        val adapted = marketplaceEntry
            .addTags(tags)
        return marketplaceEntryRepository.save(adapted)
    }

    /**
     * Sets the Tags of this Entry, similar to removing all Tags and adding new ones
     */
    fun defineTags(marketplaceEntry: MarketplaceEntry, tags: List<SearchableTag>): MarketplaceEntry {
        val adapted = marketplaceEntry
            .copy(tags = setOf())
            .addTags(tags)
        return marketplaceEntryRepository.save(adapted)
    }

    fun removeStar(marketplaceEntry: MarketplaceEntry, person: Person): MarketplaceEntry {
        val adapted = marketplaceEntry.removeStar(person)
        log.info("User $person put a star on $marketplaceEntry")
        return marketplaceEntryRepository.save(adapted)
    }

    fun deleteEntry(marketplaceEntry: MarketplaceEntry) {
        marketplaceEntryRepository.delete(marketplaceEntry)
        log.info("Deleted marketplaceEntry $marketplaceEntry")
    }

    private fun createEntryForDataProject(
        dataProject: DataProject,
        owner: Subject,
        title: String = "",
        description: String = "",
        visibilityScope: VisibilityScope = VisibilityScope.PUBLIC
    ): MarketplaceEntry {
        return MarketplaceEntry(
            globalSlug = "project-${dataProject.slug}",
            name = title,
            description = description,
            owner = owner,
            visibilityScope = visibilityScope,
            searchableType = SearchableType.typeFor(dataProject),
            searchableId = dataProject.id
        )
    }

    private fun createEntryForDataProcessor(
        dataProcessor: DataProcessor,
        owner: Subject,
        title: String = "",
        description: String = "",
        visibilityScope: VisibilityScope = VisibilityScope.PUBLIC
    ): MarketplaceEntry {
        val globalSlug = Slugs.toSlug(dataProcessor.type.name.toString() + "-" + dataProcessor.slug)
        return MarketplaceEntry(
            globalSlug = globalSlug,
            name = title,
            description = description,
            owner = owner,
            visibilityScope = visibilityScope,
            searchableType = SearchableType.typeFor(dataProcessor),
            searchableId = dataProcessor.id
        )
    }

    fun findEntriesForProjects(projectsMap: Map<UUID, AccessLevel?>): List<MarketplaceEntry> {
        val ids: List<UUID> = projectsMap.filterValues { AccessLevel.isSufficientFor(it, AccessLevel.GUEST) }.map { it.key }.toList()

        val findAllByVisibilityScope = marketplaceEntryRepository.findAllByVisibilityScope(VisibilityScope.PUBLIC)
        val accessibleDataProjects = marketplaceEntryRepository.findAccessibleDataProjects(ids)
        val accessibleProcessor = marketplaceEntryRepository.findAccessibleProcessors(ids)

        log.info("Found data projects: ${accessibleDataProjects.size}")
        log.info("Found processors: ${accessibleProcessor.size}")

        return findAllByVisibilityScope.toMutableSet().apply {
            addAll(accessibleDataProjects)
        }.toList()
    }

    fun findEntriesForProjectsBySlug(projectsMap: Map<UUID, AccessLevel?>, slug: String): MarketplaceEntry {
        val ids: List<UUID> = projectsMap.filterValues { AccessLevel.isSufficientFor(it, AccessLevel.GUEST) }.map { it.key }.toList()

        val accessibleDataProject = marketplaceEntryRepository.findAccessibleDataProject(ids, slug)
        val accessibleProcessor = marketplaceEntryRepository.findAccessibleProcessor(ids, slug)
        val findPublic = marketplaceEntryRepository.findByGlobalSlugAndVisibilityScope(slug, VisibilityScope.PUBLIC)

        return findPublic ?: accessibleDataProject ?: accessibleProcessor ?: throw NotFoundException("Not found")
    }

    fun findPublicEntriesPageable(page: Pageable): Page<MarketplaceEntry> {
        return marketplaceEntryRepository.findAllByVisibilityScope(VisibilityScope.PUBLIC, page)
    }
}
