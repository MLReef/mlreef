package com.mlreef.rest.domain

import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.SearchableType
import com.mlreef.rest.domain.marketplace.Star
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.DiscriminatorValue
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.ManyToMany
import javax.persistence.OneToMany

/**
 * A Machine Learning Repository Project describes the association of data and experiments.
 * A repo can also be described with an DataType, for example a MLDataRepository using Images a data set
 */
@Entity
@DiscriminatorValue("DATA_PROJECT")
class DataProject(
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

    @OneToMany(mappedBy = "dataProject", fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    val experiments: MutableSet<Experiment> = mutableSetOf(),

    @OneToMany(mappedBy = "dataProject", fetch = FetchType.EAGER)
    val pipelineConfigurations: MutableSet<PipelineConfiguration> = mutableSetOf(),

    @ManyToMany(mappedBy = "projects", fetch = FetchType.LAZY)
    val externalDrives: MutableSet<DriveExternal> = mutableSetOf(),

    gitlabPathWithNamespace: String = "$gitlabNamespace/$gitlabPath",
    forksCount: Int = 0,
    inputDataTypes: MutableSet<DataType> = hashSetOf(),

    forkParent: Project? = null,
    forkChildren: MutableSet<Project> = mutableSetOf(),

    //searchable
    globalSlug: String? = null,
    tags: MutableSet<SearchableTag> = hashSetOf(),
    starsCount: Int = 0,
    stars: MutableSet<Star> = mutableSetOf(),
    cover: MlreefFile? = null,
    //Auditing
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : Project(id, ProjectType.DATA_PROJECT, slug, url, name, description, ownerId,
    gitlabNamespace, gitlabPath, gitlabPathWithNamespace, gitlabId,
    visibilityScope, forksCount, inputDataTypes,
    //searchable
    globalSlug, tags, starsCount, stars,
    forkParent, forkChildren,
    cover, version, createdAt, updatedAt
) {

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
        cover: MlreefFile?,
    ): T {
        return DataProject(
            id = this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            description = description ?: this.description,
            ownerId = this.ownerId,
            gitlabNamespace = gitlabNamespace ?: this.gitlabNamespace,
            gitlabPathWithNamespace = gitlabPathWithNamespace ?: this.gitlabPathWithNamespace,
            gitlabPath = gitlabPath ?: this.gitlabPath,
            gitlabId = gitlabId ?: this.gitlabId,
            experiments = this.experiments,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt,
            visibilityScope = visibilityScope ?: this.visibilityScope,
            globalSlug = globalSlug ?: this.globalSlug,
            stars = stars?.toMutableSet() ?: this.stars,
            starsCount = stars?.size ?: this.stars.size,
            tags = tags?.toMutableSet() ?: this.tags,
            inputDataTypes = inputDataTypes?.toMutableSet() ?: this.inputDataTypes,
            forkParent = forkParent ?: this.forkParent,
            forkChildren = forkChildren ?: this.forkChildren,
            cover = cover ?: this.cover,
        ) as T
    }

    fun copy(
        id: UUID? = null,
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        description: String? = null,
        gitlabNamespace: String? = null,
        gitlabPath: String? = null,
        gitlabPathWithNamespace: String? = null,
        gitlabId: Long? = null,
        experiments: Collection<Experiment>? = null,
        globalSlug: String? = null,
        stars: Collection<Star>? = null,
        inputDataTypes: Collection<DataType>? = null,
        tags: Collection<SearchableTag>? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null,
        visibilityScope: VisibilityScope? = null,
        cover: MlreefFile?,
    ): DataProject {
        return DataProject(
            id = id ?: this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            description = description ?: this.description,
            ownerId = this.ownerId,
            gitlabNamespace = gitlabNamespace ?: this.gitlabNamespace,
            gitlabPathWithNamespace = gitlabPathWithNamespace ?: this.gitlabPathWithNamespace,
            gitlabPath = gitlabPath ?: this.gitlabPath,
            gitlabId = gitlabId ?: this.gitlabId,
            experiments = experiments?.toMutableSet() ?: this.experiments,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt,
            visibilityScope = visibilityScope ?: this.visibilityScope,
            globalSlug = globalSlug ?: this.globalSlug,
            stars = stars?.toMutableSet() ?: this.stars,
            starsCount = stars?.size ?: this.stars.size,
            tags = tags?.toMutableSet() ?: this.tags,
            inputDataTypes = inputDataTypes?.toMutableSet() ?: this.inputDataTypes,
            cover = cover ?: this.cover,
        )
    }

    override fun toString(): String {
        return "[DataProject: id:$id slug:$slug name:$name ownerId:$ownerId gitlabId:${gitlabId} gitlabPathWithNamespace:$gitlabPathWithNamespace"
    }

    override fun clone(name: String?,
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
            inputDataTypes = inputDataTypes,
            tags = tags
        )
    }

    override val searchableType: SearchableType
        get() = SearchableType.DATA_PROJECT

    fun createPipelineConfiguration(
        name: String? = null,
        type: PipelineType,
        slug: String? = null,
        processorInstances: Collection<ProcessorInstance>? = null,
        sourceBranch: String? = null,
        targetBranchPattern: String? = null,
        inputFiles: Collection<FileLocation>? = null,
    ): PipelineConfiguration {
        val configuration =  PipelineConfiguration(
            id = UUID.randomUUID(),
            pipelineType = type,
            slug = slug ?: this.slug,
            name = name ?: this.name,
            dataProject = this,
            sourceBranch = sourceBranch ?: "master",
            targetBranchPattern = targetBranchPattern ?: "",
            processorInstances = processorInstances?.toMutableSet() ?: mutableSetOf(),
            inputFiles = inputFiles?.toMutableSet() ?: mutableSetOf(),
        )

        this.pipelineConfigurations.add(configuration)

        return configuration
    }

    val pipelines: Set<Pipeline>
    get() = pipelineConfigurations.flatMap { it.pipelines }.toSet()

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is DataProject -> false
            else -> this.id == other.id
        }
    }
}
