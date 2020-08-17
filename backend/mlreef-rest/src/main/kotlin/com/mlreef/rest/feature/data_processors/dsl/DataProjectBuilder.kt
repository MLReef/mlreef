package com.mlreef.rest.feature.data_processors.dsl

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.Star
import java.time.ZonedDateTime
import java.util.UUID

class DataProjectBuilder {
    lateinit var id: UUID
    lateinit var slug: String
    lateinit var url: String
    lateinit var name: String
    lateinit var description: String
    lateinit var ownerId: UUID
    lateinit var gitlabNamespace: String
    lateinit var gitlabPath: String
    var gitlabId: Long = 0
    var visibilityScope: VisibilityScope = VisibilityScope.default()
    var gitlabPathWithNamespace: String = "$gitlabNamespace/$gitlabPath"
    var forksCount: Int = 0
    var inputDataTypes: Set<DataType> = hashSetOf()
    var outputDataTypes: Set<DataType> = hashSetOf()
    var globalSlug: String? = null
    var tags: Set<SearchableTag> = hashSetOf()
    var starsCount: Int = 0
    var stars: List<Star> = arrayListOf()
    var version: Long? = null
    var createdAt: ZonedDateTime? = null
    var updatedAt: ZonedDateTime? = null

    fun build() = DataProject(
        id = this.id,
        slug = slug,
        url = url,
        name = name,
        description = description,
        ownerId = this.ownerId,
        gitlabNamespace = gitlabNamespace,
        gitlabPath = gitlabPath,
        gitlabPathWithNamespace = gitlabPathWithNamespace,
        gitlabId = gitlabId,
        version = version ?: this.version,
        createdAt = createdAt ?: this.createdAt,
        updatedAt = updatedAt ?: this.updatedAt,
        visibilityScope = visibilityScope,
        globalSlug = globalSlug ?: this.globalSlug,
        stars = stars,
        starsCount = stars.size,
        tags = tags,
        inputDataTypes = inputDataTypes ?: this.inputDataTypes,
        outputDataTypes = outputDataTypes ?: this.outputDataTypes
    )

}
