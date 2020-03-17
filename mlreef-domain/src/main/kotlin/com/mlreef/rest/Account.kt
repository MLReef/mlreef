package com.mlreef.rest

import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table

/**
@Id @Column(name = "id", length = 16, unique = true, nullable = false) val@Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
.... own properties
// Auditing
@Version val version: Long? = null,
@CreatedDate @Column(name = "created_at", nullable = false, updatable = false)
createdAt: ZonedDateTime = I18N.dateTime(),
@LastModifiedDate @Column(name = "updated_at")
val updatedAt: ZonedDateTime? = null
 */


@Entity
@Table(name = "account")
class Account(
    id: UUID,
    val username: String,
    val email: String,
    val passwordEncrypted: String,
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH])
    @JoinColumn(name = "person_id")
    val person: Person,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "account_id")
    val tokens: MutableList<AccountToken> = arrayListOf(),
    @Column(name = "gitlab_id")
    val gitlabId: Int? = null,
    val lastLogin: ZonedDateTime? = null,
    // Auditing
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : AuditEntity(id, version, createdAt, updatedAt) {
    fun copy(
        id: UUID? = null,
        username: String? = null,
        email: String? = null,
        passwordEncrypted: String? = null,
        person: Person? = null,
        tokens: MutableList<AccountToken>? = null,
        gitlabId: Int? = null,
        lastLogin: ZonedDateTime? = null
    ): Account = Account(
        id = this.id,
        username = username ?: this.username,
        email = email ?: this.email,
        passwordEncrypted = passwordEncrypted ?: this.passwordEncrypted,
        person = person ?: this.person,
        gitlabId = gitlabId ?: this.gitlabId,
        lastLogin = lastLogin ?: this.lastLogin,
        tokens = tokens ?: this.tokens,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}
