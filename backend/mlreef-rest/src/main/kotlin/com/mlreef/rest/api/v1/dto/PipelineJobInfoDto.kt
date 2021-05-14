package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.domain.PipelineJobInfo
import java.time.Instant

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class PipelineJobInfoDto(
    val id: Long?,
    val ref: String?,
    val commitSha: String,
    val createdAt: Instant? = null,
    val committedAt: Instant? = null,
    val startedAt: Instant? = null,
    val updatedAt: Instant? = null,
    val finishedAt: Instant? = null
)

internal fun PipelineJobInfo.toDto(): PipelineJobInfoDto =
    PipelineJobInfoDto(
        id = this.gitlabId,
        ref = this.ref,
        commitSha = this.commitSha,
        committedAt = this.committedAt,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        startedAt = this.startedAt,
        finishedAt = this.finishedAt
    )