package com.mlreef.rest.feature.email

import com.mlreef.rest.feature.AbstractContextTest
import com.ninjasquad.springmockk.SpykBean
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import org.springframework.transaction.annotation.Transactional

class EmailTemplateServiceContextTest : AbstractContextTest() {
    @SpykBean
    private lateinit var service: EmailTemplateService

    @BeforeEach
    fun setUp() {
    }

    @Transactional
    @Rollback
    @Test
    fun `reset password html template generates message`() {
        val params = mapOf(
            EmailVariables.USER_NAME to "Test user",
            EmailVariables.REDIRECT_URL to "http://example.com/go/to/this/link"
        )
        val html = service.createPasswordResetTemplateHtml(params)

        assertThat(html).isNotNull()
        assertThat(html).contains("Hello Test user")
    }

    @Transactional
    @Rollback
    @Test
    fun `reset password text template generates message`() {
        val params = mapOf(
            EmailVariables.USER_NAME to "Test user",
            EmailVariables.REDIRECT_URL to "http://example.com/go/to/this/link"
        )
        val html = service.createPasswordResetTemplateText(params)

        assertThat(html).isNotNull()
        assertThat(html).contains("Dear Test user")
    }

    @Transactional
    @Rollback
    @Test
    fun `welcome message html template generates message`() {
        val params = mapOf(
            EmailVariables.USER_NAME to "Test user"
        )
        val html = service.createWelcomeMessageTemplateHtml(params)

        assertThat(html).isNotNull()
        assertThat(html).contains("Hello Test user")
    }

    @Transactional
    @Rollback
    @Test
    fun `welcome message text template generates message`() {
        val params = mapOf(
            EmailVariables.USER_NAME to "Test user"
        )
        val html = service.createWelcomeMessageTemplateText(params)

        assertThat(html).isNotNull()
        assertThat(html).contains("Hello Test user")
    }

}