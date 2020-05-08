package com.mlreef.rest.marketplace

import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import org.hibernate.annotations.Cascade
import org.slf4j.LoggerFactory
import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.CascadeType
import javax.persistence.CollectionTable
import javax.persistence.Column
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table
import javax.persistence.UniqueConstraint

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
@Entity
@Table(
    name = "marketplace_entry",
    uniqueConstraints = [
        UniqueConstraint(name = "marketplace_entry_unique_id", columnNames = ["id"]),
        UniqueConstraint(name = "marketplace_entry_unique_slug", columnNames = ["global_slug"]),
        UniqueConstraint(name = "marketplace_entry_unique_title_owner", columnNames = ["name", "owner_id"])
    ]
)
data class MarketplaceEntry(
    @Id
    val id: UUID = randomUUID(),
    /**
     * Every type of Explorable Resources needs a "slug" as a human-readable unique string identifier with the same constraints of slugs used in Gitlab for projects.
     */
    @Column(name = "global_slug", length = 64)
    val globalSlug: String,

    @Column(name = "visibility")
    @Enumerated(EnumType.STRING)
    val visibilityScope: VisibilityScope,

    @Column(name = "name", length = 256)
    val name: String,

    @Column(name = "description", length = 4096)
    val description: String,

    @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Cascade(org.hibernate.annotations.CascadeType.SAVE_UPDATE)
    @JoinTable(
        name = "marketplace_entries_tags",
        joinColumns = [JoinColumn(name = "entry_id", referencedColumnName = "id", updatable = false, foreignKey = ForeignKey(name = "marketplace_entries_tags_entry_id"))],
        inverseJoinColumns = [JoinColumn(name = "tag_id", referencedColumnName = "id", updatable = false, foreignKey = ForeignKey(name = "marketplace_entries_tags_tag_id"))]
    )
    val tags: Set<SearchableTag> = hashSetOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", foreignKey = ForeignKey(name = "marketplace_entry_subject_owner_id"))
    val owner: Subject,

    @Column(name = "owner_id", insertable = false, updatable = false)
    private val ownerId: UUID = owner.id,

    @Column(name = "stars_count")
    val starsCount: Int = 0,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "entry_id", foreignKey = ForeignKey(name = "marketplace_entry_star_entry_id"), updatable = false)
    val stars: List<Star> = arrayListOf(),

    @Column(name = "searchable_id", updatable = false)
    val searchableId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(name = "searchable_type", updatable = false)
    val searchableType: SearchableType,

    @Enumerated(EnumType.STRING)
    @ElementCollection(targetClass = DataType::class)
    @CollectionTable(
        name = "marketplace_entries_inputdatatype",
        joinColumns = [JoinColumn(name = "entry_id", updatable = false, referencedColumnName = "id", foreignKey = ForeignKey(name = "marketplace_entries_inputdatatype_entry_id"))]
    )
    @Column(name = "input_datatype")
    val inputDataTypes: Set<DataType> = hashSetOf(),

    @Enumerated(EnumType.STRING)
    @ElementCollection(targetClass = DataType::class)
    @CollectionTable(
        name = "marketplace_entries_outputdatatype",
        joinColumns = [JoinColumn(name = "entry_id", updatable = false,referencedColumnName = "id", foreignKey = ForeignKey(name = "marketplace_entries_outputdatatype_entry_id"))]
    )
    @Column(name = "output_datatype")
    val outputDataTypes: Set<DataType> = hashSetOf()
) {

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    fun addStar(subject: Person): MarketplaceEntry {
        val existing = stars.find { it.subjectId == subject.id }
        return if (existing != null) {
            log.info("Skipped: Marketplace already has a star for subject: $subject.id")
            this
        } else {
            val newStars: List<Star> = this.stars.toMutableList().apply {
                add(Star(
                    subjectId = subject.id,
                    entryId = this@MarketplaceEntry.id
                ))
            }
            this.copy(
                stars = newStars,
                starsCount = newStars.size
            )
        }
    }

    fun removeStar(subject: Person): MarketplaceEntry {
        val existing = stars.find { it.subjectId == subject.id }
        return if (existing != null) {
            val newStars = this.stars.toMutableList().filter { it.subjectId != subject.id }
            this.copy(
                stars = newStars,
                starsCount = newStars.size
            )
        } else {
            log.info("Skipped: Marketplace does not have a star for subject: $subject.id")
            this
        }
    }


    fun addTags(tags: List<SearchableTag>): MarketplaceEntry {
        return this.copy(
            tags = this.tags.toMutableSet().apply { addAll(tags) }
        )
    }

    fun addInputDataTypes(dataTypes: List<DataType>): MarketplaceEntry {
        return this.copy(
            inputDataTypes = this.inputDataTypes.toMutableSet().apply { addAll(dataTypes) }
        )
    }

    fun addOutputDataTypes(dataTypes: List<DataType>): MarketplaceEntry {
        return this.copy(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { addAll(dataTypes) }
        )
    }

    fun removeInputDataTypes(dataTypes: List<DataType>): MarketplaceEntry {
        return this.copy(
            inputDataTypes = this.inputDataTypes.toMutableSet().apply { removeAll(dataTypes) }
        )
    }

    fun removeOutputDataTypes(dataTypes: List<DataType>): MarketplaceEntry {
        return this.copy(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { removeAll(dataTypes) }
        )
    }

    override fun toString(): String {
        return "[MarketplaceEntry: $id $globalSlug stars:${starsCount} tags:$tags inputDataTypes:$inputDataTypes outputDataTypes:$outputDataTypes]"
    }
}
