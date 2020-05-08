package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.config.censor
import com.mlreef.rest.helpers.DataClassWithId
import com.mlreef.rest.helpers.UserInGroup
import com.mlreef.rest.helpers.UserInProject
import java.util.UUID

data class UserDto(
    override val id: UUID,
    val username: String,
    val email: String,
    val token: String?,
    val accessToken: String?,
    val refreshToken: String?
) : DataClassWithId {
    fun censor(): UserDto {
        return this.copy(token = token?.censor())
    }
}

fun Account.toUserDto(accessToken: String? = null, refreshToken: String? = null) = UserDto(
    this.id,
    this.username,
    this.email,
    this.bestToken?.token,
    accessToken,
    refreshToken
)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class UserInProjectDto(
    override val id: UUID?,
    val userName: String?,
    val email: String?,
    val gitlabId: Long?
) : DataClassWithId

internal fun UserInProjectDto.toDomain() = UserInProject(
    id = this.id,
    userName = this.userName,
    gitlabId = this.gitlabId,
    email = this.email
)

internal fun UserInProject.toDto() = UserInProjectDto(
    id = this.id,
    userName = this.userName,
    gitlabId = this.gitlabId,
    email = this.email
)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class UserInGroupDto(
    override val id: UUID,
    val userName: String?,
    val email: String?,
    val gitlabId: Long?,
    val accessLevel: AccessLevel?
) : DataClassWithId

internal fun UserInGroupDto.toDomain() = UserInGroup(
    id = this.id,
    userName = this.userName,
    email = this.email,
    gitlabId = this.gitlabId,
    accessLevel = this.accessLevel
)

internal fun UserInGroup.toDto() = UserInGroupDto(
    id = this.id,
    userName = this.userName,
    email = this.email,
    gitlabId = this.gitlabId,
    accessLevel = this.accessLevel
)