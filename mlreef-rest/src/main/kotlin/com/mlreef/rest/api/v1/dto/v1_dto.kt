package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.PerformanceMetrics
import java.util.*

class ParameterDto(
        val name: String,
        val type: String,
        val value: String
)

class DataProcessorDto(
        val parameters: List<ParameterDto> = arrayListOf()
)

class ExperimentCreateRequest(
        val ownerId: UUID,
        val dataProjectId: UUID,
        val branch: String,
        val preProcessing: List<DataProcessorDto>? = arrayListOf(),
        val postProcessing: List<DataProcessorDto>? = arrayListOf(),
        val processing: List<DataProcessorDto>? = arrayListOf()
)

class ExperimentCreateResponse(
        val id: UUID,
        val ownerId: UUID,
        val dataRepository: UUID,
        val branch: String,
        val performanceMetrics: PerformanceMetrics? = null,
        val preProcessing: List<DataProcessorDto>? = arrayListOf(),
        val postProcessing: List<DataProcessorDto>? = arrayListOf(),
        val processing: List<DataProcessorDto>? = arrayListOf()
)