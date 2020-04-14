package com.mlreef.rest.external_api.gitlab.dto

data class OAuthToken(
    val accessToken: String,
    val refreshToken: String?,
    val tokenType: String,
    val scope: String,
    val createdAt: Long
)
