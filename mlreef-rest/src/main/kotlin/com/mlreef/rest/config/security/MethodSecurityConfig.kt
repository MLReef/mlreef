package com.mlreef.rest.config.security

import com.mlreef.rest.security.MlReefMethodSecurityExpressionHandler
import com.mlreef.rest.security.MlReefPermissionEvaluator
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration


@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
class MethodSecurityConfig : GlobalMethodSecurityConfiguration() {
    override fun createExpressionHandler(): MethodSecurityExpressionHandler {
        val expressionHandler = MlReefMethodSecurityExpressionHandler()
        expressionHandler.setPermissionEvaluator(MlReefPermissionEvaluator())
        return expressionHandler
    }
}
