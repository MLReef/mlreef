package com.mlreef.rest.domain

import java.time.Instant
import java.util.*
import javax.persistence.*

@Table(
    name = "mlreef_files", indexes = [
        Index(name = "mlreef_files_storage_file_name_uidx", columnList = "storage_file_name", unique = true)
    ]
)
@Entity
data class MlreefFile(
    @Id
    @Column(name = "id", nullable = false)
    var id: UUID,

    @ManyToOne
    @JoinColumn(name = "owner_id")
    var owner: Account? = null,

    @Column(name = "upload_time")
    var uploadTime: Instant = Instant.now(),

    @Column(name = "storage_file_name")
    var storageFileName: String? = null,

    @Column(name = "original_file_name")
    var originalFileName: String? = null,

    @Column(name = "file_format")
    var fileFormat: String? = null,

    @ManyToOne
    @JoinColumn(name = "purpose_id")
    var purpose: FilePurpose? = null,

    @Column(name = "file_size")
    var fileSize: Long = 0L,

    @Column(name = "upload_dir", nullable = false)
    var uploadDir: String = "",

    @Column(name = "description")
    var description: String? = null,

    @Column(name = "content")
    var content: ByteArray? = null,

    @Transient
    var downloadLink: String? = null
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
        return "MlreefFile(id=$id, ownerId=${owner?.id}, storageFileName=$storageFileName, originalFileName=$originalFileName, purpose=$purpose, fileSize=$fileSize, uploadDir='$uploadDir', description=$description)"
    }
}