package com.mlreef.rest.helpers

import com.mlreef.rest.AccessLevel
import java.util.UUID

interface DataClassWithId {
    val id: UUID?
}

data class UserInGroup(
    override val id: UUID,
    val userName: String?,
    val email: String?,
    val gitlabId: Long?,
    val accessLevel: AccessLevel?
) : DataClassWithId
