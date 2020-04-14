package com.mlreef.rest.config.security

import com.mlreef.rest.config.censor
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.auth.AuthService
import com.mlreef.rest.security.MlReefSessionRegistry
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session


@Configuration
class AuthenticationProvider(val authService: AuthService,
                             val sessionRegistry: MlReefSessionRegistry,
                             val sessionRepository: FindByIndexNameSessionRepository<out Session>
) : AbstractUserDetailsAuthenticationProvider() {

    companion object {
        private val log = LoggerFactory.getLogger(AuthenticationProvider::class.java)
    }

    init {
        log.debug("MlReef authentication provider is running...")
    }

    /**
     * Will be called during EACH Request to load or reload Authentication via Service or from Session
     */
    override fun retrieveUser(accessToken: String?, authentication: UsernamePasswordAuthenticationToken?): UserDetails {
        if (accessToken == null) {
            throw BadCredentialsException("token is null during AuthenticationProvider")
        }
        if (authentication == null) {
            throw BadCredentialsException("authentication is null during AuthenticationProvider")
        }

        val fromSession: UserDetails? = sessionRegistry.retrieveFromSession(accessToken)
        if (fromSession != null) {
            log.debug("Using token details for user ${fromSession.username} from session")
            return fromSession
        }
        val fromCache: UserDetails? = this.userCache.getUserFromCache(accessToken)
        if (fromCache != null) {
            return fromCache
        }

        log.debug("!!!!!!!!!No session found for token ${accessToken.censor()}!!!!!!!!")

        val gitlabUser = authenticateInGitlab(accessToken)
            ?: throw BadCredentialsException("Token not found in Gitlab!")
        val account = authService.findAccountByGitlabId(gitlabUser.id) ?: authService.findAccountByToken(accessToken)
        val tokenDetails = authService.createTokenDetails(accessToken, account, gitlabUser)

        if (!tokenDetails.valid) {
            throw BadCredentialsException("Token not found in Gitlab!")
        } else {
            // store user in cache! This method will not be called if cache can be used!
            // Session is being stored in cache by SessionStrategy (see com.mlreef.rest.config.http.RedisSessionStrategy class)
            return tokenDetails
        }
    }

    private fun authenticateInGitlab(token: String): GitlabUser? {
        try {
            return authService.checkUserInGitlab(token)
        } catch (ex: Exception) {
            return null
        }
    }

    override fun additionalAuthenticationChecks(userDetails: UserDetails?, authentication: UsernamePasswordAuthenticationToken?) =
        Unit
}
