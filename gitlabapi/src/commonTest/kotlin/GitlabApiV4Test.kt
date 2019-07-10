@file:Suppress("EXPERIMENTAL_API_USAGE")

package com.mlreef.gitlabapi.v4

import kotlinx.serialization.ImplicitReflectionSerializer
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ImplicitReflectionSerializer
class GitlabApiV4Test {

    @Test fun canGetSingleGroup() = runTest {
        val group: Group = getGroup(testToken, "mlreef")

        assertEquals(actual = group.id, expected = 5351747)
    }

    @Test fun canGetMultipleGroups() = runTest {
        val groups: Collection<Group> = getGroups(testToken)

        assertTrue(groups.size >= 2)
        assertTrue(groups.any { it.name == "MLReef" })
    }

    @Test fun canListRepoDirectory() = runTest {
        val files = listRepoDirectory(
            token = testToken,
            projectId = mlReefDemoProjectId
        )

        files.forEach {
            println("--- ${it.path}")
        }
    }
}

// This testing token will only work until 2019-09-30
val testToken = "4s129mSs6v1iw_uDzDc7"

val mlReefDemoProjectId: Long = 12395599
