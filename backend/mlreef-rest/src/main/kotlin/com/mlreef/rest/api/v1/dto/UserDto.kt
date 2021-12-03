package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.config.censor
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.UserRole
import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.domain.helpers.UserInGroup
import com.mlreef.rest.domain.helpers.UserInProject
import java.time.Instant
import java.util.*

// FIXME: Coverage says: missing tests
data class UserDto(
    override val id: UUID,
    val username: String,
    val name: String,
    val email: String,
    val gitlabId: Long?,
    val userRole: UserRole? = null,
    val termsAcceptedAt: Instant? = null,
    val hasNewsletters: Boolean? = null,
    val external: Boolean = false,
    val externalFrom: String? = null,
    val externalUsername: String? = null,
    val avatarUrl: String? = null,
) : DataClassWithId

fun Account.toUserDto(avatarUrl: String? = null) = UserDto(
    id = this.id,
    username = this.username,
    name = this.name,
    email = this.externalAccount?.email?.takeIf { it.isNotBlank() } ?: this.email,
    gitlabId = this.gitlabId,
    userRole = this.userRole,
    termsAcceptedAt = this.termsAcceptedAt,
    hasNewsletters = this.hasNewsletters,
    external = this.externalAccount != null,
    externalFrom = this.externalAccount?.oauthClient,
    externalUsername = this.externalAccount?.username?.takeIf { it.isNotBlank() },
    avatarUrl = avatarUrl,
)

data class SecretUserDto(
    override val id: UUID,
    val username: String,
    val name: String,
    val email: String,
    val gitlabId: Long?,
    @Deprecated("This shall be removed in favour of the Oauth Token")
    val token: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val userRole: UserRole? = null,
    val termsAcceptedAt: Instant? = null,
    val hasNewsletters: Boolean? = null,
    val external: Boolean = false,
    val externalFrom: String? = null,
    val avatarUrl: String? = null,
) : DataClassWithId {
    fun censor(): SecretUserDto = this.copy(token = token?.censor())
}

fun Account.toSecretUserDto(accessToken: String? = null, refreshToken: String? = null,avatarUrl: String? = null) = SecretUserDto(
    id = this.id,
    username = this.externalAccount?.let { it.username ?: "" } ?: this.username,
    name = this.name,
    email = this.externalAccount?.let { it.email ?: "" } ?: this.email,
    gitlabId = this.gitlabId,
    token = accessToken,
    accessToken = accessToken,
    refreshToken = refreshToken,
    userRole = this.userRole,
    termsAcceptedAt = this.termsAcceptedAt,
    hasNewsletters = this.hasNewsletters,
    external = this.externalAccount != null,
    externalFrom = this.externalAccount?.oauthClient,
    avatarUrl = avatarUrl,
)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class UserInProjectDto(
    override val id: UUID?,
    val userName: String?,
    val email: String?,
    val gitlabId: Long?,
    val accessLevel: AccessLevel?,
    val expiredAt: Instant?
) : DataClassWithId

internal fun UserInProjectDto.toDomain() = UserInProject(
    id = this.id,
    userName = this.userName,
    gitlabId = this.gitlabId,
    email = this.email,
    accessLevel = this.accessLevel,
    expiredAt = this.expiredAt
)

internal fun UserInProject.toDto() = UserInProjectDto(
    id = this.id,
    userName = this.userName,
    gitlabId = this.gitlabId,
    email = this.email,
    accessLevel = this.accessLevel,
    expiredAt = this.expiredAt
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
