package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.Parameter
import com.mlreef.rest.exceptions.InternalException
import javax.validation.constraints.NotEmpty

data class ParameterDto(
    @get:NotEmpty val name: String,
    @get:NotEmpty val type: String,
    @get:NotEmpty val required: Boolean = true,
    val order: Int?,
    val defaultValue: String = "",
    val description: String? = null
)

internal fun Parameter.toDto(): ParameterDto =
    ParameterDto(
        name = this.name,
        type = this.parameterType?.name
            ?: throw InternalException("Parameter ${this.name}(${this.id}) has no type"),
        required = this.required,
        defaultValue = this.defaultValue,
        order = this.order,
        description = this.description
    )