package com.mlreef.rest.external_api.gitlab

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.util.UUID

class TokenDetails(
    private val username: String,
    val accessToken: String,
    val accountId: UUID,
    val personId: UUID,
    val valid: Boolean = true,
    val edition: Int = 0,
    val groups: MutableMap<UUID, AccessLevel?> = mutableMapOf(),
    val projects: MutableMap<UUID, AccessLevel?> = mutableMapOf(),
    val gitlabUser: GitlabUser? = null,
    val isVisitor: Boolean = false,
    val authorities: List<out GrantedAuthority> = listOf(),
) : UserDetails {

    override fun getAuthorities(): Collection<out GrantedAuthority> {
        return authorities
    }

    override fun isEnabled(): Boolean {
        return valid
    }

    override fun getUsername(): String {
        return username
    }

    override fun isCredentialsNonExpired(): Boolean {
        return valid
    }

    override fun getPassword(): String {
        return accessToken
    }

    override fun isAccountNonExpired(): Boolean {
        return valid
    }

    override fun isAccountNonLocked(): Boolean {
        return valid
    }
}



