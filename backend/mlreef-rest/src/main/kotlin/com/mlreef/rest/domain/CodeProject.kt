package com.mlreef.rest.domain

import com.mlreef.rest.domain.marketplace.SearchableExtended
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.SearchableType
import com.mlreef.rest.domain.marketplace.Star
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.DiscriminatorValue
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.ManyToOne
import javax.persistence.OneToMany

/**
 * A Code Repository is used for the working Code like Data Operations,
 * Algorithms, or soon Visualisations.
 */
@Entity
@DiscriminatorValue("CODE_PROJECT")
class CodeProject(
    id: UUID,
    slug: String,
    url: String,
    name: String,
    description: String,
    ownerId: UUID,
    gitlabNamespace: String,
    gitlabPath: String,
    gitlabId: Long,
    visibilityScope: VisibilityScope = VisibilityScope.default(),
    gitlabPathWithNamespace: String = "$gitlabNamespace/$gitlabPath",
    forksCount: Int = 0,
    inputDataTypes: MutableSet<DataType> = mutableSetOf(),

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "project_outputdatatypes",
        joinColumns = [JoinColumn(name = "project_id")],
        inverseJoinColumns = [JoinColumn(name = "data_type_id")]
    )
    override val outputDataTypes: MutableSet<DataType> = mutableSetOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_type_id")
    override val processorType: ProcessorType,

    @OneToMany(mappedBy = "codeProject", fetch = FetchType.EAGER)
    val processors: MutableSet<Processor> = mutableSetOf(),

    var modelType: String? = null,
    var mlCategory: String? = null,

    forkParent: Project? = null,
    forkChildren: MutableSet<Project> = mutableSetOf(),

    //searchable
    globalSlug: String? = null,
    tags: MutableSet<SearchableTag> = hashSetOf(),
    starsCount: Int = 0,
    stars: MutableSet<Star> = mutableSetOf(),
    //Auditing
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null

) : Project(
    id, ProjectType.CODE_PROJECT, slug, url, name, description, ownerId,
    gitlabNamespace, gitlabPath, gitlabPathWithNamespace, gitlabId,
    visibilityScope, forksCount, inputDataTypes,
    //searchable
    globalSlug, tags, starsCount, stars,
    forkParent, forkChildren,
    version, createdAt, updatedAt
), SearchableExtended {
    fun wasPublished(): Boolean {
        return this.processors.any { it.status == PublishStatus.PUBLISHED || it.status == PublishStatus.PUBLISH_FINISHING }
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T : Project> copy(
        id: UUID,
        url: String?,
        slug: String?,
        name: String?,
        description: String?,
        gitlabNamespace: String?,
        gitlabPathWithNamespace: String?,
        gitlabPath: String?,
        gitlabId: Long?,
        globalSlug: String?,
        stars: Collection<Star>?,
        inputDataTypes: Collection<DataType>?,
        tags: Collection<SearchableTag>?,
        version: Long?,
        createdAt: ZonedDateTime?,
        updatedAt: ZonedDateTime?,
        visibilityScope: VisibilityScope?,
        forkParent: Project?,
        forkChildren: MutableSet<Project>?,
    ): T {
        return CodeProject(
            id = id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            description = description ?: this.description,
            ownerId = this.ownerId,
            gitlabNamespace = gitlabNamespace ?: this.gitlabNamespace,
            gitlabPath = gitlabPath ?: this.gitlabPath,
            gitlabPathWithNamespace = gitlabPathWithNamespace ?: this.gitlabPathWithNamespace,
            gitlabId = gitlabId ?: this.gitlabId,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt,
            visibilityScope = visibilityScope ?: this.visibilityScope,
            globalSlug = globalSlug ?: this.globalSlug,
            stars = stars?.toMutableSet() ?: this.stars.toMutableSet(),
            starsCount = stars?.size ?: this.stars.size,
            tags = tags?.toMutableSet() ?: this.tags,
            inputDataTypes = inputDataTypes?.toMutableSet() ?: this.inputDataTypes,
            outputDataTypes = this.outputDataTypes,
            processorType = this.processorType,
            processors = this.processors,
            forkParent = forkParent ?: this.forkParent,
            forkChildren = forkChildren ?: this.forkChildren,
        ) as T
    }

    fun copy(
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        description: String? = null,
        gitlabNamespace: String? = null,
        gitlabPathWithNamespace: String? = null,
        gitlabPath: String? = null,
        gitlabId: Long? = null,
        globalSlug: String? = null,
        stars: Collection<Star>? = null,
        inputDataTypes: Collection<DataType>? = null,
        outputDataTypes: Collection<DataType>? = null,
        processorType: ProcessorType? = null,
        processors: Collection<Processor>? = null,
        tags: Collection<SearchableTag>? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null,
        visibilityScope: VisibilityScope? = null
    ): CodeProject {
        return CodeProject(
            id = this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            description = description ?: this.description,
            ownerId = this.ownerId,
            gitlabNamespace = gitlabNamespace ?: this.gitlabNamespace,
            gitlabPath = gitlabPath ?: this.gitlabPath,
            gitlabPathWithNamespace = gitlabPathWithNamespace ?: this.gitlabPathWithNamespace,
            gitlabId = gitlabId ?: this.gitlabId,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt,
            visibilityScope = visibilityScope ?: this.visibilityScope,
            globalSlug = globalSlug ?: this.globalSlug,
            stars = stars?.toMutableSet() ?: this.stars,
            starsCount = stars?.size ?: this.stars.size,
            tags = tags?.toMutableSet() ?: this.tags,
            inputDataTypes = inputDataTypes?.toMutableSet() ?: this.inputDataTypes,
            outputDataTypes = outputDataTypes?.toMutableSet() ?: this.outputDataTypes,
            processorType = processorType ?: this.processorType,
            processors = processors?.toMutableSet() ?: this.processors,
        )
    }

    override fun toString(): String {
        return "[CodeProject: id:$id slug:$slug name:$name ownerId:$ownerId gitlabId:${gitlabId} gitlabPathWithNamespace:$gitlabPathWithNamespace"
    }

    override fun clone(
        name: String?,
        description: String?,
        visibilityScope: VisibilityScope?,
        stars: Collection<Star>?,
        outputDataTypes: Collection<DataType>?,
        inputDataTypes: Collection<DataType>?,
        tags: Collection<SearchableTag>?
    ): Project {
        return this.copy(
            name = name,
            description = description,
            visibilityScope = visibilityScope,
            stars = stars,
            outputDataTypes = outputDataTypes,
            inputDataTypes = inputDataTypes,
            tags = tags
        )
    }

    fun addOutputDataTypes(dataTypes: Collection<DataType>): Project {
        return this.clone(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { addAll(dataTypes) }
        )
    }

    fun removeOutputDataTypes(dataTypes: Collection<DataType>): Project {
        return this.clone(
            outputDataTypes = this.outputDataTypes.toMutableSet().apply { removeAll(dataTypes) }
        )
    }

    override val searchableType: SearchableType
        get() = SearchableType.CODE_PROJECT

    fun createProcessor(
        name: String? = null,
        slug: String? = null,
        mainScript: String? = null,
        imageName: String? = null,
        branch: String? = null,
        version: String? = null,
        publisher: Person? = null,
    ): Processor {
        val processor = Processor(
            UUID.randomUUID(),
            this,
            name = name ?: this.name,
            slug = slug ?: "${this.slug}-processor",
            mainScriptPath = mainScript ?: "main.py",
            imageName = "${this.name}:master",
            branch = branch ?: "master",
            version = version ?: "1",
            publisher = publisher,
        )
        this.processors.add(processor)
        return processor
    }

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is CodeProject -> false
            else -> this.id == other.id
        }
    }
}
