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

// FIXME: Coverage says: missing tests
data class UserDto(
    override val id: UUID,
    val username: String,
    val email: String,
    val gitlabId: Long?
) : DataClassWithId

fun Account.toUserDto() = UserDto(
    id = this.id,
    username = this.username,
    email = this.email,
    gitlabId = this.person.gitlabId
)

data class SecretUserDto(
    override val id: UUID,
    val username: String,
    val email: String,
    val gitlabId: Long?,
    @Deprecated("This shall be removed in favour of the Oauth Token")
    val token: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null
): DataClassWithId {
    fun censor(): SecretUserDto = this.copy(token = token?.censor())
}

fun Account.toSecretUserDto(accessToken: String? = null, refreshToken: String? = null) = SecretUserDto(
    id = this.id,
    username = this.username,
    email = this.email,
    gitlabId = this.person.gitlabId,
    token = this.bestToken?.token,
    accessToken = accessToken,
    refreshToken = refreshToken
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

// FIXME: Coverage says: missing tests
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
