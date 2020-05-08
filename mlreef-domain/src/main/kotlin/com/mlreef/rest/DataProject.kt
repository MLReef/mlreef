package com.mlreef.rest

import com.mlreef.rest.helpers.ProjectOfUser
import com.mlreef.rest.marketplace.SearchableType
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ForeignKey
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

    @Column(name = "gitlab_path_with_namespace")
    override val gitlabPathWithNamespace: String = "$gitlabGroup/$gitlabProject",

    @Column(name = "gitlab_id")
    override val gitlabId: Long,

    @Enumerated(EnumType.STRING)
    override val visibilityScope: VisibilityScope = VisibilityScope.default(),

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(
        name = "data_project_id",
        foreignKey = ForeignKey(name = "experiment_dataproject_data_project_id_fkey"))
    val experiments: List<Experiment> = listOf(),

    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt), MLProject, Searchable {

    fun copy(
        id: UUID? = null,
        url: String? = null,
        slug: String? = null,
        name: String? = null,
        gitlabGroup: String? = null,
        gitlabProject: String? = null,
        gitlabPathWithNamespace: String? = null,
        gitlabId: Long? = null,
        experiments: List<Experiment>? = null,
        version: Long? = null,
        createdAt: ZonedDateTime? = null,
        updatedAt: ZonedDateTime? = null
    ): DataProject {
        return DataProject(
            id = id ?: this.id,
            slug = slug ?: this.slug,
            url = url ?: this.url,
            name = name ?: this.name,
            ownerId = this.ownerId,
            gitlabGroup = gitlabGroup ?: this.gitlabGroup,
            gitlabPathWithNamespace = gitlabPathWithNamespace ?: this.gitlabPathWithNamespace,
            gitlabProject = gitlabProject ?: this.gitlabProject,
            gitlabId = gitlabId ?: this.gitlabId,
            experiments = experiments ?: this.experiments,
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

    override fun toString(): String {
        return "[DataProject: id:$id slug:$slug name:$name ownerId:$ownerId gitlabId:${gitlabId} gitlabPathWithNamespace:$gitlabPathWithNamespace"
    }

    override fun getType(): SearchableType {
        return SearchableType.DATA_PROJECT
    }
}
