package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.PublishingInfo
import java.time.ZonedDateTime
import java.util.UUID

@JsonInclude(JsonInclude.Include.NON_NULL)
data class CodeProjectPublishingDto(
    val id: UUID? = null,
    val branch: String? = null,
    val command: String? = null,
    val environment: BaseEnvironmentsDto? = null,
    val path: String? = null,
    val modelType: String? = null,
    val mlCategory: String? = null,
    val publishInfo: PublishingInfoDto? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class PublishingInfoDto(
    val commitSha: String? = null,
    val publishedAt: ZonedDateTime? = null,
    val publishedBy: UUID? = null
)

fun ProcessorVersion.toPublishingPipelineDto() = CodeProjectPublishingDto(
    this.id,
    this.branch,
    this.command,
    this.baseEnvironment?.toBaseEnvironmentsDto(),
    this.path,
    this.modelType,
    this.mlCategory,
    this.publishingInfo?.toPublishingInfoDto()
)

fun PublishingInfo.toPublishingInfoDto() = PublishingInfoDto(
    this.commitSha,
    this.publishedAt,
    this.publisher?.id
)