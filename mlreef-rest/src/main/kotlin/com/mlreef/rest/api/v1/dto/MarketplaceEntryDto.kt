package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.helpers.DataClassWithId
import com.mlreef.rest.marketplace.MarketplaceEntry
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import java.util.UUID

data class MarketplaceEntryDto(
    override val id: UUID,
    val globalSlug: String,
    val visibilityScope: VisibilityScope,
    val name: String,
    val description: String,
    val tags: List<SearchableTagDto>,
    val ownerId: UUID,
    val ownerName: String,
    val starsCount: Int,
    val inputDataTypes: List<DataType>,
    val outputDataTypes: List<DataType>,
    val searchableId: UUID?,
    val searchableType: SearchableType?
) : DataClassWithId


internal fun MarketplaceEntry.toDto(): MarketplaceEntryDto =
    MarketplaceEntryDto(
        id = this.id,
        globalSlug = this.globalSlug,
        visibilityScope = this.visibilityScope,
        name = this.name,
        description = this.description,
        tags = this.tags.map(SearchableTag::toDto),
        ownerId = this.owner.id,
        ownerName = this.owner.name,
        starsCount = this.starsCount,
        inputDataTypes = this.inputDataTypes.toList(),
        outputDataTypes = this.outputDataTypes.toList(),
        searchableId = this.searchableId,
        searchableType = this.searchableType
    )