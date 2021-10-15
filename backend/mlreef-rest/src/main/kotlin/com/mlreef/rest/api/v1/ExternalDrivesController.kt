package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.ExternalDriveDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.FeatureNotSupported
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.project.ExternalDriveType
import com.mlreef.rest.feature.project.ExternalDrivesService
import com.mlreef.rest.feature.project.ProjectResolverService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/v1/external"])
class ExternalDrivesController(
    private val externalDrivesService: ExternalDrivesService,
    private val projectResolverService: ProjectResolverService,
) {
    @RequestMapping(value = ["/drive/{driveType}/regions"], method = [RequestMethod.GET])
    fun getExternalDriveAvailableRegions(
        @PathVariable driveType: String,
    ): List<String> {
        val type = ExternalDriveType.values().find { it.name.equals(driveType.trim(), true) }
            ?: throw FeatureNotSupported("Drive $driveType is not allowed")

        return externalDrivesService.getAvailableRegions(type)
    }

    @RequestMapping(value = ["/drive/{driveIdOrAlias}"], method = [RequestMethod.GET])
    fun getExternalDriveInformation(
        @PathVariable driveIdOrAlias: String,
        token: TokenDetails,
    ): ExternalDriveDto {
        val driveId = driveIdOrAlias.tryToUUID()
        val driveAlias = if (driveId == null) driveIdOrAlias else null

        val drive = externalDrivesService.resolveExternalDrive(driveId, token.accountId, driveAlias)?.takeIf { it.account.id == token.accountId }
            ?: throw NotFoundException("Drive $driveIdOrAlias not found for user ${token.accountId}")

        return drive.toDto()
    }

    @RequestMapping(value = ["/drive/{driveType}"], method = [RequestMethod.POST])
    @PreAuthorize("hasAccessToProject(#request.projectId, 'MAINTAINER', true)")
    fun connectExternalDrive(
        @PathVariable driveType: String,
        @RequestBody request: ExternalDriveConnectRequest,
        token: TokenDetails,
    ): ExternalDriveDto {
        val projectId = request.projectId.tryToUUID()
        val projectGitlabId = if (projectId == null) request.projectId?.toLongOrNull() else null

        val drive = ExternalDriveType.values().find { it.name.equals(driveType.trim(), true) }
            ?: throw BadRequestException("Drive $driveType is not allowed")

        val project = if (projectId != null || projectGitlabId != null) {
            projectResolverService.resolveProject(projectId, projectGitlabId)
                ?: throw NotFoundException("Project ${request.projectId} not found")
        } else null

        return externalDrivesService.addExternalDriveInformation(
            project,
            request.alias,
            drive,
            token.accountId,
            request.path,
            request.mask,
            request.region,
            keys = arrayOf(request.key1, request.key2, request.key3, request.key4, request.key5),
        ).toDto()
    }

    @RequestMapping(value = ["/drive/{driveIdOrAlias}/buckets"], method = [RequestMethod.GET])
    @PreAuthorize("hasAccessToDrive(#driveIdOrAlias, 'MAINTAINER')")
    fun getExternalDriveBucketsList(
        @PathVariable driveIdOrAlias: String,
        token: TokenDetails,
    ): List<String> {
        val driveId = driveIdOrAlias.tryToUUID()
        val driveAlias = if (driveId == null) driveIdOrAlias else null

        return externalDrivesService.getBucketsListForDrive(
            token.accountId,
            driveId,
            driveAlias
        )
    }

    @RequestMapping(value = ["/drive/{driveIdOrAlias}"], method = [RequestMethod.PUT])
    @PreAuthorize("hasAccessToProject(#request.projectId, 'MAINTAINER', true)")
    fun updateExternalDrive(
        @PathVariable driveIdOrAlias: String,
        @RequestBody request: ExternalDriveConnectRequest,
        token: TokenDetails,
    ): ExternalDriveDto {
        val driveId = driveIdOrAlias.tryToUUID()
        val driveAlias = if (driveId == null) driveIdOrAlias else null

        val projectId = request.projectId.tryToUUID()
        val projectGitlabId = if (projectId == null) request.projectId?.toLongOrNull() else null

        val project = if (projectId != null || projectGitlabId != null) {
            projectResolverService.resolveProject(projectId, projectGitlabId)
                ?: throw NotFoundException("Project ${request.projectId} not found")
        } else null

        return externalDrivesService.updateExternalDriveInformation(
            token.accountId,
            driveId,
            driveAlias,
            project,
            request.alias,
            request.path,
            request.mask,
            request.region,
            keys = arrayOf(request.key1, request.key2, request.key3, request.key4, request.key5),
        ).toDto()
    }

    @RequestMapping(value = ["/drive/{driveIdOrAlias}"], method = [RequestMethod.DELETE])
    @PreAuthorize("hasAccessToProject(#projectIdStr, 'MAINTAINER', true)")
    fun deleteExternalDrive(
        @PathVariable driveIdOrAlias: String,
        @RequestParam(value = "project_id", required = false) projectIdStr: String?,
        token: TokenDetails,
    ): ExternalDriveDto? {
        val driveId = driveIdOrAlias.tryToUUID()
        val driveAlias = if (driveId == null) driveIdOrAlias else null

        val projectId = projectIdStr.tryToUUID()
        val projectGitlabId = if (projectId == null) projectIdStr?.toLongOrNull() else null

        val project = if (projectId != null || projectGitlabId != null) {
            projectResolverService.resolveProject(projectId, projectGitlabId)
                ?: throw NotFoundException("Project $projectIdStr not found")
        } else null

        return if (project != null) {
            externalDrivesService.deleteExternalDriveFromProject(token.accountId, driveId, driveAlias, project).toDto()
        } else {
            externalDrivesService.deleteExternalDriveInformation(token.accountId, driveId, driveAlias)
            null
        }
    }


}

data class ExternalDriveConnectRequest(
    val projectId: String? = null,
    val alias: String? = null,
    val region: String? = null,
    val key1: String? = null,
    val key2: String? = null,
    val key3: String? = null,
    val key4: String? = null,
    val key5: String? = null,
    val path: String? = null,
    val mask: String? = null,
)
