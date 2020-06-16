package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.I18N
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.security.MlReefSessionRegistry
import com.mlreef.rest.testcommons.AbstractRestTest
import com.mlreef.rest.testcommons.TestRedisContainer
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration
import org.springframework.restdocs.operation.preprocess.Preprocessors
import org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.snippet.Snippet
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.UUID
import java.util.regex.Pattern
import kotlin.math.absoluteValue
import kotlin.random.Random

@TestPropertySource("classpath:application.yml")
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@ContextConfiguration(initializers = [TestRedisContainer.Initializer::class])
abstract class AbstractRestApiTest : AbstractRestTest() {

    protected lateinit var account: Account

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)

        const val testPrivateUserTokenMock1: String = "doesnotmatterat-all-11111"
    }

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var restClient: GitlabRestClient

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var currentUserService: CurrentUserService

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var sessionRegistry: MlReefSessionRegistry

    @Autowired
    protected lateinit var accountTokenRepository: AccountTokenRepository

    @Autowired
    protected lateinit var personRepository: PersonRepository

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @Autowired
    protected lateinit var pipelineService: PipelineService

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    protected fun defaultAcceptContentAuth(builder: MockHttpServletRequestBuilder): MockHttpServletRequestBuilder {
        return this.acceptContentAuth(builder, account)
    }

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

        every { restClient.userLoginOAuthToGitlab(any(), any()) } returns OAuthToken(
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

        every { restClient.getUser(any()) } returns GitlabUser(
            id = 1,
            name = "Mock Gitlab User",
            username = "mock_user",
            email = "mock@example.com",
            state = "active"
        )

        every { restClient.adminCreateUser(any(), any(), any(), any()) } returns gitlabUser

        every { restClient.adminCreateUserToken(any(), any()) } returns GitlabUserToken(
            id = 1,
            revoked = false,
            token = testPrivateUserTokenMock1,
            active = true,
            name = "mlreef-token"
        )

        every {
            restClient.adminCreateGroup(any(), any())
        } returns GitlabGroup(
            id = 1,
            webUrl = "http://127.0.0.1/",
            name = "Mock Gitlab Group",
            path = "mock-group"
        )

        every { restClient.adminAddUserToGroup(any(), any(), any()) } returns GitlabUserInGroup(
            id = 1,
            webUrl = "http://127.0.0.1/",
            name = "Mock Gitlab Group",
            username = "mock-group"
        )

        every { restClient.createProject(any(), any(), any(), any(), any(), any(), any(), any(), any(), any()) } returns
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

        every { restClient.deleteProject(any(), any()) } returns Unit

        every { restClient.userCreateGroup(any(), any(), any()) } returns GitlabGroup(
            id = 1,
            webUrl = "www.url.com",
            name = "test-group",
            path = "test-path"
        )
        every { restClient.userGetUserGroups(any()) } returns emptyList()
        every { restClient.createBranch(any(), any(), any(), any()) } returns Branch("branch")
        every { restClient.commitFiles(any(), any(), any(), any(), any(), any()) } returns Commit("branch")
        every { currentUserService.person() } answers { personRepository.findAll().first() }
        every { currentUserService.account() } answers { accountRepository.findAll().first() }
        every { currentUserService.permanentToken() } answers { testPrivateUserTokenMock1 }
    }

    protected fun mockGitlabPipelineWithBranch(sourceBranch: String, targetBranch: String) {

        val commit = Commit(id = "12341234")
        val branch = Branch(ref = sourceBranch, branch = targetBranch)
        val gitlabPipeline = GitlabPipeline(
            id = 32452345,
            coverage = "",
            sha = "sha",
            ref = "ref",
            beforeSha = "before_sha",
            user = GitlabUser(id = 1000L),
            status = "CREATED",
            committedAt = I18N.dateTime(),
            createdAt = I18N.dateTime(),
            startedAt = null,
            updatedAt = null,
            finishedAt = null
        )

        every {
            restClient.createBranch(any(), any(), any(), any())
        } returns branch
        every {
            restClient.commitFiles(any(), any(), any(), any(), any(), any())
        } returns commit
        every {
            restClient.createPipeline(any(), any(), any(), any())
        } returns gitlabPipeline
    }


    fun mockSecurityContextHolder(token: TokenDetails? = null) {
        val finalToken = token ?: TokenDetails(
            "testusername",
            "test-token",
            "test-access-token",
            UUID.randomUUID(),
            UUID.randomUUID()
        )

        val secContext = mockk<SecurityContext>()
        val authentication = mockk<Authentication>()

        every { authentication.principal } answers { finalToken }
        every { secContext.authentication } answers { authentication }

        SecurityContextHolder.setContext(secContext)
    }

    fun mockGetUserProjectsList(projectIds: List<UUID>, returnAccount: Account? = null, level: AccessLevel = AccessLevel.MAINTAINER) {
        val toMutableMap = projectIds.map { Pair<UUID, AccessLevel?>(it, level) }.toMap().toMutableMap()
        return mockGetUserProjectsList1(toMutableMap, returnAccount)
    }

    fun mockGetUserProjectsList(returnAccount: Account? = null) {
        return mockGetUserProjectsList1(hashMapOf(), returnAccount)
    }

    fun mockGetUserProjectsList2(projectIdLevelMap: Map<UUID, AccessLevel>, returnAccount: Account? = null) {
        return mockGetUserProjectsList1(projectIdLevelMap.toMutableMap(), returnAccount)
    }

    fun mockGetUserProjectsList1(projectIdLevelMap: MutableMap<UUID, AccessLevel?>, returnAccount: Account? = null) {
        val actualAccount = returnAccount ?: account
//        every { authService.findAccountByGitlabId(any()) } answers { actualAccount }
//        every { authService.createTokenDetails(any(), any(), any()) } answers {
//            val token = this.args[0] as String
//            tokenDetails(actualAccount, token, projectIdLevelMap)
//        }
        every { sessionRegistry.retrieveFromSession(any()) } answers {
            val token = this.args[0] as String
            tokenDetails(actualAccount, token, projectIdLevelMap)
        }
    }

    fun mockGitlabUpdateProject() {
        every {
            restClient.userUpdateProject(
                id = any(),
                token = any(),
                name = any(),
                description = any(),
                visibility = any()
            )
        } answers {
            GitlabProject(Random.nextLong().absoluteValue,
                "New Test project",
                "test-name-withnamespace",
                "test-slug",
                "tes-path-with-namespace",
                GitlabUser(Random.nextLong().absoluteValue, "testusername", "testuser"),
                1L,
                visibility = GitlabVisibility.PUBLIC
            )
        }
    }

    private fun tokenDetails(actualAccount: Account, token: String, projectIdLevelMap: MutableMap<UUID, AccessLevel?>): TokenDetails {
        return TokenDetails(
            username = actualAccount.username,
            permanentToken = actualAccount.bestToken?.token ?: throw RuntimeException("Could not setup mock"),
            accessToken = token,
            accountId = actualAccount.id,
            personId = actualAccount.person.id,
            gitlabUser = GitlabUser(account.person.gitlabId!!, "testuser", "Test User", "test@example.com"),
            valid = true,
            projects = projectIdLevelMap
        )
    }

    fun ResultActions.document(name: String, vararg snippets: Snippet): ResultActions {
        return this.andDo(MockMvcRestDocumentation.document(name, *snippets))
    }

    protected fun errorResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("error_code").type(JsonFieldType.NUMBER).description("Unique error code"),
            fieldWithPath("error_name").type(JsonFieldType.STRING).description("Short error title"),
            fieldWithPath("error_message").type(JsonFieldType.STRING).description("A detailed message"),
            fieldWithPath("time").type(JsonFieldType.STRING).description("Timestamp of error")
        )
    }

    fun wrapToPage(content: List<FieldDescriptor>): List<FieldDescriptor> {
        return mutableListOf(
            fieldWithPath("last").type(JsonFieldType.BOOLEAN).description("Is the last page"),
            fieldWithPath("total_pages").type(JsonFieldType.NUMBER).description("Total pages count"),
            fieldWithPath("total_elements").type(JsonFieldType.NUMBER).description("Total elements count ([pages count] x [page size])"),
            fieldWithPath("size").type(JsonFieldType.NUMBER).description("Requested elements count per page. Request parameter 'size'. Default 20"),
            fieldWithPath("number").type(JsonFieldType.NUMBER).description("Current page number"),
            fieldWithPath("number_of_elements").type(JsonFieldType.NUMBER).description("Elements count in current page"),
            fieldWithPath("first").type(JsonFieldType.BOOLEAN).description("Is the first page"),
            fieldWithPath("empty").type(JsonFieldType.BOOLEAN).description("Is the current page empty")
        ).apply {
            addAll(content.map { it.copy("content[].${it.path}") })
            addAll(pageableFields())
            addAll(sortFields())
        }
    }

    private fun pageableFields(): List<FieldDescriptor> {
        val prefix = "pageable."
        return mutableListOf(
            fieldWithPath(prefix + "offset").type(JsonFieldType.NUMBER).description("Current offset (starting from 0). Request parameter 'page' or 'offset'"),
            fieldWithPath(prefix + "page_size").type(JsonFieldType.NUMBER).description("Requested elements count per page. Request parameter 'size'. Default 20"),
            fieldWithPath(prefix + "page_number").type(JsonFieldType.NUMBER).description("Current page number"),
            fieldWithPath(prefix + "unpaged").type(JsonFieldType.BOOLEAN).description("Is the result unpaged"),
            fieldWithPath(prefix + "paged").type(JsonFieldType.BOOLEAN).description("Is the result paged")
        ).apply {
            addAll(sortFields(prefix))
        }
    }

    private fun sortFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "sort.sorted").type(JsonFieldType.BOOLEAN).description("Is the result sorted. Request parameter 'sort', values '=field,direction(asc,desc)'"),
            fieldWithPath(prefix + "sort.unsorted").type(JsonFieldType.BOOLEAN).description("Is the result unsorted"),
            fieldWithPath(prefix + "sort.empty").type(JsonFieldType.BOOLEAN).description("Is the sort empty")
        )
    }
}

fun FieldDescriptor.copy(path: String? = null): FieldDescriptor {
    return PayloadDocumentation.fieldWithPath(path ?: this.path)
        .type(this.type)
        .description(this.description)
        .also {
            if (this.isOptional) it.optional()
        }
}
