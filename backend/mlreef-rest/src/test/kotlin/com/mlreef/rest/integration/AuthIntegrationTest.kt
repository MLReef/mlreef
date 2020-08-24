package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.RegisterRequest
import com.mlreef.rest.api.v1.UpdateRequest
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.utils.RandomUtils
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

class AuthIntegrationTest : AbstractIntegrationTest() {

    val authUrl = "/api/v1/auth"
    val sessionsUrl = "/api/v1/sessions"

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can register with new user`() {
        val randomUserName = RandomUtils.generateRandomUserName(10)
        val randomPassword = RandomUtils.generateRandomPassword(30, true)
        val email = "$randomUserName@example.com"
        val registerRequest = RegisterRequest(randomUserName, email, randomPassword, "name")

        val returnedResult: SecretUserDto = this.performPost("$authUrl/register", body = registerRequest)
            .expectOk()
            .returns()

        with(accountRepository.findOneByEmail(email)!!) {
            assertThat(id).isEqualTo(returnedResult.id)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot register with existing user`() {
        val (existingUser, _, _) = testsHelper.createRealUser()
        val registerRequest = RegisterRequest(existingUser.username, existingUser.email, "any other password", "name")

        this.performPost("$authUrl/register", body = registerRequest)
            .expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can login with existing user`() {
        val password = RandomUtils.generateRandomPassword(20, true)
        val (account, _, _) = testsHelper.createRealUser(password = password)

        val loginRequest = LoginRequest(account.username, account.email, password)

        val returnedResult: SecretUserDto = this.performPost("$authUrl/login", body = loginRequest)
            .expectOk()
            .returns()

        assertThat(returnedResult).isNotNull()
        assertThat(returnedResult.username).isEqualTo(account.username)
        assertThat(returnedResult.email).isEqualTo(account.email)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot login with Gitlab is rejected credentials`() {
        val notRealPassword = "password"
        val (existingUser, realPassword, _) = testsHelper.createRealUser()

        assertThat(realPassword).isNotEqualTo(notRealPassword)

        val loginRequest = LoginRequest(existingUser.username, existingUser.email, notRealPassword)

        this.performPost("$authUrl/login", body = loginRequest)
            .expect4xx()
    }

    @Test
    fun `Admin expiration OAuth token test`() {
        val (account, token, _) = testsHelper.createRealUser()

        assertThat(restClient.oAuthAdminToken.get()).isNotNull

        val returnedResult: UserDto = this.performGet("$sessionsUrl/find/user?gitlab_id=${account.person.gitlabId}", token)
            .expectOk()
            .returns()

        assertThat(returnedResult.id).isEqualTo(account.id)
        assertThat(returnedResult.username).isEqualTo(account.username)

        val (expired, _) = restClient.oAuthAdminToken.get()!!

        //Make token invalidated to GitlabRestClient obtain a new one
        restClient.oAuthAdminToken.set(Pair(expired, "123"))

        assertThat(restClient.oAuthAdminToken.get()!!.second).isEqualTo("123")

        val returnedResult2: UserDto = this.performGet("$sessionsUrl/find/user?gitlab_id=${account.person.gitlabId}", token)
            .expectOk()
            .returns()

        assertThat(returnedResult2.id).isEqualTo(account.id)
        assertThat(returnedResult2.username).isEqualTo(account.username)

        assertThat(restClient.oAuthAdminToken.get()!!.second).isNotEqualTo("123")
    }

    @Transactional
    @Rollback
    @Test
    fun `Can update en existing user`() {
        val randomUserName = RandomUtils.generateRandomUserName(10)
        val randomPassword = RandomUtils.generateRandomPassword(30, true)
        val email = "$randomUserName@example.com"
        val registerRequest = RegisterRequest(randomUserName, email, randomPassword, "name")

        val returnedResult: SecretUserDto = this.performPost("$authUrl/register", body = registerRequest)
            .expectOk()
            .returns()

        with(accountRepository.findOneByEmail(email)!!) {
            assertThat(id).isEqualTo(returnedResult.id)
            assertThat(username).isEqualTo(returnedResult.username).isEqualTo(randomUserName)
        }

        val newRandomUserName = RandomUtils.generateRandomUserName(10)
        val newEmail = "$newRandomUserName@example.com"

        val updateRequest = UpdateRequest(
            newRandomUserName,
            newEmail
        )

        val returnedResult2: UserDto = this.performPut("$authUrl/update/${returnedResult.id}", returnedResult.accessToken, body = updateRequest)
            .expectOk()
            .returns()

        with(accountRepository.findOneByEmail(newEmail)!!) {
            assertThat(id).isEqualTo(returnedResult2.id)
            assertThat(username).isEqualTo(returnedResult2.username).isEqualTo(newRandomUserName)
        }

        assertThat(accountRepository.findOneByEmail(email)).isNull()
        assertThat(accountRepository.findOneByUsername(randomUserName)).isNull()
    }
}
