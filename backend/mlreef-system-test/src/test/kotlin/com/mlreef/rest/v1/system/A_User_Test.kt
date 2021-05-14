package com.mlreef.rest.v1.system

import com.mlreef.rest.api.v1.GroupCreateRequest
import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.dto.GroupDto
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserInGroupDto
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.springframework.http.ResponseEntity


@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("A: User and basic user management")
@Tag(value = SystemTestTags.SYSTEM)
class A_User_Test : AbstractSystemTest() {

    companion object {
        lateinit var accessToken: String
        lateinit var currentUser: SecretUserDto
        lateinit var currentGroup: GroupDto
    }

    @Test
    fun `A01 Register as a new User`() {
        val returnedResult = prepareCurrentUser(globalRandomUserName, globalEmail, globalRandomPassword)
        accessToken = returnedResult.accessToken ?: returnedResult.token!!
        currentUser = returnedResult
    }

    @Test
    fun `A02 Login as new User`() {
        val registerRequest = LoginRequest(globalRandomUserName, globalEmail, globalRandomPassword)
        val response: ResponseEntity<SecretUserDto> = backendRestClient.post("/auth/login", body = registerRequest)
        val returnedResult = response.expectOk().returns()
        accessToken = returnedResult.accessToken ?: returnedResult.token!!
        currentUser = returnedResult
    }

    @Test
    fun `A03 Create new group`() {
        val groupName = RandomUtils.generateRandomUserName(15)
        val registerRequest = GroupCreateRequest(groupName, "unused", groupName)
        val response: ResponseEntity<GroupDto> = backendRestClient.post("/groups", accessToken, registerRequest)
        val returnedResult = response.expectOk().returns()
        currentGroup = returnedResult
    }

    @Test
    @Disabled
    fun `A04 Add another user to group`() {
        val newUsername = RandomUtils.generateRandomUserName(10)
        val newPassword = RandomUtils.generateRandomPassword(30, true)
        val newUserEmail = "$newUsername@example.com"
        val newUser = prepareCurrentUser(newUsername, newUserEmail, newPassword)
        val response: ResponseEntity<Any> = backendRestClient.post("/groups/${currentGroup.id}/users/${newUser.id}", accessToken, null)
        val modifiedGroupUsers = response.expectOk().returnsList(UserInGroupDto::class.java)
        assertThat(modifiedGroupUsers.map { it.userName }).contains(currentUser.username)
    }
}