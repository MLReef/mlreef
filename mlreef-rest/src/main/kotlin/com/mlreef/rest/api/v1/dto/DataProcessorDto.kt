package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.MetricType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.VisibilityScope
import java.util.UUID

data class DataProcessorDto(
    val id: UUID,
    val slug: String,
    val name: String? = null,
    val inputDataType: DataType,
    val outputDataType: DataType,
    val type: DataProcessorType,
    val visibilityScope: VisibilityScope,
    val description: String,
    val codeProjectId: UUID?,
    val authorId: UUID?,
    val metricType: MetricType,
    val parameters: List<ParameterDto> = arrayListOf()
)


internal fun DataProcessor.toDto(): DataProcessorDto =
    DataProcessorDto(
        id = this.id,
        slug = this.slug,
        name = this.name,
        description = this.description,
        type = this.type,
        metricType = metricSchema.metricType,
        authorId = this.author?.id,
        inputDataType = this.inputDataType,
        outputDataType = this.outputDataType,
        visibilityScope = this.visibilityScope,
        codeProjectId = this.codeProjectId,
        parameters = this.parameters.map(ProcessorParameter::toDto)
    )