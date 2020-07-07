package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.feature.marketplace.SearchResult
import com.mlreef.rest.helpers.DataClassWithId
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableTagType
import java.util.UUID

data class SearchResultDto(
    val project: ProjectDto,
    val probability: Float = 0.0F
)


internal fun SearchResult.toDto(): SearchResultDto =
    SearchResultDto(
        project = this.project.toDto(),
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