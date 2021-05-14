package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.Experiment
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.exceptions.InternalException
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

class ExperimentDto(
    override val id: UUID,
    val dataProjectId: UUID,
    val dataInstanceId: UUID?,
    val slug: String,
    val name: String,
    val number: Int,
    @get:NotEmpty val sourceBranch: String,
    @get:NotEmpty val targetBranch: String,
    val status: String,
    val pipelineJobInfo: PipelineJobInfoDto? = null,
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf(),
    @get:Valid val processing: ProcessorInstanceDto? = null,
    @get:Valid val postProcessing: List<ProcessorInstanceDto>? = arrayListOf(),
    val jsonBlob: String = "",
    val createdBy: UUID? = null,
) : DataClassWithId

internal fun Experiment.toDto(): ExperimentDto =
    ExperimentDto(
        id = this.id,
        dataProjectId = this.dataProject?.id ?: throw InternalException("Experiment ${this.id} is not attached to data processor"),
        dataInstanceId = this.pipeline?.id,
        slug = this.slug,
        name = this.name,
        number = this.number ?: 0,
        sourceBranch = this.sourceBranch,
        targetBranch = this.targetBranch,
        inputFiles = this.inputFiles.map(FileLocation::toDto),
        status = this.status.name,
        jsonBlob = this.jsonBlob,
        pipelineJobInfo = this.pipelineJobInfo?.toDto(),
        postProcessing = this.postProcessing.map(ProcessorInstance::toDto),
        processing = this.getProcessor()?.toDto(),
        createdBy = this.creator?.id,
    )