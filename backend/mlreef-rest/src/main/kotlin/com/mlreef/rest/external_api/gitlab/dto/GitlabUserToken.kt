package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabUserToken(
    val id: Int,
    val revoked: Boolean,
    val scopes: List<String> = listOf(),
    val token: String? = null,
    val name: String,
    val active: Boolean = false,
    val impersonation: Boolean = false,
    val createdAt: String? = "",
    val expiresAt: String? = ""
) : Serializable
