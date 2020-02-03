package com.mlreef.rest.external_api.gitlab.dto

import com.mlreef.rest.external_api.gitlab.GroupAccessLevel

class SharedGroup(
    val groupId: Long,
    val groupName: String,
    val groupFullPath: String? = null,
    val groupAccessLevel: GroupAccessLevel = GroupAccessLevel.DEVELOPER
)
