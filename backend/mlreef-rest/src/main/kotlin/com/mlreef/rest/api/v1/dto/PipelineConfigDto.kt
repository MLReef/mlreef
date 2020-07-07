package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.FileLocation
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.helpers.DataClassWithId
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

data class PipelineConfigDto(
    override val id: UUID,
    val pipelineType: String,
    val dataProjectId: UUID,
    val slug: String,
    val name: String,
    @get:NotEmpty val sourceBranch: String,
    val targetBranchPattern: String = "",
    @get:Valid val dataOperations: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf()
) : DataClassWithId

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