package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import com.mlreef.rest.external_api.gitlab.GitlabActivityState
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
class GitlabUserInGroup(
    val id: Long,
    val webUrl: String,
    val name: String,
    val username: String,
    val state: GitlabActivityState = GitlabActivityState.ACTIVE,
    val avatarUrl: String = "",
    val accessLevel: GitlabAccessLevel = GitlabAccessLevel.DEVELOPER,
    val expiresAt: String? = null
) : Serializable
