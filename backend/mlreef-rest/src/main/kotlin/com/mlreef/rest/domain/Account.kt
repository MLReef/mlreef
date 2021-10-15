package com.mlreef.rest.domain

import com.mlreef.rest.domain.helpers.UserInGroup
import java.time.Instant
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.*

enum class UserRole {
    UNDEFINED,
    DATA_SCIENTIST,
    DEVELOPER,
    ML_ENGINEER,
    RESEARCHER,
    STUDENT,
    TEAM_LEAD,
}

@Entity
@Table(name = "account")
class Account(
    id: UUID,
    val username: String,
    val email: String,
    val passwordEncrypted: String,
    val slug: String,
    val name: String,

//    @OneToOne(fetch = FetchType.LAZY) //, cascade = [CascadeType.ALL])
//    @JoinColumn(name = "person_id")
//    val person: Person,

    @OneToOne(mappedBy = "account", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var externalAccount: AccountExternal? = null,

    @OneToOne(fetch = FetchType.LAZY) //, cascade = [CascadeType.ALL])
    @JoinColumn(name = "avatar_id")
    var avatar: MlreefFile? = null,

    val lastLogin: ZonedDateTime? = null,
    // Token for changing account (change password, etc)
    val changeAccountToken: String? = null,
    val changeAccountTokenCreatedAt: ZonedDateTime? = null,

    val gitlabId: Long?,

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role")
    val userRole: UserRole = UserRole.UNDEFINED,

    @Column(name = "terms_accepted_at")
    val termsAcceptedAt: Instant? = null,

    @Column(name = "has_newsletters")
    val hasNewsletters: Boolean = false,

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
        slug: String? = null,
        name: String? = null,
        tokens: MutableList<AccountToken>? = null,
        lastLogin: ZonedDateTime? = null,
        externalAccount: AccountExternal? = null,
        gitlabId: Long? = null,
        userRole: UserRole? = null,
        termsAcceptedAt: Instant? = null,
        hasNewsletters: Boolean? = null,
        avatar: MlreefFile? = null,
    ): Account = Account(
        id = this.id,
        username = username ?: this.username,
        email = email ?: this.email,
        passwordEncrypted = passwordEncrypted ?: this.passwordEncrypted,
        slug = slug ?: this.slug,
        name = name ?: this.name,
        lastLogin = lastLogin ?: this.lastLogin,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        changeAccountToken = this.changeAccountToken,
        changeAccountTokenCreatedAt = this.changeAccountTokenCreatedAt,
        externalAccount = externalAccount ?: this.externalAccount,
        gitlabId = gitlabId ?: this.gitlabId,
        userRole = userRole ?: this.userRole,
        termsAcceptedAt = termsAcceptedAt ?: this.termsAcceptedAt,
        hasNewsletters = hasNewsletters ?: this.hasNewsletters,
        avatar = avatar ?: this.avatar,
    )

    fun copyWithToken(
        changeAccountToken: String?,
        changeAccountTokenCreatedAt: ZonedDateTime?
    ): Account = Account(
        id = this.id,
        username = this.username,
        email = this.email,
        passwordEncrypted = this.passwordEncrypted,
        slug = this.slug,
        name = this.name,
        lastLogin = this.lastLogin,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
        changeAccountToken = changeAccountToken,
        changeAccountTokenCreatedAt = changeAccountTokenCreatedAt,
        externalAccount = this.externalAccount,
        gitlabId = this.gitlabId,
        userRole = this.userRole,
        termsAcceptedAt = this.termsAcceptedAt,
        hasNewsletters = this.hasNewsletters,
        avatar = this.avatar,
    )

    fun toUserInGroup(accessLevel: AccessLevel?) = UserInGroup(
        id = this.id,
        userName = this.externalAccount?.username ?: this.username,
        email = this.externalAccount?.email ?: this.email,
        gitlabId = this.gitlabId,
        accessLevel = accessLevel
    )
}
