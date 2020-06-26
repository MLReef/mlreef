package com.mlreef.rest.helpers

import com.mlreef.rest.AccessLevel
import java.util.UUID

data class GroupOfUser(
    override val id: UUID,
    val gitlabId: Long?,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId
