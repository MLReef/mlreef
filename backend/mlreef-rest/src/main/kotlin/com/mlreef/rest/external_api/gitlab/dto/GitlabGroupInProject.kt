package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
class GitlabGroupInProject(
    val id: Long,
    val projectId: Long,
    val groupId: Long,
    val groupAccess: GitlabAccessLevel = GitlabAccessLevel.DEVELOPER,
    val expiresAt: String? = null
) : Serializable
