package com.mlreef.rest.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
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
    }

    @Autowired protected lateinit var objectMapper: ObjectMapper

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository

    @MockBean
    protected lateinit var restClient: GitlabRestClient

    @MockBean
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

        Mockito.`when`(restClient.userLoginOAuthToGitlab(
            Mockito.anyString(), Mockito.anyString()
        )).thenReturn(
            OAuthToken("accesstoken12345", "refreshtoken1234567", "bearer", "api", 1585910424)
        )

        val gitlabUser = GitlabUser(
            id = 1,
            name = "Mock Gitlab User",
            username = "mock_user",
            email = "mock@example.com",
            state = "active"
        )

        Mockito.`when`(restClient.getUser(Mockito.anyString())).thenReturn(
            GitlabUser(
                id = 1,
                name = "Mock Gitlab User",
                username = "mock_user",
                email = "mock@example.com",
                state = "active"
            )
        )

        Mockito.`when`(restClient.adminCreateUser(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString()
        )).thenReturn(
            gitlabUser
        )

        Mockito.`when`(restClient.adminCreateUserToken(Mockito.anyLong(), Mockito.anyString())).thenReturn(
            GitlabUserToken(
                id = 1,
                revoked = false,
                token = testPrivateUserTokenMock,
                active = true,
                name = "mlreef-token"
            )
        )

        Mockito.`when`(restClient.adminCreateGroup(
            Mockito.anyString(), Mockito.anyString()
        )).thenReturn(
            GitlabGroup(
                id = 1,
                webUrl = "http://127.0.0.1/",
                name = "Mock Gitlab Group",
                path = "mock-group"
            )
        )

        Mockito.`when`(restClient.adminAddUserToGroup(
            Mockito.anyLong(), Mockito.anyLong(), anyObject()
        )).thenReturn(
            GitlabUserInGroup(
                id = 1,
                webUrl = "http://127.0.0.1/",
                name = "Mock Gitlab Group",
                username = "mock-group"
            )
        )

        Mockito.`when`(restClient.createProject(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), anyObject()
        )).thenReturn(
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
        )

        Mockito.doNothing().`when`(restClient).deleteProject(
            Mockito.anyLong(), Mockito.anyString()
        )

        Mockito.`when`(restClient.userCreateGroup(Mockito.anyString(), Mockito.anyString(), Mockito.anyString())).thenReturn(
            GitlabGroup(
                id = 1,
                webUrl = "www.url.com",
                name = "test-group",
                path = "test-path"
            )
        )

        Mockito.`when`(currentUserService.person()).then { personRepository.findAll().first() }
        Mockito.`when`(currentUserService.account()).then { accountRepository.findAll().first() }
        Mockito.`when`(currentUserService.permanentToken()).then { testPrivateUserTokenMock }
    }

    protected fun defaultAcceptContentAuth(requestBuilder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(HEADER_PRIVATE_TOKEN, testPrivateUserTokenMock)
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

    //Workaround for Mockito to use Kotlin's default parameters in methods
    protected fun <T> anyObject(): T {
        return Mockito.any<T>()
    }
}
