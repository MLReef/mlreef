package com.mlreef.rest.config.security

import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.PipelineConfigurationRepository
import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.ProcessorsRepository
import com.mlreef.rest.domain.Project
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.security.MlReefMethodSecurityExpressionHandler
import com.mlreef.rest.security.MlReefPermissionEvaluator
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration


@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
class MethodSecurityConfig(
    private val publicProjectsCache: PublicProjectsCacheService,
    private val processorRepository: ProcessorsRepository,
    private val pipelineConfigRepository: PipelineConfigurationRepository,
    private val pipelineRepository: PipelinesRepository,
    private val projectService: ProjectService<Project>,
    private val experimentRepository: ExperimentRepository,
) : GlobalMethodSecurityConfiguration() {
    override fun createExpressionHandler(): MethodSecurityExpressionHandler {
        val expressionHandler = MlReefMethodSecurityExpressionHandler(
            publicProjectsCache,
            processorRepository,
            pipelineConfigRepository,
            pipelineRepository,
            projectService,
            experimentRepository,
        )
        expressionHandler.setPermissionEvaluator(MlReefPermissionEvaluator())
        return expressionHandler
    }
}
