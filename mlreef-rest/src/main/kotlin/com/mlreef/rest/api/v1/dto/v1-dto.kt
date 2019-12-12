package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.Experiment
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.PerformanceMetrics
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.exceptions.ValidationException
import org.springframework.validation.FieldError
import java.lang.System.currentTimeMillis
import java.time.LocalDateTime
import java.util.*
import javax.validation.Valid
import javax.validation.constraints.Email
import javax.validation.constraints.NotEmpty
import javax.validation.constraints.PositiveOrZero

data class RestExceptionDto(
    val errorCode: Int,
    val errorName: String,
    val errorMessage: String,
    val time: Long = currentTimeMillis()
) {
    constructor(
        restException: RestException,
        time: Long = currentTimeMillis()
    ) : this(
        restException.errorCode,
        restException.errorName,
        restException.message.orEmpty(),
        time
    )
}

class ValidationFailureDto(
    val errorCode: Int,
    val errorName: String,
    val errorMessage: String,
    val validationErrors: Array<FieldError?>,
    val time: LocalDateTime = LocalDateTime.now()
) {
    constructor(
        restException: ValidationException,
        time: LocalDateTime = LocalDateTime.now()
    ) : this(
        restException.errorCode,
        restException.errorName,
        restException.message.orEmpty(),
        restException.validationErrors,
        time
    )
}

data class UserDto(
    val id: UUID,
    val username: String,
    val email: String,
    val token: String
) {
    fun censor(): UserDto {
        return this.copy(token = token.censor())
    }
}

data class LoginRequest(
    val username: String?,
    @get:Email val email: String?,
    @get:NotEmpty val password: String
)

data class RegisterRequest(
    @get:NotEmpty val username: String,
    @get:Email @get:NotEmpty val email: String,
    @get:NotEmpty val password: String,
    @get:NotEmpty val name: String
)

data class ParameterDto(
    @get:NotEmpty val name: String,
    @get:NotEmpty val type: String
)

data class ParameterInstanceDto(
    @get:NotEmpty val name: String,
    @get:NotEmpty val value: String,
    val type: String? = null
)

data class DataProcessorDto(
    @get:Valid val parameters: List<ParameterDto> = arrayListOf()
)

data class DataProcessorInstanceDto(
    @get:NotEmpty val slug: String,
    @get:Valid val parameters: List<ParameterInstanceDto> = arrayListOf(),
    val name: String? = null
)

data class PerformanceMetricsDto(
    @get:PositiveOrZero val jobStartedAt: Long = 0,
    @get:PositiveOrZero val jobUpdatedAt: Long = 0,
    @get:PositiveOrZero val jobFinishedAt: Long = 0,
    val jsonBlob: String = "")

class ExperimentDto(
    val id: UUID,
    val dataProjectId: UUID,
    val branch: String,
    val performanceMetrics: PerformanceMetricsDto? = null,
    @get:Valid val preProcessing: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val postProcessing: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val processing: DataProcessorInstanceDto? = null
)

internal fun Experiment.toDto(): ExperimentDto {
    return ExperimentDto(
        this.id,
        this.dataProjectId,
        this.branch,
        this.performanceMetrics.toDto(),
        this.preProcessing.toDataProcessorInstanceDtoList(),
        this.postProcessing.toDataProcessorInstanceDtoList(),
        this.getProcessor()?.toDto()
    )
}

internal fun PerformanceMetrics.toDto(): PerformanceMetricsDto? {
    return PerformanceMetricsDto(
        this.jobStartedAt ?: 0,
        this.jobUpdatedAt ?: 0,
        this.jobFinishedAt ?: 0,
        this.jsonBlob
    )
}

internal fun DataProcessorInstance.toDto(): DataProcessorInstanceDto {
    return DataProcessorInstanceDto(
        this.slug,
        this.parameterInstances.toParameterInstanceDtoList(),
        this.name
    )
}

internal fun ParameterInstance.toDto(): ParameterInstanceDto {
    return ParameterInstanceDto(
        this.processorParameter.name,
        this.value,
        this.processorParameter.type.name
    )
}

internal fun DataProcessor.toDto(): DataProcessorDto {
    return DataProcessorDto(this.parameters.toProcessorParameterDtoList())
}

internal fun ProcessorParameter.toDto(): ParameterDto {
    return ParameterDto(this.name, this.type.name)
}

internal fun List<Experiment>.toExperimentDtoList(): List<ExperimentDto> = this.map { it.toDto() }
internal fun List<ParameterInstance>.toParameterInstanceDtoList(): List<ParameterInstanceDto> = this.map { it.toDto() }
internal fun Collection<ProcessorParameter>.toProcessorParameterDtoList(): List<ParameterDto> = this.map { it.toDto() }

internal fun List<DataProcessor>.toDataProcessorDtoList(): List<DataProcessorDto> = this.map { it.toDto() }
internal fun List<DataProcessorInstance>.toDataProcessorInstanceDtoList(): List<DataProcessorInstanceDto> = this.map { it.toDto() }
