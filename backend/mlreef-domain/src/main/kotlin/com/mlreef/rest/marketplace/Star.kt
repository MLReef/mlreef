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
    val projectId: UUID,

    @Id
    val subjectId: UUID

) {
    @Embeddable
    data class StarId(
        @Column(name = "subject_id", updatable = false)
        val subjectId: UUID,

        @Column(name = "project_id", updatable = false)
        val projectId: UUID
    ) : Serializable

    override fun equals(other: Any?): Boolean {
        return if (this === other) {
            return true
        } else if (other is Star) {
            other.projectId == this.projectId && other.subjectId == subjectId
        } else {
            false
        }
    }
}
