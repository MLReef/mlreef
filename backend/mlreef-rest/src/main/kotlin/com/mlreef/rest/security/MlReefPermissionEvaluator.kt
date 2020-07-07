package com.mlreef.rest.security

import org.springframework.security.access.PermissionEvaluator
import org.springframework.security.core.Authentication
import java.io.Serializable

class MlReefPermissionEvaluator : PermissionEvaluator {
    override fun hasPermission(auth: Authentication?, targetDomainObject: Any?, permission: Any): Boolean {
        if (auth == null || targetDomainObject == null || permission !is String) {
            return false
        }
        val targetType = targetDomainObject.javaClass.simpleName.toUpperCase()
        return hasPrivilege(auth, targetType, permission.toString().toUpperCase())
    }

    override fun hasPermission(auth: Authentication?, targetId: Serializable?, targetType: String?, permission: Any): Boolean {
        return if (auth == null || targetType == null || permission !is String) {
            false
        } else hasPrivilege(auth, targetType.toUpperCase(), permission.toString().toUpperCase())
    }

    private fun hasPrivilege(auth: Authentication, targetType: String, permission: String): Boolean {
        for (grantedAuth in auth.authorities) {
            if (grantedAuth.authority.startsWith(targetType)) {
                if (grantedAuth.authority.contains(permission)) {
                    return true
                }
            }
        }
        return false
    }
}
