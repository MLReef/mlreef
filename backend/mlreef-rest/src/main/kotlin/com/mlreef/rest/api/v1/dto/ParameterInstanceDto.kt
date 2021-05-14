package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.ParameterInstance
import javax.validation.constraints.NotEmpty

data class ParameterInstanceDto(
    @get:NotEmpty val name: String,
    @get:NotEmpty val value: String,
    val type: String? = null,
    val required: Boolean = true,
    val description: String = ""
)

internal fun ParameterInstance.toDto(): ParameterInstanceDto =
    ParameterInstanceDto(
        name = this.parameter.name,
        value = this.value,
        type = this.parameter.parameterType?.name ?: this.parameterType?.name,
        description = this.parameter.description ?: "",
        required = this.parameter.required
    )