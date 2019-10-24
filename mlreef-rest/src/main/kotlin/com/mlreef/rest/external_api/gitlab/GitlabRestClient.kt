package com.mlreef.rest.external_api.gitlab

import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
open class GitlabRestClient(private val builder: RestTemplateBuilder) {

    companion object {
        private const val GITLAB_API_ROOT = "https://gitlab.com/api/v4"
    }

    @Bean
    fun restTemplate(builder: RestTemplateBuilder): RestTemplate {
        return builder.build()
    }

    fun getUser(token: String): GitlabUser? {
        val restTemplate = restTemplate(builder)
        val headers = HttpHeaders()
        headers.set("PRIVATE-TOKEN", token)
        val entity = HttpEntity<String>("body", headers)
        val response: ResponseEntity<GitlabUser> = restTemplate.exchange("$GITLAB_API_ROOT/user", HttpMethod.GET, entity, GitlabUser::class.java)
        return response.body
    }
}
