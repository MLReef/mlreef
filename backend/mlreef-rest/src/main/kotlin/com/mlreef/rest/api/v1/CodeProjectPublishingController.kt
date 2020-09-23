package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.CodeProjectPublishingPipelineDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.feature.PublishingService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/code-projects/{id}/")
internal class CodeProjectPublishingController(
    val publishingService: PublishingService
) {

    @PostMapping("publish")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("canViewProject(#id)")
    fun publishExistingProject(@PathVariable id: UUID): CodeProjectPublishingPipelineDto =
        publishingService.startPublishing(userToken = "", projectId = -1)
            .let {
                CodeProjectPublishingPipelineDto(commit = it)
            }
}
