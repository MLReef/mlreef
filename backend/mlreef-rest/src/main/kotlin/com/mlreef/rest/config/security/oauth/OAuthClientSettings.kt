package com.mlreef.rest.config.security.oauth

import org.springframework.security.oauth2.core.ClientAuthenticationMethod

data class OAuthClientSettings(
    val name: String,
    val clientName:String?,
    val clientId: String,
    val clientSecret: String,
    val clientKey: String? = null,
    val impersonateTokenLifetimeSec: Long,
    val enabled: Boolean = true,
    val authorizationUri: String? = null,
    val scope: List<String>? = null,
    val clientAuthenticationMethod: ClientAuthenticationMethod? = null,
    val redirectUriTemplate:String? = null,
    val redirectUrl:String? = null,
    val accessToken:String? = null,
    val accessTokenSecret:String? = null,
    val bearerToken:String? = null,
    val test: Boolean = false,
)
