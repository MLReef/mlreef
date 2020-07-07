package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.time.LocalDateTime
import java.time.ZonedDateTime

// TODO check datatypes for all fields
@JsonIgnoreProperties(ignoreUnknown = true)
class GitlabPipeline(
    val id: Long,
    val sha: String,
    val ref: String,
    val status: String?,
    val beforeSha: String,
    val user: GitlabUser,
    val createdAt: ZonedDateTime? = null,
    val yamlErrors: Any? = null,
    val updatedAt: ZonedDateTime? = null,
    val startedAt: ZonedDateTime? = null,
    val finishedAt: ZonedDateTime? = null,
    val committedAt: ZonedDateTime? = null,
    val duration: String? = null,
    val coverage: String? =null,
    val webUrl: String? = ""
)
