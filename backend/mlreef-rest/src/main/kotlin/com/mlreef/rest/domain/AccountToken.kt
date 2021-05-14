package com.mlreef.rest.domain

import java.time.LocalDateTime
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table
import javax.persistence.UniqueConstraint

@Entity
@Table(
    name = "account_token",
    uniqueConstraints = [UniqueConstraint(name = "unique_token", columnNames = ["token", "active"])])
data class AccountToken(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
    @Column(name = "account_id")
    val accountId: UUID,
    @Column()
    val token: String,
    @Column(name = "gitlab_id")
    val gitlabId: Int? = null,
    val active: Boolean = true,
    val revoked: Boolean = false,
    @Column(name = "expires_at")
    val expiresAt: LocalDateTime? = null
)
