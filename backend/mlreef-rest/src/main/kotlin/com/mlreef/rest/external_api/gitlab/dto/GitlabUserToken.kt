package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable
import java.time.Instant
import java.time.LocalDate

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabUserToken(
    val id: Long,
    val revoked: Boolean,
    val scopes: List<String> = listOf(),
    val token: String? = null,
    val name: String,
    val active: Boolean = false,
    val impersonation: Boolean = false,
    val createdAt: Instant? = null,
    val expiresAt: LocalDate? = null,
) : Serializable
