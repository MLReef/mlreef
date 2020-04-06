package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.Experiment
import com.mlreef.rest.FileLocation
import com.mlreef.rest.I18N
import com.mlreef.rest.MetricType
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.PerformanceMetrics
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.VisibilityScope
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
    @get:NotEmpty val type: String,
    @get:NotEmpty val required: Boolean = true,
    val order: Int?,
    val defaultValue: String = "",
    val description: String? = null
)

data class ParameterInstanceDto(
    @get:NotEmpty val name: String,
    @get:NotEmpty val value: String,
    val type: String? = null,
    val required: Boolean = true,
    val description: String = ""
)

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

data class PipelineConfigDto(
    val id: UUID,
    val pipelineType: String,
    val dataProjectId: UUID,
    val slug: String,
    val name: String,
    @get:NotEmpty val sourceBranch: String,
    val targetBranchPattern: String = "",
    @get:Valid val dataOperations: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf()
)

data class PipelineInstanceDto(
    val id: UUID,
    val pipelineType: String,
    val pipelineConfigId: UUID,
    val dataProjectId: UUID,
    val slug: String,
    val name: String,
    @get:NotEmpty val sourceBranch: String,
    val targetBranch: String,
    @get:Valid val dataOperations: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf(),
    val number: Int,
    val commit: String? = null,
    val status: String
)

data class FileLocationDto(
    val location: String,
    val locationType: String = "PATH"
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
        preProcessing = this.preProcessing.map(DataProcessorInstance::toDto),
        postProcessing = this.postProcessing.map(DataProcessorInstance::toDto),
        processing = this.getProcessor()?.toDto()
    )


internal fun PerformanceMetrics.toDto(): PerformanceMetricsDto =
    PerformanceMetricsDto(
        this.jobStartedAt,
        this.jobUpdatedAt,
        this.jobFinishedAt,
        this.jsonBlob
    )

internal fun PipelineConfig.toDto(): PipelineConfigDto =
    PipelineConfigDto(
        id = this.id,
        slug = this.slug,
        name = this.name,
        pipelineType = this.pipelineType.name,
        dataProjectId = this.dataProjectId,
        sourceBranch = this.sourceBranch,
        targetBranchPattern = this.targetBranchPattern,
        inputFiles = this.inputFiles.map(FileLocation::toDto),
        dataOperations = this.dataOperations.map(DataProcessorInstance::toDto)
    )

internal fun PipelineInstance.toDto(): PipelineInstanceDto =
    PipelineInstanceDto(
        id = this.id,
        dataProjectId = this.dataProjectId,
        pipelineConfigId = this.pipelineConfigId,
        slug = this.slug,
        name = this.name,
        pipelineType = this.pipelineType.name,
        sourceBranch = this.sourceBranch,
        targetBranch = this.targetBranch,
        inputFiles = this.inputFiles.map(FileLocation::toDto),
        dataOperations = this.dataOperations.map(DataProcessorInstance::toDto),
        number = this.number,
        commit = this.commit,
        status = this.status.name
    )

internal fun FileLocation.toDto(): FileLocationDto =
    FileLocationDto(
        location = this.location,
        locationType = this.locationType.name
    )

internal fun DataProcessorInstance.toDto(): DataProcessorInstanceDto =
    DataProcessorInstanceDto(
        this.slug,
        this.parameterInstances.map(ParameterInstance::toDto),
        this.name
    )

internal fun ParameterInstance.toDto(): ParameterInstanceDto =
    ParameterInstanceDto(
        this.processorParameter.name,
        this.value,
        this.processorParameter.type.name
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


internal fun ProcessorParameter.toDto(): ParameterDto =
    ParameterDto(
        name = this.name,
        type = this.type.name,
        required = this.required,
        defaultValue = this.defaultValue,
        order = this.order,
        description = this.description
    )


