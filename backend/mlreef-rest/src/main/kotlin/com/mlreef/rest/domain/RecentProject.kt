package com.mlreef.rest.domain

import java.time.Instant
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table(name = "recent_projects")
data class RecentProject(
    @Id
    @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: Account,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    val project: Project,

    val updateDate: Instant,
    val operation: String? = null,
) {
    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is RecentProject -> false
            else -> this.id == other.id
        }
    }

    override fun toString(): String {
        return "RecentProject(id=$id, user=${user.id}, project=${project.id}, lastUpdate='$updateDate')"
    }
}