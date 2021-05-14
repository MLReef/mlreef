package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable
import java.time.Instant

@JsonIgnoreProperties(ignoreUnknown = true)
data class GitlabRegistry(
    val id: Long,
    val name: String? = null,
    val path: String? = null,
    val projectId: Long,
    val location: String? = null,
    val createdAt: Instant? = null,
    val cleanupPolicyStartedAt: Instant? = null,
) : Serializable

