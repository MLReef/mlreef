package com.mlreef.rest.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabUser
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
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
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.*
import java.util.regex.Pattern
import javax.transaction.Transactional


@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
abstract class RestApiTest {

    lateinit var mockMvc: MockMvc

    @Value("\${mlreef.gitlab.mockUserToken}")
    protected val testPrivateUserTokenMock: String? = null
    protected val HEADER_PRIVATE_TOKEN = "PRIVATE-TOKEN"

    @Autowired protected lateinit var objectMapper: ObjectMapper

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository

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
        val censoredSecretHash = testPrivateUserTokenMock!!.substring(0, 5) + "**********"
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .apply<DefaultMockMvcBuilder>(documentationConfiguration(restDocumentation)
                .operationPreprocessors()
                .withRequestDefaults(
                    removeHeaders(HEADER_PRIVATE_TOKEN),
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock!!), censoredSecretHash))
                .withResponseDefaults(
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock!!), censoredSecretHash))
            )
            .build()

        Mockito.`when`(restClient.getUser(Mockito.anyString())).thenReturn(GitlabUser(

        ))

        Mockito.`when`(currentUserService.person()).then { personRepository.findAll().first() }
    }


    protected fun defaultAcceptContentAuth(requestBuilder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return requestBuilder
            .accept(MediaType.APPLICATION_JSON)
            .header(HEADER_PRIVATE_TOKEN, testPrivateUserTokenMock)
            .contentType(MediaType.APPLICATION_JSON)
    }

    protected fun errorResponseFields(): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath("errorCode").type(JsonFieldType.NUMBER).description("Unique error code"),
            PayloadDocumentation.fieldWithPath("errorName").type(JsonFieldType.STRING).description("Short error title"),
            PayloadDocumentation.fieldWithPath("errorMessage").type(JsonFieldType.STRING).description("A detailed message"),
            PayloadDocumentation.fieldWithPath("time").type(JsonFieldType.NUMBER).description("Timestamp of error")
        )
    }

    @Transactional
    protected fun createMockUser(plainPassword: String = "password"): Account {
        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val person = Person(
            id = UUID.fromString("aaaa0000-0001-0000-0000-cccccccccccc"),
            slug = "person_slug",
            name = "user name")
        val account = Account(
            id = UUID.fromString("aaaa0000-0002-0000-0000-aaaaaaaaaaaa"),
            username = "username",
            email = "email@example.com",
            passwordEncrypted = passwordEncrypted,
            person = person)
        val token = AccountToken(
            id = UUID.fromString("aaaa0000-0003-0000-0000-bbbbbbbbbbbb"),
            accountId = account.id,
            token = testPrivateUserTokenMock!!,
            gitlabId = 0)
        personRepository.save(person)
        accountRepository.save(account)
        accountTokenRepository.save(token)
        return account
    }

}
