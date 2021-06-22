package com.mlreef.rest.api.v1

//import com.mlreef.rest.config.security.social.TwitterApi
import com.mlreef.rest.config.security.PRIVATE_TOKEN_NAME
import com.mlreef.rest.feature.auth.SocialService
import com.mlreef.rest.utils.RestClientFactory
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.time.temporal.ChronoUnit
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import kotlin.math.absoluteValue


@RestController
@RequestMapping(value = ["/api/v1/social"])
class SocialController(
    private val restClientFactory: RestClientFactory,
    private val socialService: SocialService,
    @Value("\${mlreef.oauth2.put-token-to-cookie:false}")
    private val putTokenToCookie: Boolean = false,
    @Value("\${mlreef.oauth2.put-token-to-header:true}")
    private val putTokenToHeader: Boolean = true,
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    @GetMapping("/authorize/{clientId}")
    fun getSocialConnect(
        @PathVariable clientId: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
        response.sendRedirect(
            socialService.getAuthenticationRedirectPath(clientId, request, response)
        )
    }

    @GetMapping("/login/{clientId}")
    fun loginSocial(
        @PathVariable clientId: String,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
        val (redirectUrl, accountToken) = socialService.getAfterLoginRedirectPath(clientId, request, response)

        accountToken?.takeIf { !it.revoked }?.let {
            if (putTokenToCookie) {
                val tokenCookie = Cookie(PRIVATE_TOKEN_NAME, it.token)
                tokenCookie.path = "/"
                tokenCookie.isHttpOnly = true
                tokenCookie.maxAge = ChronoUnit.SECONDS.between(Instant.now(), it.expiresAt).absoluteValue.toInt()
                response.addCookie(tokenCookie)
            }
            if (putTokenToHeader) {
                response.addHeader(PRIVATE_TOKEN_NAME, it.token)
            }
        } ?: deleteAuthCookie(response)

        response.sendRedirect(redirectUrl)
    }

    private fun deleteAuthCookie(response: HttpServletResponse) {
        val tokenCookie = Cookie(PRIVATE_TOKEN_NAME, "")
        tokenCookie.path = "/"
        tokenCookie.isHttpOnly = true
        tokenCookie.maxAge = 0

        response.addCookie(tokenCookie)
    }
}