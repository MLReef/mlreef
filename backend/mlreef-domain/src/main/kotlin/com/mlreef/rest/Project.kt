package com.mlreef.rest

import com.mlreef.rest.helpers.ProjectOfUser
import com.mlreef.rest.marketplace.Searchable
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.Star
import org.hibernate.annotations.Cascade
import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.CollectionTable
import javax.persistence.Column
import javax.persistence.DiscriminatorColumn
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Inheritance
import javax.persistence.InheritanceType
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.PrePersist
import javax.persistence.Table

enum class ProjectType {
    DATA_PROJECT,
    CODE_PROJECT
}

@Table(name = "mlreef_project")
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "PROJECT_TYPE")
abstract class Project(
    id: UUID,
    @Enumerated(EnumType.STRING)
    @Column(name = "PROJECT_TYPE", insertable = false, updatable = false)
    val type: ProjectType,

    override val slug: String,
    val url: String,
    override val name: String,
    override val description: String,

    @Column(name = "owner_id")
    override val ownerId: UUID,

    @Column(name = "gitlab_namespace")
    val gitlabNamespace: String,

    @Column(name = "gitlab_path")
    val gitlabPath: String,

    @Column(name = "gitlab_path_with_namespace")
    val gitlabPathWithNamespace: String = "$gitlabNamespace/$gitlabPath",

    @Column(name = "gitlab_id")
    val gitlabId: Long,

    @Enumerated(EnumType.STRING)
    override val visibilityScope: VisibilityScope = VisibilityScope.default(),

    @OneToOne(fetch = FetchType.EAGER, mappedBy = "codeProject", optional = true)
    val dataProcessor: DataProcessor? = null,

    @Column(name = "forks_count")
    override val forksCount: Int = 0,

    @Enumerated(EnumType.STRING)
    @ElementCollection(targetClass = DataType::class, fetch = FetchType.EAGER)
    @CollectionTable(
        name = "project_inputdatatypes",
        joinColumns = [JoinColumn(name = "project_id", updatable = false, referencedColumnName = "id", foreignKey = ForeignKey(name = "dataproject_inputdatatypes_dataproject_id"))]
    )
    @Column(name = "input_datatype")
    @Fetch(value = FetchMode.JOIN)
    override val inputDataTypes: Set<DataType> = hashSetOf(),

    @Enumerated(EnumType.STRING)
    @ElementCollection(targetClass = DataType::class, fetch = FetchType.EAGER)
    @CollectionTable(
        name = "project_outputdatatypes",
        joinColumns = [JoinColumn(name = "project_id", updatable = false, referencedColumnName = "id", foreignKey = ForeignKey(name = "dataproject_outputdatatypes_dataproject_id"))]
    )
    @Column(name = "output_datatype")
    @Fetch(value = FetchMode.JOIN)
    override val outputDataTypes: Set<DataType> = hashSetOf(),

    @Column(name = "global_slug", length = 64)
    override val globalSlug: String?,

    @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Cascade(org.hibernate.annotations.CascadeType.SAVE_UPDATE)
    @JoinTable(
        name = "projects_tags",
        joinColumns = [JoinColumn(name = "project_id", referencedColumnName = "id", updatable = false, foreignKey = ForeignKey(name = "project_tags_project_id"))],
        inverseJoinColumns = [JoinColumn(name = "tag_id", referencedColumnName = "id", updatable = false, foreignKey = ForeignKey(name = "project_tags_tag_id"))]
    )
    @Fetch(value = FetchMode.SELECT)
    override val tags: Set<SearchableTag> = hashSetOf(),

    @Column(name = "stars_count")
    private var _starsCount: Int = 0,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "project_id", foreignKey = ForeignKey(name = "project_star_entry_id"), updatable = false)
    @Fetch(value = FetchMode.JOIN)
    override val stars: List<Star> = listOf(),

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null

) : AuditEntity(id, version, createdAt, updatedAt), Searchable {

    fun toProjectOfUser(accessLevel: AccessLevel?) = ProjectOfUser(
        id = this.id,
        name = this.name,
        accessLevel = accessLevel
    )

    abstract fun <T : Project> copy(
        id: UUID = this.id,
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        description: String? = null,
        gitlabNamespace: String? = null,
        gitlabPathWithNamespace: String? = null,
        gitlabPath: String? = null,
        gitlabId: Long? = null,
        globalSlug: String? = null,
        stars: List<Star>? = null,
        inputDataTypes: Set<DataType>? = null,
        outputDataTypes: Set<DataType>? = null,
        tags: Set<SearchableTag>? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null,
        visibilityScope: VisibilityScope? = null
    ): T

    fun addStar(subject: Person): Project {
        val existing = stars.find { it.subjectId == subject.id }
        return if (existing != null) {
            this
        } else {
            val newStars = this.stars.toMutableList().apply {
                add(Star(
                    subjectId = subject.id,
                    projectId = this@Project.id
                ))
            }

            this.clone(
                stars = newStars
            )
        }
    }

    fun removeStar(subject: Person): Project {
        val existing = stars.find { it.subjectId == subject.id }
        return if (existing != null) {
            val newStars = this.stars.filter { it.subjectId != subject.id }
            this.clone(
                stars = newStars
            )
        } else {
            this
        }
    }

    override val starsCount: Int
        get() = _starsCount

    @PrePersist
    fun prePersist() {
        this._starsCount = this.stars.size
    }


    fun addTags(tags: List<SearchableTag>): Project {
        return this.clone(
            tags = this.tags.toMutableSet().apply { addAll(tags) }
        )
    }

    fun addInputDataTypes(dataTypes: List<DataType>): Project {
        return this.clone(
            inputDataTypes = this.inputDataTypes.toMutableSet().apply { addAll(dataTypes) }
        )
    }

    fun addOutputDataTypes(dataTypes: List<DataType>): Project {
        return this.clone(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { addAll(dataTypes) }
        )
    }

    fun removeInputDataTypes(dataTypes: List<DataType>): Project {
        return this.clone(
            inputDataTypes = this.inputDataTypes.toMutableSet().apply { removeAll(dataTypes) }
        )
    }

    fun removeOutputDataTypes(dataTypes: List<DataType>): Project {
        return this.clone(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { removeAll(dataTypes) }
        )
    }

    abstract fun clone(
        name: String? = null,
        description: String? = null,
        visibilityScope: VisibilityScope? = null,
        stars: List<Star>? = null,
        outputDataTypes: MutableSet<DataType>? = null,
        inputDataTypes: MutableSet<DataType>? = null,
        tags: MutableSet<SearchableTag>? = null
    ): Project

}
