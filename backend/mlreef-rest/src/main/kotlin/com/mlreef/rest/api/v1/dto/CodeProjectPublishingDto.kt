package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.domain.Processor
import java.time.Instant
import java.util.UUID

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class CodeProjectPublishingDto(
    val id: UUID? = null,
    val projectId: UUID? = null,
    val branch: String? = null,
    val version: String? = null,
    val scriptPath: String? = null,
    val requirementsFile: String? = null,
    val environment: BaseEnvironmentsDto? = null,
    val modelType: String? = null,
    val mlCategory: String? = null,
    val name: String? = null,
    val slug: String? = null,
    val description: String? = null,
    val commitSha: String? = null,
    val publishedAt: Instant? = null,
    val jobStartedAt: Instant? = null,
    val jobFinishedAt: Instant? = null,
    val publishedBy: UUID? = null,
    val status: String? = null,
    val gitlabPipelineId: Long? = null,
    val entryFile: String? = null,
)


fun Processor.toPublishingPipelineDto() = CodeProjectPublishingDto(
    this.id,
    this.codeProject?.id,
    this.branch,
    this.version,
    this.mainScriptPath,
    this.requirementsFilePath,
    this.baseEnvironment?.toBaseEnvironmentsDto(),
    this.codeProject?.modelType,
    this.codeProject?.mlCategory,
    this.name,
    this.slug,
    this.description,
    this.commitSha,
    this.publishedAt,
    this.jobStartedAt,
    this.jobFinishedAt,
    this.publisher?.id,
    this.status.name,
    this.gitlabPipelineId,
    this.mainScriptPath,
)