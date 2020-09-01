package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Group
import com.mlreef.rest.helpers.DataClassWithId
import com.mlreef.rest.helpers.GroupOfUser
import java.util.UUID

// FIXME: Coverage says: missing tests
@JsonInclude(JsonInclude.Include.NON_NULL)
data class GroupDto(
    override val id: UUID,
    val name: String,
    val gitlabId: Long?,
//    val visibility: GitlabVisibility, //FIXME we need this
) : DataClassWithId


internal fun Group.toDto(): GroupDto =
    GroupDto(
        id = this.id,
        name = this.name,
        gitlabId = this.gitlabId
    )

// FIXME: Coverage says: missing tests
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class GroupOfUserDto(
    override val id: UUID,
    val gitlabId: Long?,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId

internal fun GroupOfUserDto.toDomain() = GroupOfUser(
    id = this.id,
    gitlabId = this.gitlabId,
    name = this.name,
    accessLevel = this.accessLevel
)

internal fun GroupOfUser.toDto() = GroupOfUserDto(
    id = this.id,
    gitlabId = this.gitlabId,
    name = this.name,
    accessLevel = this.accessLevel
)
