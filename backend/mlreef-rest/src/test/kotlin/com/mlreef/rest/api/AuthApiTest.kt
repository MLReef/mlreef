package com.mlreef.rest.api

import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.RegisterRequest
import com.mlreef.rest.api.v1.UpdateRequest
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.domain.UserRole
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabAuthenticationFailedException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.SpykBean
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import java.time.ZonedDateTime
import java.util.UUID
import javax.mail.internet.MimeMessage
import javax.transaction.Transactional

class AuthApiTest : AbstractRestApiTest() {

    val authUrl = "/api/v1/auth"

    @SpykBean
    lateinit var mailSender: JavaMailSender

    @BeforeEach
    fun clearRepo() {
        every { mailSender.send(ofType(SimpleMailMessage::class)) } just Runs
        every { mailSender.send(ofType(MimeMessage::class)) } just Runs
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can register with new user`() {
        val randomUserName = RandomUtils.generateRandomUserName(10)
        val randomPassword = RandomUtils.generateRandomPassword(30, true)
        val email = "$randomUserName@example.com"
        val registerRequest = RegisterRequest(randomUserName, email, randomPassword, "absolute-new-name")

        val url = "$authUrl/register"

        val result = this.performPost(url, body = registerRequest)
            .expectOk()
            .document("register-success",
                requestFields(registerRequestFields()),
                responseFields(userSecretDtoResponseFields()))
            .returns(SecretUserDto::class.java)

        with(accountRepository.findOneByEmail(email)!!) {
            assertThat(id).isEqualTo(result.id)
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Cannot register with existing user`() {
        val existingUser = createMockUser()
        val registerRequest = RegisterRequest(existingUser.username, existingUser.email, "any other password", "another-new-name")

        val url = "$authUrl/register"

        this.performPost(url, body = registerRequest)
            .expect4xx()
            .document("register-fail",
                responseFields(errorResponseFields()))
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can login with existing user`() {
        every {
            restClient.userLoginOAuthToGitlab(any(), any())
        } returns OAuthToken("accesstoken12345", "refreshtoken1234567", "bearer", "api", 1585910424)

        val plainPassword = "password"
        val existingUser = createMockUser(plainPassword, "0000")
        val loginRequest = LoginRequest(existingUser.username, existingUser.email, plainPassword)

        val url = "$authUrl/login"

        val result = this.performPost(url, body = loginRequest)
            .expectOk()
            .document("login-success",
                requestFields(loginRequestFields()),
                responseFields(userSecretDtoResponseFields()))
            .returns(SecretUserDto::class.java).censor()

        assertThat(result).isNotNull
        assertThat(result.username).isEqualTo(existingUser.username)
        assertThat(result.email).isEqualTo(existingUser.email)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Cannot login with Gitlab is rejected credentials`() {
        every {
            restClient.userLoginOAuthToGitlab(any(), any())
        } answers {
            throw GitlabAuthenticationFailedException(403, ErrorCode.ValidationFailed, "Bad credentials")
        }

        val plainPassword = "password"
        val existingUser = createMockUser(plainPassword, "0000")
        val loginRequest = LoginRequest(existingUser.username, existingUser.email, plainPassword)

        val url = "$authUrl/login"

        this.performPost(url, body = loginRequest)
            .expect4xx()
            .document("login-fail",
                responseFields(errorResponseFields()))
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update an existing user`() {
        val randomUserName = RandomUtils.generateRandomUserName(10)
        val randomPassword = RandomUtils.generateRandomPassword(30, true)
        val email = "$randomUserName@example.com"
        val registerRequest = RegisterRequest(randomUserName, email, randomPassword, "absolute-new-name")

        val url = "$authUrl/register"

        val result = this.performPost(url, body = registerRequest)
            .expectOk()
            .returns(SecretUserDto::class.java)

        with(accountRepository.findOneByEmail(email)!!) {
            assertThat(id).isEqualTo(result.id)
            assertThat(username).isEqualTo(result.username).isEqualTo(randomUserName)
        }

        val newRandomUserName = RandomUtils.generateRandomUserName(10)
        val newEmail = "$newRandomUserName@example.com"

        val updateRequest = UpdateRequest(
            newRandomUserName,
            newEmail
        )

        val tokenDetails = TokenDetails(
            result.username,
            "new-token-${UUID.randomUUID()}",
            result.id,
            UUID.randomUUID()
        )

        mockSecurityContextHolder(tokenDetails)

        val returnedResult2: UserDto = this.performPut("$authUrl/update/${result.id}", token = "new-token-${UUID.randomUUID()}", body = updateRequest)
            .expectOk()
            .document("update-profile-success",
                requestFields(updateProfileRequestFields()),
                responseFields(userDtoResponseFields()))
            .returns()

        with(accountRepository.findOneByEmail(newEmail)!!) {
            assertThat(id).isEqualTo(returnedResult2.id)
            assertThat(username).isEqualTo(returnedResult2.username).isEqualTo(newRandomUserName)
        }

        assertThat(accountRepository.findOneByEmail(email)).isNull()
        assertThat(accountRepository.findOneByUsername(randomUserName)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own user`() {
        val randomUserName = RandomUtils.generateRandomUserName(10)
        val randomPassword = RandomUtils.generateRandomPassword(30, true)
        val email = "$randomUserName@example.com"
        val registerRequest = RegisterRequest(randomUserName, email, randomPassword, "absolute-new-name")

        val result = this.performPost("$authUrl/register", body = registerRequest)
            .expectOk()
            .returns(SecretUserDto::class.java)

        mockSecurityContextHolder(TokenDetails(
            result.username,
            "new-token-${UUID.randomUUID()}",
            result.id,
            UUID.randomUUID()
        ))

        val returnedResult2: UserDto = this.performPut(
            "$authUrl/user",
            token = "new-token-${UUID.randomUUID()}",
            body = UpdateRequest(
                termsAcceptedAt = ZonedDateTime.now(),
                hasNewsletters = true,
                userRole = UserRole.DEVELOPER,
                email = email,
                username = randomUserName
            ))
            .expectOk()
            .document("update-own-profile-success",
                requestFields(updateProfileRequestFields()),
                responseFields(userDtoResponseFields()))
            .returns()

        with(accountRepository.findOneByEmail(email)!!) {
            assertThat(id).isEqualTo(returnedResult2.id)
            assertThat(returnedResult2.userRole).isEqualTo(UserRole.DEVELOPER)
            assertThat(returnedResult2.hasNewsletters).isEqualTo(true)
            assertThat(returnedResult2.termsAcceptedAt).isNotNull
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get who-am-i`() {
        mockUserAuthentication(forAccount = mainAccount)

        val result: UserDto = this.performGet("$authUrl/whoami", token = mainToken)
            .expectOk()
            .document(
                "who-am-i",
                responseFields(userDtoResponseFields())
            )
            .returns()

        assertThat(mainAccount.username).isEqualTo(result.username)
        assertThat(mainAccount.email).isEqualTo(result.email)
        assertThat(mainAccount.id).isEqualTo(result.id)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can check token`() {
        val account = mainAccount

        mockUserAuthentication()

        val result: UserDto = this.performGet("$authUrl/check/token", token = "new-token-${UUID.randomUUID()}")
            .expectOk()
            .document(
                "check-token",
                responseFields(userDtoResponseFields())
            )
            .returns()

        assertThat(account.id).isEqualTo(result.id)
        assertThat(result.username).isEqualTo("mock_user")
        assertThat(result.email).isEqualTo("mock@example.com")
    }

    private fun userSecretDtoResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath("username").type(JsonFieldType.STRING).description("An unique username"),
            fieldWithPath("email").type(JsonFieldType.STRING).description("An valid email"),
            fieldWithPath("gitlab_id").type(JsonFieldType.NUMBER).description("A gitlab id"),
            fieldWithPath("token").type(JsonFieldType.STRING).optional().description("The permanent (with long-lifetime) token to authenticate in gitlab and mlreef. Can be used in PRIVATE-TOKEN"),
            fieldWithPath("access_token").type(JsonFieldType.STRING).optional().description("The OAuth (with short-lifetime) access token to authenticate in gitlab and mlreef. Can be used in PRIVATE-TOKEN"),
            fieldWithPath("refresh_token").type(JsonFieldType.STRING).optional().description("The OAuth refresh token to authenticate in gitlab and mlreef. an be used in PRIVATE-TOKEN"),
            fieldWithPath("user_role").optional().type(JsonFieldType.STRING).description("UserRole describes the main usage type of this user"),
            fieldWithPath("terms_accepted_at").optional().type(JsonFieldType.STRING).description("Timestamp, when the terms & conditions have been accepted."),
            fieldWithPath("has_newsletters").optional().type(JsonFieldType.BOOLEAN).description("Indicates that the user wants to retrieve newsletters, or not"),
        )
    }

    private fun userDtoResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath("username").type(JsonFieldType.STRING).description("An unique username"),
            fieldWithPath("email").type(JsonFieldType.STRING).description("An valid email"),
            fieldWithPath("gitlab_id").type(JsonFieldType.NUMBER).description("A gitlab id"),
            fieldWithPath("user_role").optional().type(JsonFieldType.STRING).description("UserRole describes the main usage type of this user"),
            fieldWithPath("terms_accepted_at").optional().type(JsonFieldType.STRING).description("Timestamp, when the terms & conditions have been accepted."),
            fieldWithPath("has_newsletters").optional().type(JsonFieldType.BOOLEAN).description("Indicates that the user wants to retrieve newsletters, or not"),
        )
    }

    private fun registerRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("password").type(JsonFieldType.STRING).description("A plain text password"),
            fieldWithPath("username").type(JsonFieldType.STRING).description("A valid, not-yet-existing username"),
            fieldWithPath("email").type(JsonFieldType.STRING).description("A valid email"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("The fullname of the user"),
        )
    }

    private fun updateProfileRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("username").type(JsonFieldType.STRING).description("A valid, not-yet-existing username"),
            fieldWithPath("email").type(JsonFieldType.STRING).description("A valid email"),
            fieldWithPath("name").type(JsonFieldType.STRING).optional().description("The fullname of the user"),
            fieldWithPath("user_role").optional().type(JsonFieldType.STRING).description("UserRole: Can be DATA_SCIENTIST,\n" +
                "    DEVELOPER,\n" +
                "    ML_ENGINEER,\n" +
                "    RESEARCHER,\n" +
                "    STUDENT,\n" +
                "    TEAM_LEAD,"),
            fieldWithPath("terms_accepted_at").optional().type(JsonFieldType.STRING).description("Timestamp, when the terms & conditions have been accepted."),
            fieldWithPath("has_newsletters").optional().type(JsonFieldType.BOOLEAN).description("Indicates that the user wants to retrieve newsletters, or not")

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
