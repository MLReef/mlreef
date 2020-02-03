package com.mlreef.rest

import java.time.ZonedDateTime
import java.util.*
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.Table

/**
 * A Machine Learning Repository Project describes the association of data and experiments.
 * A repo can also be described with an DataType, for example a MLDataRepository using Images a data set
 */
@Entity
@Table(name = "data_project")
class DataProject(
    id: UUID,
    override val slug: String,
    override val url: String,
    override val name: String,

    @Column(name = "owner_id")
    override val ownerId: UUID,

    @Column(name = "gitlab_group")
    override val gitlabGroup: String,

    @Column(name = "gitlab_project")
    override val gitlabProject: String,

    @Column(name = "gitlab_id")
    override val gitlabId: Int,

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_project_id")
    val experiments: List<Experiment> = listOf(),

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt), MLProject {

    fun copy(
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        gitlabGroup: String? = null,
        gitlabProject: String? = null,
        gitlabId: Int? = null,
        experiments: List<Experiment>? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null
    ): DataProject {
        return DataProject(
            id = this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            ownerId = this.ownerId,
            gitlabGroup = gitlabGroup ?: this.gitlabGroup,
            gitlabProject = gitlabProject ?: this.gitlabProject,
            gitlabId = gitlabId ?: this.gitlabId,
            experiments = this.experiments,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt
        )
    }
}
