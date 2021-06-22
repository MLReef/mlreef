package com.mlreef.rest.api

import com.mlreef.rest.feature.auth.SocialService
import com.ninjasquad.springmockk.SpykBean
import io.mockk.every
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

internal class SocialControllerTest : AbstractRestApiTest() {
    val rootUrl = "/api/v1/social"

    @SpykBean
    private lateinit var socialService: SocialService


    @BeforeEach
    fun setUp() {
        every { socialService.getAuthenticationRedirectPath(any(), any(), any()) } returns "https://google.com/oauth/authorize?state=kjjk340833lkn96782bni"
    }

    @Test
    fun getSocialConnect() {
        val url = "$rootUrl/authorize/google"
        this.performGet(url)
            .expectFound()
            .document(
                "call-social-authorization-list",
            )
    }
}