package com.mlreef.rest.external_api.gitlab

import com.mlreef.rest.config.RedisSessionStrategy
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
class GitlabRestClient(
    private val builder: RestTemplateBuilder,
    @Value("\${mlreef.gitlab.rootUrl}")
    val gitlabRootUrl: String,
    @Value("\${mlreef.gitlab.adminUserToken}")
    val gitlabAdminUserToken: String
) {

    val gitlabServiceRootUrl = "$gitlabRootUrl/api/v4"

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

    fun restTemplate(builder: RestTemplateBuilder): RestTemplate =
        builder.build()

    fun getUser(token: String): GitlabUser {
        return HttpHeaders()
            .apply {
                set("PRIVATE-TOKEN", token)
            }
            .let {
                HttpEntity<String>("body", it)
            }
            .let {
                val url = "$gitlabServiceRootUrl/user"
                restTemplate(builder).exchange(url, HttpMethod.GET, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminCreateUser(email: String, username: String, name: String, password: String): GitlabUser {
        return GitlabCreateUserRequest(email = email, username = username, name = name, password = password)
            .let { HttpEntity(it, createAdminHeaders()) }
            .let {
                val url = "$gitlabServiceRootUrl/users"
                restTemplate(builder).exchange(url, HttpMethod.POST, it, GitlabUser::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    fun adminCreateUserToken(gitlabUserId: Int, tokenName: String): GitlabUserToken {
        return GitlabCreateUserTokenRequest(name = tokenName)
            .let { HttpEntity(it, createAdminHeaders()) }
            .let {
                restTemplate(builder).exchange(
                    "$gitlabServiceRootUrl/users/$gitlabUserId/impersonation_tokens",
                    HttpMethod.POST,
                    it,
                    GitlabUserToken::class.java)
            }
            .also { logGitlabCall(it) }
            .body!!
    }

    private fun logGitlabCall(it: ResponseEntity<out Any>) {
        if (it.statusCode.is2xxSuccessful) {
            log.info("Received from gitlab: ${it.headers.location} ${it.statusCode}")
        } else {
            log.warn("Received from gitlab: ${it.headers.location} ${it.statusCode}")
            log.warn(it.headers.toString())
        }
    }

    private fun createAdminHeaders(): HttpHeaders =
        HttpHeaders().apply {
            set("PRIVATE-TOKEN", gitlabAdminUserToken)
        }
}
