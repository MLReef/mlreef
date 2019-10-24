package com.mlreef.rest.external_api.gitlab

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class GitlabUserDetails(
        val token: String,
        val valid: Boolean = false,
        private val gitlabUser: GitlabUser? = null
) : UserDetails {


    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return arrayListOf()
    }

    override fun isEnabled(): Boolean {
        return valid
    }

    override fun getUsername(): String {
        return gitlabUser?.username ?: ""
    }

    override fun isCredentialsNonExpired(): Boolean {
        return valid
    }

    override fun getPassword(): String {
        return ""
    }

    override fun isAccountNonExpired(): Boolean {
        return valid
    }

    override fun isAccountNonLocked(): Boolean {
        return valid
    }

}



