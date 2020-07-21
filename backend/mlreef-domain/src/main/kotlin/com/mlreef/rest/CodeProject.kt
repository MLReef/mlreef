package com.mlreef.rest

import com.mlreef.rest.marketplace.Searchable
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import com.mlreef.rest.marketplace.Star
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.DiscriminatorValue
import javax.persistence.Entity

/**
 * A Code Repository is used for the working Code like Data Operations,
 * Algorithms, or soon Visualisations.
 *
 * A
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
    dataProcessor: DataProcessor? = null,
    forksCount: Int = 0,
    inputDataTypes: Set<DataType> = hashSetOf(),
    outputDataTypes: Set<DataType> = hashSetOf(),
    //searchable
    globalSlug: String? = null,
    tags: Set<SearchableTag> = hashSetOf(),
    starsCount: Int = 0,
    stars: List<Star> = arrayListOf(),
    //Auditing
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null

) : Project(id, ProjectType.CODE_PROJECT, slug, url, name, description, ownerId,
    gitlabNamespace, gitlabPath, gitlabPathWithNamespace, gitlabId,
    visibilityScope, dataProcessor, forksCount, inputDataTypes, outputDataTypes,
    //searchable
    globalSlug, tags, starsCount, stars,
    version, createdAt, updatedAt) {

    @Suppress("UNCHECKED_CAST")
    override fun <T : Project> copy(
        url: String?,
        slug: String?,
        name: String?,
        description: String?,
        gitlabNamespace: String?,
        gitlabPathWithNamespace: String?,
        gitlabPath: String?,
        gitlabId: Long?,
        globalSlug: String?,
        stars: List<Star>?,
        inputDataTypes: Set<DataType>?,
        outputDataTypes: Set<DataType>?,
        tags: Set<SearchableTag>?,
        version: Long?,
        createdAt: ZonedDateTime?,
        updatedAt: ZonedDateTime?,
        visibilityScope: VisibilityScope?
    ): T {
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
            dataProcessor = this.dataProcessor,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt,
            visibilityScope = visibilityScope ?: this.visibilityScope,
            globalSlug = globalSlug ?: this.globalSlug,
            stars = stars ?: this.stars,
            starsCount = stars?.size ?: this.stars.size,
            tags = tags ?: this.tags,
            inputDataTypes = inputDataTypes ?: this.inputDataTypes,
            outputDataTypes = outputDataTypes ?: this.outputDataTypes
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
        dataProcessor: DataProcessor? = null,
        globalSlug: String? = null,
        stars: List<Star>? = null,
        inputDataTypes: Set<DataType>? = null,
        outputDataTypes: Set<DataType>? = null,
        tags: Set<SearchableTag>? = null,
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
            dataProcessor = dataProcessor ?: this.dataProcessor,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt,
            visibilityScope = visibilityScope ?: this.visibilityScope,
            globalSlug = globalSlug ?: this.globalSlug,
            stars = stars ?: this.stars,
            starsCount = stars?.size ?: this.stars.size,
            tags = tags ?: this.tags,
            inputDataTypes = inputDataTypes ?: this.inputDataTypes,
            outputDataTypes = outputDataTypes ?: this.outputDataTypes
        )
    }

    override fun toString(): String {
        return "[CodeProject: id:$id slug:$slug name:$name ownerId:$ownerId gitlabId:${gitlabId} gitlabPathWithNamespace:$gitlabPathWithNamespace"
    }

    override fun clone(name: String?,
                       description: String?,
                       visibilityScope: VisibilityScope?,
                       stars: List<Star>?,
                       outputDataTypes: MutableSet<DataType>?,
                       inputDataTypes: MutableSet<DataType>?,
                       tags: MutableSet<SearchableTag>?
    ): Searchable {
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

    override val searchableType: SearchableType
        get() = SearchableType.CODE_PROJECT
}
