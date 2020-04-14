package com.mlreef.rest.security

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.external_api.gitlab.TokenDetails
import org.springframework.security.access.expression.SecurityExpressionRoot
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.security.core.Authentication
import java.util.UUID

class MlReefSecurityExpressionRoot(authentication: Authentication)
    : SecurityExpressionRoot(authentication), MethodSecurityExpressionOperations {

    private lateinit var returnObject: Any
    private lateinit var filterObject: Any
    private lateinit var target: Any

    fun isGitlabAdmin(): Boolean {
        return (this.principal as? TokenDetails)?.gitlabUser?.isAdmin ?: false
    }

    fun isGroupOwner(groupId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.groups?.get(groupId)?.accessCode
            ?: 0) == AccessLevel.OWNER.accessCode
    }

    fun hasAccessToGroup(groupId: UUID, minAccessLevel: String): Boolean {
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return ((this.principal as? TokenDetails)?.groups?.get(groupId)?.accessCode ?: 0) >= level.accessCode
    }

    fun isCurrentUserInGroup(groupId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.groups?.containsKey(groupId) ?: false)
    }

    fun isUserInGroup(groupId: UUID, userId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.groups?.containsKey(groupId) ?: false)
    }

    fun isUserItself(userId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.accountId == userId)
    }

    fun isProjectOwner(projectId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.projects?.get(projectId)?.accessCode
            ?: 0) == AccessLevel.OWNER.accessCode
    }

    fun hasAccessToProject(projectId: UUID, minAccessLevel: String): Boolean {
        val level = AccessLevel.valueOf(minAccessLevel.toUpperCase())
        return ((this.principal as? TokenDetails)?.projects?.get(projectId)?.accessCode ?: 0) >= level.accessCode
    }

    fun isCurrentUserInProject(projectId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.projects?.containsKey(projectId) ?: false)
    }

    fun canCreateProject(): Boolean {
        return ((this.principal as? TokenDetails)?.gitlabUser?.canCreateProject ?: false)
    }

    fun canCreateGroup(): Boolean {
        return ((this.principal as? TokenDetails)?.gitlabUser?.canCreateGroup ?: false)
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


}
