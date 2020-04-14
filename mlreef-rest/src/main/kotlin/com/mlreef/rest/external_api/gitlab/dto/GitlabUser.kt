package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.mlreef.rest.external_api.gitlab.GitlabActivityState
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import org.springframework.context.annotation.Scope
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@Scope("session")
class GitlabUser(
    val id: Long,
    val username: String = "",
    val name: String = "",
    val email: String = "",
    val publicEmail: String = "",
    val state: String = "",
//    val organization: String = "",
    val avatarUrl: String = "",
    val weburlUrl: String = "",
    val isAdmin: Boolean = false,
    val canCreateGroup: Boolean = true,
    val canCreateProject: Boolean = true,
    val privateProfile: Boolean = true
) : Serializable

fun GitlabUserInProject.toGitlabUser(): GitlabUser {
    return GitlabUser(this.id, this.username, this.name, "", "", this.state.name, this.avatarUrl, this.webUrl, false)
}

fun GitlabUser.toGitlabUserInProject(accessLevel: GroupAccessLevel): GitlabUserInProject {
    return GitlabUserInProject(this.id, this.weburlUrl, this.name, this.username, GitlabActivityState.ACTIVE, this.avatarUrl, accessLevel)
}
