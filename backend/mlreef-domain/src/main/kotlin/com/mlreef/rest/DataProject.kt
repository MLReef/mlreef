package com.mlreef.rest

import com.mlreef.rest.marketplace.Searchable
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import com.mlreef.rest.marketplace.Star
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.DiscriminatorValue
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.JoinColumn
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

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(
        name = "data_project_id",
        foreignKey = ForeignKey(name = "experiment_dataproject_data_project_id_fkey"))
    val experiments: List<Experiment> = listOf(),
    gitlabPathWithNamespace: String = "$gitlabNamespace/$gitlabPath",

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
) : Project(id, ProjectType.DATA_PROJECT, slug, url, name, description, ownerId,
    gitlabNamespace, gitlabPath, gitlabPathWithNamespace, gitlabId,
    visibilityScope, null, forksCount, inputDataTypes, outputDataTypes,
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
            stars = stars ?: this.stars,
            starsCount = stars?.size ?: this.stars.size,
            tags = tags ?: this.tags,
            inputDataTypes = inputDataTypes ?: this.inputDataTypes,
            outputDataTypes = outputDataTypes ?: this.outputDataTypes
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
        experiments: List<Experiment>? = null,
        globalSlug: String? = null,
        stars: List<Star>? = null,
        inputDataTypes: Set<DataType>? = null,
        outputDataTypes: Set<DataType>? = null,
        tags: Set<SearchableTag>? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null,
        visibilityScope: VisibilityScope? = null
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
            experiments = experiments ?: this.experiments,
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
        return "[DataProject: id:$id slug:$slug name:$name ownerId:$ownerId gitlabId:${gitlabId} gitlabPathWithNamespace:$gitlabPathWithNamespace"
    }

    override fun clone(name: String?,
                       description: String?,
                       visibilityScope: VisibilityScope?,
                       stars: List<Star>?,
                       outputDataTypes: MutableSet<DataType>?,
                       inputDataTypes: MutableSet<DataType>?,
                       tags: MutableSet<SearchableTag>?
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

    override val searchableType: SearchableType
        get() = SearchableType.DATA_PROJECT


}
