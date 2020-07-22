package com.mlreef.rest.security

import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.Project
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.project.ProjectService
import org.aopalliance.intercept.MethodInvocation
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.security.authentication.AuthenticationTrustResolver
import org.springframework.security.authentication.AuthenticationTrustResolverImpl
import org.springframework.security.core.Authentication


class MlReefMethodSecurityExpressionHandler(
    private val publicProjectsCache: PublicProjectsCacheService,
    private val dataProcessorRepository: DataProcessorRepository,
    private val pipelineConfigRepository: PipelineConfigRepository,
    private val projectService: ProjectService<Project>,
    private val pipelineInstanceRepository: PipelineInstanceRepository
) : DefaultMethodSecurityExpressionHandler() {
    private val trustResolver: AuthenticationTrustResolver = AuthenticationTrustResolverImpl()

    override fun createSecurityExpressionRoot(authentication: Authentication, invocation: MethodInvocation?): MethodSecurityExpressionOperations? {
        val root = MlReefSecurityExpressionRoot(
            authentication,
            publicProjectsCache,
            dataProcessorRepository,
            pipelineConfigRepository,
            projectService,
            pipelineInstanceRepository)
        root.setPermissionEvaluator(permissionEvaluator)
        root.setTrustResolver(this.trustResolver)
        root.setRoleHierarchy(roleHierarchy)
        return root
    }

    override fun getTrustResolver(): AuthenticationTrustResolver {
        return super.getTrustResolver()
    }
}