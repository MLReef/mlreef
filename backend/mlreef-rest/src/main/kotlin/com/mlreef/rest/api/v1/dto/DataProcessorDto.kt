package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.MetricType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.helpers.DataClassWithId
import java.time.ZonedDateTime
import java.util.UUID

data class DataProcessorDto(
    override val id: UUID,
    val slug: String,
    val name: String? = null,
    val inputDataType: DataType,
    val outputDataType: DataType,
    val type: DataProcessorType,
    val visibilityScope: VisibilityScope,
    val description: String,
    val codeProjectId: UUID?,
    val authorId: UUID?
) : DataClassWithId


internal fun DataProcessor.toDto(): DataProcessorDto =
    DataProcessorDto(
        id = this.id,
        slug = this.slug,
        name = this.name,
        description = this.description,
        type = this.type,
        authorId = this.author?.id,
        inputDataType = this.inputDataType,
        outputDataType = this.outputDataType,
        visibilityScope = this.visibilityScope,
        codeProjectId = this.codeProjectId
    )

data class ProcessorVersionDto(
    override val id: UUID,
    val slug: String,
    val name: String? = null,
    val inputDataType: DataType,
    val outputDataType: DataType,
    val type: DataProcessorType,
    val visibilityScope: VisibilityScope,
    val description: String,
    val codeProjectId: UUID?,
    val dataProcessorId: UUID?,
    val authorId: UUID?,
    val publisherId: UUID?,
    val metricType: MetricType,
    val parameters: List<ParameterDto> = arrayListOf(),
    val number: Long,
    val branch: String,
    val command: String,
    val baseEnvironment: BaseEnvironmentsDto? = null,
    val pipelineJobInfo: PipelineJobInfoDto? = null,
    val publishedAt: ZonedDateTime? = null
) : DataClassWithId

internal fun ProcessorVersion.toDto(): ProcessorVersionDto =
    ProcessorVersionDto(
        id = this.id,
        slug = this.dataProcessor.slug,
        name = this.dataProcessor.name,
        description = this.dataProcessor.description,
        type = this.dataProcessor.type,
        metricType = metricSchema.metricType,
        authorId = this.dataProcessor.author?.id,
        dataProcessorId = this.dataProcessor.id,
        inputDataType = this.dataProcessor.inputDataType,
        outputDataType = this.dataProcessor.outputDataType,
        visibilityScope = this.dataProcessor.visibilityScope,
        codeProjectId = this.dataProcessor.codeProjectId,
        parameters = this.parameters.map(ProcessorParameter::toDto),
        publisherId = this.publishingInfo?.publisher?.id,
        pipelineJobInfo = this.pipelineJobInfo?.toDto(),
        baseEnvironment = this.baseEnvironment?.toBaseEnvironmentsDto(),
        branch = this.branch,
        command = this.command,
        number = this.number,
        publishedAt = this.publishingInfo?.publishedAt
    )