package com.mlreef.rest.config

import com.mlreef.rest.external_api.gitlab.GitlabUserDetails
import lombok.extern.slf4j.Slf4j
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.security.web.util.matcher.OrRequestMatcher
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import org.springframework.stereotype.Component
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

interface AuthService {
    fun findByToken(token: String): GitlabUserDetails?
}

@Slf4j
@Component
open class CustomAuthenticationProvider : AbstractUserDetailsAuthenticationProvider() {
    @Autowired
    lateinit var authService: AuthService

    @Autowired
    lateinit var sessionRepository: FindByIndexNameSessionRepository<out Session>

    override fun retrieveUser(username: String?, authentication: UsernamePasswordAuthenticationToken?): UserDetails {
        if (username == null) {
            throw BadCredentialsException("username is null during AuthenticationProvider")
        }
        if (authentication == null) {
            throw BadCredentialsException("authentication is null during AuthenticationProvider")
        }
        val findByToken = authService.findByToken(authentication.name)
        if (findByToken == null) {
            throw BadCredentialsException("Token not found in Gitlab!")
        } else {
            return findByToken
        }
    }

    override fun additionalAuthenticationChecks(userDetails: UserDetails?, authentication: UsernamePasswordAuthenticationToken?) {
    }
}

@Slf4j
class CustomAuthenticationFilter(requestMatcher: RequestMatcher) : AbstractAuthenticationProcessingFilter(requestMatcher) {
    override fun attemptAuthentication(request: HttpServletRequest?, response: HttpServletResponse?): Authentication {
        val tokenHeader = request?.getHeader("PRIVATE-TOKEN")
        val token = tokenHeader?.removePrefix("Bearer")?.trim()
        val springToken = UsernamePasswordAuthenticationToken(token, token)
        return authenticationManager.authenticate(springToken)
    }

    override fun successfulAuthentication(request: HttpServletRequest?, response: HttpServletResponse?, chain: FilterChain?, authResult: Authentication?) {
        SecurityContextHolder.getContext().authentication = authResult
        request?.session?.setAttribute("isAuthenticated", authResult!!.isAuthenticated)
        chain?.doFilter(request, response)
    }
}

@Slf4j
class CustomSessionStrategy<T : Session>(private val sessionRepo: FindByIndexNameSessionRepository<T>) : SessionAuthenticationStrategy {

    override fun onAuthentication(authentication: Authentication?, request: HttpServletRequest?, response: HttpServletResponse?) {

        val userDetails = authentication?.principal as GitlabUserDetails
        val token = userDetails.token

        val findByPrincipalNameMap = sessionRepo.findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
        val session: T = if (findByPrincipalNameMap.isNotEmpty()) {
            findByPrincipalNameMap.values.first()
        } else {
            sessionRepo.createSession()
        }
        session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
        session.setAttribute("user", userDetails)
        sessionRepo.save(session)
    }
}

@Configuration
@EnableWebSecurity(debug = true)
@EnableGlobalMethodSecurity(prePostEnabled = true)
open class SecurityConfiguration(var provider: AuthenticationProvider) : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var sessionRepo: FindByIndexNameSessionRepository<out Session>

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(provider)
    }

    override fun configure(webSecurity: WebSecurity) {
        webSecurity.ignoring().antMatchers("/token/**")
    }

    @Throws(Exception::class)
    public override fun configure(http: HttpSecurity) {
        http.sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .exceptionHandling()
                .and()
                .authenticationProvider(provider)
                .addFilterBefore(authenticationFilter(), AnonymousAuthenticationFilter::class.java)
                .authorizeRequests()
                .requestMatchers(PROTECTED_URLS)
                .authenticated()
                .and()
                .csrf().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .logout().disable()
    }

    @Bean
    open fun authenticationFilter(): CustomAuthenticationFilter {
        val filter = CustomAuthenticationFilter(PROTECTED_URLS)
        filter.setAuthenticationManager(authenticationManager())
        filter.setSessionAuthenticationStrategy(sessionStrategy())
        return filter
    }

    @Bean
    open fun sessionStrategy(): SessionAuthenticationStrategy {
        return CustomSessionStrategy(sessionRepo)
    }

    @Bean
    open fun forbiddenEntryPoint(): AuthenticationEntryPoint {
        return HttpStatusEntryPoint(HttpStatus.FORBIDDEN)
    }

    companion object {
        private val PROTECTED_URLS = OrRequestMatcher(
                AntPathRequestMatcher("/api/**")
        )
    }
}
