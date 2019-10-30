package com.mlreef.rest.external_api.gitlab

import com.mlreef.rest.config.AuthService
import lombok.extern.slf4j.Slf4j
import org.springframework.stereotype.Service

@Slf4j
@Service("authService")
open class GitlabAuthService(private val gitlabRestClient: GitlabRestClient) : AuthService {

    override fun findByToken(token: String): TokenDetails? {

        val user = try {
            gitlabRestClient.getUser(token)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }

        return TokenDetails(
                token = token,
                gitlabUser = user,
                valid = (user != null)
        )
    }

}
