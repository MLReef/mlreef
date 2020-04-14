package com.mlreef.rest.security

import org.aopalliance.intercept.MethodInvocation
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.security.authentication.AuthenticationTrustResolver
import org.springframework.security.authentication.AuthenticationTrustResolverImpl
import org.springframework.security.core.Authentication


class MlReefMethodSecurityExpressionHandler : DefaultMethodSecurityExpressionHandler() {
    private val trustResolver: AuthenticationTrustResolver = AuthenticationTrustResolverImpl()

    override fun createSecurityExpressionRoot(authentication: Authentication, invocation: MethodInvocation?): MethodSecurityExpressionOperations? {
        val root = MlReefSecurityExpressionRoot(authentication)
        root.setPermissionEvaluator(permissionEvaluator)
        root.setTrustResolver(this.trustResolver)
        root.setRoleHierarchy(roleHierarchy)
        return root
    }

    override fun getTrustResolver(): AuthenticationTrustResolver {
        return super.getTrustResolver()
    }
}