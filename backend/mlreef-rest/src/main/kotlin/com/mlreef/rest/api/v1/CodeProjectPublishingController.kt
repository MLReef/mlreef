package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.CodeProjectPublishingPipelineDto
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.PublishingService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
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
    fun publishExistingProject(
        @RequestBody(required = false) request: PublishingRequest?,
        @PathVariable id: UUID,
        token: TokenDetails
    ): CodeProjectPublishingPipelineDto =
        publishingService.startPublishing(request?.path, userToken = token.accessToken, projectId = id)
            .let {
                CodeProjectPublishingPipelineDto(commit = it)
            }

    @PostMapping("unpublish")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("canViewProject(#id)")
    fun unpublishExistingProject(
        @PathVariable id: UUID,
        token: TokenDetails
    ): CodeProjectPublishingPipelineDto =
        publishingService.unPublishProject(userToken = token.accessToken, projectId = id)
            .let {
                CodeProjectPublishingPipelineDto(commit = it)
            }

}

class PublishingRequest(
    val path: String? = null
)
