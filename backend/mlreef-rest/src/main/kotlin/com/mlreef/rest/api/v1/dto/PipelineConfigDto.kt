package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.FileLocation
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.helpers.DataClassWithId
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class PipelineConfigDto(
    override val id: UUID,
    val pipelineType: String,
    val dataProjectId: UUID,
    val slug: String,
    val name: String,
    @get:NotEmpty val sourceBranch: String,
    val targetBranchPattern: String = "",
    @get:Valid val dataOperations: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf(),
    val instances: List<PipelineInstanceDto>? = null
) : DataClassWithId

internal fun PipelineConfig.toDto(instances: List<PipelineInstanceDto>? = null): PipelineConfigDto =
    PipelineConfigDto(
        id = this.id,
        slug = this.slug,
        name = this.name,
        pipelineType = this.pipelineType.name,
        dataProjectId = this.dataProjectId,
        sourceBranch = this.sourceBranch,
        targetBranchPattern = this.targetBranchPattern,
        inputFiles = this.inputFiles.map(FileLocation::toDto),
        dataOperations = this.dataOperations.map(DataProcessorInstance::toDto),
        instances = instances
    )