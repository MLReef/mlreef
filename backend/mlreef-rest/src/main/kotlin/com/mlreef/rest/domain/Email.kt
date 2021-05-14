package com.mlreef.rest.domain

import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Table

@Entity
@Table(name = "email")
class Email(
    id: UUID,
    val accountId: UUID,
    val recipientName: String,
    val recipientEmail: String,
    val senderEmail: String?,
    val subject: String,
    val message: String?,
    val scheduledAt: ZonedDateTime? = null,
    val sentAt: ZonedDateTime? = null,
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null,
    val parentEmailId: UUID? = null,
    val failMessages: String? = null
) : AuditEntity(id, version, createdAt, updatedAt) {
    fun copy(message: String? = null,
             scheduledAt: ZonedDateTime? = null,
             sentAt: ZonedDateTime? = null,
             parentEmailId: UUID? = null,
             failMessages: String? = null): Email {
        return Email(
            this.id,
            this.accountId,
            this.recipientName,
            this.recipientEmail,
            this.senderEmail,
            this.subject,
            message ?: this.message,
            scheduledAt ?: this.scheduledAt,
            sentAt ?: sentAt,
            this.version,
            this.createdAt,
            this.updatedAt,
            parentEmailId ?: this.parentEmailId,
            failMessages ?: this.failMessages
        )
    }
}