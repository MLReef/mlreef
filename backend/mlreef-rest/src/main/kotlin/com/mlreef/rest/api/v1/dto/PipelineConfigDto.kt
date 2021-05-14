package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.exceptions.InternalException
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
    @get:Valid val dataOperations: List<ProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf(),
    val instances: List<PipelineDto>? = null,
    val createdBy: UUID? = null,
) : DataClassWithId

internal fun PipelineConfiguration.toDto(): PipelineConfigDto =
    PipelineConfigDto(
        id = this.id,
        slug = this.slug,
        name = this.name,
        pipelineType = this.pipelineType?.name
            ?: throw InternalException("Pipeline configuration has no pipeline type"),
        dataProjectId = this.dataProject?.id
            ?: throw InternalException("Pipeline configuration ${this.id} is detached from Data project"),
        sourceBranch = this.sourceBranch,
        targetBranchPattern = this.targetBranchPattern,
        inputFiles = this.inputFiles.map(FileLocation::toDto),
        dataOperations = this.processorInstances.map(ProcessorInstance::toDto),
        instances = this.pipelines.map(com.mlreef.rest.domain.Pipeline::toDto),
        createdBy = this.creator?.id,
    )