package com.mlreef.rest.api

import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.RegisterRequest
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.feature.auth.AuthService
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.SpykBean
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import javax.transaction.Transactional

class AuthApiTest : RestApiTest() {

    val authUrl = "/api/v1/auth"
    val sessionsUrl = "/api/v1/sessions"

    @SpykBean
    private lateinit var authService: AuthService

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

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
            .andDo(document(
                "register-success",
                requestFields(registerRequestFields()),
                responseFields(userSecretDtoResponseFields())))
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
        val (existingUser, _, _) = gitlabHelper.createRealUser()
        val registerRequest = RegisterRequest(existingUser.username, existingUser.email, "any other password", "name")

        this.mockMvc.perform(
            post("$authUrl/register")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
            .andExpect(status().is4xxClientError)
            .andDo(document(
                "register-fail",
                responseFields(errorResponseFields())))
    }

    @Transactional
    @Rollback
    @Test
    fun `Can login with existing user`() {
        val (account, plainPassword, _) = gitlabHelper.createRealUser()

        val loginRequest = LoginRequest(account.username, account.email, plainPassword)

        val returnedResult: SecretUserDto = this.mockMvc.perform(
            post("$authUrl/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk)
            .andDo(document(
                "login-success",
                requestFields(loginRequestFields()),
                responseFields(userSecretDtoResponseFields())))
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
        val (existingUser, realPassword, _) = gitlabHelper.createRealUser()

        assertThat(realPassword).isNotEqualTo(notRealPassword)

        val loginRequest = LoginRequest(existingUser.username, existingUser.email, notRealPassword)

        this.mockMvc.perform(
            post("$authUrl/login")
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().is4xxClientError)
            .andDo(document(
                "login-fail",
                responseFields(errorResponseFields())))
    }

    @Test
    fun `Admin expiration OAuth token test`() {
        val (account, realPassword, _) = gitlabHelper.createRealUser()

        assertThat(restClient.oAuthAdminToken.get()).isNotNull

        val returnedResult: UserDto = this.mockMvc.perform(
            this.acceptContentAuth(get("$sessionsUrl/find/user?gitlab_id=${account.person.gitlabId}"), account))
            .andExpect(status().isOk)
            .andDo(document(
                "get-user-info",
                responseFields(userDtoResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, UserDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(account.id)
        assertThat(returnedResult.username).isEqualTo(account.username)

        verify(exactly = 1) { restClient["forceRefreshAdminOAuthToken"]() }

        val (expired, token) = restClient.oAuthAdminToken.get()!!

        //Make token invalidated to GitlabRestClient obtain a new one
        restClient.oAuthAdminToken.set(Pair(expired, "${token}1"))

        val returnedResult2: UserDto = this.mockMvc.perform(
            this.acceptContentAuth(get("$sessionsUrl/find/user?gitlab_id=${account.person.gitlabId}"), account))
            .andExpect(status().isOk)
            .andDo(document(
                "get-user-info",
                responseFields(userDtoResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, UserDto::class.java)
            }

        assertThat(returnedResult2.id).isEqualTo(account.id)
        assertThat(returnedResult2.username).isEqualTo(account.username)

        verify(exactly = 2) { restClient["forceRefreshAdminOAuthToken"]() }
    }

    private fun userDtoResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath("username").type(JsonFieldType.STRING).description("An unique username"),
            fieldWithPath("email").type(JsonFieldType.STRING).description("An valid email"),
            fieldWithPath("gitlab_id").type(JsonFieldType.NUMBER).description("A gitlab id")
        )
    }

    private fun userSecretDtoResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath("username").type(JsonFieldType.STRING).description("An unique username"),
            fieldWithPath("email").type(JsonFieldType.STRING).description("An valid email"),
            fieldWithPath("gitlab_id").type(JsonFieldType.NUMBER).description("A gitlab id"),
            fieldWithPath("token").type(JsonFieldType.STRING).optional().description("The permanent (with long-lifetime) token to authenticate in gitlab and mlreef. Can be used in PRIVATE-TOKEN"),
            fieldWithPath("access_token").type(JsonFieldType.STRING).optional().description("The OAuth (with short-lifetime) access token to authenticate in gitlab and mlreef. Can be used in PRIVATE-TOKEN"),
            fieldWithPath("refresh_token").type(JsonFieldType.STRING).optional().description("The OAuth refresh token to authenticate in gitlab and mlreef. an be used in PRIVATE-TOKEN")
        )
    }

    private fun registerRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("password").type(JsonFieldType.STRING).description("A plain text password"),
            fieldWithPath("username").type(JsonFieldType.STRING).description("A valid, not-yet-existing username"),
            fieldWithPath("email").type(JsonFieldType.STRING).description("A valid email"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("The fullname of the user")
        )
    }

    private fun loginRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("password").type(JsonFieldType.STRING).description("The plain text password"),
            fieldWithPath("username").type(JsonFieldType.STRING).optional().description("At least username or email has to be provided"),
            fieldWithPath("email").type(JsonFieldType.STRING).optional().description("At least username or email has to be provided")
        )
    }
}
