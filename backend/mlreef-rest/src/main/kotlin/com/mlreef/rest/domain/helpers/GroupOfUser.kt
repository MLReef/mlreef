package com.mlreef.rest.domain.helpers

import com.mlreef.rest.domain.AccessLevel
import java.util.UUID

data class GroupOfUser(
    override val id: UUID,
    val gitlabId: Long?,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId
