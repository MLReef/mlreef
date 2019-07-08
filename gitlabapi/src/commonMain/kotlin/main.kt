package com.mlreef

import com.mlreef.gitlabapi.Group
import com.mlreef.gitlabapi.getGroup
import kotlinx.serialization.ImplicitReflectionSerializer
import kotlinx.serialization.UnstableDefault

@UnstableDefault
@ImplicitReflectionSerializer suspend fun notMain() {
    val testToken = "4s129mSs6v1iw_uDzDc7"
    val group: Group = getGroup(testToken, "mlreef")
    println("Hellooooo")
    println("Group: ${group.name}, id: ${group.id}")
}
