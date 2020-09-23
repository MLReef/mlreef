package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline

internal data class CodeProjectPublishingPipelineDto(
    val commit: Commit
)
