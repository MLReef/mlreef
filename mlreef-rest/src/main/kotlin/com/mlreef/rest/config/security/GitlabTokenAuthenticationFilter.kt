package com.mlreef.rest.config.security

import org.slf4j.LoggerFactory
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.util.matcher.RequestMatcher
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class GitlabTokenAuthenticationFilter(requestMatcher: RequestMatcher) : AbstractAuthenticationProcessingFilter(requestMatcher) {

    companion object {
        private val log = LoggerFactory.getLogger(GitlabTokenAuthenticationFilter::class.java)
    }

    @Throws(AuthenticationException::class)
    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {

        val tokenHeader = request?.getHeader("PRIVATE-TOKEN")
        val token = tokenHeader?.removePrefix("Bearer")?.trim()
        val springToken = UsernamePasswordAuthenticationToken(token, token, listOf())

        val authentication = authenticationManager.authenticate(springToken)
        val securityContext: SecurityContext = SecurityContextHolder.getContext()

        if (!authentication.isAuthenticated) {
            throw BadCredentialsException("Not authenticated")
        }
        // set freshly valid authenticated info into context
        securityContext.authentication = authentication
        return authentication
    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        SecurityContextHolder.getContext().authentication = authResult
        chain?.doFilter(request, response)
    }
}