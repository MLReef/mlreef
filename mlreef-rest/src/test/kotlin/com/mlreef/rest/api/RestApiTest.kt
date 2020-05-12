package com.mlreef.rest.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.testcommons.TestGitlabContainer
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.operation.preprocess.Preprocessors
import org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.snippet.Snippet
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.regex.Pattern
@TestPropertySource("classpath:application.yml")
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@ContextConfiguration(initializers = [
    TestRedisContainer.Initializer::class,
    TestPostgresContainer.Initializer::class,
    TestGitlabContainer.Initializer::class])
abstract class RestApiTest {

    lateinit var mockMvc: MockMvc

    companion object {
        private val log = LoggerFactory.getLogger(RestApiTest::class.java)

        const val testPrivateUserTokenMock1: String = "doesnotmatterat-all-11111"
        const val testPrivateUserTokenMock2: String = "doesnotmatterat-all-22222"
        const val testPrivateAdminTokenMock: String = "doesnotmatterat-all-admin"
        const val mockUserName1: String = "mockusername1"
        const val mockUserName2: String = "mockusername2"
        const val mockGroupName1: String = "mockgroupname1"
        const val mockGroupName2: String = "mockgroupname2"
        const val HEADER_PRIVATE_TOKEN = "PRIVATE-TOKEN"
        const val EPF_HEADER = "EPF-BOT-TOKEN"

        lateinit var mockedGitlabUser1: GitlabUser
        lateinit var mockedGitlabUser2: GitlabUser

        @AfterAll
        @JvmStatic
        fun tearDownGlobal() {
            val usersNamesLine = GitlabHelper.allCreatedUsersNames.joinToString(separator = System.lineSeparator(), prefix = "${System.lineSeparator()}USERS:${System.lineSeparator()}")
            val projectsNamesLine = GitlabHelper.allCreatedProjectsNames.joinToString(separator = System.lineSeparator(), prefix = "${System.lineSeparator()}PROJECTS:${System.lineSeparator()}")
            log.info(usersNamesLine)
            log.info(projectsNamesLine)
        }
    }

    @Autowired protected lateinit var objectMapper: ObjectMapper

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository

    @Autowired protected lateinit var pipelineService: PipelineService

    @Autowired
    protected lateinit var restClient: GitlabRestClient

    @Autowired
    private lateinit var builder: RestTemplateBuilder

    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        val censoredSecretHash = testPrivateUserTokenMock1.substring(0, 5) + "**********"
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .apply<DefaultMockMvcBuilder>(documentationConfiguration(restDocumentation)
                .operationPreprocessors()
                .withRequestDefaults(
                    removeHeaders(HEADER_PRIVATE_TOKEN),
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock1), censoredSecretHash))
                .withResponseDefaults(
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock1), censoredSecretHash))
            )
            .build()
    }

    protected fun addRealUserToProject(projectId: Long, userId: Long, accessLevel: GroupAccessLevel? = null) {
        restClient.adminAddUserToProject(projectId = projectId, userId = userId, accessLevel = accessLevel
            ?: GroupAccessLevel.DEVELOPER)
    }

    protected fun acceptContentAuth(requestBuilder: MockHttpServletRequestBuilder, account: Account? = null, token: String? = null): MockHttpServletRequestBuilder {
        val finalToken = token ?: account?.bestToken?.token
        ?: throw RuntimeException("No valid token to execute Gitlab request")
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(HEADER_PRIVATE_TOKEN, finalToken)
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

    protected fun performGet(url: String, account: Account? = null) =
        this.mockMvc.perform(this.acceptContentAuth(RestDocumentationRequestBuilders.get(url), account))

    protected fun performEPFPut(token: String, url: String, body: Any? = null) =
        if (body != null) {
            this.mockMvc.perform(this.defaultAcceptContentEPFBot(token, RestDocumentationRequestBuilders.put(url))
                .content(objectMapper.writeValueAsString(body)))
        } else {
            this.mockMvc.perform(this.defaultAcceptContentEPFBot(token, RestDocumentationRequestBuilders.put(url)))
        }

    protected fun defaultAcceptContentEPFBot(token: String, requestBuilder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(EPF_HEADER, token)
            .contentType(MediaType.APPLICATION_JSON)
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
}



