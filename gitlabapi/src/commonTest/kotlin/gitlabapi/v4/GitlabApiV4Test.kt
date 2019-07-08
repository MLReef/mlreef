package com.mlreef.gitlabapi.v4

import com.mlreef.gitlabapi.Group
import com.mlreef.gitlabapi.getGroup
import com.mlreef.gitlabapi.getGroups
import com.mlreef.runTest
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
}

// This testing token will only work until 2019-09-30
val testToken = "4s129mSs6v1iw_uDzDc7"
