package com.mlreef.rest

import com.mlreef.rest.helpers.UserInGroup
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table


@Entity
@Table(name = "account")
class Account(
    id: UUID,
    val username: String,
    val email: String,
    val passwordEncrypted: String,
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH])
    @JoinColumn(name = "person_id", foreignKey = ForeignKey(name = "account_subject_person_id_fkey"))
    val person: Person,
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(
        name = "account_id",
        foreignKey = ForeignKey(name = "accounttoken_account_account_id_fkey"))
    val tokens: MutableList<AccountToken> = arrayListOf(),
    @Column(name = "gitlab_id")
    @Deprecated("Use gitlabId in Person Entity")
    val gitlabId: Long? = null,
    val lastLogin: ZonedDateTime? = null,

    // Token for changing account (change password, etc)
    val changeAccountToken: String? = null,
    val changeAccountTokenCreatedAt: ZonedDateTime? = null,

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
        gitlabId: Long? = null,
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
        updatedAt = this.updatedAt,
        changeAccountToken = this.changeAccountToken,
        changeAccountTokenCreatedAt = this.changeAccountTokenCreatedAt
    )

    fun copyWithToken(
        changeAccountToken: String?,
        changeAccountTokenCreatedAt: ZonedDateTime?
    ): Account = Account(
        id = this.id,
        username = this.username,
        email = this.email,
        passwordEncrypted = this.passwordEncrypted,
        person = this.person,
        gitlabId = this.gitlabId,
        lastLogin = this.lastLogin,
        tokens = this.tokens,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        changeAccountToken = changeAccountToken,
        changeAccountTokenCreatedAt = changeAccountTokenCreatedAt
    )

    val bestToken: AccountToken?
        @javax.persistence.Transient
        get() = this.tokens.filter { it.active && !it.revoked }
            .sortedBy { it.expiresAt }
            .getOrNull(0)

    fun toUserInGroup(accessLevel: AccessLevel?) = UserInGroup(
        id = this.id,
        userName = this.username,
        email = this.email,
        gitlabId = this.person.gitlabId,
        accessLevel = accessLevel
    )

}
