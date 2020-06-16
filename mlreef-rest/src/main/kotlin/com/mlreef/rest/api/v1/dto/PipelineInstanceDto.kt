package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.FileLocation
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.helpers.DataClassWithId
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

data class PipelineInstanceDto(
    override val id: UUID,
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
    val status: String,
    val pipelineJobInfo: PipelineJobInfoDto? = null
) : DataClassWithId

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
        status = this.status.name,
        pipelineJobInfo = this.pipelineJobInfo?.toDto()
    )