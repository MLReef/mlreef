package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.AccessLevel
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProject
import com.mlreef.rest.Experiment
import com.mlreef.rest.MLProject
import com.mlreef.rest.helpers.DataClassWithId
import com.mlreef.rest.helpers.ProjectOfUser
import org.springframework.data.domain.Persistable
import java.util.UUID

abstract class MLProjectDto(
    override val id: UUID?,
    open val slug: String,
    open val url: String,
    open val ownerId: UUID,
    open val gitlabGroup: String,
    open val gitlabProject: String,
    open val gitlabId: Long
) : DataClassWithId

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ProjectOfUserDto(
    override val id: UUID,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId

data class DataProjectDto(
    override val id: UUID,
    override val slug: String,
    override val url: String,
    override val ownerId: UUID,
    override val gitlabGroup: String,
    override val gitlabProject: String,
    override val gitlabId: Long,
    val experiments: List<ExperimentDto> = listOf()
) : MLProjectDto(id, slug, url, ownerId, gitlabGroup, gitlabProject, gitlabId)

data class CodeProjectDto(
    override val id: UUID,
    override val slug: String,
    override val url: String,
    override val ownerId: UUID,
    override val gitlabGroup: String,
    override val gitlabProject: String,
    override val gitlabId: Long
) : MLProjectDto(id, slug, url, ownerId, gitlabGroup, gitlabProject, gitlabId)

internal fun ProjectOfUserDto.toDomain() = ProjectOfUser(
    id = this.id,
    name = this.name,
    accessLevel = this.accessLevel
)

@Suppress("UNCHECKED_CAST")
fun MLProject.toDto(): MLProjectDto {
    val id = (this as? Persistable<UUID>)?.id
    return object : MLProjectDto(
        id,
        this.slug,
        this.url,
        this.ownerId,
        this.gitlabGroup,
        this.gitlabProject,
        this.gitlabId
    ) {}
}

internal fun DataProject.toDto(): DataProjectDto {
    return DataProjectDto(
        id = this.id,
        slug = this.slug,
        url = this.url,
        ownerId = this.ownerId,
        gitlabGroup = this.gitlabGroup,
        gitlabProject = this.gitlabProject,
        gitlabId = this.gitlabId,
        experiments = this.experiments.map(Experiment::toDto)
    )
}

internal fun CodeProject.toDto() =
    CodeProjectDto(
        id = this.id,
        slug = this.slug,
        url = this.url,
        ownerId = this.ownerId,
        gitlabGroup = this.gitlabGroup,
        gitlabProject = this.gitlabProject,
        gitlabId = this.gitlabId
    )
