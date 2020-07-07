package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.ParameterInstance
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
        name = this.processorParameter.name,
        value = this.value,
        type = this.processorParameter.type.name,
        description = this.processorParameter.description ?: "",
        required = this.processorParameter.required
    )