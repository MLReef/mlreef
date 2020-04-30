package com.mlreef.rest.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration
import org.springframework.restdocs.operation.preprocess.Preprocessors
import org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.regex.Pattern

@TestPropertySource("classpath:application.yml")
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@ContextConfiguration(initializers = [TestRedisContainer.Initializer::class, TestPostgresContainer.Initializer::class])
abstract class RestApiTest {

    lateinit var mockMvc: MockMvc

    companion object {
        const val testPrivateUserTokenMock: String = "doesnotmatterat-all123"
        const val HEADER_PRIVATE_TOKEN = "PRIVATE-TOKEN"
        const val EPF_HEADER = "EPF-BOT-USER"
    }

    @Autowired protected lateinit var objectMapper: ObjectMapper

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository

    @Autowired protected lateinit var pipelineService: PipelineService

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var restClient: GitlabRestClient

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var currentUserService: CurrentUserService

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        val censoredSecretHash = testPrivateUserTokenMock.substring(0, 5) + "**********"
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .apply<DefaultMockMvcBuilder>(documentationConfiguration(restDocumentation)
                .operationPreprocessors()
                .withRequestDefaults(
                    removeHeaders(HEADER_PRIVATE_TOKEN),
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock), censoredSecretHash))
                .withResponseDefaults(
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock), censoredSecretHash))
            )
            .build()


        every { restClient.userLoginOAuthToGitlab(any(), any()) } returns
            OAuthToken(
                "accesstoken12345",
                "refreshtoken1234567",
                "bearer",
                "api",
                1585910424)

        val gitlabUser = GitlabUser(
            id = 1,
            name = "Mock Gitlab User",
            username = "mock_user",
            email = "mock@example.com",
            state = "active"
        )

        every { restClient.getUser(any()) } returns
            GitlabUser(
                id = 1,
                name = "Mock Gitlab User",
                username = "mock_user",
                email = "mock@example.com",
                state = "active"
            )


        every {
            restClient.adminCreateUser(
                any(), any(), any(), any()
            )
        } returns
            gitlabUser


        every {
            restClient.adminCreateUserToken(any(), any())
        } returns
            GitlabUserToken(
                id = 1,
                revoked = false,
                token = testPrivateUserTokenMock,
                active = true,
                name = "mlreef-token"
            )

        every {
            restClient.adminCreateGroup(any(), any())
        } returns
            GitlabGroup(
                id = 1,
                webUrl = "http://127.0.0.1/",
                name = "Mock Gitlab Group",
                path = "mock-group"
            )


        every {
            restClient.adminAddUserToGroup(any(), any(), any())
        } returns
            GitlabUserInGroup(
                id = 1,
                webUrl = "http://127.0.0.1/",
                name = "Mock Gitlab Group",
                username = "mock-group"
            )

        every {
            restClient.createProject(any(), any(), any(), any(), any(), any(), any(), any(), any(), any())
        } returns
            GitlabProject(
                id = 1,
                name = "Mock Gitlab Project",
                nameWithNamespace = "mlreef / Mock Gitlab Project",
                path = "test-path",
                pathWithNamespace = "mlreef/test-path",
                owner = gitlabUser,
                creatorId = 1L,
                webUrl = "http://127.0.0.1/"
            )


        every {
            restClient.deleteProject(any(), any())
        } returns Unit


        every {
            restClient.userCreateGroup(any(), any(), any())
        } returns GitlabGroup(
            id = 1,
            webUrl = "www.url.com",
            name = "test-group",
            path = "test-path"
        )
        every { restClient.userGetUserGroups(any()) } returns emptyList()
        every { restClient.createBranch(any(), any(), any(), any()) } returns Branch("branch")
        every { restClient.commitFiles(any(), any(), any(), any(), any(), any()) } returns Commit("branch")


        every {
            currentUserService.person()
        } answers { personRepository.findAll().first() }

        every {
            currentUserService.account()
        } answers { accountRepository.findAll().first() }

        every {
            currentUserService.permanentToken()
        } answers { testPrivateUserTokenMock }
    }

    protected fun defaultAcceptContentAuth(requestBuilder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(HEADER_PRIVATE_TOKEN, testPrivateUserTokenMock)
            .contentType(MediaType.APPLICATION_JSON)
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

}
