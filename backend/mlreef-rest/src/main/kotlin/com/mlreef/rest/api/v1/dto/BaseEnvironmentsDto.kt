package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.domain.BaseEnvironments
import com.mlreef.rest.domain.PublishingMachineType
import java.util.UUID

@JsonInclude(JsonInclude.Include.NON_NULL)
data class BaseEnvironmentsDto(
    val id: UUID? = null,
    val title: String? = null,
    val dockerImage: String? = null,
    val description: String? = null,
    val requirements: String? = null,
    val machineType: PublishingMachineType? = null,
    val sdkVersion: String? = null,
)

fun BaseEnvironments.toBaseEnvironmentsDto() = BaseEnvironmentsDto(
    this.id,
    this.title,
    this.dockerImage,
    this.description,
    this.requirements,
    this.machineType,
    this.sdkVersion
)