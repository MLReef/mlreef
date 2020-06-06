package com.mlreef.rest.api

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.feature.pipeline.PipelineService
import org.junit.jupiter.api.extension.ExtendWith
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.snippet.Snippet
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@TestPropertySource("classpath:application.yml")
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
abstract class AbstractRestApiTest {

    lateinit var mockMvc: MockMvc

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
        const val HEADER_PRIVATE_TOKEN = "PRIVATE-TOKEN"
        const val EPF_HEADER = "EPF-BOT-TOKEN"

        const val testPrivateUserTokenMock1: String = "doesnotmatterat-all-11111"
        const val testPrivateUserTokenMock2: String = "doesnotmatterat-all-22222"
        const val testPrivateAdminTokenMock: String = "doesnotmatterat-all-admin"
        const val mockUserName1: String = "mockusername1"
        const val mockUserName2: String = "mockusername2"
        const val mockGroupName1: String = "mockgroupname1"
        const val mockGroupName2: String = "mockgroupname2"
    }

    @Autowired protected lateinit var objectMapper: ObjectMapper

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository

    @Autowired protected lateinit var pipelineService: PipelineService

    protected fun acceptContentAuth(
        requestBuilder: MockHttpServletRequestBuilder,
        account: Account? = null,
        token: String? = null
    ): MockHttpServletRequestBuilder {
        val finalToken = token ?: account?.bestToken?.token
        ?: throw RuntimeException("No valid token to execute Gitlab request")
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(HEADER_PRIVATE_TOKEN, finalToken)
            .contentType(MediaType.APPLICATION_JSON)
    }

    protected fun acceptAnonymousAuth(requestBuilder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .contentType(MediaType.APPLICATION_JSON)
    }

    protected fun defaultAcceptContentEPFBot(token: String, requestBuilder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(EPF_HEADER, token)
            .contentType(MediaType.APPLICATION_JSON)
    }

    protected fun performPost(url: String, account: Account? = null, body: Any? = null) =
        if (body != null) {
            this.mockMvc.perform(
                this.acceptContentAuth(RestDocumentationRequestBuilders.post(url), account)
                    .content(objectMapper.writeValueAsString(body)))
        } else {
            this.mockMvc.perform(this.acceptContentAuth(RestDocumentationRequestBuilders.post(url), account))
        }

    protected fun performPut(url: String, account: Account? = null, body: Any? = null) =
        if (body != null) {
            this.mockMvc.perform(
                this.acceptContentAuth(RestDocumentationRequestBuilders.put(url), account)
                    .content(objectMapper.writeValueAsString(body)))
        } else {
            this.mockMvc.perform(this.acceptContentAuth(RestDocumentationRequestBuilders.put(url), account))
        }

    protected fun performGet(url: String, account: Account? = null) =
        this.mockMvc.perform(this.acceptContentAuth(RestDocumentationRequestBuilders.get(url), account))

    protected fun performGet(url: String, account: Account? = null, anonymously: Boolean = false): ResultActions {
        return if (anonymously) {
            this.mockMvc.perform(this.acceptAnonymousAuth(RestDocumentationRequestBuilders.get(url)))
        } else {
            this.mockMvc.perform(this.acceptContentAuth(RestDocumentationRequestBuilders.get(url), account))
        }
    }

    protected fun performDelete(url: String, account: Account? = null) =
        this.mockMvc.perform(this.acceptContentAuth(RestDocumentationRequestBuilders.delete(url), account))

    protected fun performEPFPut(token: String, url: String, body: Any? = null) =
        if (body != null) {
            this.mockMvc.perform(this.defaultAcceptContentEPFBot(token, RestDocumentationRequestBuilders.put(url))
                .content(objectMapper.writeValueAsString(body)))
        } else {
            this.mockMvc.perform(this.defaultAcceptContentEPFBot(token, RestDocumentationRequestBuilders.put(url)))
        }



    protected fun errorResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("error_code").type(JsonFieldType.NUMBER).description("Unique error code"),
            fieldWithPath("error_name").type(JsonFieldType.STRING).description("Short error title"),
            fieldWithPath("error_message").type(JsonFieldType.STRING).description("A detailed message"),
            fieldWithPath("time").type(JsonFieldType.STRING).description("Timestamp of error")
        )
    }

    fun ResultActions.checkStatus(status: HttpStatus): ResultActions {
        return this.andExpect(MockMvcResultMatchers.status().`is`(status.value()))
    }

    fun ResultActions.document(name: String, vararg snippets: Snippet): ResultActions {
        return this.andDo(MockMvcRestDocumentation.document(name, *snippets))
    }

    fun <T> ResultActions.returnsList(clazz: Class<T>): List<T> {
        return this.andReturn().let {
            val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, clazz)
            objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
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
}



