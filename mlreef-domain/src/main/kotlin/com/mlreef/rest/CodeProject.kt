package com.mlreef.rest

import com.mlreef.rest.helpers.ProjectOfUser
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.JoinColumn
import javax.persistence.OneToOne
import javax.persistence.Table

/**
 * A Code Repository is used for the working Code like Data Operations,
 * Algorithms, or soon Visualisations.
 *
 * A
 */
@Entity
@Table(name = "code_project")
class CodeProject(
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

    @Column(name = "gitlab_path_with_namespace")
    override val gitlabPathWithNamespace: String = "$gitlabGroup/$gitlabProject",

    @Column(name = "gitlab_id")
    override val gitlabId: Long,

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "code_project_id")
    val dataProcessor: DataProcessor? = null,

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null

) : AuditEntity(id, version, createdAt, updatedAt), MLProject {
    fun copy(
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        gitlabGroup: String? = null,
        gitlabPathWithNamespace: String? = null,
        gitlabProject: String? = null,
        gitlabId: Long? = null,
        dataProcessor: DataProcessor? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null
    ): CodeProject {
        return CodeProject(
            id = this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            ownerId = this.ownerId,
            gitlabGroup = gitlabGroup ?: this.gitlabGroup,
            gitlabProject = gitlabProject ?: this.gitlabProject,
            gitlabPathWithNamespace = gitlabPathWithNamespace ?: this.gitlabPathWithNamespace,
            gitlabId = gitlabId ?: this.gitlabId,
            dataProcessor = dataProcessor ?: this.dataProcessor,
            version = version ?: this.version,
            createdAt = createdAt ?: this.createdAt,
            updatedAt = updatedAt ?: this.updatedAt
        )
    }

    fun toProjectOfUser(accessLevel: AccessLevel?) = ProjectOfUser(
        id = this.id,
        name = this.name,
        accessLevel = accessLevel
    )
}
