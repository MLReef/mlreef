package com.mlreef.rest.config

import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.auth.AuthService
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import org.springframework.stereotype.Component
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


fun String.censor(): String {
    val censoringShortener = 3
    return if (this.length >= censoringShortener) {
        val censoringBegin = this.length / censoringShortener
        this.replaceRange(censoringBegin, this.length - 1, "*****")
    } else {
        "**"
    }
}

@Component
class CustomAuthenticationProvider(
    val authService: AuthService,
    val sessionRepository: FindByIndexNameSessionRepository<out Session>
) : AbstractUserDetailsAuthenticationProvider() {

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

    /**
     * Will be called during EACH Request to load or reload Authentication via Service or from Session
     */
    override fun retrieveUser(token: String?, authentication: UsernamePasswordAuthenticationToken?): UserDetails {
        if (token == null) {
            throw BadCredentialsException("token is null during AuthenticationProvider")
        }
        if (authentication == null) {
            throw BadCredentialsException("authentication is null during AuthenticationProvider")
        }

        val fromSession: UserDetails? = retrieveFromSession(token)
        if (fromSession != null) {
            return fromSession
        }
        val fromCache: UserDetails? = this.userCache.getUserFromCache(token)
        if (fromCache != null) {
            return fromCache
        }
        val account = authService.findAccountByToken(token)
        val gitlabUser = authService.findGitlabUserViaToken(token)
        val findByToken = authService.createTokenDetails(token, account, gitlabUser)
        if (!findByToken.valid) {
            throw BadCredentialsException("Token not found in Gitlab!")
        } else {
            // store user in cache! This method will not be called if cache can be used!
            this.userCache.putUserInCache(findByToken)
            createSession(token, findByToken)
            return findByToken
        }
    }

    private fun createSession(token: String, userDetails: UserDetails) {
        logger.info("createSession: Create session for token:${token.censor()}")
        val session = sessionRepository.createSession()
        session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
        session.setAttribute("user", userDetails)
    }

    private fun retrieveFromSession(token: String): UserDetails? {
        val findByPrincipalNameMap = sessionRepository.findByIndexNameAndIndexValue(
            FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)

        if (findByPrincipalNameMap.isNotEmpty()) {
            logger.info("retrieveFromSession token:${token.censor()}")
            val first = findByPrincipalNameMap.values.first()
            val userDetails = first.getAttribute<UserDetails>("user")
            if (userDetails == null) {
                logger.debug("User not cached")
            }
            return userDetails
        }

        return null
    }

    override fun additionalAuthenticationChecks(userDetails: UserDetails?, authentication: UsernamePasswordAuthenticationToken?) =
        Unit
}

class GitlabTokenAuthenticationFilter(requestMatcher: RequestMatcher) : AbstractAuthenticationProcessingFilter(requestMatcher) {

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

    @Throws(AuthenticationException::class)
    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {

        val tokenHeader = request?.getHeader("PRIVATE-TOKEN")
        val token = tokenHeader?.removePrefix("Bearer")?.trim()
        val springToken = UsernamePasswordAuthenticationToken(token, token, listOf())

        val authenticate = authenticationManager.authenticate(springToken)
        val securityContext: SecurityContext = SecurityContextHolder.getContext()

        if (!authenticate.isAuthenticated) {
            throw BadCredentialsException("Not authenticated")
        }
        // set freshly valid authenticated info into context
        securityContext.authentication = authenticate
        return authenticate
    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        SecurityContextHolder.getContext().authentication = authResult
        chain?.doFilter(request, response)
    }
}

class RedisSessionStrategy<T : Session>(private val sessionRepo: FindByIndexNameSessionRepository<T>) : SessionAuthenticationStrategy {

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

    override fun onAuthentication(authentication: Authentication?, request: HttpServletRequest?, response: HttpServletResponse?) {
        val userDetails = authentication?.principal as TokenDetails
        val token = userDetails.token

        val findByPrincipalNameMap = sessionRepo.findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
        val session: T = if (findByPrincipalNameMap.isNotEmpty()) {
            log.debug("Reuse session for token:${token.censor()}")
            findByPrincipalNameMap.values.first()
        } else {
            log.debug("Create session for token:${token.censor()}")
            sessionRepo.createSession()
        }
        session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
        session.setAttribute("user", userDetails)
        sessionRepo.save(session)
    }
}

