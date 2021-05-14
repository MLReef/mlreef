package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.Pipeline
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.exceptions.InternalException
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

data class PipelineDto(
    override val id: UUID,
    val pipelineType: String,
    val pipelineConfigId: UUID,
    val dataProjectId: UUID,
    val slug: String,
    val name: String,
    @get:NotEmpty val sourceBranch: String,
    val targetBranch: String,
    @get:Valid val dataOperations: List<ProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf(),
    val number: Int,
    val commit: String? = null,
    val status: String,
    val pipelineJobInfo: PipelineJobInfoDto? = null,
    val createdBy: UUID? = null,
) : DataClassWithId

internal fun Pipeline.toDto(): PipelineDto =
    PipelineDto(
        id = this.id,
        dataProjectId = this.dataProject?.id ?: throw InternalException("Pipeline is detached from Data project"),
        pipelineConfigId = this.pipelineConfiguration?.id
            ?: throw InternalException("Pipeline is detached from Configuration"),
        slug = this.slug,
        name = this.name,
        pipelineType = this.pipelineType?.name ?: throw InternalException("Pipeline has no pipeline type"),
        sourceBranch = this.sourceBranch,
        targetBranch = this.targetBranch,
        inputFiles = this.inputFiles.map(FileLocation::toDto),
        dataOperations = this.processorInstances.map(ProcessorInstance::toDto),
        number = this.number,
        commit = this.commit,
        status = this.status.name,
        pipelineJobInfo = this.pipelineJobInfo?.toDto(),
        createdBy = this.creator?.id,
    )