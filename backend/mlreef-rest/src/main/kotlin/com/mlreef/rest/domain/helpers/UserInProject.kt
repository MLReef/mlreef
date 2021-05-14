package com.mlreef.rest.domain.helpers

import com.mlreef.rest.domain.AccessLevel
import java.time.Instant
import java.util.UUID

data class UserInProject(
    override val id: UUID?,
    val userName: String?,
    val email: String?,
    val gitlabId: Long?,
    val accessLevel: AccessLevel?,
    val expiredAt: Instant?
) : DataClassWithId

