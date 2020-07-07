package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.ProjectCreationLevel
import com.mlreef.rest.external_api.gitlab.SubgroupCreationLevel
import java.io.Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonInclude(JsonInclude.Include.NON_NULL)
class GitlabGroup(
    val id: Long,
    val webUrl: String,
    val name: String,
    val path: String,
    val description: String = "",
    val visibility: GitlabVisibility = GitlabVisibility.PRIVATE,
    val shareWithGroupLock: Boolean = false,
    val requireTwoFactorAuthentication: Boolean = false,
    val twoFactorGracePeriod: Int = 48,
    val projectCreationLevel: ProjectCreationLevel = ProjectCreationLevel.DEVELOPER,
    val autoDevopsEnabled: Boolean? = null,
    val subgroupCreationLevel: SubgroupCreationLevel = SubgroupCreationLevel.MAINTAINER,
    val emailsDisabled: Boolean? = null,
    val lfsEnabled: Boolean = true,
    val avatarUrl: String? = null,
    val requestAccessEnabled: Boolean = true,
    val fullName: String = "",
    val fullPath: String = "",
    val parentId: Int? = null
    //TODO: There are two fields missing: projects and shared_projects. Need to know wherever ignore them or not
) : Serializable
