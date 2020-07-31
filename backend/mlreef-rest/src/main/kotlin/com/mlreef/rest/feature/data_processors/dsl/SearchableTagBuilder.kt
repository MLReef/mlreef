package com.mlreef.rest.feature.data_processors.dsl

import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableTagType
import java.util.UUID

class SearchableTagBuilder {
    lateinit var id: UUID
    lateinit var name: String
    var public: Boolean = true
    var ownerId: UUID? = null
    var type: SearchableTagType = SearchableTagType.UNDEFINED

    fun build() = SearchableTag(
        id = this.id,
        name = name,
        ownerId = this.ownerId,
        public = this.public,
        type = this.type
    )
}
