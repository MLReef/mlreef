package com.mlreef.rest.api.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.mlreef.rest.api.v1.MarketplaceController.Companion.MAX_PAGE_SIZE
import com.mlreef.rest.api.v1.dto.BaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingDto
import com.mlreef.rest.api.v1.dto.toBaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.toPublishingPipelineDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.PublishingMachineType
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.PublishingService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
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
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
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
            projectId = id,
            branch = request.branch,
            version = request.version,
        ).toPublishingPipelineDto()

    @GetMapping("{id}/publish/{processorId}")
    @PreAuthorize("canViewProject(#id)")
    fun getPublishInfoById(
        @PathVariable id: UUID,
        @PathVariable processorId: UUID,
        token: TokenDetails
    ): CodeProjectPublishingDto {
        return publishingService.getPublishingInfoById(id, processorId).toPublishingPipelineDto()
    }

    @GetMapping("{id}/publish/{branch}/{version}")
    @PreAuthorize("canViewProject(#id)")
    fun getPublishInfoByBranchAndVersion(
        @PathVariable id: UUID,
        @PathVariable branch: String,
        @PathVariable version: String,
        token: TokenDetails
    ): CodeProjectPublishingDto {
        return publishingService.getPublishingInfo(id, branch, version).firstOrNull()?.toPublishingPipelineDto()
            ?: throw NotFoundException("Publication not found for project $id, branch $branch and version $version")
    }

    @GetMapping("{id}/publish")
    @PreAuthorize("canViewProject(#id)")
    fun getPublishInfo(
        @PathVariable id: UUID,
        @RequestParam(required = false) branch: String?,
        @RequestParam(required = false) version: String?,
        @PageableDefault(size = MAX_PAGE_SIZE) pageable: Pageable,
        token: TokenDetails
    ): Page<CodeProjectPublishingDto> {
        val result = publishingService.getPublishingInfo(
            id,
            branch,
            version,
            pageable
        ) as Page

        return result.map { it.toPublishingPipelineDto() }
    }

    @GetMapping("{id}/publish/latest")
    @PreAuthorize("canViewProject(#id)")
    fun getLatestPublishInfo(
        @PathVariable id: UUID,
        @RequestParam(required = false) branch: String?,
        @RequestParam(required = false) version: String?,
        token: TokenDetails
    ): CodeProjectPublishingDto {
        val result = publishingService.getPublishingInfo(
            id,
            branch,
            version,
        )

        return result.sortedByDescending { it.jobFinishedAt ?: it.jobStartedAt ?: it.publishedAt ?: Instant.now() }.firstOrNull()?.toPublishingPipelineDto()
            ?: throw NotFoundException("No latest publication for project $id${branch?.let { ", branch $it" }}${version?.let { " and version $it" }} ")
    }

    @RequestMapping(value = ["{id}/{branch}/{version}/unpublish"], method = [RequestMethod.POST, RequestMethod.DELETE])
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun unpublishExistingProject(
        @PathVariable id: UUID,
        @PathVariable branch: String,
        @PathVariable version: String,
        token: TokenDetails
    ): CodeProjectPublishingDto = publishingService.unPublishProcessor(
        userToken = token.accessToken,
        projectId = id,
        branch = branch,
        version = version,
        unpublisherSubjectId = token.personId,
        isProjectOwner = token.projects.get(id) == AccessLevel.OWNER,
    ).toPublishingPipelineDto()


    @PostMapping("{id}/republish")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun republishExistingProject(
        @RequestBody request: PublishingRequest,
        @PathVariable id: UUID,
        token: TokenDetails
    ): CodeProjectPublishingDto {
        return publishingService.republishProcessor(
            userToken = token.accessToken,
            projectId = id,
            branch = request.branch ?: throw BadRequestException("Branch is mandatory for republish"),
            version = request.version ?: throw BadRequestException("Version is mandatory for republish"),
            mainFilePath = request.path,
            environmentId = request.environment,
            republisherSubjectId = token.personId,
            isProjectOwner = token.projects.get(id) == AccessLevel.OWNER,
        ).toPublishingPipelineDto()
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
class PublishingRequest(
    val slug: String? = null,
    val path: String? = null,
    val environment: UUID? = null,
    val branch: String? = null,
    val version: String? = null,
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

