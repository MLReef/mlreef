package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class OAuthTokenInfo(
    val resourceOwnerId: Long,
    val scopes: List<String>?,
    val expiresInSeconds: Long?,
    val application: GitlabApplication?,
    val createdAt: Long?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitlabApplication(
    val uid: String?
)
