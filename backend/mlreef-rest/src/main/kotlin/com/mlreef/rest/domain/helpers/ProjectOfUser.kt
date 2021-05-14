package com.mlreef.rest.domain.helpers

import com.mlreef.rest.domain.AccessLevel
import java.util.UUID

data class ProjectOfUser(
    override val id: UUID,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId
