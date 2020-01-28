package com.mlreef.rest.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.external_api.gitlab.GitlabGroup
import com.mlreef.rest.external_api.gitlab.GitlabProject
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabUser
import com.mlreef.rest.external_api.gitlab.GitlabUserInGroup
import com.mlreef.rest.external_api.gitlab.GitlabUserToken
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
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.*
import java.util.regex.Pattern
import javax.transaction.Transactional

@TestPropertySource("classpath:application.yml")
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
abstract class RestApiTest {

    lateinit var mockMvc: MockMvc

    protected val testPrivateUserTokenMock: String = "doesnotmatterat-all123"
    protected val HEADER_PRIVATE_TOKEN = "PRIVATE-TOKEN"

    @Autowired protected lateinit var objectMapper: ObjectMapper

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository
    @Autowired protected lateinit var subjectRepository: SubjectRepository

    @MockBean
    protected lateinit var restClient: GitlabRestClient

    @MockBean
    protected lateinit var currentUserService: CurrentUserService

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    protected lateinit var account: Account

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

        Mockito.`when`(restClient.adminCreateUserToken(Mockito.anyInt(), Mockito.anyString())).thenReturn(
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
            Mockito.anyInt(), Mockito.anyLong(), anyObject()
        )).thenReturn(
            GitlabUserInGroup(
                id = 1,
                webUrl = "http://127.0.0.1/",
                name = "Mock Gitlab Group",
                username = "mock-group"
            )
        )

        Mockito.`when`(restClient.createProject(
            Mockito.anyString(), Mockito.anyString(), anyObject()
        )).thenReturn(
            GitlabProject(
                id = 1,
                name = "Mock Gitlab Project",
                nameWithNamespace = "namespace",
                path = "test-path",
                pathWithNamespace = "test-path",
                owner = gitlabUser,
                creatorId = 1L,
                webUrl = "http://127.0.0.1/"
            )
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
        Mockito.`when`(currentUserService.account()).then { account }
        Mockito.`when`(currentUserService.token()).then { testPrivateUserTokenMock }
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

    @Transactional
    protected fun createMockUser(plainPassword: String = "password", userOverrideSuffix: String? = null): Account {

        var mockToken = testPrivateUserTokenMock
        var userSuffix = "0000"
        if (userOverrideSuffix != null) {
            userSuffix = userOverrideSuffix
            mockToken = "second-token-$userSuffix"
        }
        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val person = Person(
            id = UUID.fromString("aaaa0000-0001-0000-$userSuffix-cccccccccccc"),
            slug = "person_slug$userSuffix",
            name = "user name")
        val account = Account(
            id = UUID.fromString("aaaa0000-0002-0000-$userSuffix-aaaaaaaaaaaa"),
            username = "username$userSuffix",
            email = "email$userSuffix@example.com",
            passwordEncrypted = passwordEncrypted,
            person = person)
        val token = AccountToken(
            id = UUID.fromString("aaaa0000-0003-0000-$userSuffix-bbbbbbbbbbbb"),
            accountId = account.id,
            token = mockToken,
            gitlabId = 0)
        personRepository.save(person)
        accountRepository.save(account)
        accountTokenRepository.save(token)
        return account
    }

    //Workaround for Mockito to use Kotlin's default parameters in methods
    private fun <T> anyObject(): T {
        return Mockito.any<T>()
    }
}
