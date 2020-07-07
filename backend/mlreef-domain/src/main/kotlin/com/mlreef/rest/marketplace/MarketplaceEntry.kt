package com.mlreef.rest.marketplace

import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
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
    val outputDataTypes: Set<DataType>
    val globalSlug: String?
    val tags: Set<SearchableTag>
    val starsCount: Int
    val stars: List<Star>

    // TODO: add project UUID codeProject or dataProject for faster search! Joins will be easier!

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    fun addStar(subject: Person): Searchable {
        val existing = stars.find { it.subjectId == subject.id }
        return if (existing != null) {
            log.info("Skipped: Marketplace already has a star for subject: $subject.id")
            this
        } else {
            val newStars: List<Star> = this.stars.toMutableList().apply {
                add(Star(
                    subjectId = subject.id,
                    projectId = this@Searchable.getId()
                ))
            }
            this.clone(
                stars = newStars
            )
        }
    }


    fun removeStar(subject: Person): Searchable {
        val existing = stars.find { it.subjectId == subject.id }
        return if (existing != null) {
            val newStars = this.stars.toMutableList().filter { it.subjectId != subject.id }
            this.clone(
                stars = newStars
            )
        } else {
            log.info("Skipped: Marketplace does not have a star for subject: $subject.id")
            this
        }
    }


    fun addTags(tags: List<SearchableTag>): Searchable {
        return this.clone(
            tags = this.tags.toMutableSet().apply { addAll(tags) }
        )
    }

    fun addInputDataTypes(dataTypes: List<DataType>): Searchable {
        return this.clone(
            inputDataTypes = this.inputDataTypes.toMutableSet().apply { addAll(dataTypes) }
        )
    }

    fun addOutputDataTypes(dataTypes: List<DataType>): Searchable {
        return this.clone(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { addAll(dataTypes) }
        )
    }

    fun removeInputDataTypes(dataTypes: List<DataType>): Searchable {
        return this.clone(
            inputDataTypes = this.inputDataTypes.toMutableSet().apply { removeAll(dataTypes) }
        )
    }

    fun removeOutputDataTypes(dataTypes: List<DataType>): Searchable {
        return this.clone(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { removeAll(dataTypes) }
        )
    }

    fun clone(
        name: String? = null,
        description: String? = null,
        visibilityScope: VisibilityScope? = null,
        stars: List<Star>? = null,
        outputDataTypes: MutableSet<DataType>? = null,
        inputDataTypes: MutableSet<DataType>? = null,
        tags: MutableSet<SearchableTag>? = null
    ): Searchable

}

