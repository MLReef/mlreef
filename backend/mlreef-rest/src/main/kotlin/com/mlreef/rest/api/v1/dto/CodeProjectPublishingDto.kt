package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.ProcessorVersion
import java.util.UUID

@JsonInclude(JsonInclude.Include.NON_NULL)
internal data class CodeProjectPublishingDto(
    val id: UUID? = null,
    val branch: String? = null,
    val command: String? = null,
    val environment: BaseEnvironmentsDto? = null,
    val path: String? = null,
    val modelType: String? = null,
    val mlCategory: String? = null,
    val pipelineJobInfo: PipelineJobInfoDto? = null,
)

internal fun ProcessorVersion.toPublishingPipelineDto() = CodeProjectPublishingDto(
    this.id,
    this.branch,
    this.command,
    this.baseEnvironment?.toBaseEnvironmentsDto(),
    this.path,
    this.modelType,
    this.mlCategory,
    this.pipelineJobInfo?.toDto()
)
