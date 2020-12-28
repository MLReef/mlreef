package com.mlreef.rest.config.security

import com.mlreef.rest.external_api.gitlab.TokenDetails
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.authority.SimpleGrantedAuthority
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
        val springToken = UsernamePasswordAuthenticationToken(token, token, listOf(SimpleGrantedAuthority("USER")))

        val authentication = authenticationManager.authenticate(springToken)
        val securityContext: SecurityContext = SecurityContextHolder.getContext()

        if (!authentication.isAuthenticated) {
            throw BadCredentialsException("Not authenticated")
        }

        val isVisitor = (authentication.principal as? TokenDetails)?.isVisitor ?: true

        val finalAuthentication = if (isVisitor) {
            AnonymousAuthenticationToken("Visitor", authentication.principal, listOf(SimpleGrantedAuthority("VISITOR")))
        } else authentication

        // set freshly valid authenticated info into context
        securityContext.authentication = finalAuthentication
        return finalAuthentication
    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        SecurityContextHolder.getContext().authentication = authResult
        chain?.doFilter(request, response)
    }
}