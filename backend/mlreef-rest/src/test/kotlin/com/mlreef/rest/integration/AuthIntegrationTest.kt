package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.RegisterRequest
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.utils.RandomUtils
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
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

        val returnedResult: SecretUserDto = this.mockMvc.perform(
            post("$authUrl/register")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, SecretUserDto::class.java)
            }

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

        this.mockMvc.perform(
            post("$authUrl/register")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().is4xxClientError)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can login with existing user`() {
        val (account, plainPassword, _) = testsHelper.createRealUser()

        val loginRequest = LoginRequest(account.username, account.email, plainPassword)

        val returnedResult: SecretUserDto = this.mockMvc.perform(
            post("$authUrl/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, SecretUserDto::class.java).censor()
            }

        assertThat(returnedResult).isNotNull()
        assertThat(returnedResult.username).isEqualTo(account.username)
        assertThat(returnedResult.email).isEqualTo(account.email)
        assertThat(returnedResult.token!!.substring(0, 3)).isEqualTo(account.bestToken?.token?.substring(0, 3))
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot login with Gitlab is rejected credentials`() {
        val notRealPassword = "password"
        val (existingUser, realPassword, _) = testsHelper.createRealUser()

        assertThat(realPassword).isNotEqualTo(notRealPassword)

        val loginRequest = LoginRequest(existingUser.username, existingUser.email, notRealPassword)

        this.mockMvc.perform(
            post("$authUrl/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is4xxClientError)
    }

    @Test
    fun `Admin expiration OAuth token test`() {
        val (account, _, _) = testsHelper.createRealUser()

        assertThat(restClient.oAuthAdminToken.get()).isNotNull

        val returnedResult: UserDto = this.mockMvc.perform(
            this.acceptContentAuth(get("$sessionsUrl/find/user?gitlab_id=${account.person.gitlabId}"), account))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, UserDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(account.id)
        assertThat(returnedResult.username).isEqualTo(account.username)

        val (expired, _) = restClient.oAuthAdminToken.get()!!

        //Make token invalidated to GitlabRestClient obtain a new one
        restClient.oAuthAdminToken.set(Pair(expired, "123"))

        assertThat(restClient.oAuthAdminToken.get()!!.second).isEqualTo("123")

        val returnedResult2: UserDto = this.mockMvc.perform(
            this.acceptContentAuth(get("$sessionsUrl/find/user?gitlab_id=${account.person.gitlabId}"), account))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, UserDto::class.java)
            }

        assertThat(returnedResult2.id).isEqualTo(account.id)
        assertThat(returnedResult2.username).isEqualTo(account.username)

        assertThat(restClient.oAuthAdminToken.get()!!.second).isNotEqualTo("123")
    }
}
