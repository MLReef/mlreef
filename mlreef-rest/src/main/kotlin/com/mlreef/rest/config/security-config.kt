package com.mlreef.rest.config

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
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
class BasicSecurity {

    @Bean fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }
}


@Configuration
@EnableWebSecurity//(debug = true)
@EnableGlobalMethodSecurity(prePostEnabled = true)
class SecurityConfiguration(private val provider: AuthenticationProvider) : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var sessionRepo: FindByIndexNameSessionRepository<out Session>

    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(provider)
    }

    override fun configure(webSecurity: WebSecurity) {
        webSecurity.ignoring().antMatchers("/docs", "/docs/*", AUTH_URL)
    }

    @Throws(Exception::class)
    public override fun configure(httpSecurity: HttpSecurity) {
        httpSecurity
            .exceptionHandling().and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED).and()
            .anonymous().and()
            .authorizeRequests().antMatchers("/docs", "/docs/*", AUTH_URL).permitAll().and()
            .authorizeRequests().anyRequest().fullyAuthenticated()
            .and().authenticationProvider(provider).addFilterBefore(authenticationFilter(), AnonymousAuthenticationFilter::class.java)
            .csrf().disable()
            .httpBasic().disable()
            .logout().disable()
    }

    @Bean fun authenticationFilter(): GitlabTokenAuthenticationFilter {
        val filter = GitlabTokenAuthenticationFilter(PROTECTED_MATCHER)
        filter.setAuthenticationManager(authenticationManager())
        filter.setSessionAuthenticationStrategy(sessionStrategy())
        return filter
    }

    @Bean fun sessionStrategy(): SessionAuthenticationStrategy {
        return RedisSessionStrategy(sessionRepo)
    }

    @Bean fun forbiddenEntryPoint(): AuthenticationEntryPoint {
        return HttpStatusEntryPoint(HttpStatus.FORBIDDEN)
    }

    companion object {
        private const val PROTECTED_URL = "/api/v1/**"
        private const val AUTH_URL = "/api/v1/auth/**"
        private val PROTECTED_MATCHER = AndRequestMatcher(
            AntPathRequestMatcher(PROTECTED_URL),
            NegatedRequestMatcher(AntPathRequestMatcher(AUTH_URL))
        )
    }
}
