package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.domain.MlreefFile
import java.time.Instant
import java.util.*

data class MlreefFileDto(
    val id: UUID,
    val ownerId:UUID? = null,
    val uploadTime: Instant,
    val fileName: String? = null,
    val format: String? = null,
    val purpose:String? = null,
    val size: Long? = null,
    val description:String? = null,
    val downloadLink: String? = null,
)

fun MlreefFile.toDto() = MlreefFileDto(
    this.id,
    this.owner?.id,
    this.uploadTime,
    this.originalFileName,
    this.fileFormat,
    this.purpose?.purposeName,
    this.fileSize,
    this.description,
    this.downloadLink,
)