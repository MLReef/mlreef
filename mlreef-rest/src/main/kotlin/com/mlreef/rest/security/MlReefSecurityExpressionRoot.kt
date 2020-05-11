package com.mlreef.rest.security

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.helpers.DataClassWithId
import org.springframework.security.access.expression.SecurityExpressionRoot
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations
import org.springframework.security.core.Authentication
import java.util.UUID

class MlReefSecurityExpressionRoot(authentication: Authentication)
    : SecurityExpressionRoot(authentication), MethodSecurityExpressionOperations {

    private var returnObject: Any? = null
    private var filterObject: Any? = null
    private var target: Any? = null

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

    fun isCurrentUserInResultGroup(): Boolean {
        val id = (returnObject as? DataClassWithId)?.id
        return if (id != null) isCurrentUserInGroup(id) else false
    }

    fun isUserInGroup(groupId: UUID): Boolean {
        return ((this.principal as? TokenDetails)?.groups?.containsKey(groupId) ?: false)
    }

    fun isUserItself(userId: UUID?): Boolean {
        return if (userId!=null) ((this.principal as? TokenDetails)?.accountId == userId) else false
    }

    fun isUserItself(userGitlabId: Long?): Boolean {
        return if (userGitlabId!=null) (this.principal as? TokenDetails)?.gitlabUser?.id == userGitlabId else false
    }

    fun isUserItself(userName: String?): Boolean {
        return if (userName!=null) (this.principal as? TokenDetails)?.username == userName else false
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

//    fun hasAccessToExplorable(projectId: UUID, minAccessLevel: String) : Boolean {
//
//    }

    fun isCurrentUserInResultProject(): Boolean {
        val id = (returnObject as? DataClassWithId)?.id
        return if (id != null) isCurrentUserInProject(id) else false
    }

    fun canCreateProject(): Boolean {
        return ((this.principal as? TokenDetails)?.gitlabUser?.canCreateProject ?: false)
    }

    fun canCreateGroup(): Boolean {
        return ((this.principal as? TokenDetails)?.gitlabUser?.canCreateGroup ?: false)
    }

    fun filterProjectByAccessLevel(minAccessLevel: String): Boolean {
        val id = (filterObject as? DataClassWithId)?.id
        return if (id != null) hasAccessToProject(id, minAccessLevel) else false
    }

    fun filterProjectByUserInProject(): Boolean {
        val id = (filterObject as? DataClassWithId)?.id
        return if (id != null) isCurrentUserInProject(id) else false
    }

    fun filterGroupByAccessLevel(minAccessLevel: String): Boolean {
        val id = (filterObject as? DataClassWithId)?.id
        return if (id != null) hasAccessToGroup(id, minAccessLevel) else false
    }

    fun filterGroupByUserInGroup(): Boolean {
        val id = (filterObject as? DataClassWithId)?.id
        return if (id != null) isCurrentUserInGroup(id) else false
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
