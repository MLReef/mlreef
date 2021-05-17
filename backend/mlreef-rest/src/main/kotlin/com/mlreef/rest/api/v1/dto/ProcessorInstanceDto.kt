package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.ProcessorInstance
import java.util.UUID

data class ProcessorInstanceDto(
    val id: UUID? = null,
    val name: String? = null,
    val slug: String? = null,
    val projectId: UUID? = null,
    val branch: String? = null,
    val version: String? = null,
    val parameters: List<ParameterInstanceDto> = arrayListOf(),
)

internal fun ProcessorInstance.toDto() = ProcessorInstanceDto(
    id = this.id,
    slug = this.slug ?: "",
    name = this.name,
    parameters = this.parameterInstances.map(com.mlreef.rest.domain.ParameterInstance::toDto),
    branch = this.processor.branch,
    version = this.processor.version,
    projectId = this.processor.codeProject?.id,
)