package com.mlreef.rest.utils

import com.fasterxml.jackson.databind.ObjectMapper
import io.netty.handler.ssl.SslContextBuilder
import io.netty.handler.ssl.util.InsecureTrustManagerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.http.codec.ClientCodecConfigurer
import org.springframework.http.codec.json.Jackson2JsonDecoder
import org.springframework.http.codec.json.Jackson2JsonEncoder
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.ExchangeStrategies
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import reactor.netty.tcp.ProxyProvider

class RestClient(
    val url: String? = null,
    val contentType: MediaType? = null,
    val proxyHost: String? = null,
    val proxyPort: Int? = null,
    val objectMapper: ObjectMapper? = null
) {
    val webClient: WebClient

    init {
        val connector = if (proxyHost != null && proxyPort != null) {
            val sslContext = SslContextBuilder
                .forClient()
                .trustManager(InsecureTrustManagerFactory.INSTANCE)
                .build()

            val httpClient = HttpClient.create()
                .tcpConfiguration { tcpClient ->
                    tcpClient.proxy { proxy ->
                        proxy.type(ProxyProvider.Proxy.HTTP).host(proxyHost).port(proxyPort)
                    }
                }
                .secure {
                    it.sslContext(sslContext)
                }
            ReactorClientHttpConnector(httpClient)
        } else null

        val strategy = if (objectMapper != null) {
            ExchangeStrategies
                .builder()
                .codecs { clientDefaultCodecsConfigurer: ClientCodecConfigurer ->
                    clientDefaultCodecsConfigurer.defaultCodecs()
                        .jackson2JsonEncoder(Jackson2JsonEncoder(objectMapper, MediaType.APPLICATION_JSON)) //No need to use custom objectMapper here because Keycloak accepts camelCase requests and returns snake_case
                    clientDefaultCodecsConfigurer.defaultCodecs().jackson2JsonDecoder(Jackson2JsonDecoder(objectMapper, MediaType.APPLICATION_JSON))
                }.build()
        } else null

        webClient = WebClient.builder()
            .apply {
                if (url != null) it.baseUrl(url)
            }
            .apply {
                if (contentType != null) it.defaultHeader(HttpHeaders.CONTENT_TYPE, contentType.type)
            }
            .apply {
                if (connector != null) it.clientConnector(connector)
            }
            .apply {
                if (strategy != null) it.exchangeStrategies(strategy)
            }
            .build()
    }

    fun <T> sendRequest(
        url: String,
        method: HttpMethod = HttpMethod.GET,
        contentType: MediaType = MediaType.APPLICATION_JSON,
        accept: List<MediaType>? = null,
        authorization: String? = null,
        body: Any? = null,
        headers: Map<String, Any>? = null,
        formData: Map<String, Any>? = null,
        params: Map<String, String>? = null,
        returnClass: Class<T>,
        errorProcessor: ((t: Throwable) -> T?)? = null
    ): ResponseEntity<T>? {

        val paramString = params?.takeIf { it.isNotEmpty() }?.let { "?${it.map { "${it.key}=${it.value}" }.joinToString("&")}" } ?: ""

        val client = webClient
            .method(method)
            .uri("$url$paramString")

        headers?.takeIf { it.isNotEmpty() }?.let {
            it.forEach { t, u ->
                when (u) {
                    is Collection<*> -> client.header(t, *u.map { it as? String ?: it.toString() }.toTypedArray())
                    is String -> client.header(t, u)
                    else -> client.header(t, u.toString())
                }
            }
        }

        val clientWithBody = client
            .contentType(contentType)
            .apply {
                accept?.let { this.accept(*it.toTypedArray()) }
            }
            .apply {
                authorization?.let { this.header("Authorization", it) }
            }
            .apply {
                body?.let { this.bodyValue(it) }
            }
            .apply {
                formData?.let { form ->
                    this
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .body(
                            BodyInserters.fromFormData(LinkedMultiValueMap(form.mapValues { listOf(it.value.toString()) }))
                        )
                }
            }

        return try {
            clientWithBody.retrieve().toEntity(returnClass).block()
        } catch (ex: Exception) {
            if (errorProcessor != null) {
                return ResponseEntity(errorProcessor.invoke(ex), HttpStatus.INTERNAL_SERVER_ERROR)
            } else {
                throw ex
            }
        }
    }

    inline fun <reified T> sendRequest(
        url: String,
        method: HttpMethod = HttpMethod.GET,
        contentType: MediaType = MediaType.APPLICATION_JSON,
        authorization: String? = null,
        body: Any? = null,
        formData: Map<String, Any>? = null,
        params: Map<String, String>? = null
    ): T? {

        val paramString = if (params != null) "?${params.map { "${it.key}=${it.value}" }.joinToString("&")}" else ""

        val client = webClient
            .method(method)
            .uri("$url$paramString")

        // val form = BodyInserters.fromFormData(LinkedMultiValueMap(formData?.mapValues { listOf(it.value.toString()) }))

        val clientWithBody = client
            .contentType(contentType)
            .apply {
                if (authorization != null) this.header("Authorization", authorization)
            }
            .apply {
                if (body != null) this.bodyValue(body)
            }

        return clientWithBody.retrieve().bodyToMono(T::class.java).block();
    }
}