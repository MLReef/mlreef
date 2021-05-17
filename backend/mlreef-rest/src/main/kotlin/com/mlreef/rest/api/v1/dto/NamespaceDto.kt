package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class NamespaceDto(
    val gitlabId: Long,
    val name: String,
    val fullPath: String,
    val path: String,
)