package com.mlreef.rest.marketplace

import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.Table

enum class SearchableTagType {
    UNDEFINED
}

@Entity
@Table(name = "marketplace_tag")
data class SearchableTag(
    @Id
    val id: UUID,

    @Column(name = "name", length = 64)
    val name: String,

    @Column(name = "public")
    val public: Boolean = true,

    @Column(name = "owner_id", nullable = true)
    val ownerId: UUID? = null,

    @Column(name = "tag_type")
    @Enumerated(EnumType.STRING)
    val type: SearchableTagType = SearchableTagType.UNDEFINED
)
