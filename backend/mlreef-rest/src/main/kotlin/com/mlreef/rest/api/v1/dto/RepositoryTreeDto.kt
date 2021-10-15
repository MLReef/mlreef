package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.external_api.gitlab.dto.RepositoryTree

data class RepositoryTreeDto(
    val id: String? = null,
    val name: String,
    val type: String,
    val path: String,
    val mode: String? = null,
)

fun RepositoryTree.toDto() = RepositoryTreeDto(
    this.id,
    this.name,
    this.type.name,
    this.path,
    this.mode,
)