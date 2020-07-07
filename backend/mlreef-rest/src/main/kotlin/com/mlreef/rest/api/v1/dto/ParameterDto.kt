package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.ProcessorParameter
import javax.validation.constraints.NotEmpty

data class ParameterDto(
    @get:NotEmpty val name: String,
    @get:NotEmpty val type: String,
    @get:NotEmpty val required: Boolean = true,
    val order: Int?,
    val defaultValue: String = "",
    val description: String? = null
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