package com.mlreef.rest.external_api.gitlab

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import org.springframework.context.annotation.Scope
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@Scope("session")
class GitlabUser(
    val id: Int,
    val username: String = "",
    val name: String = "",
    val email: String = "",
    val publicEmail: String = "",
    val state: String = "") : Serializable

// https://docs.gitlab.com/ee/api/users.html#user-creation
internal class GitlabCreateUserRequest(
    val email: String,
    val username: String,
    val name: String,
    val password: String,
    val reset_password: Boolean = false
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#get-all-impersonation-tokens-of-a-user
internal class GitlabGetUserTokensRequest(
    val user_id: Int,
    val state: String = "all"
) : Serializable

// https://docs.gitlab.com/ee/api/users.html#create-an-impersonation-token
internal class GitlabCreateUserTokenRequest(
    val name: String = "mlreef-token",
    val scopes: List<String> = listOf("api", "read_user"),
    val expires_at: String? = null
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabUserToken(
    val id: Int,
    val revoked: Boolean,
    val scopes: List<String> = listOf(),
    val token: String,
    val name: String,
    val active: Boolean = false,
    val impersonation: Boolean = false,
    val created_at: String? = "",
    val expires_at: String? = ""
) : Serializable
