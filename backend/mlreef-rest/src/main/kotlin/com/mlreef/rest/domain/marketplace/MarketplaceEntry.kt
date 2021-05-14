package com.mlreef.rest.domain.marketplace

import com.mlreef.rest.domain.DataType
import com.mlreef.rest.domain.ProcessorType
import com.mlreef.rest.domain.VisibilityScope
import org.slf4j.LoggerFactory
import java.util.UUID

/**
 * Resources are Explorable if they can be accessed in the Marketplace and can be accessed publicly.
 * Explorable Resources are:
 *
 * DataProjects
 * Data Processors (and implicitly their CodeProjects)
 *
 * Searchable Resources are Explorable Resources which further provide fields for advanced filtering and searching.
 *
 * Forked Projects, for example a fork of an Data Project, must not be included in the search result.
 * Only the original public Resource will be Searchable and presented in the paginated result.
 * The Forked Project may be Explorable and accessible with known Id.
 */

interface Searchable {
    fun getId(): UUID
    val name: String
    val visibilityScope: VisibilityScope
    val slug: String
    val description: String
    val ownerId: UUID
    val forksCount: Int
    val searchableType: SearchableType
    val inputDataTypes: Set<DataType>
    val globalSlug: String?
    val tags: Set<SearchableTag>
    val starsCount: Int
    val stars: Set<Star>

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }
}

interface SearchableExtended : Searchable {
    val processorType: ProcessorType?
    val outputDataTypes: Set<DataType>
}

