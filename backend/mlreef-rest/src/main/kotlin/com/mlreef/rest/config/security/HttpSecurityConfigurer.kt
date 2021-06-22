package com.mlreef.rest.config.security

import org.springframework.security.config.annotation.web.builders.HttpSecurity

interface HttpSecurityConfigurer {
    fun configSecurity(httpSecurity: HttpSecurity): HttpSecurity
}
