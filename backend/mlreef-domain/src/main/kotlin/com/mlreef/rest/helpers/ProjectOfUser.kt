package com.mlreef.rest.helpers

import com.mlreef.rest.AccessLevel
import java.util.UUID

data class ProjectOfUser(
    override val id: UUID,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId
