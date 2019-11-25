package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.PerformanceMetrics
import com.mlreef.rest.api.Dto
import com.mlreef.rest.api.DtoRequest
import com.mlreef.rest.exceptions.RestException
import java.time.LocalDateTime
import java.util.*
import javax.validation.Valid

@Dto
class RestExceptionResponse(
    val errorCode: Int,
    val errorName: String,
    val errorMessage: String,
    val time: LocalDateTime = LocalDateTime.now()
) {
    constructor(
        restException: RestException,
        time: LocalDateTime = LocalDateTime.now()
    ) : this(
        restException.errorCode,
        restException.errorName,
        restException.message.orEmpty(),
        time
    )
}

@Dto
class UserDto(
    val id: UUID,
    val username: String,
    val email: String,
    val token: String
)


@DtoRequest
class LoginRequest(
    @Valid
    val username: String?,
    @Valid
    val email: String?,
    @Valid()
    val password: String
)

@DtoRequest
class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val name: String
)

@Dto
class ParameterDto(
    val name: String,
    val type: String,
    val value: String
)

@Dto
class DataProcessorDto(
    val parameters: List<ParameterDto> = arrayListOf()
)

@DtoRequest
class ExperimentCreateRequest(
    val ownerId: UUID,
    val dataProjectId: UUID,
    val branch: String,
    val preProcessing: List<DataProcessorDto>? = arrayListOf(),
    val postProcessing: List<DataProcessorDto>? = arrayListOf(),
    val processing: List<DataProcessorDto>? = arrayListOf()
)

@Dto
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