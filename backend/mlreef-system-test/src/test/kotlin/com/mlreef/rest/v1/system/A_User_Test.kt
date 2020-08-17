package com.mlreef.rest.v1.system

import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.springframework.http.ResponseEntity


@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("A: User and basic user management")
class A_User_Test : AbstractSystemTest() {

    companion object {
        lateinit var accessToken: String
        lateinit var currentUser: SecretUserDto
    }

    @Test
    fun `A01 Register as a new User`() {
        val returnedResult = prepareCurrentUser(globalRandomUserName, globalEmail, globalRandomPassword)
        accessToken = returnedResult.accessToken!!
        currentUser = returnedResult
    }

    @Test
    fun `A02 Login as new User`() {
        val registerRequest = LoginRequest(globalRandomUserName, globalEmail, globalRandomPassword)
        val response: ResponseEntity<SecretUserDto> = backendRestClient.post("/auth/login", body = registerRequest)
        val returnedResult = response.expectOk().returns()
        Assertions.assertThat(returnedResult.accessToken).isNotBlank()
        accessToken = returnedResult.accessToken!!
        currentUser = returnedResult
    }
}