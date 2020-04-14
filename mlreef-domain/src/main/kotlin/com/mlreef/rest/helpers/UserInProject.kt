package com.mlreef.rest.helpers

import java.util.UUID

data class UserInProject(
    override val id: UUID?,
    val userName: String?,
    val email: String?,
    val gitlabId: Long?
) : DataClassWithId
