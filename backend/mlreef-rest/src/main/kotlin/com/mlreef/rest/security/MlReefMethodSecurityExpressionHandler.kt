package com.mlreef.rest.security

import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.PipelineConfigurationRepository
import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.ProcessorsRepository
import com.mlreef.rest.domain.Project
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
    private val processorRepository: ProcessorsRepository,
    private val pipelineConfigRepository: PipelineConfigurationRepository,
    private val pipelineRepository: PipelinesRepository,
    private val projectService: ProjectService<Project>,
    private val experimentRepository: ExperimentRepository,
) : DefaultMethodSecurityExpressionHandler() {
    private val trustResolver: AuthenticationTrustResolver = AuthenticationTrustResolverImpl()

    override fun createSecurityExpressionRoot(authentication: Authentication, invocation: MethodInvocation?): MethodSecurityExpressionOperations? {
        val root = MlReefSecurityExpressionRoot(
            authentication,
            publicProjectsCache,
            processorRepository,
            pipelineConfigRepository,
            pipelineRepository,
            projectService,
            experimentRepository,
        )
        root.setPermissionEvaluator(permissionEvaluator)
        root.setTrustResolver(this.trustResolver)
        root.setRoleHierarchy(roleHierarchy)
        return root
    }

    override fun getTrustResolver(): AuthenticationTrustResolver {
        return super.getTrustResolver()
    }
}