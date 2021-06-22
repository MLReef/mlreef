package com.mlreef.rest.domain

import java.time.Instant
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToOne
import javax.persistence.Table

@Entity
@Table(name = "account_external")
data class AccountExternal(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    val oauthClient: String,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    val account: Account,

    val username: String? = null,
    val email: String? = null,
    val externalId: String? = null,
    val reposUrl: String? = null,
    val avatarUrl:String? = null,

    val avatarDownloaded: Boolean = false,

    val accessToken: String? = null,
    val accessTokenExpiresAt: Instant? = null,
    val refreshToken: String? = null,
    val refreshTokenExpiresAt: Instant? = null,
)
