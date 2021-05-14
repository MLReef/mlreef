package com.mlreef.rest.security

import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.PipelineConfigurationRepository
import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.ProcessorsRepository
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineDto
import com.mlreef.rest.api.v1.dto.ProcessorDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.project.ProjectService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.access.expression.SecurityExpressionRoot
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.security.core.Authentication
import java.util.UUID

class MlReefSecurityExpressionRoot(
    authentication: Authentication,
    private val publicProjectsCache: PublicProjectsCacheService,
    private val processorRepository: ProcessorsRepository,
    private val pipelineConfigRepository: PipelineConfigurationRepository,
    private val pipelineRepository: PipelinesRepository,
    private val projectService: ProjectService<Project>,
    private val experimentsRepository: ExperimentRepository,
) : SecurityExpressionRoot(authentication), MethodSecurityExpressionOperations {

    private var returnObject: Any? = null
    private var filterObject: Any? = null
    private var target: Any? = null

    private val tokenDetails: TokenDetails?
        get() = (this.principal as? TokenDetails)

    private val projects: Map<UUID, AccessLevel?>
        get() = tokenDetails?.projects ?: mapOf()

    private val groups: Map<UUID, AccessLevel?>
        get() = tokenDetails?.groups ?: mapOf()

    private val visitor: Boolean
        get() = tokenDetails?.isVisitor ?: true

    fun hasAccessToGroup(groupId: UUID, minAccessLevel: String): Boolean {
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return (tokenDetails?.groups?.get(groupId)?.accessCode ?: 0) >= level.accessCode
    }

    //-------------------------------- PROJECTS

    fun isProjectOwner(projectId: UUID): Boolean {
        return projects[projectId] == AccessLevel.OWNER
    }

    fun canViewProject(projectId: UUID): Boolean {
        if (projectIsPublic(projectId)) return true
        return projects[projectId] != null
    }

    fun canViewProject(namespace: String, slug: String): Boolean {
        val projectId = projectService.getProjectsByNamespaceAndPath(namespace, slug)?.id
            ?: return false
        return canViewProject(projectId)
    }

    fun postCanViewProject(): Boolean {
        return getIdFromContext()?.let {
            canViewProject(it)
        } ?: false
    }

    fun hasAccessToProject(projectId: UUID, minAccessLevel: String): Boolean {
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return (projects[projectId]?.accessCode ?: 0) >= level.accessCode
    }

    fun hasAccessToProject(namespace: String, slug: String, minAccessLevel: String): Boolean {
        val projectId = projectService.getProjectsByNamespaceAndPath(namespace, slug)?.id
            ?: return false
        return hasAccessToProject(projectId, minAccessLevel)
    }

    fun postHasAccessToProject(minAccessLevel: String): Boolean {
        return getIdFromContext()?.let {
            hasAccessToProject(it, minAccessLevel)
        } ?: false
    }

    //-------------------------------- PIPELINES CONFIGS

    fun hasAccessToPipelineConfig(pipelineConfigId: UUID, minAccessLevel: String): Boolean {
        return getPipelineConfigFromContext(pipelineConfigId)?.let {
            hasAccessToProject(it.dataProjectId, minAccessLevel)
        } ?: false
    }

    fun postHasAccessToPipelineConfig(minAccessLevel: String): Boolean {
        return getIdFromContext()?.let {
            hasAccessToPipelineConfig(it, minAccessLevel)
        } ?: false
    }

    fun canViewPipelineConfig(id: UUID): Boolean {
        return getPipelineConfigFromContext(id)?.let {
            canViewProject(it.dataProjectId)
        } ?: false
    }

    fun postCanViewPipelineConfig(): Boolean {
        return getIdFromContext()?.let {
            canViewPipelineConfig(it)
        } ?: false
    }

    //-------------------------------- PIPELINES

    fun hasAccessToPipeline(pipelineId: UUID, minAccessLevel: String): Boolean {
        return getPipelineFromContext(pipelineId)?.let {
            hasAccessToProject(it.dataProjectId, minAccessLevel)
        } ?: false
    }

    fun postHasAccessToPipeline(minAccessLevel: String): Boolean {
        return getIdFromContext()?.let {
            hasAccessToPipeline(it, minAccessLevel)
        } ?: false
    }

    fun canViewPipeline(id: UUID): Boolean {
        return getPipelineFromContext(id)?.let {
            canViewProject(it.dataProjectId)
        } ?: false
    }

    fun postCanViewPipeline(): Boolean {
        return getIdFromContext()?.let {
            canViewPipeline(it)
        } ?: false
    }

    //-------------------------------- EXPERIMENTS

    fun hasAccessToExperiment(experimentId: UUID, minAccessLevel: String): Boolean {
        return getExperimentFromContext(experimentId)?.let {
            hasAccessToProject(it.dataProjectId, minAccessLevel)
        } ?: false
    }

    fun postHasAccessToExperiment(minAccessLevel: String): Boolean {
        return getIdFromContext()?.let {
            hasAccessToExperiment(it, minAccessLevel)
        } ?: false
    }

    fun canViewExperiment(id: UUID): Boolean {
        return getPipelineConfigFromContext(id)?.let {
            canViewProject(it.dataProjectId)
        } ?: false
    }

    fun postCanViewExperiment(): Boolean {
        return getIdFromContext()?.let {
            canViewExperiment(it)
        } ?: false
    }

    //-------------------------------- PROCESSORS

    fun hasAccessToProcessor(processorId: UUID, minAccessLevel: String): Boolean {
        return getProcessorFromContext(processorId)?.codeProjectId?.let {
            hasAccessToProject(it, minAccessLevel)
        } ?: false
    }

    fun postHasAccessToProcessor(minAccessLevel: String): Boolean {
        return getIdFromContext()?.let {
            hasAccessToProcessor(it, minAccessLevel)
        } ?: false
    }

    fun canViewProcessor(processorId: UUID): Boolean = hasAccessToProcessor(processorId, AccessLevel.VISITOR.name)
    fun postCanViewProcessor() = postHasAccessToProcessor(AccessLevel.VISITOR.name)

    //-------------------------------- OTHERS

    @Deprecated("postCanViewProject")
    fun userInProject(): Boolean {
        return getIdFromContext()?.let {
            userInProject(it)
        } ?: false
    }

    @Deprecated("canViewProject", ReplaceWith("canViewProject"))
    fun userInProject(projectId: UUID): Boolean = projects.containsKey(projectId)

    fun userInProject(namespace: String, slug: String): Boolean {
        val projectId = projectService.getProjectsByNamespaceAndPath(namespace, slug)?.id
            ?: return false
        return userInProject(projectId)
    }

    fun projectIsPublic(projectId: UUID) = projectService.getProjectById(projectId)?.isPublic() ?: false

    fun projectIsPublic(namespace: String, slug: String) = projectService.getProjectsByNamespaceAndPath(namespace, slug)?.isPublic() ?: false

    fun canCreateProject(): Boolean {
        return !visitor && (tokenDetails?.gitlabUser?.canCreateProject ?: false)
    }

    // Common security check
    fun isGitlabAdmin(): Boolean = tokenDetails?.gitlabUser?.isAdmin ?: false

    fun isUserItself(userId: UUID?): Boolean = userId?.let { tokenDetails?.accountId == it } ?: false

    fun isUserItself(userGitlabId: Long?): Boolean = userGitlabId?.let { tokenDetails?.gitlabUser?.id == it } ?: false

    fun isUserItself(userName: String?): Boolean = userName?.let { tokenDetails?.username == it } ?: false

    fun isUserItselfByToken(token: String?) = token?.let { tokenDetails?.accessToken == it } ?: false

    // Groups' security
    fun isGroupOwner(groupId: UUID): Boolean {
        return groups[groupId] == AccessLevel.OWNER
    }

    fun userInGroup(): Boolean {
        return getIdFromContext()?.let {
            userInGroup(it)
        } ?: false
    }

    fun userInGroup(groupId: UUID): Boolean = groups.containsKey(groupId)

    fun canCreateGroup() = tokenDetails?.gitlabUser?.canCreateGroup ?: false

    override fun getReturnObject() = returnObject

    override fun setReturnObject(returnObject: Any) {
        this.returnObject = returnObject
    }

    override fun getFilterObject() = filterObject

    override fun setFilterObject(filterObject: Any) {
        this.filterObject = filterObject
    }

    override fun getThis() = target

    fun setThis(target: Any) {
        this.target = target
    }

    private fun getIdFromContext(projectId: UUID? = null): UUID? {
        return when {
            projectId != null -> projectId
            filterObject != null -> (filterObject as? DataClassWithId)?.id
            returnObject != null -> (returnObject as? DataClassWithId)?.id
            else -> null
        }
    }

    private fun getProcessorFromContext(dataProcessorId: UUID? = null): ProcessorDto? {
        return when {
            dataProcessorId != null -> processorRepository.findByIdOrNull(dataProcessorId)?.toDto()
            filterObject != null -> (filterObject as? ProcessorDto)
            returnObject != null -> (returnObject as? ProcessorDto)
            else -> null
        }
    }

    private fun getPipelineConfigFromContext(pipelineConfigId: UUID? = null): PipelineConfigDto? {
        return when {
            pipelineConfigId != null -> pipelineConfigRepository.findByIdOrNull(pipelineConfigId)?.toDto()
            filterObject != null -> (filterObject as? PipelineConfigDto)
            returnObject != null -> (returnObject as? PipelineConfigDto)
            else -> null
        }
    }

    private fun getPipelineFromContext(pipelineId: UUID? = null): PipelineDto? {
        return when {
            pipelineId != null -> pipelineRepository.findByIdOrNull(pipelineId)?.toDto()
            filterObject != null -> (filterObject as? PipelineDto)
            returnObject != null -> (returnObject as? PipelineDto)
            else -> null
        }
    }

    private fun getExperimentFromContext(experimentId: UUID? = null): ExperimentDto? {
        return when {
            experimentId != null -> experimentsRepository.findByIdOrNull(experimentId)?.toDto()
            filterObject != null -> (filterObject as? ExperimentDto)
            returnObject != null -> (returnObject as? ExperimentDto)
            else -> null
        }
    }
}
