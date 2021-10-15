package com.mlreef.rest.testcommons

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.mlreef.rest.BaseTest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.result.MockMvcResultMatchers


abstract class AbstractRestTest: BaseTest() {

    lateinit var mockMvc: MockMvc

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
        const val HEADER_PRIVATE_TOKEN = "PRIVATE-TOKEN"
        const val EPF_HEADER = "EPF-BOT-TOKEN"
    }

    @Autowired protected lateinit var objectMapper: ObjectMapper

    protected fun acceptContentAuth(
        requestBuilder: MockHttpServletRequestBuilder,
        token: String,
        mediaType: MediaType? = null,
    ): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN)
            .header(HEADER_PRIVATE_TOKEN, token)
            .contentType(mediaType ?: MediaType.APPLICATION_JSON)
    }

    protected fun acceptAnonymousAuth(requestBuilder: MockHttpServletRequestBuilder, mediaType: MediaType? = null): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN)
            .contentType(mediaType ?: MediaType.APPLICATION_JSON)
    }

    protected fun defaultAcceptContentEPFBot(token: String, requestBuilder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(EPF_HEADER, token)
            .contentType(MediaType.APPLICATION_JSON)
    }

    protected fun performPost(url: String, token: String? = null, body: Any? = null) =
        mockMvc.perform(
            generateRequestBuilder(url, token, body, HttpMethod.POST)
        )

    protected fun performPut(url: String, token: String? = null, body: Any? = null) =
        mockMvc.perform(
            generateRequestBuilder(url, token, body, HttpMethod.PUT)
        )

    protected fun performGet(url: String, token: String? = null) =
        mockMvc.perform(
            generateRequestBuilder(url, token, null, HttpMethod.GET)
        )

    protected fun performDelete(url: String, token: String? = null) =
        mockMvc.perform(
            generateRequestBuilder(url, token, null, HttpMethod.DELETE)
        )

    protected fun performEPFPut(token: String, url: String, body: Any? = null) =
        if (body != null) {
            this.mockMvc.perform(
                this.defaultAcceptContentEPFBot(token, RestDocumentationRequestBuilders.put(url))
                    .content(objectMapper.writeValueAsString(body))
            )
        } else {
            this.mockMvc.perform(this.defaultAcceptContentEPFBot(token, RestDocumentationRequestBuilders.put(url)))
        }

    protected fun performPostMultipart(
        url: String,
        file: MockMultipartFile? = null,
        files: List<MockMultipartFile>? = null,
        accessToken: String? = null,
        params: Map<String, String>? = null
    ): ResultActions {
        return mockMvc.perform(
            generateMultipartRequestBuilder(url, accessToken, file, files, params)
        )
    }

    private fun generateRequestBuilder(url: String, token: String?, body: Any?, method: HttpMethod = HttpMethod.GET): MockHttpServletRequestBuilder {
        val builder = when (method) {
            HttpMethod.GET -> RestDocumentationRequestBuilders.get(url)
            HttpMethod.POST -> RestDocumentationRequestBuilders.post(url)
            HttpMethod.PUT -> RestDocumentationRequestBuilders.put(url)
            HttpMethod.DELETE -> RestDocumentationRequestBuilders.delete(url)
            else -> throw RuntimeException("Method not implemented")
        }

        if (body != null) {
            builder.content(objectMapper.writeValueAsString(body))
        }

        return if (token == null) {
            acceptAnonymousAuth(builder)
        } else {
            acceptContentAuth(builder, token)
        }
    }

    private fun generateMultipartRequestBuilder(
        url: String,
        token: String?,
        file: MockMultipartFile? = null,
        files: List<MockMultipartFile>? = null,
        params: Map<String, String>?
    ): MockHttpServletRequestBuilder {
        val builder = RestDocumentationRequestBuilders.fileUpload(url)

        file?.let {
            builder.file(file)
        }

        files?.forEach {
            builder.file(it)
        }

        params?.forEach { t, u -> builder.param(t, u) }

        builder.accept(MediaType.APPLICATION_JSON)

        return if (token == null) {
            acceptAnonymousAuth(builder, MediaType.MULTIPART_FORM_DATA)
        } else {
            acceptContentAuth(builder, token, MediaType.MULTIPART_FORM_DATA)
        }
    }

    fun ResultActions.checkStatus(status: HttpStatus): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().`is`(status.value()))
    }

    fun <T> ResultActions.returnsList(clazz: Class<T>): List<T> {
        return this.andReturn().let {
            val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, clazz)
            objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
        }
    }

    @Deprecated("Is not working properly")
    fun <S, T : RestResponsePage<S>> ResultActions.returnsPage(clazz: Class<S>): T {
        return this.andReturn().let {
            val pageType = object : TypeReference<T>() {}
            objectMapper.readValue(it.response.contentAsByteArray, pageType)
        }
    }

    final inline fun <reified T : Any> ResultActions.returns(): T {
        return this.andReturn().let {
            `access$objectMapper`.readValue(it.response.contentAsByteArray)
        }
    }

    fun <T> ResultActions.returns(clazz: Class<T>): T {
        return this.andReturn().let {
            objectMapper.readValue(it.response.contentAsByteArray, clazz)
        }
    }

    fun <T> ResultActions.returns(valueTypeRef: TypeReference<T>): T {
        return this.andReturn().let {
            objectMapper.readValue(it.response.contentAsByteArray, valueTypeRef)
        }
    }

    fun ResultActions.returnsFile(): ByteArray {
        return this.andReturn().response.contentAsByteArray
    }

    fun ResultActions.expectOk(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isOk)
    }

    fun ResultActions.expectForbidden(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    fun ResultActions.expect4xx(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    fun ResultActions.expectNoContent(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isNoContent)
    }

    fun ResultActions.expectBadRequest(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    fun ResultActions.isNotFound(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isNotFound)
    }

    fun ResultActions.isConflict(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isConflict)
    }

    fun ResultActions.expectFound(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isFound)
    }

    fun ResultActions.isUnavailableForLegalReasons(): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().isUnavailableForLegalReasons)
    }

    @PublishedApi
    internal var `access$objectMapper`: ObjectMapper
        get() = objectMapper
        set(value) {
            objectMapper = value
        }

}



