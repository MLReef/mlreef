package com.mlreef.rest.config.security

import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
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
    private val dataProcessorRepository: DataProcessorRepository,
    private val pipelineConfigRepository: PipelineConfigRepository,
    private val pipelineInstanceRepository: PipelineInstanceRepository
) : GlobalMethodSecurityConfiguration() {
    override fun createExpressionHandler(): MethodSecurityExpressionHandler {
        val expressionHandler = MlReefMethodSecurityExpressionHandler(
            publicProjectsCache,
            dataProcessorRepository,
            pipelineConfigRepository,
            pipelineInstanceRepository
        )
        expressionHandler.setPermissionEvaluator(MlReefPermissionEvaluator())
        return expressionHandler
    }
}
