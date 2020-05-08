package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.PipelineJobInfo
import java.time.ZonedDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class PipelineJobInfoDto(
    val id: Long,
    val ref: String,
    val commitSha: String,
    val createdAt: ZonedDateTime? = null,
    val committedAt: ZonedDateTime? = null,
    val startedAt: ZonedDateTime? = null,
    val updatedAt: ZonedDateTime? = null,
    val finishedAt: ZonedDateTime? = null
)

internal fun PipelineJobInfo.toDto(): PipelineJobInfoDto =
    PipelineJobInfoDto(
        this.gitlabId,
        this.ref,
        this.commitSha,
        this.committedAt,
        this.createdAt,
        this.updatedAt,
        this.startedAt,
        this.finishedAt
    )