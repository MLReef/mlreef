package com.mlreef.rest.feature.auth

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.github.scribejava.apis.*
import com.github.scribejava.core.builder.ServiceBuilder
import com.github.scribejava.core.builder.api.DefaultApi10a
import com.github.scribejava.core.builder.api.DefaultApi20
import com.github.scribejava.core.model.*
import com.github.scribejava.core.oauth.AccessTokenRequestParams
import com.github.scribejava.core.oauth.OAuth10aService
import com.github.scribejava.core.oauth.OAuth20Service
import com.github.scribejava.core.oauth.OAuthService
import com.mlreef.rest.OAuthConfiguration
import com.mlreef.rest.config.security.oauth.*
import com.mlreef.rest.domain.AccountExternal
import com.mlreef.rest.domain.AccountToken
import com.mlreef.rest.exceptions.AuthenticationException
import com.mlreef.rest.exceptions.FeatureNotSupported
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_PROFILE_EMAIL_KEY_1
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_PROFILE_EMAIL_KEY_2
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_PROFILE_FIRSTNAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_PROFILE_LASTNAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.AZURE_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_PROFILE_AVATAR_KEY_1
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_PROFILE_AVATAR_KEY_2
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_PROFILE_AVATAR_KEY_3
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_PROFILE_EMAIL_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FACEBOOK_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_PROFILE_AVATAR_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_PROFILE_EMAIL_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_PROFILE_ROOT_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_PROFILE_USERNAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.FREELANCER_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_PROFILE_AVATAR_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_PROFILE_EMAIL_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_PROFILE_REPOS_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_PROFILE_USERNAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITHUB_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_PROFILE_AVATAR_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_PROFILE_EMAIL_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_PROFILE_REPOS_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_PROFILE_USERNAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GITLAB_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GOOGLE_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GOOGLE_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GOOGLE_PROFILE_AVATAR_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GOOGLE_PROFILE_EMAIL_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GOOGLE_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GOOGLE_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.GOOGLE_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PREFERRED_LOCALE
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_AVATAR_KEY_1
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_AVATAR_KEY_2
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_EMAIL_KEY_1
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_EMAIL_KEY_2
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_EMAIL_KEY_3
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_FIRST_NAME_KEY_1
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_FIRST_NAME_KEY_2
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_LAST_NAME_KEY_1
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_LAST_NAME_KEY_2
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_LOCALIZED_FIRST_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_PROFILE_LOCALIZED_LAST_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LINKEDIN_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_PROFILE_EMAIL_KEY_1
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_PROFILE_EMAIL_KEY_2
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_PROFILE_EMAIL_KEY_3
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.LIVE_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_CODE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_ERROR_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_PROFILE_ACCOUNT_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_PROFILE_AVATAR_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_PROFILE_EMAIL_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_PROFILE_ROOT_KEY
import com.mlreef.rest.feature.auth.TokenKeys.STACKEXCHANGE_STATE_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.TWITTER_OAUTH_TOKEN_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.TWITTER_OAUTH_VERIFIER_PARAM_KEY
import com.mlreef.rest.feature.auth.TokenKeys.TWITTER_PROFILE_AVATAR_KEY
import com.mlreef.rest.feature.auth.TokenKeys.TWITTER_PROFILE_EMAIL_KEY
import com.mlreef.rest.feature.auth.TokenKeys.TWITTER_PROFILE_ID_KEY
import com.mlreef.rest.feature.auth.TokenKeys.TWITTER_PROFILE_NAME_KEY
import com.mlreef.rest.feature.auth.TokenKeys.TWITTER_PROFILE_USERNAME_KEY
import com.mlreef.rest.feature.auth.helpers.FreelancerApi20
import com.mlreef.rest.feature.auth.helpers.GitLabApi
import com.mlreef.rest.feature.caches.SocialAuthCache
import com.mlreef.rest.utils.RandomUtils
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.*
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * https://github.com/scribejava/scribejava
 */

