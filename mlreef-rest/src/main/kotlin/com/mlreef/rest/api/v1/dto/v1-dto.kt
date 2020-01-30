package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProject
import com.mlreef.rest.Experiment
import com.mlreef.rest.I18N
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.PerformanceMetrics
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.exceptions.ValidationException
import org.springframework.validation.FieldError
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.util.*
import javax.validation.Valid
import javax.validation.constraints.Email
import javax.validation.constraints.NotEmpty
import javax.validation.constraints.PositiveOrZero

data class RestExceptionDto(
    val errorCode: Int,
    val errorName: String,
    val errorMessage: String,
    val time: ZonedDateTime = I18N.dateTime()
) {
    constructor(
        restException: RestException,
        time: ZonedDateTime = I18N.dateTime()
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
    @get:PositiveOrZero val jobStartedAt: ZonedDateTime? = null,
    @get:PositiveOrZero val jobUpdatedAt: ZonedDateTime? = null,
    @get:PositiveOrZero val jobFinishedAt: ZonedDateTime? = null,
    val jsonBlob: String = ""
)

data class DataProjectDto(
    val id: UUID,
    val slug: String,
    val url: String,
    val ownerId: UUID,
    val gitlabGroup: String,
    val gitlabProject: String,
    val gitlabId: Int,
    val experiments: List<ExperimentDto> = listOf()
)

data class CodeProjectDto(
    val id: UUID,
    val slug: String,
    val url: String,
    val ownerId: UUID,
    val gitlabGroup: String,
    val gitlabProject: String,
    val gitlabId: Int
)


class ExperimentDto(
    val id: UUID,
    val dataProjectId: UUID,
    @get:NotEmpty val sourceBranch: String,
    @get:NotEmpty val targetBranch: String,
    val status: String,
    val performanceMetrics: PerformanceMetricsDto? = null,
    @get:Valid val preProcessing: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val postProcessing: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val processing: DataProcessorInstanceDto? = null
)

internal fun DataProject.toDto() =
    DataProjectDto(
        id = this.id,
        slug = this.slug,
        url = this.url,
        ownerId = this.ownerId,
        gitlabGroup = this.gitlabGroup,
        gitlabProject = this.gitlabProject,
        gitlabId = this.gitlabId,
        experiments = this.experiments.map { it.toDto() }
    )

internal fun CodeProject.toDto() =
    CodeProjectDto(
        id = this.id,
        slug = this.slug,
        url = this.url,
        ownerId = this.ownerId,
        gitlabGroup = this.gitlabGroup,
        gitlabProject = this.gitlabProject,
        gitlabId = this.gitlabId
    )

internal fun Experiment.toDto(): ExperimentDto =
    ExperimentDto(
        id = this.id,
        dataProjectId = this.dataProjectId,
        sourceBranch = this.sourceBranch,
        targetBranch = this.targetBranch,
        status = this.status.name,
        performanceMetrics = this.performanceMetrics.toDto(),
        preProcessing = this.preProcessing.toDataProcessorInstanceDtoList(),
        postProcessing = this.postProcessing.toDataProcessorInstanceDtoList(),
        processing = this.getProcessor()?.toDto()
    )


internal fun PerformanceMetrics.toDto(): PerformanceMetricsDto =
    PerformanceMetricsDto(
        this.jobStartedAt,
        this.jobUpdatedAt,
        this.jobFinishedAt,
        this.jsonBlob
    )

internal fun DataProcessorInstance.toDto(): DataProcessorInstanceDto =
    DataProcessorInstanceDto(
        this.slug,
        this.parameterInstances.toParameterInstanceDtoList(),
        this.name
    )

internal fun ParameterInstance.toDto(): ParameterInstanceDto =
    ParameterInstanceDto(
        this.processorParameter.name,
        this.value,
        this.processorParameter.type.name
    )

internal fun DataProcessor.toDto(): DataProcessorDto =
    DataProcessorDto(this.parameters.toProcessorParameterDtoList())


internal fun ProcessorParameter.toDto(): ParameterDto =
    ParameterDto(this.name, this.type.name)


internal fun List<Experiment>.toExperimentDtoList(): List<ExperimentDto> = this.map { it.toDto() }
internal fun List<DataProject>.toDataProjectDtoList(): List<DataProjectDto> = this.map { it.toDto() }
internal fun List<CodeProject>.toCodeProjectDtoList(): List<CodeProjectDto> = this.map { it.toDto() }
internal fun List<ParameterInstance>.toParameterInstanceDtoList(): List<ParameterInstanceDto> = this.map { it.toDto() }
internal fun Collection<ProcessorParameter>.toProcessorParameterDtoList(): List<ParameterDto> = this.map { it.toDto() }

internal fun List<DataProcessor>.toDataProcessorDtoList(): List<DataProcessorDto> = this.map { it.toDto() }
internal fun List<DataProcessorInstance>.toDataProcessorInstanceDtoList(): List<DataProcessorInstanceDto> = this.map { it.toDto() }
