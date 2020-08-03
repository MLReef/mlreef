package com.mlreef.rest.external_api.gitlab.dto

import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel

class SharedGroup(
    val groupId: Long,
    val groupName: String,
    val groupFullPath: String? = null,
    val groupAccessLevel: GitlabAccessLevel = GitlabAccessLevel.DEVELOPER,
    val expiresAt: String? = null
)
