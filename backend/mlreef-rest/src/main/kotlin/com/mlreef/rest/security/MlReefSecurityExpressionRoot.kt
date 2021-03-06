package com.mlreef.rest.security

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.Project
import com.mlreef.rest.api.v1.dto.DataProcessorDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.helpers.DataClassWithId
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.access.expression.SecurityExpressionRoot
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.security.core.Authentication
import java.util.UUID

class MlReefSecurityExpressionRoot(
    authentication: Authentication,
    private val publicProjectsCache: PublicProjectsCacheService,
    private val dataProcessorRepository: DataProcessorRepository,
    private val pipelineConfigRepository: PipelineConfigRepository,
    private val projectService: ProjectService<Project>,
    private val pipelineInstanceRepository: PipelineInstanceRepository)
    : SecurityExpressionRoot(authentication), MethodSecurityExpressionOperations {

    private var returnObject: Any? = null
    private var filterObject: Any? = null
    private var target: Any? = null


    fun hasAccessToGroup(groupId: UUID, minAccessLevel: String): Boolean {
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return ((this.principal as? TokenDetails)?.groups?.get(groupId)?.accessCode ?: 0) >= level.accessCode
    }

    // Projects' security
    fun isProjectOwner(projectId: UUID): Boolean {
        val tokenDetails = this.principal as? TokenDetails
        val projects = tokenDetails?.projects
        val accessLevel = projects?.get(projectId)
        return (accessLevel?.accessCode ?: 0) == AccessLevel.OWNER.accessCode
    }

    fun hasAccessToProject(projectId: UUID, minAccessLevel: String): Boolean {
        if (projectIsPublic(projectId)) return true
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return ((this.principal as? TokenDetails)?.projects?.get(projectId)?.accessCode ?: 0) >= level.accessCode
    }

    fun hasAccessToProject(namespace: String, slug: String, minAccessLevel: String): Boolean {
        val projectId = projectService.getProjectsByNamespaceAndPath(namespace, slug)?.id
            ?: return false
        return hasAccessToProject(projectId, minAccessLevel)
    }

    fun postHasAccessToProject(minAccessLevel: String): Boolean {
        val id = getIdFromContext()
        return if (id != null) hasAccessToProject(id, minAccessLevel) else false
    }

    fun canViewProject(projectId: UUID) = hasAccessToProject(projectId, AccessLevel.VISITOR.name)
    fun canViewProject(namespace: String, slug: String) = hasAccessToProject(namespace, slug, AccessLevel.VISITOR.name)
    fun postCanViewProject() = postHasAccessToProject(AccessLevel.VISITOR.name)

    fun hasAccessToPipeline(pipelineId: UUID, minAccessLevel: String): Boolean {
        val config = getPipelineConfigFromContext(pipelineId)
        return if (config != null) hasAccessToProject(config.dataProjectId, minAccessLevel) else false
    }

    fun postHasAccessToPipeline(minAccessLevel: String): Boolean {
        val id = getIdFromContext()
        return if (id != null) hasAccessToPipeline(id, minAccessLevel) else false
    }

    fun canViewPipeline(id: UUID) = hasAccessToPipeline(id, AccessLevel.VISITOR.name)
    fun postCanViewPipeline() = postHasAccessToPipeline(AccessLevel.VISITOR.name)

    fun hasAccessToProcessor(processorId: UUID, minAccessLevel: String): Boolean {
        val config = getDataProcessorFromContext(processorId)
        return if (config?.codeProjectId != null) hasAccessToProject(config.codeProjectId, minAccessLevel) else false
    }

    fun postHasAccessToProcessor(minAccessLevel: String): Boolean {
        val id = getIdFromContext()
        return if (id != null) hasAccessToProcessor(id, minAccessLevel) else false
    }

    fun canViewProcessor(processorId: UUID): Boolean = hasAccessToProcessor(processorId, AccessLevel.VISITOR.name)
    fun postCanViewProcessor() = postHasAccessToProcessor(AccessLevel.VISITOR.name)

    @Deprecated("postCanViewProject")
    fun userInProject(): Boolean {
        val id = getIdFromContext()
        return if (id != null) userInProject(id) else false
    }

    @Deprecated("canViewProject", ReplaceWith("canViewProject"))
    fun userInProject(projectId: UUID): Boolean = ((this.principal as? TokenDetails)?.projects?.containsKey(projectId)
        ?: false)

    fun userInProject(namespace: String, slug: String): Boolean {
        val projectId = projectService.getProjectsByNamespaceAndPath(namespace, slug)?.id
            ?: return false
        return userInProject(projectId)
    }

    private fun projectIsPublic(projectId: UUID): Boolean {
        val project = projectService.getProjectById(projectId)

        return project?.isPublic() ?: false
    }

    fun projectIsPublic(namespace: String, slug: String): Boolean {
        val project = projectService.getProjectsByNamespaceAndPath(namespace, slug)

        return project?.isPublic() ?: false
    }

    @Deprecated("why not accesslevel maintainer?")
    fun canCreateProject(): Boolean {
        val tokenDetails = (this.principal as? TokenDetails) ?: return false
        return !tokenDetails.isVisitor && (tokenDetails.gitlabUser?.canCreateProject ?: false)
    }

    // Common security check
    fun isGitlabAdmin(): Boolean = (this.principal as? TokenDetails)?.gitlabUser?.isAdmin ?: false

    fun isVisitor(): Boolean = (this.principal as? TokenDetails)?.isVisitor ?: false

    fun isUserItself(userId: UUID?): Boolean = if (userId != null) ((this.principal as? TokenDetails)?.accountId == userId) else false

    fun isUserItself(userGitlabId: Long?): Boolean = if (userGitlabId != null) (this.principal as? TokenDetails)?.gitlabUser?.id == userGitlabId else false

    fun isUserItself(userName: String?): Boolean = if (userName != null) (this.principal as? TokenDetails)?.username == userName else false

    fun isUserItselfByToken(token: String?): Boolean {
        return if (token != null) {
            (this.principal as? TokenDetails)?.accessToken == token
        } else false
    }

    // Groups' security
    fun isGroupOwner(groupId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.groups?.get(groupId)?.accessCode
            ?: 0) == AccessLevel.OWNER.accessCode
    }

    fun userInGroup(): Boolean {
        val id = getIdFromContext()
        return if (id != null) userInGroup(id) else false
    }

    fun userInGroup(groupId: UUID): Boolean = ((this.principal as? TokenDetails)?.groups?.containsKey(groupId) ?: false)

    fun canCreateGroup(): Boolean {
        val tokenDetails = this.principal as? TokenDetails
        return tokenDetails?.gitlabUser?.canCreateGroup ?: false
    }

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

    private fun getDataProcessorFromContext(dataProcessorId: UUID? = null): DataProcessorDto? {
        return when {
            dataProcessorId != null -> dataProcessorRepository.findByIdOrNull(dataProcessorId)?.toDto()
            filterObject != null -> (filterObject as? DataProcessorDto)
            returnObject != null -> (returnObject as? DataProcessorDto)
            else -> null
        }
    }

    private fun getPipelineConfigFromContext(pipelineId: UUID? = null): PipelineConfigDto? {
        return when {
            pipelineId != null -> pipelineConfigRepository.findByIdOrNull(pipelineId)?.toDto()
            filterObject != null -> (filterObject as? PipelineConfigDto)
            returnObject != null -> (returnObject as? PipelineConfigDto)
            else -> null
        }
    }
}
