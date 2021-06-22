package com.mlreef.rest.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.ProxyConfiguration
import org.springframework.stereotype.Component

@Component
class RestClientFactory(
    private val proxyConfig: ProxyConfiguration,
    private val objectMapper: ObjectMapper
) {
    fun getRestClient(): RestClient {
        return if (!proxyConfig.enabled) {
            RestClient(objectMapper = objectMapper)
        } else {
            RestClient(proxyHost = proxyConfig.host, proxyPort = proxyConfig.port, objectMapper = objectMapper)
        }
    }
}