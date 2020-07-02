package com.mlreef.rest.security

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.api.v1.dto.DataProcessorDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
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
    private val pipelineInstanceRepository: PipelineInstanceRepository)
    : SecurityExpressionRoot(authentication), MethodSecurityExpressionOperations {

    private var returnObject: Any? = null
    private var filterObject: Any? = null
    private var target: Any? = null

    // Common security check
    fun isGitlabAdmin(): Boolean = (this.principal as? TokenDetails)?.gitlabUser?.isAdmin ?: false

    fun isVisitor(): Boolean = (this.principal as? TokenDetails)?.isVisitor ?: false

    fun isUserItself(userId: UUID?): Boolean = if (userId != null) ((this.principal as? TokenDetails)?.accountId == userId) else false

    fun isUserItself(userGitlabId: Long?): Boolean = if (userGitlabId != null) (this.principal as? TokenDetails)?.gitlabUser?.id == userGitlabId else false

    fun isUserItself(userName: String?): Boolean = if (userName != null) (this.principal as? TokenDetails)?.username == userName else false

    fun isUserItselfByToken(token: String?): Boolean {
        return if (token != null) {
            (this.principal as? TokenDetails)?.accessToken == token
                || (this.principal as? TokenDetails)?.permanentToken == token
        } else false
    }

    // Groups' security
    fun isGroupOwner(groupId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.groups?.get(groupId)?.accessCode
            ?: 0) == AccessLevel.OWNER.accessCode
    }

    fun hasAccessToGroup(groupId: UUID, minAccessLevel: String): Boolean {
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return ((this.principal as? TokenDetails)?.groups?.get(groupId)?.accessCode ?: 0) >= level.accessCode
    }

    fun userInGroup(): Boolean {
        val id = getIdFromContext()
        return if (id != null) userInGroup(id) else false
    }

    fun userInGroup(groupId: UUID): Boolean = ((this.principal as? TokenDetails)?.groups?.containsKey(groupId) ?: false)

    fun canCreateGroup(): Boolean = ((this.principal as? TokenDetails)?.gitlabUser?.canCreateGroup ?: false)

    // Projects' security
    fun isProjectOwner(projectId: UUID): Boolean {
        val tokenDetails = this.principal as? TokenDetails
        val projects = tokenDetails?.projects
        val accessLevel = projects?.get(projectId)
        return (accessLevel?.accessCode ?: 0) == AccessLevel.OWNER.accessCode
    }

    fun hasAccessToProject(projectId: UUID, minAccessLevel: String): Boolean {
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return ((this.principal as? TokenDetails)?.projects?.get(projectId)?.accessCode ?: 0) >= level.accessCode
    }

    fun canViewProject() = userInProject() || userInProject()
    fun canViewProject(projectId: UUID) = userInProject(projectId) || userInProject(projectId)

    fun userInProject(): Boolean {
        val id = getIdFromContext()
        return if (id != null) userInProject(id) else false
    }

    fun userInProject(projectId: UUID): Boolean = ((this.principal as? TokenDetails)?.projects?.containsKey(projectId)
        ?: false)

    fun projectIsPublic(): Boolean {
        val id = getIdFromContext()
        return if (id != null) projectIsPublic(id) else false
    }

    fun projectIsPublic(projectId: UUID): Boolean {
        return publicProjectsCache.isProjectPublic(projectId)
    }

    fun canCreateProject(): Boolean = ((this.principal as? TokenDetails)?.gitlabUser?.canCreateProject ?: false)

    //Data processors' security
    fun userInDataProcessor(dataProcessorId: UUID): Boolean {
        val processor = getDataProcessorFromContext(dataProcessorId)
        return if (processor != null && processor.codeProjectId != null) userInProject(processor.codeProjectId) else false
    }

    fun userInDataProcessor(): Boolean {
        val processor = getDataProcessorFromContext()
        return if (processor != null && processor.codeProjectId != null) userInProject(processor.codeProjectId) else false
    }

    fun dataProcessorIsPublic(dataProcessorId: UUID): Boolean {
        val processor = getDataProcessorFromContext(dataProcessorId)
        return if (processor != null && processor.codeProjectId != null) projectIsPublic(processor.codeProjectId) else false
    }

    fun dataProcessorIsPublic(): Boolean {
        val processor = getDataProcessorFromContext()
        return if (processor != null && processor.codeProjectId != null) projectIsPublic(processor.codeProjectId) else false
    }

    //Pipeline configs' security
    fun userInPipeline(pipelineConfigId: UUID): Boolean {
        val config = getPipelineConfigFromContext(pipelineConfigId)
        return if (config != null) userInProject(config.dataProjectId) else false
    }

    fun userInPipeline(): Boolean {
        val config = getPipelineConfigFromContext()
        return if (config != null) userInProject(config.dataProjectId) else false
    }

    fun pipelineIsPublic(pipelineConfigId: UUID): Boolean {
        val config = getPipelineConfigFromContext(pipelineConfigId)
        return if (config != null) projectIsPublic(config.dataProjectId) else false
    }

    fun pipelineIsPublic(): Boolean {
        val config = getPipelineConfigFromContext()
        return if (config != null) projectIsPublic(config.dataProjectId) else false
    }

    fun hasAccessToPipeline(pipelineId: UUID, minAccessLevel: String): Boolean {
        val config = getPipelineConfigFromContext(pipelineId)
        return if (config != null) hasAccessToProject(config.dataProjectId, minAccessLevel) else false
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
