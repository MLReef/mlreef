package com.mlreef.rest.v1.system

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.SystemTestConfiguration
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.RestTemplate

@Component
@Profile(ApplicationProfiles.SYSTEM_TEST)
class GenericRestClient(
    private val conf: ApplicationConfiguration,
    private val testConf: SystemTestConfiguration,
    private val builder: RestTemplateBuilder,
    private val objectMapper: ObjectMapper
) {
    val rootUrl = "${testConf.backendUrl}/api/v1"

    fun restTemplate(): RestTemplate = builder.build()

    companion object {
        private const val PRIVATE_TOKEN = "PRIVATE-TOKEN"
        private const val EPF_BOT_TOKEN = "EPF-BOT-TOKEN"
        private const val OAUTH_TOKEN_VALUE_PREFIX = "Bearer "
    }

    private fun <T : HttpEntity<out Any>, R> T.makeRequest(block: (T) -> R): R {
        try {
            return block.invoke(this)
        } catch (ex: HttpStatusCodeException) {
            throw ex
        }
    }

    final inline fun <reified T> get(url: String, token: String? = null) = sendRequest(url, HttpMethod.GET, token, null, T::class.java)
    final inline fun <reified T> delete(url: String, token: String? = null) = sendRequest(url, HttpMethod.DELETE, token, null, T::class.java)
    final inline fun <reified T> post(url: String, token: String? = null, body: Any? = null) = sendRequest(url, HttpMethod.POST, token, body, T::class.java)
    final inline fun <reified T> put(url: String, token: String? = null, body: Any? = null) = sendRequest(url, HttpMethod.PUT, token, body, T::class.java)

//    private inline fun <reified T> sendRequest(url: String, method: HttpMethod, token: String? = null, body: Any? = null) = sendRequest(url, method, token, body, T::class.java)

    fun <T> sendRequest(url: String, method: HttpMethod, token: String? = null, body: Any? = null, returnClass: Class<T>? = null): ResponseEntity<T> {

        val headers = if (token != null) {
            HttpHeaders().apply {
                set(PRIVATE_TOKEN, "$OAUTH_TOKEN_VALUE_PREFIX$token")
            }
        } else {
            HttpHeaders()
        }.apply {
            accept = listOf(MediaType.APPLICATION_JSON)
            contentType = MediaType.APPLICATION_JSON
        }

        val request = if (body != null) {
            HttpEntity(body, headers)
        } else {
            HttpEntity("", headers)
        }
        return restTemplate().exchange(rootUrl + url, method, request, returnClass)
    }

    fun <T> sendEpfRequest(absoluteUrl: String, method: HttpMethod, epfSecret: String, body: Any? = null, returnClass: Class<T>? = null): ResponseEntity<T> {

        val headers = HttpHeaders().apply {
            set(EPF_BOT_TOKEN, epfSecret)
        }.apply {
            accept = listOf(MediaType.APPLICATION_JSON)
            contentType = MediaType.APPLICATION_JSON
        }

        val request = if (body != null) {
            HttpEntity(body, headers)
        } else {
            HttpEntity("", headers)
        }
        return restTemplate().exchange(absoluteUrl, method, request, returnClass)
    }
}