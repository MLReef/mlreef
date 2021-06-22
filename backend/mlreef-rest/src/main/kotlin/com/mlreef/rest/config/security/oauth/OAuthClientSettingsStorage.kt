package com.mlreef.rest.config.security.oauth

import org.springframework.beans.factory.annotation.Value
import org.springframework.core.env.Environment
import org.springframework.security.oauth2.core.ClientAuthenticationMethod
import org.springframework.stereotype.Component

interface OAuthClientSettingsStorage {
    fun getOAuthClientSettings(client: String): OAuthClientSettings?
}

const val GITHUB_CLIENT = "github"
const val GOOGLE_CLIENT = "google"
const val FACEBOOK_CLIENT = "facebook"
const val OKTA_CLIENT = "okta"
const val GITLAB_CLIENT = "gitlab"
const val LINKEDIN_CLIENT = "linkedin"
const val TWITTER_CLIENT = "twitter"
const val LIVE_CLIENT = "live" //Microsoft live
const val FREELANCER_CLIENT = "freelancer" //freelancer.com
const val AZURE_CLIENT = "azure" //freelancer.com
const val STACKEXCHANGE_CLIENT = "stackexchange" //https://stackexchange.com/

val oauthClients = listOf(
    GITHUB_CLIENT, GOOGLE_CLIENT, FACEBOOK_CLIENT,
    OKTA_CLIENT, GITLAB_CLIENT, LINKEDIN_CLIENT,
    TWITTER_CLIENT, LIVE_CLIENT, FREELANCER_CLIENT,
    AZURE_CLIENT, STACKEXCHANGE_CLIENT,
)

@Component
class OAuthClientSettingsStorageImpl(
    private val env: Environment,
    @Value("\${mlreef.oauth2.default-impersonate-token-lifetime-sec:600}")
    private val defaultTokenLifetime: Long,
) : OAuthClientSettingsStorage {
    private val CLIENT_PROPERTY_KEY = "social."
    private val oauthClientsMap = mutableMapOf<String, OAuthClientSettings>()

    override fun getOAuthClientSettings(client: String): OAuthClientSettings? {
        val finalClient = client.trim().toLowerCase()
        oauthClientsMap[finalClient]?.let { return it }

        val clientName = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.client-name")
        val clientId = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.client-id")
        val clientSecret = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.client-secret")
        val clientKey = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.client-key")
        val impersonateTokenLifetimeSec = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.impersonate-token-lifetime-sec")?.toLongOrNull()
        val authorizationUri = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.authorization-uri")
        val redirectUriTemplate = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.redirect-uri")
            ?: env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.redirect-uri-template")
        val redirectUrl = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.redirect-url")
        val enabled = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.enabled")?.toBoolean() ?: true
        val scopesList = extractListFromEnvironment(env, "$CLIENT_PROPERTY_KEY$finalClient.scope").takeIf { it.isNotEmpty() }
        val clientAuthenticationMethod = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.client-authentication-method")?.let {
            ClientAuthenticationMethod(it)
        }
        val bearerToken = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.bearer-token")
        val accessToken = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.access-token")
        val accessTokenSecret = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.access-token-secret")
        val test = env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.debug")?.toBoolean() ?: env.getProperty("$CLIENT_PROPERTY_KEY$finalClient.test")?.toBoolean()

        if (clientId.isNullOrBlank() || clientSecret.isNullOrBlank()) return null

        val settings = OAuthClientSettings(
            finalClient,
            clientName,
            clientId,
            clientSecret,
            clientKey,
            impersonateTokenLifetimeSec ?: defaultTokenLifetime,
            enabled,
            authorizationUri,
            scopesList,
            clientAuthenticationMethod,
            redirectUriTemplate,
            redirectUrl,
            accessToken,
            accessTokenSecret,
            bearerToken,
            test ?: false,
        )

        oauthClientsMap.put(finalClient, settings)

        return settings
    }

    private fun extractListFromEnvironment(env: Environment, key: String): List<String> {
        val result = mutableListOf<String>()
        for (i in 0..Int.MAX_VALUE) {
            val item = env.getProperty("${key}[$i]") ?: break
            result.add(item)
        }

        return result
    }
}