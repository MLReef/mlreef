package com.mlreef.rest.feature.marketplace

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.Project
import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.FilterRequest
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.marketplace.Searchable
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * Handles the creation and linking of Searchables with their Marketplace Entries
 * All Operations which are not only scoped into a single Entry are handled by this Service
 */
@Service
class MarketplaceService(
    private val projectRepository: ProjectRepository,
    private val dataProjectRepository: DataProjectRepository,
    private val codeProjectRepository: CodeProjectRepository,
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
    @Transactional
    fun prepareEntry(searchable: Searchable, owner: Subject): Searchable {
        val afterSave = when (searchable) {
            is DataProject -> updateDataProject(searchable, owner)
            is CodeProject -> updateCodeProject(searchable, owner)
            else -> throw NotImplementedError("Searchable does not support that type")
        }

        log.info("Create new Searchable for searchable id ${searchable.getId()} and owner $owner")
        return save(afterSave)
    }

    /**
     * Creates a new Entry for a Searchable with a Subject as owner/author.
     * Searchable can be a DataProject or a DataProcessorr
     *
     */
    fun assertEntry(searchable: Searchable, owner: Subject): Searchable {
        val existing = projectRepository.findByIdOrNull(searchable.getId())
        existing?.let { return@let existing }
        return prepareEntry(searchable, owner)
    }

    @Transactional
    fun save(searchable: Searchable): Searchable {
        return when (searchable) {
            is DataProject -> dataProjectRepository.save(searchable)
            is CodeProject -> codeProjectRepository.save(searchable)
            is Project -> projectRepository.save(searchable)
            else -> throw IllegalStateException("Not possible ")
        }
    }

    /**
     * Adds a star from one Person
     */
    fun addStar(searchable: Searchable, person: Person): Searchable {
        val adapted = searchable.addStar(person)
        return save(adapted)
    }

    /**
     * Adds a preexisting Tag to this Entry, Tags are stored just once per Entry
     */
    @Transactional
    fun addTags(searchable: Searchable, tags: List<SearchableTag>): Searchable {
        val adapted = searchable.addTags(tags)
        return save(adapted)
    }

    /**
     * Sets the Tags of this Entry, similar to removing all Tags and adding new ones
     */
    fun defineTags(searchable: Searchable, tags: List<SearchableTag>): Searchable {
        val adapted = searchable
            .clone(tags = hashSetOf())
            .addTags(tags)
        return save(adapted)
    }

    fun removeStar(searchable: Searchable, person: Person): Searchable {
        val adapted = searchable.removeStar(person)
        log.info("User $person put a star on $Searchable")
        return save(adapted)
    }

    private fun updateDataProject(
        dataProject: DataProject,
        owner: Subject,
        name: String = dataProject.name,
        description: String = "",
        visibilityScope: VisibilityScope = dataProject.visibilityScope
    ): Searchable {
        return dataProject.copy(
            name = name,
            description = description,
            visibilityScope = visibilityScope,
            globalSlug = "data-project-${dataProject.slug}"
        )
    }

    private fun updateCodeProject(
        codeProject: CodeProject,
        owner: Subject,
        name: String = codeProject.name,
        description: String = "",
        visibilityScope: VisibilityScope = codeProject.visibilityScope
    ): Searchable {
        return codeProject.copy(
            name = name,
            description = description,
            visibilityScope = visibilityScope,
            globalSlug = "code-project-${codeProject.slug}"
        )
    }


    fun findEntriesForProjects(pageable: Pageable, projectsMap: Map<UUID, AccessLevel?>): List<Project> {
        val ids: List<UUID> = projectsMap.filterValues { AccessLevel.isSufficientFor(it, AccessLevel.GUEST) }.map { it.key }.toList()

        val findAllByVisibilityScope = projectRepository.findAllByVisibilityScope(VisibilityScope.PUBLIC, pageable)
        val projects = projectRepository.findAccessibleProjects(ids, pageable)
        return findAllByVisibilityScope.toMutableSet().apply {
            addAll(projects)
        }.toList()
    }


    fun findEntriesForProjectsBySlug(projectsMap: Map<UUID, AccessLevel?>, slug: String): Project {
        val ids: List<UUID> = projectsMap.filterValues { AccessLevel.isSufficientFor(it, AccessLevel.GUEST) }.map { it.key }.toList()

        val project = projectRepository.findAccessibleProject(ids, slug)
        val findPublic = projectRepository.findByGlobalSlugAndVisibilityScope(slug, VisibilityScope.PUBLIC)
        return findPublic ?: project ?: throw NotFoundException("Not found")
    }

    /**
     * This method must perform the search in a complex way:
     * - Paging is supported
     * - Filtering is possible
     * - Ordering is supported by Spring Paging support (except rank)
     * - If a searchQuery is applied, the result is sorted by rank DESC (scoped in the current page)
     * - If no full text search is applied, the SearchResult will have "1.0" as idempotent rank
     *
     * Due to performance reasons, and limited development resources, text search ranking is just scoped to the current page!
     * So currently we cannot order per rank and afterwards apply paging, but just offer normal paging and sorting, and then sort the page results per rank.
     *
     * *Hint*: If you need a "global order by rank" just use a page size of over 9000 which should result in one page which is ordered per rank
     */
    fun performSearch(pageable: Pageable, filter: FilterRequest, projectsMap: Map<UUID, AccessLevel?>? = null): List<SearchResult> {

        log.debug("Start MarketplaceSearch for filterRequest ${filter} and paging ${pageable}")
        val time = System.currentTimeMillis()

        val ids: List<UUID>? = projectsMap?.filterValues { AccessLevel.isSufficientFor(it, AccessLevel.GUEST) }?.map { it.key }?.toList()
        val existingTags = filter.tags?.let { findTagsForStrings(it) }

        val typeClazz = if (filter.searchableType == SearchableType.DATA_PROJECT) {
            DataProject::class.java
        } else {
            CodeProject::class.java
        }
        val findAccessible = projectRepository.findAccessible(
            typeClazz,
            pageable,
            ids,
            null,
            filter.searchableType,
            filter.inputDataTypes,
            filter.outputDataTypes,
            existingTags
        )
        val accessibleEntriesMap = findAccessible.associateBy { it.id }

        log.debug("Found ${findAccessible.size} findAccessible")
        log.info("Marketplace Search found ${findAccessible.size} normal results within ${System.currentTimeMillis() - time} ms")

        if (findAccessible.isEmpty()) {
            return emptyList()
        }

        if (filter.query.isNotBlank()) {
            val ftsQueryPart = buildFTSCondition(filter.query, queryAnd = filter.queryAnd)

            /**
             * Requires the "update_fts_document" PSQL TRIGGER and "project_fts_index" gin index
             * Currently Fulltext search is implemented via psql and _relies_ on that, be aware of that when you change DB!
             */
            val rankedResults = projectRepository
                .fulltextSearch(ftsQueryPart, accessibleEntriesMap.keys)
                .map { UUIDRank(UUID.fromString(it.id), it.rank) }

            log.debug("Found ${rankedResults.size} fulltext search results with query ranking")

            // step 1: reduce all ranks to ranks with Id in current page
            val filteredRanks = rankedResults.filter { it.id in accessibleEntriesMap }

            // step 2: order baselist with currentRanks probability
            val finalPageRankedEntries = filteredRanks.mapNotNull {
                accessibleEntriesMap[it.id]
            }
            val searchResults = finalPageRankedEntries.zip(rankedResults).map {
                SearchResult(it.first, SearchResultProperties(rank = it.second.rank.toFloat()))
            }
            log.info("Marketplace fulltext search found ${searchResults.size} fts results within ${System.currentTimeMillis() - time} ms")
            return searchResults
        } else {
            return findAccessible.map {
                SearchResult(it, null)
            }
        }

    }

    private fun findTagsForStrings(tagNames: List<String>): List<SearchableTag> {
        return searchableTagRepository.findAllByPublicTrueAndNameIsIn(tagNames.map(String::toLowerCase))
    }

    /**
     * Requires the "update_fts_document" PSQL TRIGGER and "project_fts_index" gin index
     *
     * Currently Fulltext search is implemented via psql and _relies_ on that, be aware of that when you change DB!
     */
    private fun buildFTSCondition(query: String, queryAnd: Boolean): String {

        val safeQuery = query.replace("\"", "").replace("\'", "")
        val list = safeQuery.split(" ")
        return if (queryAnd) {
            list.joinToString(" & ")
        } else {
            list.joinToString(" | ")
        }
    }
}

data class SearchResultProperties(
    val rank: Float
)

data class SearchResult(
    val project: Project,
    val properties: SearchResultProperties?
)

data class UUIDRank(
    val id: UUID,
    val rank: Double
)