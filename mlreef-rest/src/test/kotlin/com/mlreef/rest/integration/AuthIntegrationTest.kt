package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.dto.UserDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class AuthIntegrationTest : IntegrationRestApiTest() {

    val sessionsUrl = "/api/v1/sessions"

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
    }

    @Test
    fun `Admin expiration OAuth token test`() {
        val (account, realPassword, _) = gitlabHelper.createRealUser()

        assertThat(restClient.oAuthAdminToken.get()).isNotNull

        val returnedResult: UserDto = this.mockMvc.perform(
            this.acceptContentAuth(get("$sessionsUrl/find/user?gitlab_id=${account.person.gitlabId}"), account))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, UserDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(account.id)
        assertThat(returnedResult.username).isEqualTo(account.username)

        val (expired, token) = restClient.oAuthAdminToken.get()!!

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
