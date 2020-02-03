package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.mlreef.rest.external_api.gitlab.NamespaceKind

@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabNamespace(
    val id: Long,
    val name: String,
    val path: String,
    val kind: NamespaceKind = NamespaceKind.USER,
    val fullPath: String = "",
    val parentId: Long? = null,
    val avatarUrl: String? = null,
    val webUrl: String? = null
)
