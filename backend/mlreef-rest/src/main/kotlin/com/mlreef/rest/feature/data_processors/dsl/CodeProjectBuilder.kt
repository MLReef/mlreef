package com.mlreef.rest.feature.data_processors.dsl

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataType
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.Star
import java.time.ZonedDateTime
import java.util.UUID

class CodeProjectBuilder {
    lateinit var id: UUID
    lateinit var slug: String
    var url: String = ""
    lateinit var name: String
    lateinit var description: String
    lateinit var owner: Subject
    var gitlabNamespace: String = ""
    var gitlabPath: String = ""
    var gitlabId: Long = 0
    var visibilityScope: VisibilityScope = VisibilityScope.default()
    var dataProcessor: DataProcessor? = null
    var forksCount: Int = 0
    var inputDataTypes: Set<DataType> = hashSetOf()
    var outputDataTypes: Set<DataType> = hashSetOf()
    var globalSlug: String? = null
    var tags: Set<SearchableTag> = hashSetOf()
    var starsCount: Int = 0
    var stars: List<Star> = listOf()
    var version: Long? = null
    var createdAt: ZonedDateTime? = null
    var updatedAt: ZonedDateTime? = null

    fun build() = CodeProject(
        id = this.id,
        slug = slug,
        url = url,
        name = name,
        description = description,
        ownerId = this.owner.id,
        gitlabNamespace = gitlabNamespace,
        gitlabPath = gitlabPath,
        gitlabPathWithNamespace = "$gitlabNamespace/$gitlabPath",
        gitlabId = gitlabId,
        dataProcessor = dataProcessor,
        version = version,
        createdAt = createdAt,
        updatedAt = updatedAt,
        visibilityScope = visibilityScope,
        globalSlug = globalSlug ?: this.globalSlug,
        stars = stars,
        starsCount = stars.size,
        tags = tags,
        inputDataTypes = inputDataTypes,
        outputDataTypes = outputDataTypes
    )

}
