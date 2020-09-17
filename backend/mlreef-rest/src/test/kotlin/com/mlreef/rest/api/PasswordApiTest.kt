package com.mlreef.rest.api

import com.mlreef.rest.EmailRepository
import com.mlreef.rest.api.v1.PasswordResetRequest
import com.mlreef.rest.feature.auth.PasswordService
import com.mlreef.rest.feature.email.TemplateService
import com.ninjasquad.springmockk.SpykBean
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import java.time.ZonedDateTime
import java.util.UUID
import javax.mail.internet.MimeMessage
import javax.transaction.Transactional

class PasswordApiTest : AbstractRestApiTest() {

    val baseUrl = "/api/v1/password"

    @SpykBean
    lateinit var passwordService: PasswordService

    @SpykBean
    lateinit var templateService: TemplateService

    @SpykBean
    lateinit var mailSender: JavaMailSender

    @SpykBean
    lateinit var mailRepository: EmailRepository

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        every { templateService.createPasswordResetTemplateHtml(any()) } returns "Generated email template"

        every { mailSender.send(ofType(SimpleMailMessage::class)) } just Runs
        every { mailSender.send(ofType(MimeMessage::class)) } just Runs
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can request password reset by email`() {
        val existingUser = createMockUser()

        val url = "$baseUrl/reset?email=${existingUser.email}"

        this.performPost(url)
            .expectNoContent()
            .document("password-reset-successful",
                requestParameters(
                    parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    parameterWithName("email").optional().description("User email"),
                    parameterWithName("user_name").optional().description("Username")
                ))
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Cannot request password reset for non existing user`() {
        val url = "$baseUrl/reset?email=notexistingemail@example.com"

        this.performPost(url).isNotFound()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Confirm password reset by email`() {
        val existingUser = createMockUser()

        var changedUser = existingUser.copyWithToken(UUID.randomUUID().toString(), ZonedDateTime.now())
        changedUser = accountRepository.save(changedUser)

        val resetConfirmRequest = PasswordResetRequest(changedUser.changeAccountToken!!, "NEW-PASSWORD")

        val url = "$baseUrl/reset/confirm"

        this.performPost(url, body = resetConfirmRequest)
            .expectOk()
            .document("password-reset-confirmation",
                requestFields(confirmPasswordResetFields())
            )
            .returns(Boolean::class.java)
    }

    fun confirmPasswordResetFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("token").type(JsonFieldType.STRING).optional().description("Token gotten from url"),
            fieldWithPath("password").type(JsonFieldType.STRING).optional().description("New user password")
        )
    }
}
