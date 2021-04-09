package com.mlreef.rest.api.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.mlreef.rest.PublishingMachineType
import com.mlreef.rest.api.v1.dto.BaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingDto
import com.mlreef.rest.api.v1.dto.CommitDto
import com.mlreef.rest.api.v1.dto.toBaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.toCommitDto
import com.mlreef.rest.api.v1.dto.toPublishingPipelineDto
import com.mlreef.rest.exceptions.ProjectPublicationException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.PublishingService
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/v1/code-projects/")
internal class CodeProjectPublishingController(
    private val publishingService: PublishingService
) {

    @GetMapping("environments")
    fun getEnvironmentsList(): List<BaseEnvironmentsDto> {
        return publishingService.getBaseEnvironmentsList().map { it.toBaseEnvironmentsDto() }
    }

    @PostMapping("environments")
    @PreAuthorize("isGitlabAdmin()")
    fun createEnvironment(
        @RequestBody request: CreateEnvironmentRequest
    ): BaseEnvironmentsDto {
        return publishingService.createBaseEnvironment(
            request.title,
            request.dockerImage,
            request.description,
            request.requirements,
            request.machineType,
            request.sdkVersion
        ).toBaseEnvironmentsDto()
    }

    @DeleteMapping("environments/{envId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isGitlabAdmin()")
    fun deleteEnvironment(
        @PathVariable envId: UUID,
    ) {
        publishingService.deleteBaseEnvironment(envId)
    }

    @PostMapping("{id}/publish")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("canViewProject(#id)")
    fun publishExistingProject(
        @RequestBody request: PublishingRequest,
        @PathVariable id: UUID,
        token: TokenDetails
    ): CodeProjectPublishingDto =
        publishingService.startPublishing(
            mainFilePath = request.path,
            environmentId = request.environment,
            modelType = request.modelType,
            mlCategory = request.mlCategory,
            publisherSubjectId = token.personId,
            userToken = token.accessToken,
            projectId = id
        ).toPublishingPipelineDto()

    @GetMapping("{id}/publish")
    fun getPublishInfo(
        @PathVariable id: UUID,
        token: TokenDetails
    ): CodeProjectPublishingDto {
        return publishingService.getPublishingInfo(id).toPublishingPipelineDto()
    }

    @PostMapping("{id}/unpublish")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("canViewProject(#id)")
    fun unpublishExistingProject(
        @PathVariable id: UUID,
        token: TokenDetails
    ): CommitDto =
        publishingService.unPublishProject(userToken = token.accessToken, projectId = id)?.toCommitDto()
            ?: throw ProjectPublicationException("The project cannot be unpublished")

    @PostMapping("{id}/republish")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("canViewProject(#id)")
    fun republishExistingProject(
        @RequestBody request: PublishingRequest,
        @PathVariable id: UUID,
        token: TokenDetails
    ): CodeProjectPublishingDto {
        publishingService.unPublishProject(userToken = token.accessToken, projectId = id, exceptionIfNotPublished = false)
        return publishingService.startPublishing(
            mainFilePath = request.path,
            environmentId = request.environment,
            modelType = request.modelType,
            mlCategory = request.mlCategory,
            publisherSubjectId = token.personId,
            userToken = token.accessToken,
            projectId = id
        ).toPublishingPipelineDto()
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
class PublishingRequest(
    val path: String?,
    val environment: UUID,
    val modelType: String? = null,
    val mlCategory: String? = null,
    val acceptedPublishingTerms: Instant? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
class CreateEnvironmentRequest(
    val title: String,
    val dockerImage: String,
    val description: String?,
    val requirements: String?,
    val machineType: PublishingMachineType?,
    val sdkVersion: String?
)

