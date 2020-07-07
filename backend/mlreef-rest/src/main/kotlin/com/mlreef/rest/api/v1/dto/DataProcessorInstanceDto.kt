package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.ParameterInstance
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

data class DataProcessorInstanceDto(
    @get:NotEmpty val slug: String,
    @get:Valid val parameters: List<ParameterInstanceDto> = arrayListOf(),
    val id: UUID? = null,
    val name: String? = null
)

internal fun DataProcessorInstance.toDto(): DataProcessorInstanceDto =
    DataProcessorInstanceDto(
        id = this.id,
        slug = this.slug,
        name = this.name,
        parameters = this.parameterInstances.map(ParameterInstance::toDto)
    )