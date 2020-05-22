package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.Experiment
import com.mlreef.rest.FileLocation
import com.mlreef.rest.helpers.DataClassWithId
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

class ExperimentDto(
    override val id: UUID,
    val dataProjectId: UUID,
    val dataInstanceId: UUID?,
    val slug: String,
    val name: String,
    @get:NotEmpty val sourceBranch: String,
    @get:NotEmpty val targetBranch: String,
    val status: String,
    val pipelineJobInfo: PipelineJobInfoDto? = null,
    @get:Valid val inputFiles: List<FileLocationDto>? = arrayListOf(),
    @get:Valid val postProcessing: List<DataProcessorInstanceDto>? = arrayListOf(),
    @get:Valid val processing: DataProcessorInstanceDto? = null,
    val jsonBlob: String = ""
) : DataClassWithId

internal fun Experiment.toDto(): ExperimentDto =
    ExperimentDto(
        id = this.id,
        dataProjectId = this.dataProjectId,
        dataInstanceId = this.dataInstanceId,
        slug = this.slug,
        name = this.name,
        sourceBranch = this.sourceBranch,
        targetBranch = this.targetBranch,
        inputFiles = this.inputFiles.map(FileLocation::toDto),
        status = this.status.name,
        jsonBlob = this.jsonBlob,
        pipelineJobInfo = this.pipelineJobInfo?.toDto(),
        postProcessing = this.postProcessing.map(DataProcessorInstance::toDto),
        processing = this.getProcessor()?.toDto()
    )