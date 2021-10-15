package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.SearchableTagType
import com.mlreef.rest.feature.marketplace.SearchResult
import java.util.UUID

data class SearchResultDto(
    val project: ProjectDto,
    val probability: Float = 0.0F
)


internal fun SearchResult.toDto(forkedByUser: Boolean? = null, coverUrl: String? = null): SearchResultDto =
    SearchResultDto(
        project = this.project.toDto(forkedByUser = forkedByUser, coverUrl = coverUrl),
        probability = this.properties?.rank ?: 1.0F
    )

data class SearchableTagDto(
    override val id: UUID,
    val name: String,
    val public: Boolean,
    val type: SearchableTagType
) : DataClassWithId


internal fun SearchableTag.toDto(): SearchableTagDto =
    SearchableTagDto(
        id = this.id,
        name = this.name,
        public = this.public,
        type = this.type
    )