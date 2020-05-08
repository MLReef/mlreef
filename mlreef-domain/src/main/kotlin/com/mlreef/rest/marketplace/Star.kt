package com.mlreef.rest.marketplace

import java.io.Serializable
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.IdClass
import javax.persistence.Table


@Entity
@Table(name = "marketplace_star")
@IdClass(value = Star.StarId::class)
data class Star(

    @Id
    val entryId: UUID ,

    @Id
    val subjectId: UUID

) {
    @Embeddable
    data class StarId(

        @Column(name = "subject_id", updatable = false)
        val subjectId: UUID,

        @Column(name = "entry_id", updatable = false)
        val entryId: UUID
    ) : Serializable

    override fun equals(other: Any?): Boolean {
        return if (other is Star) {
            other.entryId == this.entryId && other.subjectId == subjectId
        } else {
            false
        }
    }
}
