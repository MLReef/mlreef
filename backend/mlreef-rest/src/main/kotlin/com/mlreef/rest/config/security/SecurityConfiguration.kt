package com.mlreef.rest.config.security

import com.mlreef.rest.config.http.RedisSessionStrategy
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.security.web.util.matcher.AndRequestMatcher
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.security.web.util.matcher.NegatedRequestMatcher
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session


@Configuration
@EnableWebSecurity//(debug = true)
class SecurityConfiguration(
    private val provider: AuthenticationProvider,
) : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var sessionRepo: FindByIndexNameSessionRepository<out Session>

    init {
        log.debug("MLReef security configuration processing...")
    }

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(provider)
    }

    override fun configure(webSecurity: WebSecurity) {
        webSecurity
            .ignoring()
            .antMatchers(
                "/",
                "/docs",
                "/docs/*",
                AUTH_LOGIN_URL,
                AUTH_REGISTER_URL,
                EPF_BOT_URL,
                INFO_URL,
            )
    }

    @Throws(Exception::class)
    public override fun configure(httpSecurity: HttpSecurity) {
        httpSecurity
            .exceptionHandling().and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .anonymous().and()
            .authorizeRequests().antMatchers("/docs", "/docs/*", AUTH_LOGIN_URL, AUTH_REGISTER_URL, SOCIAL_SIGNIN_URL, EPF_BOT_URL, INFO_URL).permitAll()
            .antMatchers(*visitorsUrls).hasAnyAuthority("USER", "VISITOR")
            .and()
            .authorizeRequests().anyRequest().fullyAuthenticated()
            .and()
            .authenticationProvider(provider).addFilterBefore(authenticationFilter(), AnonymousAuthenticationFilter::class.java)
            .csrf().disable()
            .httpBasic().disable()
            .logout().disable()
    }

    @Bean
    fun authenticationFilter(): GitlabTokenAuthenticationFilter {
        val filter = GitlabTokenAuthenticationFilter(PROTECTED_MATCHER)
        filter.setAuthenticationManager(authenticationManager())
        filter.setSessionAuthenticationStrategy(sessionStrategy())
        return filter
    }

    @Bean
    fun sessionStrategy(): SessionAuthenticationStrategy {
        return RedisSessionStrategy(sessionRepo)
    }

    @Bean
    fun forbiddenEntryPoint(): AuthenticationEntryPoint {
        return HttpStatusEntryPoint(HttpStatus.FORBIDDEN)
    }

    companion object {
        private val log = LoggerFactory.getLogger(SecurityConfiguration::class.java)

        // FIXME: what is the difference ? Please let us fix that: every url should be for visitors, and THEN the permission mechanism is applied
        //Access without any security check
        private const val PROTECTED_URL = "/api/v1/**"
        private const val AUTH_LOGIN_URL = "/api/v1/auth/login"
        private const val AUTH_REGISTER_URL = "/api/v1/auth/register"
        private const val EPF_BOT_URL = "/api/v1/epf/**"
        private const val INFO_URL = "/api/v1/info/**"
        private const val PING_URL = "/api/v1/ping"
        private const val EXPLORE_URL = "/api/v1/explore/**"

        // FIXME: what is the difference ? Please let us fix that: every url should be for visitors, and THEN the permission mechanism is applied
        //Access with anonymous check (for visitors)
        private const val MARKETPLACE_PUBLIC_URL = "/api/v1/explore/entries/public"
        private const val PASSWORDS_URL = "/api/v1/password/**"
        private const val PROJECTS_URL = "/api/v1/projects/**"
        private const val DATA_PROJECTS_URL = "/api/v1/data-projects/**"
        private const val CODE_PROJECTS_URL = "/api/v1/code-projects/**"
        private const val WHOAMI_URL = "/api/v1/auth/whoami"
        private const val SOCIAL_SIGNIN_URL = "/api/v1/social/**"
        private const val DOWNLOAD_URL = "/api/v1/files/download/**"

        private val visitorsUrls = arrayOf(
            MARKETPLACE_PUBLIC_URL,
            EPF_BOT_URL,
            PASSWORDS_URL,
            PROJECTS_URL,
            DATA_PROJECTS_URL,
            CODE_PROJECTS_URL,
            EXPLORE_URL,
            WHOAMI_URL,
            DOWNLOAD_URL,
        )

        private val PROTECTED_MATCHER = AndRequestMatcher(
            AntPathRequestMatcher(PROTECTED_URL),
            NegatedRequestMatcher(AntPathRequestMatcher(AUTH_LOGIN_URL)),
            NegatedRequestMatcher(AntPathRequestMatcher(AUTH_REGISTER_URL)),
            NegatedRequestMatcher(AntPathRequestMatcher(EPF_BOT_URL)),
            NegatedRequestMatcher(AntPathRequestMatcher(INFO_URL)),
            NegatedRequestMatcher(AntPathRequestMatcher(PING_URL)),
            NegatedRequestMatcher(AntPathRequestMatcher(SOCIAL_SIGNIN_URL)),
        )
    }
}