@Service
class SocialService(
    private val oAuthClientSettingsStorage: OAuthClientSettingsStorage,
    private val oAuthConfiguration: OAuthConfiguration,
    private val authService: AuthService,
    private val userResolverService: UserResolverService,
    private val objectMapper: ObjectMapper,
    private val socialAuthCache: SocialAuthCache,
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)

        private const val STATE_LENGTH = 30

        private const val REDIRECT_URL = "/api/v1/social/login/"

        private const val TWITTER_PROFILE_URL = "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true&include_entities=false"
        private const val FACEBOOK_PROFILE_URL = "https://graph.facebook.com/v3.2/me?fields=id,name,email,picture.type(large)"
        private const val GITHUB_PROFILE_URL = "https://api.github.com/user"
        private const val GOOGLE_PROFILE_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
        private const val GITLAB_PROFILE_URL = "https://gitlab.com/oauth/userinfo"
        private const val MICROSOFT_LIVE_PROFILE_URL = "https://apis.live.net/v5.0/me";
        private const val FREELANCER_PROFILE_URL = "https://www.freelancer.com/api/users/0.1/self"
        private const val FREELANCER_TEST_PROFILE_URL = "https://www.freelancer-sandbox.com/api/users/0.1/self"
        private const val AZURE_PROFILE_URL = "https://graph.microsoft.com/v1.0/me"
        private const val STACKEXCHANGE_PROFILE_URL = "https://api.stackexchange.com/2.2/me";

        private const val LINKEDIN_PROFILE_URL = "https://api.linkedin.com/v2/me"
        private const val LINKEDIN_EMAIL_URL = "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))"

        private const val DEFAULT_PAGE_TO_REDIRECT_ON_SUCCESS = "/dashboard"
        private const val DEFAULT_PAGE_TO_REDIRECT_ON_FAILURE = "/login"
    }

    fun getAuthenticationRedirectPath(clientId: String, request: HttpServletRequest, response: HttpServletResponse): String {
        return when (clientId.trim().toLowerCase()) {
            GITHUB_CLIENT -> processGithubAuthorization(request)
            GOOGLE_CLIENT -> processGoogleAuthorization(request)
            TWITTER_CLIENT -> processTwitterAuthorization(request)
            FACEBOOK_CLIENT -> processFacebookAuthorization(request)
            LINKEDIN_CLIENT -> processLinkedInAuthorization(request)
            GITLAB_CLIENT -> processGitlabAuthorization(request)
            LIVE_CLIENT -> processMicrosoftLiveAuthorization(request)
            FREELANCER_CLIENT -> processFreelancerAuthorization(request)
            AZURE_CLIENT -> processMicrosoftAzureAuthorization(request)
            STACKEXCHANGE_CLIENT -> processStackExchangeAuthorization(request)
            else -> throw FeatureNotSupported("OAuth client $clientId is not implemented")
        }
    }

    fun getAfterLoginRedirectPath(clientId: String, request: HttpServletRequest, response: HttpServletResponse): Pair<String, AccountToken?> {
        return when (clientId.trim().toLowerCase()) {
            GITHUB_CLIENT -> processGithubLogin(request)
            GOOGLE_CLIENT -> processGoogleLogin(request)
            TWITTER_CLIENT -> processTwitterLogin(request)
            FACEBOOK_CLIENT -> processFacebookLogin(request)
            LINKEDIN_CLIENT -> processLinkedInLogin(request)
            GITLAB_CLIENT -> processGitlabLogin(request)
            LIVE_CLIENT -> processMicrosoftLiveLogin(request)
            FREELANCER_CLIENT -> processFreelancerLogin(request)
            AZURE_CLIENT -> processMicrosoftAzureLogin(request)
            STACKEXCHANGE_CLIENT -> processStackExchangeLogin(request)
            else -> throw FeatureNotSupported("OAuth client $clientId is not implemented")
        }
    }

    private fun processGithubAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, GITHUB_CLIENT) as OAuth20Service)
            .getAuthorizationUrl(generateStateCode())
    }

    private fun processGoogleAuthorization(request: HttpServletRequest): String {
        val service = getServiceForClient(request, GOOGLE_CLIENT) as OAuth20Service
        val additionalParams: MutableMap<String, String> = HashMap()
        additionalParams["access_type"] = "offline"
        additionalParams["prompt"] = "consent"

        return service.createAuthorizationUrlBuilder()
            .state(generateStateCode())
            .additionalParams(additionalParams)
            .build()
    }

    private fun processTwitterAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, TWITTER_CLIENT) as OAuth10aService).let {
            it.getAuthorizationUrl(it.requestToken)
        }
    }

    private fun processFacebookAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, FACEBOOK_CLIENT) as OAuth20Service)
            .getAuthorizationUrl(generateStateCode())
    }

    private fun processLinkedInAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, LINKEDIN_CLIENT) as OAuth20Service)
            .getAuthorizationUrl(generateStateCode())
    }

    private fun processGitlabAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, GITLAB_CLIENT) as OAuth20Service)
            .getAuthorizationUrl(generateStateCode())
    }

    private fun processMicrosoftLiveAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, LIVE_CLIENT) as OAuth20Service)
            .getAuthorizationUrl(generateStateCode())
    }

    private fun processFreelancerAuthorization(request: HttpServletRequest): String {
        val service = getServiceForClient(request, FREELANCER_CLIENT) as OAuth20Service
        val additionalParams: MutableMap<String, String> = HashMap()
        additionalParams["advanced_scopes"] = "fln:user_information"

        return service.createAuthorizationUrlBuilder()
            .state(generateStateCode())
            .additionalParams(additionalParams)
            .build()
    }

    private fun processMicrosoftAzureAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, AZURE_CLIENT) as OAuth20Service)
            .getAuthorizationUrl(generateStateCode())
    }

    private fun processStackExchangeAuthorization(request: HttpServletRequest): String {
        return (getServiceForClient(request, STACKEXCHANGE_CLIENT) as OAuth20Service)
            .getAuthorizationUrl(generateStateCode())
    }


    private fun processGithubLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("Github login")
        val clientId = GITHUB_CLIENT

        return try {
            val state = request.parameterMap[GITHUB_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[GITHUB_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[GITHUB_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val accessToken: OAuth2AccessToken = service.getAccessToken(code)

            val req = OAuthRequest(Verb.GET, GITHUB_PROFILE_URL)

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val token = getImpersonateToken(
                clientId,
                profileBody.getOrNull(GITHUB_PROFILE_ID_KEY)?.asText(),
                profileBody.getOrNull(GITHUB_PROFILE_EMAIL_KEY)?.asText(),
                profileBody.getOrNull(GITHUB_PROFILE_NAME_KEY)?.asText(),
                profileBody.getOrNull(GITHUB_PROFILE_USERNAME_KEY)?.asText(),
                profileBody.getOrNull(GITHUB_PROFILE_REPOS_KEY)?.asText(),
                profileBody.getOrNull(GITHUB_PROFILE_AVATAR_KEY)?.asText(),
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            )?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Github login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processGoogleLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("Google login")
        val clientId = GOOGLE_CLIENT

        return try {
            val state = request.parameterMap[GOOGLE_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[GOOGLE_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[GOOGLE_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val accessToken = service.getAccessToken(code).apply {
                service.refreshAccessToken(this.refreshToken)
            }

            val req = OAuthRequest(Verb.GET, GOOGLE_PROFILE_URL)

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val token = getImpersonateToken(
                clientId,
                profileBody.getOrNull(GOOGLE_PROFILE_ID_KEY)?.asText(),
                profileBody.getOrNull(GOOGLE_PROFILE_EMAIL_KEY)?.asText(),
                profileBody.getOrNull(GOOGLE_PROFILE_NAME_KEY)?.asText(),
                null,
                null,
                profileBody.getOrNull(GOOGLE_PROFILE_AVATAR_KEY)?.asText(),
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            )?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Google login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processTwitterLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        val clientId = TWITTER_CLIENT
        log.debug("Twitter login")
        return try {
            val oauthToken = request.parameterMap[TWITTER_OAUTH_TOKEN_PARAM_KEY]?.get(0)
            val oauthVerifier = request.parameterMap[TWITTER_OAUTH_VERIFIER_PARAM_KEY]?.get(0)

            val service = getServiceForClient(request, clientId) as OAuth10aService

            val accessToken: OAuth1AccessToken = service.getAccessToken(OAuth1RequestToken(oauthToken, ""), oauthVerifier)

            val req = OAuthRequest(Verb.GET, TWITTER_PROFILE_URL)

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val token = getImpersonateToken(
                clientId,
                profileBody[TWITTER_PROFILE_ID_KEY].asText(),
                profileBody[TWITTER_PROFILE_EMAIL_KEY].asText(),
                profileBody[TWITTER_PROFILE_NAME_KEY].asText(),
                profileBody[TWITTER_PROFILE_USERNAME_KEY].asText(),
                null,
                profileBody[TWITTER_PROFILE_AVATAR_KEY].asText(),
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            )?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Twitter login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processFacebookLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("Facebook login")
        val clientId = FACEBOOK_CLIENT

        return try {
            val state = request.parameterMap[FACEBOOK_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[FACEBOOK_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[FACEBOOK_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val accessToken: OAuth2AccessToken = service.getAccessToken(code)

            val req = OAuthRequest(Verb.GET, FACEBOOK_PROFILE_URL)

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val token = getImpersonateToken(
                clientId,
                profileBody.getOrNull(FACEBOOK_PROFILE_ID_KEY)?.asText(),
                profileBody.getOrNull(FACEBOOK_PROFILE_EMAIL_KEY)?.asText(),
                profileBody.getOrNull(FACEBOOK_PROFILE_NAME_KEY)?.asText(),
                null,
                null,
                profileBody.getOrNull(FACEBOOK_PROFILE_AVATAR_KEY_1)
                    ?.getOrNull(FACEBOOK_PROFILE_AVATAR_KEY_2)
                    ?.getOrNull(FACEBOOK_PROFILE_AVATAR_KEY_3)
                    ?.asText(),
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            )?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Facebook login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processLinkedInLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("LinkedIn login")
        val clientId = LINKEDIN_CLIENT

        return try {
            val state = request.parameterMap[LINKEDIN_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[LINKEDIN_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[LINKEDIN_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val accessToken: OAuth2AccessToken = service.getAccessToken(code)

            val profileRequest = OAuthRequest(Verb.GET, LINKEDIN_PROFILE_URL)
            profileRequest.addHeader("x-li-format", "json")
            profileRequest.addHeader("Accept-Language", "ru-RU")

            service.signRequest(accessToken, profileRequest)

            val profileBody = service.execute(profileRequest).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val emailRequest = OAuthRequest(Verb.GET, LINKEDIN_EMAIL_URL)
            emailRequest.addHeader("x-li-format", "json")
            emailRequest.addHeader("Accept-Language", "ru-RU")

            service.signRequest(accessToken, emailRequest)

            val emailBody = service.execute(emailRequest).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val firstName = try {
                profileBody.getOrNull(LINKEDIN_PROFILE_FIRST_NAME_KEY_1)?.getOrNull(LINKEDIN_PROFILE_FIRST_NAME_KEY_2)?.getOrNull(LINKEDIN_PREFERRED_LOCALE)
                    ?: profileBody.getOrNull(LINKEDIN_PROFILE_LOCALIZED_FIRST_NAME_KEY)
            } catch (ex: Exception) {
                log.error("Cannot extract first name from LinkedIn token")
                null
            }?.asText()

            val lastName = try {
                profileBody.getOrNull(LINKEDIN_PROFILE_LAST_NAME_KEY_1)?.getOrNull(LINKEDIN_PROFILE_LAST_NAME_KEY_2)?.getOrNull(LINKEDIN_PREFERRED_LOCALE)
                    ?: profileBody.getOrNull(LINKEDIN_PROFILE_LOCALIZED_LAST_NAME_KEY)
            } catch (ex: Exception) {
                log.error("Cannot extract last name from LinkedIn token")
                null
            }?.asText()

            val email = try {
                emailBody
                    .getOrNull(LINKEDIN_PROFILE_EMAIL_KEY_1)
                    ?.getOrNull(0)
                    ?.getOrNull(LINKEDIN_PROFILE_EMAIL_KEY_2)
                    ?.getOrNull(LINKEDIN_PROFILE_EMAIL_KEY_3)
                    ?.asText()
            } catch (ex: Exception) {
                log.error("Cannot extract email from LinkedIn token")
                null
            }
            val profileImage = try {
                profileBody
                    .getOrNull(LINKEDIN_PROFILE_AVATAR_KEY_1)
                    ?.getOrNull(LINKEDIN_PROFILE_AVATAR_KEY_2)
                    ?.asText()
            } catch (ex: Exception) {
                log.error("Cannot extract image path from LinkedIn token")
                null
            }

            val token = getImpersonateToken(
                clientId,
                profileBody.getOrNull(LINKEDIN_PROFILE_ID_KEY)?.asText(),
                email,
                "${firstName ?: ""} ${lastName ?: ""}".trim(),
                null,
                null,
                profileImage,
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            )?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform LinkedIn login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processGitlabLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("Gitlab login")
        val clientId = GITLAB_CLIENT

        return try {
            val state = request.parameterMap[GITLAB_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[GITLAB_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[GITLAB_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val accessToken: OAuth2AccessToken = service.getAccessToken(code)

            val req = OAuthRequest(Verb.GET, GITLAB_PROFILE_URL)

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val token = getImpersonateToken(
                clientId,
                profileBody.getOrNull(GITLAB_PROFILE_ID_KEY)?.asText(),
                profileBody.getOrNull(GITLAB_PROFILE_EMAIL_KEY)?.asText(),
                profileBody.getOrNull(GITLAB_PROFILE_NAME_KEY)?.asText(),
                profileBody.getOrNull(GITLAB_PROFILE_USERNAME_KEY)?.asText(),
                profileBody.getOrNull(GITLAB_PROFILE_REPOS_KEY)?.asText(),
                profileBody.getOrNull(GITLAB_PROFILE_AVATAR_KEY)?.asText(),
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            )?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Gitlab login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processMicrosoftLiveLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("Microsoft Live login")
        val clientId = LIVE_CLIENT

        return try {
            val state = request.parameterMap[LIVE_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[LIVE_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[LIVE_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in Microsoft Live. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val accessToken: OAuth2AccessToken = service.getAccessToken(code)

            val req = OAuthRequest(Verb.GET, MICROSOFT_LIVE_PROFILE_URL)

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val email = try {
                profileBody.getOrNull(LIVE_PROFILE_EMAIL_KEY_1)?.getOrNull(LIVE_PROFILE_EMAIL_KEY_2)
                    ?: profileBody.getOrNull(LIVE_PROFILE_EMAIL_KEY_1)?.getOrNull(LIVE_PROFILE_EMAIL_KEY_3)
            } catch (ex: Exception) {
                log.error("Cannot extract email from Microsoft Live token")
                null
            }?.asText()

            val token = getImpersonateToken(
                clientId,
                profileBody.getOrNull(LIVE_PROFILE_ID_KEY)?.asText(),
                email,
                profileBody.getOrNull(LIVE_PROFILE_NAME_KEY)?.asText(),
                null,
                null,
                null,
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            )?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Microsoft Live login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processFreelancerLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("Freelancer login")
        val clientId = FREELANCER_CLIENT

        return try {
            val state = request.parameterMap[FREELANCER_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[FREELANCER_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[FREELANCER_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service
            val settings = oAuthClientSettingsStorage.getOAuthClientSettings(clientId) ?: throw FeatureNotSupported("Settings for client $clientId not found")

            val requestTokenParams = AccessTokenRequestParams(code).apply {
                this.extraParameters = mapOf(
                    "client_id" to settings.clientId,
                    "client_secret" to settings.clientSecret,
                )
            }

            val accessToken: OAuth2AccessToken = service.getAccessToken(requestTokenParams)

            val req = OAuthRequest(Verb.GET, if (settings.test) FREELANCER_TEST_PROFILE_URL else FREELANCER_PROFILE_URL)

            service.signRequest(accessToken, req)
            req.addHeader("freelancer-oauth-v1", accessToken.accessToken)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val token = profileBody.getOrNull(FREELANCER_PROFILE_ROOT_KEY)?.let {
                getImpersonateToken(
                    clientId,
                    it.getOrNull(FREELANCER_PROFILE_ID_KEY)?.asText(),
                    it.getOrNull(FREELANCER_PROFILE_EMAIL_KEY)?.asText(),
                    it.getOrNull(FREELANCER_PROFILE_NAME_KEY)?.asText(),
                    it.getOrNull(FREELANCER_PROFILE_USERNAME_KEY)?.asText(),
                    null,
                    it.getOrNull(FREELANCER_PROFILE_AVATAR_KEY)?.asText(),
                    accessToken.localAccessToken(),
                    accessToken.localRefreshToken(),
                ) ?: throw AuthenticationException("Cannot login user for client $clientId")
            } ?: throw AuthenticationException("Cannot login user for client $clientId. Incorrect json received")


            getSuccessRedirection() to token
        } catch (ex: Exception) {
            ex.printStackTrace()
            log.error("Cannot perform Freelancer login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processMicrosoftAzureLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("Microsoft Azure login")
        val clientId = AZURE_CLIENT

        return try {
            val state = request.parameterMap[AZURE_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[AZURE_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[AZURE_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val accessToken: OAuth2AccessToken = service.getAccessToken(code)

            val req = OAuthRequest(Verb.GET, AZURE_PROFILE_URL)

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val email = profileBody.getOrNull(AZURE_PROFILE_EMAIL_KEY_1)?.asText()
                ?: profileBody.getOrNull(AZURE_PROFILE_EMAIL_KEY_2)?.asText()?.takeIf { it.contains("@") }

            val name = profileBody.getOrNull(AZURE_PROFILE_NAME_KEY)?.asText()
                ?: "${profileBody.getOrNull(AZURE_PROFILE_FIRSTNAME_KEY)?.asText()} ${profileBody.getOrNull(AZURE_PROFILE_LASTNAME_KEY)?.asText()}".trim()

            val token = getImpersonateToken(
                clientId,
                profileBody.getOrNull(AZURE_PROFILE_ID_KEY)?.asText(),
                email,
                name,
                profileBody.getOrNull(AZURE_PROFILE_EMAIL_KEY_2)?.asText()?.takeIf { !it.contains("@") },
                null,
                null,
                accessToken.localAccessToken(),
                accessToken.localRefreshToken(),
            ) ?: throw AuthenticationException("Cannot login user for client $clientId")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Microsoft Azure login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun processStackExchangeLogin(request: HttpServletRequest): Pair<String, AccountToken?> {
        log.debug("StackExchange login")
        val clientId = STACKEXCHANGE_CLIENT

        return try {
            val state = request.parameterMap[STACKEXCHANGE_STATE_PARAM_KEY]?.get(0)
            val code = request.parameterMap[STACKEXCHANGE_CODE_PARAM_KEY]?.get(0)
            val error = request.parameterMap[STACKEXCHANGE_ERROR_PARAM_KEY]?.get(0)

            error?.let {
                throw AuthenticationException("Cannot authentication user in $clientId. $error")
            }

            assertStateCode(state)

            val service = getServiceForClient(request, clientId) as OAuth20Service

            val settings = oAuthClientSettingsStorage.getOAuthClientSettings(clientId) ?: throw FeatureNotSupported("Settings for client $clientId not found")

            val requestTokenParams = AccessTokenRequestParams(code).apply {
                this.extraParameters = mapOf(
                    "client_id" to settings.clientId,
                    "client_secret" to settings.clientSecret,
                )
            }

            val accessToken: OAuth2AccessToken = service.getAccessToken(requestTokenParams)

            val req = OAuthRequest(Verb.GET, "$STACKEXCHANGE_PROFILE_URL?site=stackoverflow&key=${settings.clientKey}")

            service.signRequest(accessToken, req)

            val profileBody = service.execute(req).use { resp ->
                log.debug(resp.code.toString())
                log.debug(resp.body)
                objectMapper.readTree(resp.body)
            }

            val token = profileBody.getOrNull(STACKEXCHANGE_PROFILE_ROOT_KEY)?.getOrNull(0)?.let {
                getImpersonateToken(
                    clientId,
                    it.getOrNull(STACKEXCHANGE_PROFILE_ACCOUNT_ID_KEY)?.asText(),
                    it.getOrNull(STACKEXCHANGE_PROFILE_EMAIL_KEY)?.asText(), // currently no email is returned
                    it.getOrNull(STACKEXCHANGE_PROFILE_NAME_KEY)?.asText(),
                    null,
                    null,
                    it.getOrNull(STACKEXCHANGE_PROFILE_AVATAR_KEY)?.asText(),
                    accessToken.localAccessToken(),
                    accessToken.localRefreshToken(),
                ) ?: throw AuthenticationException("Cannot login user for client $clientId")
            } ?: throw AuthenticationException("Cannot login user for client $clientId. Incorrect json received")

            getSuccessRedirection() to token
        } catch (ex: Exception) {
            log.error("Cannot perform Stack exchange login: $ex")
            getFailureRedirection() to null
        }
    }

    private fun getServiceForClient(request: HttpServletRequest, clientId: String): OAuthService? {
        return oAuthClientSettingsStorage.getOAuthClientSettings(clientId)?.let {
            val api = getApiForClient(clientId, it.test)
            ServiceBuilder(it.clientId)
                .apiSecret(it.clientSecret)
                .callback(getRedirectUrlForClient(request, clientId))
                .apply {
                    it.scope?.joinToString(" ")?.let { this.withScope(it) }
                }
                .let {
                    when (api) {
                        is DefaultApi10a -> it.build(api)
                        is DefaultApi20 -> it.build(api)
                        else -> throw InternalException("Unknown oauth api version")
                    }
                }
        }
    }

    private fun getApiForClient(clientId: String, test: Boolean = false): Any {
        return when (clientId) {
            GITHUB_CLIENT -> GitHubApi.instance()
            GOOGLE_CLIENT -> GoogleApi20.instance()
            FACEBOOK_CLIENT -> FacebookApi.instance()
            TWITTER_CLIENT -> TwitterApi.instance()
            LINKEDIN_CLIENT -> LinkedInApi20.instance()
            GITLAB_CLIENT -> GitLabApi.instance()
            LIVE_CLIENT -> LiveApi.instance()
            FREELANCER_CLIENT -> if (test) FreelancerApi20.Sandbox.instance() else FreelancerApi20.instance()
            AZURE_CLIENT -> MicrosoftAzureActiveDirectory20Api.instance()
            STACKEXCHANGE_CLIENT -> StackExchangeApi.instance()
            else -> throw FeatureNotSupported("OAuth client $clientId is not implemented")
        }
    }

    private fun getImpersonateToken(
        clientId: String,
        externalId: String?,
        email: String?,
        name: String?,
        username: String?,
        reposUrl: String?,
        avatarUrl: String?,
        accessToken: Pair<String, Instant?>,
        refreshToken: Pair<String?, Instant?>,
    ): AccountToken? {
        return externalId
            ?.let { userResolverService.resolveExternalAccount(clientId, externalId = it) }
            ?.let { loginExternalUser(it.id, accessToken.first, accessToken.second, refreshToken.first, refreshToken.second) }
            ?: registerExternalUser(clientId, username, email, name, externalId, reposUrl, avatarUrl)?.let {
                loginExternalUser(it.id, accessToken.first, accessToken.second, refreshToken.first, refreshToken.second)
            }
    }

    private fun loginExternalUser(
        userId: UUID,
        accessToken: String?,
        accessTokenExpiration: Instant?,
        refreshToken: String?,
        refreshTokenExpiration: Instant?,
    ): AccountToken? {
        return try {
            authService.loginOAuthUser(userId, accessToken, accessTokenExpiration, refreshToken, refreshTokenExpiration)
        } catch (ex: Exception) {
            log.error("Cannot login external user: Exception: $ex")
            null
        }
    }

    private fun registerExternalUser(
        oAuthClient: String,
        username: String?,
        email: String?,
        name: String?,
        externalId: String?,
        reposUrl: String?,
        avatarUrl: String?,
    ): AccountExternal? {
        return try {
            authService.registerOAuthUser(oAuthClient, username, email, name, externalId, reposUrl, avatarUrl)
        } catch (ex: Exception) {
            log.error("Cannot register external user for $oAuthClient: Exception: $ex")
            null
        }
    }

    private fun generateStateCode(): String {
        return RandomUtils.generateRandomAlphaNumeric(STATE_LENGTH).apply {
            socialAuthCache.putCode(this)
        }
    }

    private fun assertStateCode(state: String?) {
        socialAuthCache.getCode(state ?: throw AuthenticationException("Incorrect response. State was not provided"))?.let {
            socialAuthCache.evictCode(state)
            state
        } ?: throw AuthenticationException("Incorrect response. State was not found or outdated")
    }

    private fun getRedirectUrlForClient(request: HttpServletRequest, clientId: String): String {
        return "${getDomainFromRequest(request)}$REDIRECT_URL$clientId"
    }

    private fun getDomainFromRequest(request: HttpServletRequest): String {
        val finalProtocol = oAuthConfiguration.overwriteRedirectProtocol?.takeIf { it.isNotBlank() } ?: request.scheme
        val finalDomain = oAuthConfiguration.overwriteRedirectDomain?.takeIf { it.isNotBlank() } ?: request.serverName
        return "$finalProtocol://$finalDomain${getPortString(request)}"
    }

    private fun getPortString(request: HttpServletRequest): String {
        val finalPort = oAuthConfiguration.overwriteRedirectPort?.takeIf { it > 0 } ?: request.serverPort
        return if (finalPort !in listOf(80, 443)) ":$finalPort" else ""
    }

    private fun getSuccessRedirection() = if (oAuthConfiguration.redirectOnSuccess.isNullOrBlank()) DEFAULT_PAGE_TO_REDIRECT_ON_SUCCESS else oAuthConfiguration.redirectOnSuccess!!
    private fun getFailureRedirection() = if (oAuthConfiguration.redirectOnFailure.isNullOrBlank()) DEFAULT_PAGE_TO_REDIRECT_ON_FAILURE else oAuthConfiguration.redirectOnFailure!!

    private fun JsonNode.getOrNull(fieldName: String): JsonNode? {
        return try {
            this[fieldName]?.takeIf { !it.asText().equals("null", true) }
        } catch (npe: NullPointerException) {
            null
        }
    }

    private fun JsonNode.getOrNull(index: Int): JsonNode? {
        return try {
            this.get(index)
        } catch (npe: NullPointerException) {
            null
        }
    }

    private fun OAuth2AccessToken.localAccessToken(): Pair<String, Instant?> {
        return this.accessToken to this.expiresIn?.let { Instant.now().plusSeconds(it.toLong()) }
    }

    private fun OAuth2AccessToken.localRefreshToken(): Pair<String?, Instant?> {
        return this.refreshToken to null
    }

    private fun OAuth1AccessToken.localAccessToken(): Pair<String, Instant?> {
        return this.token to null
    }

    private fun OAuth1AccessToken.localRefreshToken(): Pair<String?, Instant?> {
        return null to null
    }
}

object TokenKeys {
    const val GITHUB_STATE_PARAM_KEY = "state"
    const val GITHUB_CODE_PARAM_KEY = "code"
    const val GITHUB_ERROR_PARAM_KEY = "error_description"

    const val GOOGLE_STATE_PARAM_KEY = "state"
    const val GOOGLE_CODE_PARAM_KEY = "code"
    const val GOOGLE_ERROR_PARAM_KEY = "error_description"

    const val TWITTER_OAUTH_TOKEN_PARAM_KEY = "oauth_token"
    const val TWITTER_OAUTH_VERIFIER_PARAM_KEY = "oauth_verifier"

    const val FACEBOOK_STATE_PARAM_KEY = "state"
    const val FACEBOOK_CODE_PARAM_KEY = "code"
    const val FACEBOOK_ERROR_PARAM_KEY = "error_description"

    const val LINKEDIN_STATE_PARAM_KEY = "state"
    const val LINKEDIN_CODE_PARAM_KEY = "code"
    const val LINKEDIN_ERROR_PARAM_KEY = "error_description"

    const val GITLAB_STATE_PARAM_KEY = "state"
    const val GITLAB_CODE_PARAM_KEY = "code"
    const val GITLAB_ERROR_PARAM_KEY = "error_description"

    const val LIVE_STATE_PARAM_KEY = "state"
    const val LIVE_CODE_PARAM_KEY = "code"
    const val LIVE_ERROR_PARAM_KEY = "error_description"

    const val AZURE_STATE_PARAM_KEY = "state"
    const val AZURE_CODE_PARAM_KEY = "code"
    const val AZURE_ERROR_PARAM_KEY = "error_description"

    const val FREELANCER_STATE_PARAM_KEY = "state"
    const val FREELANCER_CODE_PARAM_KEY = "code"
    const val FREELANCER_ERROR_PARAM_KEY = "error_description"

    const val STACKEXCHANGE_STATE_PARAM_KEY = "state"
    const val STACKEXCHANGE_CODE_PARAM_KEY = "code"
    const val STACKEXCHANGE_ERROR_PARAM_KEY = "error_description"

    const val TWITTER_PROFILE_ID_KEY = "id"
    const val TWITTER_PROFILE_NAME_KEY = "name"
    const val TWITTER_PROFILE_USERNAME_KEY = "screen_name"
    const val TWITTER_PROFILE_EMAIL_KEY = "email"
    const val TWITTER_PROFILE_AVATAR_KEY = "profile_image_url_https"

    const val FACEBOOK_PROFILE_ID_KEY = "id"
    const val FACEBOOK_PROFILE_NAME_KEY = "name"
    const val FACEBOOK_PROFILE_EMAIL_KEY = "email"
    const val FACEBOOK_PROFILE_AVATAR_KEY_1 = "picture"
    const val FACEBOOK_PROFILE_AVATAR_KEY_2 = "data"
    const val FACEBOOK_PROFILE_AVATAR_KEY_3 = "url"

    const val GITHUB_PROFILE_ID_KEY = "id"
    const val GITHUB_PROFILE_USERNAME_KEY = "login"
    const val GITHUB_PROFILE_NAME_KEY = "name"
    const val GITHUB_PROFILE_EMAIL_KEY = "email"
    const val GITHUB_PROFILE_AVATAR_KEY = "avatar_url"
    const val GITHUB_PROFILE_REPOS_KEY = "repos_url"

    const val GOOGLE_PROFILE_ID_KEY = "sub"
    const val GOOGLE_PROFILE_NAME_KEY = "name"
    const val GOOGLE_PROFILE_EMAIL_KEY = "email"
    const val GOOGLE_PROFILE_AVATAR_KEY = "picture"

    const val LINKEDIN_PROFILE_ID_KEY = "id"
    const val LINKEDIN_PROFILE_LOCALIZED_FIRST_NAME_KEY = "localizedFirstName"
    const val LINKEDIN_PROFILE_LOCALIZED_LAST_NAME_KEY = "localizedLastName"
    const val LINKEDIN_PROFILE_FIRST_NAME_KEY_1 = "firstName"
    const val LINKEDIN_PROFILE_FIRST_NAME_KEY_2 = "localized"

    const val LINKEDIN_PROFILE_LAST_NAME_KEY_1 = "lastName"
    const val LINKEDIN_PROFILE_LAST_NAME_KEY_2 = "localized"

    const val LINKEDIN_PREFERRED_LOCALE = "en_EN"

    const val LINKEDIN_PROFILE_EMAIL_KEY_1 = "elements"
    const val LINKEDIN_PROFILE_EMAIL_KEY_2 = "handle~"
    const val LINKEDIN_PROFILE_EMAIL_KEY_3 = "emailAddress"

    const val LINKEDIN_PROFILE_AVATAR_KEY_1 = "profilePicture"
    const val LINKEDIN_PROFILE_AVATAR_KEY_2 = "displayImage"

    const val GITLAB_PROFILE_ID_KEY = "sub"
    const val GITLAB_PROFILE_USERNAME_KEY = "nickname"
    const val GITLAB_PROFILE_NAME_KEY = "name"
    const val GITLAB_PROFILE_EMAIL_KEY = "email"
    const val GITLAB_PROFILE_AVATAR_KEY = "picture"
    const val GITLAB_PROFILE_REPOS_KEY = "profile"

    const val LIVE_PROFILE_ID_KEY = "id"
    const val LIVE_PROFILE_NAME_KEY = "name"
    const val LIVE_PROFILE_EMAIL_KEY_1 = "emails"
    const val LIVE_PROFILE_EMAIL_KEY_2 = "preferred"
    const val LIVE_PROFILE_EMAIL_KEY_3 = "account"

    const val FREELANCER_PROFILE_ROOT_KEY = "result"
    const val FREELANCER_PROFILE_ID_KEY = "id"
    const val FREELANCER_PROFILE_NAME_KEY = "public_name"
    const val FREELANCER_PROFILE_EMAIL_KEY = "email"
    const val FREELANCER_PROFILE_AVATAR_KEY = "avatar"
    const val FREELANCER_PROFILE_USERNAME_KEY = "username"
    const val FREELANCER_PROFILE_ERROR_KEY = "message"

    const val STACKEXCHANGE_PROFILE_ROOT_KEY = "items"
    const val STACKEXCHANGE_PROFILE_USER_ID_KEY = "user_id"
    const val STACKEXCHANGE_PROFILE_ACCOUNT_ID_KEY = "account_id"
    const val STACKEXCHANGE_PROFILE_NAME_KEY = "display_name"
    const val STACKEXCHANGE_PROFILE_EMAIL_KEY = "email"
    const val STACKEXCHANGE_PROFILE_AVATAR_KEY = "profile_image"
    const val STACKEXCHANGE_PROFILE_USERNAME_KEY = "username"

    const val AZURE_PROFILE_ID_KEY = "id"
    const val AZURE_PROFILE_NAME_KEY = "displayName"
    const val AZURE_PROFILE_EMAIL_KEY_1 = "mail"
    const val AZURE_PROFILE_EMAIL_KEY_2 = "userPrincipalName"
    const val AZURE_PROFILE_FIRSTNAME_KEY = "givenName"
    const val AZURE_PROFILE_LASTNAME_KEY = "surname"

}

