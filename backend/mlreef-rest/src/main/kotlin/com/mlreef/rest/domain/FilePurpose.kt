package com.mlreef.rest.domain

import java.util.*
import javax.persistence.*

@Table(
    name = "file_purposes", indexes = [
        Index(name = "file_purposes_uidx", columnList = "purpose_name", unique = true)
    ]
)
@Entity
data class FilePurpose (
    @Id
    @Column(name = "id")
    var id: UUID,

    @Column(name = "purpose_name")
    var purposeName: String,

    @Column(name = "description")
    var description: String? = null,

    @Column(name = "max_file_size")
    var maxFileSize: Long = 0L,

    @Column(name = "file_ext_allowed")
    var fileExtAllowed: String? = null,
) {
    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is MlreefFile -> false
            else -> this.id == other.id
        }
    }

    override fun hashCode() = id.hashCode()

    override fun toString(): String {
        return "FilePurpose(id=$id, purposeName=$purposeName, description=$description, maxFileSize=$maxFileSize, fileExtAllowed=$fileExtAllowed)"
    }
}