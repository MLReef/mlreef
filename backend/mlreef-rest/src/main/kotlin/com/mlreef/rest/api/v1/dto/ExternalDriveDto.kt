package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.domain.DriveExternal
import java.util.UUID

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ExternalDriveDto(
    val id: UUID,
    val driveType: String,
    val alias: String,
    val projects: List<ProjectShortestDto>? = null,
    val ownerId: UUID,
    val externalId: String? = null,
    val path: String? = null,
    val mask: String? = null,
    val region: String? = null,
)

fun DriveExternal.toDto() = ExternalDriveDto(
    this.id,
    this.driveType.name,
    this.alias,
    this.projects.takeIf { it.isNotEmpty() }?.map { it.toShortestDto() },
    this.account.id,
    this.externalId,
    this.path,
    this.mask,
)