package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class RepositoryTree(
    val id: String,
    val name: String,
    val type: RepositoryTreeType,
    val path: String,
    val mode: String,
)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class RepositoryTreePaged(
    val content: List<RepositoryTree>?,
    val page: Int,
    val totalPages: Int,
    val totalElements: Int,
    val perPage: Int,
)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class RepositoryFile(
    val sha: String,
    val size: Long,
    val encoding: String,
    val content: String?,
)
