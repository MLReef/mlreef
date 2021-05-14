package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.PasswordResetRequest
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.SpykBean
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.test.annotation.Rollback
import org.springframework.transaction.annotation.Transactional
import javax.mail.internet.MimeMessage

class PasswordIntegrationTest : AbstractIntegrationTest() {

    val authUrl = "/api/v1/auth"
    val passwordsUrl = "/api/v1/password"

    @SpykBean
    lateinit var mailSender: JavaMailSender

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()

        every { mailSender.send(ofType(SimpleMailMessage::class)) } just Runs
        every { mailSender.send(ofType(MimeMessage::class)) } just Runs
    }

    @Test
    @Transactional
    @Rollback
    fun `Can request reset password`() {
        //GIVEN
        val password = RandomUtils.generateRandomPassword(15, true)
        val (account, token, _) = createRealUser(password = password)

        // FIRST LOGIN WITH OLD PASSWORD
        var loginRequest = LoginRequest(account.username, account.email, password)

        val loginUrl = "$authUrl/login"

        var loginResult = this.performPost(loginUrl, token, loginRequest)
            .expectOk()
            .returns(SecretUserDto::class.java)

        assertThat(loginResult.username).isEqualTo(account.username)
        assertThat(loginResult.email).isEqualTo(account.email)

        // PASSWORD RESET REQUEST
        val passwordResetUrl = "$passwordsUrl/reset?email=${account.email}"

        this.performPost(passwordResetUrl)
            .expectNoContent()

        val accountInDb = accountRepository.findByIdOrNull(account.id)!!

        assertThat(accountInDb.changeAccountToken).isNotNull()
        assertThat(accountInDb.changeAccountTokenCreatedAt).isNotNull()

        // PASSWORD RESET CONFIRM
        val resetConfirmRequest = PasswordResetRequest(accountInDb.changeAccountToken!!, "NEW-PASSWORD")

        val passwordResetConfirmUrl = "$passwordsUrl/reset/confirm"

        val passwordResetResult = this.performPost(passwordResetConfirmUrl, body = resetConfirmRequest)
            .expectOk()
            .returns(Boolean::class.java)

        assertThat(passwordResetResult).isTrue()

        // SECOND LOGIN WITH OLD PASSWORD
        this.performPost(loginUrl, token, loginRequest)
            .expectBadRequest()

        // THIRD LOGIN WITH NEW PASSWORD
        loginRequest = LoginRequest(account.username, account.email, "NEW-PASSWORD")

        loginResult = this.performPost(loginUrl, token, loginRequest)
            .expectOk()
            .returns(SecretUserDto::class.java)

        assertThat(loginResult.username).isEqualTo(account.username)
        assertThat(loginResult.email).isEqualTo(account.email)
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot request reset password for unknown user email`() {
        // PASSWORD REST REQUEST
        val passwordResetUrl = "$passwordsUrl/reset?email=whattheemailitis@example.com"

        this.performPost(passwordResetUrl)
            .expect4xx()
    }

}
