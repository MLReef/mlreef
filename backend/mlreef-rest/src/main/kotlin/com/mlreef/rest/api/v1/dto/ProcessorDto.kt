package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.MetricsSchema
import com.mlreef.rest.domain.Parameter
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.exceptions.InternalException
import java.time.Instant
import java.util.UUID

//@JsonInclude(JsonInclude.Include.NON_NULL)
data class ProcessorDto(
    override val id: UUID,
    val slug: String? = null,
    val name: String? = null,
    val inputDataType: List<String>,
    val outputDataType: List<String>,
    val type: String,
    val visibilityScope: VisibilityScope,
    val description: String? = null,
    val codeProjectId: UUID,
    val authorId: UUID?,
    val branch: String,
    val version: String,
    val publishStartedAt: Instant?,
    val publishFinishedAt: Instant? = null,
    val status: String? = null,
    val modelType: String? = null,
    val mlCategory: String? = null,
    val environment: BaseEnvironmentsDto?,
    val parameters: List<ProcessorParameterDto>,
    val metricsSchema: MetricsSchemaDto? = null,
) : DataClassWithId

data class ProcessorParameterDto(
    override val id: UUID,
    val name:String,
    val type: String,
    val order: Int,
    val defaultValue: String? = null,
    val required: Boolean,
    val group: String,
    val description: String? = null,
) : DataClassWithId

data class MetricsSchemaDto(
    val metricType: String?,
    val groundTruth: String,
    val prediction: String,
)

fun Processor.toDto(): ProcessorDto {
    this.codeProject ?: throw InternalException("Processor is not connected to code project")

    return ProcessorDto(
        this.id,
        this.codeProject!!.slug,
        this.name ?: "${this.codeProject!!.name} ${this.branch} processor",
        this.codeProject!!.inputDataTypes.map { it.name },
        this.codeProject!!.outputDataTypes.map { it.name },
        this.codeProject!!.processorType.name,
        this.codeProject!!.visibilityScope,
        this.description,
        this.codeProject!!.id,
        this.publisher?.id,
        this.branch,
        this.version ?: "",
        this.publishedAt,
        this.jobFinishedAt,
        this.status.name,
        this.codeProject!!.modelType,
        this.codeProject!!.mlCategory,
        this.baseEnvironment?.toBaseEnvironmentsDto(),
        this.parameters.map { it.toParameterDto() },
        this.metricSchema?.toDto()
    )
}

fun Parameter.toParameterDto() = ProcessorParameterDto(
    this.id,
    this.name,
    this.parameterType?.name ?: "UNDEFINED",
    this.order,
    this.defaultValue,
    this.required,
    this.group,
    this.description
)

fun MetricsSchema.toDto() = MetricsSchemaDto(
    this.metricType.name,
    this.groundTruth,
    this.prediction
)