package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Group
import com.mlreef.rest.helpers.DataClassWithId
import com.mlreef.rest.helpers.GroupOfUser
import java.util.UUID

data class GroupDto(
    override val id: UUID,
    val name: String
) : DataClassWithId


internal fun Group.toDto(): GroupDto =
    GroupDto(
        id = this.id,
        name = this.name
    )

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class GroupOfUserDto(
    override val id: UUID,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId

internal fun GroupOfUserDto.toDomain() = GroupOfUser(
    id = this.id,
    name = this.name,
    accessLevel = this.accessLevel
)

internal fun GroupOfUser.toDto() = GroupOfUserDto(
    id = this.id,
    name = this.name,
    accessLevel = this.accessLevel
)
