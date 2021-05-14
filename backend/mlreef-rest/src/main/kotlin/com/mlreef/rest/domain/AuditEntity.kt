package com.mlreef.rest.domain

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.domain.Persistable
import java.io.Serializable
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Id
import javax.persistence.MappedSuperclass
import javax.persistence.PrePersist
import javax.persistence.PreUpdate
import javax.persistence.Version

@MappedSuperclass
abstract class AuditEntity(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    private val id: UUID,
    copyVersion: Long?,
    copyCreatedAt: ZonedDateTime?,
    copyUpdatedAt: ZonedDateTime?
) : Persistable<UUID>, Serializable {

    @Version
    var version: Long? = copyVersion

    @CreatedDate
    @Column(name = "created_at")
    var createdAt: ZonedDateTime? = copyCreatedAt

    @LastModifiedDate
    @Column(name = "updated_at")
    var updatedAt: ZonedDateTime? = copyUpdatedAt

    override fun getId(): UUID = id
    override fun isNew(): Boolean = createdAt == null
    override fun hashCode(): Int = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is AuditEntity -> false
            else -> getId() == other.getId()
        }
    }

    @PrePersist
    private fun onPrePersist() = handleSaveUpdate()

    @PreUpdate
    private fun onPreUpdate() = handleSaveUpdate()

    private fun handleSaveUpdate() {
        if (createdAt == null) {
            createdAt = I18N.dateTime()
        } else {
            updatedAt = I18N.dateTime()
        }
        version = (version ?: -1) + 1
    }
}
