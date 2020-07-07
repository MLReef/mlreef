package com.mlreef.rest.api

import com.mlreef.rest.EmailRepository
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
import org.springframework.test.annotation.Rollback
import javax.mail.internet.MimeMessage
import javax.transaction.Transactional

class PasswordApiTest : AbstractRestApiTest() {

    val authUrl = "/api/v1/password"

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

        val url = "$authUrl/reset?email=${existingUser.email}"

        this.performPost(url)
            .expectNoContent()
            .document("password-reset-successful")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Cannot request password reset for non existing user`() {
        val url = "$authUrl/reset?email=notexistingemail@example.com"

        this.performPost(url)
            .expectBadRequest()
    }


}
