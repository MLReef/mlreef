package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.Email
import com.mlreef.rest.EmailRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.FileLocationType
import com.mlreef.rest.I18N
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineJobInfo
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
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
import com.mlreef.rest.external_api.gitlab.dto.OAuthTokenInfo
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.data_processors.DataProcessorService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.helpers.UserInProject
import com.mlreef.rest.security.MlReefSessionRegistry
import com.mlreef.rest.testcommons.AbstractRestTest
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.utils.RandomUtils.generateRandomUserName
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration
import org.springframework.restdocs.operation.preprocess.Preprocessors
import org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
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
import java.time.Instant
import java.time.ZonedDateTime
import java.util.UUID
import java.util.regex.Pattern
import javax.persistence.EntityManager
import javax.sql.DataSource
import javax.transaction.Transactional
import kotlin.math.absoluteValue
import kotlin.random.Random

@TestPropertySource("classpath:application.yml")
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
//@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@ContextConfiguration(initializers = [TestPostgresContainer.Initializer::class, TestRedisContainer.Initializer::class])
abstract class AbstractRestApiTest : AbstractRestTest() {

    protected lateinit var account: Account
    protected var token: String = "test-dummy-token-"

    companion object {
        const val testPrivateUserTokenMock1: String = "doesnotmatterat-all-11111"
    }

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var restClient: GitlabRestClient

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var currentUserService: CurrentUserService

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var sessionRegistry: MlReefSessionRegistry

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var publicProjectsCacheService: PublicProjectsCacheService

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var emailRepository: EmailRepository

    @Autowired
    protected lateinit var accountTokenRepository: AccountTokenRepository

    @Autowired
    protected lateinit var personRepository: PersonRepository

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @Autowired
    protected lateinit var pipelineService: PipelineService

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    protected lateinit var experimentRepository: ExperimentRepository

    @Autowired
    protected lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    protected lateinit var dataProcessorService: DataProcessorService

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    protected fun defaultAcceptContentAuth(builder: MockHttpServletRequestBuilder, token: String): MockHttpServletRequestBuilder {
        return this.acceptContentAuth(builder, token)
    }

    @Autowired
    val dataSource: DataSource? = null

    @Autowired
    val jdbcTemplate: JdbcTemplate? = null

    @Autowired
    val entityManager: EntityManager? = null

    protected fun truncateDbTables(tables: List<String>, cascade: Boolean = true) {
        println("Truncating tables: $tables")
        val joinToString = tables.joinToString("\", \"", "\"", "\"")

        if (cascade) {
            entityManager!!.createNativeQuery("truncate table $joinToString CASCADE ").executeUpdate()
        } else {
            entityManager!!.createNativeQuery("truncate table $joinToString ").executeUpdate()
        }
    }

    protected fun truncateAllTables() {
        truncateDbTables(listOf(
            "account", "account_token",
            "data_processor", "data_processor_instance",
            "email", "experiment", "experiment_input_files",
            "file_location",
            "marketplace_star",
            "marketplace_tag",
            "membership",
            "mlreef_project",
            "output_file",
            "parameter_instance",
            "pipeline_config",
            "pipeline_config_input_files",
            "pipeline_instance",
            "pipeline_instance_input_files",
            "processor_parameter",
            "processor_version",
            "project_inputdatatypes",
            "project_outputdatatypes",
            "projects_tags",
            "subject",
        ), cascade = true)
    }

    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        truncateAllTables()
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
            id = 200,
            name = "Mock Gitlab User",
            username = "mock_user",
            email = "mock@example.com",
            state = "active"
        )

        every { restClient.adminCreateUser(any(), any(), any(), any()) } returns GitlabUser(
            id = RandomUtils.randomGitlabId(),
            name = "Mock Gitlab User",
            username = "mock_user",
            email = "mock@example.com",
            state = "active"
        )
        every { restClient.getUser(any()) } returns GitlabUser(
            id = RandomUtils.randomGitlabId(),
            name = "Mock Gitlab User",
            username = "mock_user",
            email = "mock@example.com",
            state = "active"
        )

        every { restClient.userCheckOAuthTokenInGitlab(any()) } returns OAuthTokenInfo(
            resourceOwnerId = 1L,
            scopes = listOf(),
            expiresInSeconds = 0L,
            application = null,
            createdAt = Instant.now().epochSecond
        )


        every { restClient.adminCreateUserToken(any(), any()) } returns GitlabUserToken(
            id = 1,
            revoked = false,
            token = testPrivateUserTokenMock1,
            active = true,
            name = "mlreef-token"
        )

        every {
            restClient.adminCreateGroup(any(), any(), any())
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

        every { restClient.userCreateGroup(any(), any(), any(), any()) } returns GitlabGroup(
            id = RandomUtils.randomGitlabId(),
            webUrl = "www.url.com",
            name = "test-group",
            path = "test-path"
        )

        val emailSlot = slot<Email>()

        every { emailRepository.save(capture(emailSlot)) } answers { emailSlot.captured }

        every { restClient.userGetUserGroups(any()) } returns emptyList()
        every { restClient.createBranch(any(), any(), any(), any()) } returns Branch("branch")
        every { restClient.commitFiles(any(), any(), any(), any(), any(), any()) } returns Commit("branch")
        every { currentUserService.person() } answers { personRepository.findAll().first() }
        every { currentUserService.account() } answers { accountRepository.findAll().first() }
        every { currentUserService.accessToken() } answers { testPrivateUserTokenMock1 }
    }

    protected fun mockGitlabPipelineWithBranch(targetBranch: String) {

        val commit = Commit(id = "12341234")
        val branch = Branch(name = targetBranch)
        val gitlabPipeline = GitlabPipeline(
            RandomUtils.randomGitlabId(),
            coverage = "",
            sha = "sha",
            ref = "ref",
            beforeSha = "before_sha",
            user = GitlabUser(id = RandomUtils.randomGitlabId()),
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
            UUID.randomUUID(),
            UUID.randomUUID()
        )

        val secContext = mockk<SecurityContext>()
        val authentication = mockk<Authentication>()

        every { authentication.principal } answers { finalToken }
        every { secContext.authentication } answers { authentication }
        every { sessionRegistry.retrieveFromSession(any()) } answers { finalToken }

        SecurityContextHolder.setContext(secContext)
    }

    fun mockGetUserProjectsList(projectIds: List<UUID>, returnAccount: Account? = null, level: AccessLevel = AccessLevel.MAINTAINER) {
        val toMutableMap = projectIds.map { Pair<UUID, AccessLevel?>(it, level) }.toMap().toMutableMap()
        return mockGetUserProjectsList1(toMutableMap, returnAccount)
    }

    fun mockGetUserProjectsList(returnAccount: Account? = null) {
        return mockGetUserProjectsList1(hashMapOf(), returnAccount)
    }


    fun mockGetUserProjectsList1(projectIdLevelMap: MutableMap<UUID, AccessLevel?>, returnAccount: Account? = null) {
        val actualAccount = returnAccount ?: account
        every { sessionRegistry.retrieveFromSession(any()) } answers {
            val token = this.args[0] as String
            tokenDetails(actualAccount, token, projectIdLevelMap, mutableMapOf())
        }
    }

    fun mockUserAuthentication(projectIdLevelMap: MutableMap<UUID, AccessLevel?> = mutableMapOf(),
                               groupIdLevelMap: MutableMap<UUID, AccessLevel?> = mutableMapOf(),
                               returnAccount: Account? = null) {
        val actualAccount = returnAccount ?: account
        every { sessionRegistry.retrieveFromSession(any()) } answers {
            val token = this.args[0] as String
            tokenDetails(actualAccount, token, projectIdLevelMap, groupIdLevelMap)
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

    @Transactional
    fun createMockUser(plainPassword: String = "password", userOverrideSuffix: String? = null): Account {
        val accountId = UUID.randomUUID()
        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val person = personRepository.save(Person(UUID.randomUUID(), generateRandomUserName(30), generateRandomUserName(30), 10L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now()))
        val account = accountRepository.save(Account(accountId, person.slug, "${person.slug}@example.com", passwordEncrypted, person))
        return account
    }

    protected fun createExperiment(dataProjectId: UUID, dataOp: ProcessorVersion, slug: String = "experiment-slug", dataInstanceId: UUID? = null): Experiment {
        val processorInstance = DataProcessorInstance(UUID.randomUUID(), dataOp)
        val processorInstance2 = DataProcessorInstance(UUID.randomUUID(), dataOp)

        val processorParameter = ProcessorParameter(
            id = UUID.randomUUID(), processorVersionId = processorInstance.dataProcessorId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)

        processorInstance.addParameterInstances(processorParameter, "value")
        processorInstance2.addParameterInstances(processorParameter.copy(processorVersionId = processorInstance2.dataProcessorId), "value")
        processorParameterRepository.save(processorParameter)
        dataProcessorInstanceRepository.save(processorInstance)
        dataProcessorInstanceRepository.save(processorInstance2)
        val experiment1 = Experiment(
            slug = slug,
            name = "Experiment Name",
            dataInstanceId = dataInstanceId,
            id = UUID.randomUUID(),
            dataProjectId = dataProjectId,
            sourceBranch = "source",
            targetBranch = "target",
            postProcessing = arrayListOf(processorInstance2),
            number = experimentRepository.countByDataProjectId(dataProjectId) + 1,
            pipelineJobInfo = PipelineJobInfo(
                gitlabId = 4,
                createdAt = I18N.dateTime(),
                commitSha = "sha",
                ref = "branch",
                committedAt = I18N.dateTime(),
                secret = "secret"
            ),
            processing = processorInstance,
            inputFiles = listOf(FileLocation(UUID.randomUUID(), FileLocationType.PATH, "location1")))

        return experimentRepository.save(experiment1)
    }

    protected fun createPipelineConfig(dataProcessorInstance: DataProcessorInstance, dataProjectId: UUID, slug: String): PipelineConfig {
        val entity = PipelineConfig(
            id = UUID.randomUUID(),
            pipelineType = PipelineType.DATA, slug = slug, name = "pipeline-name",
            dataProjectId = dataProjectId,
            sourceBranch = "source", targetBranchPattern = "target",
            dataOperations = arrayListOf(dataProcessorInstance))
        pipelineConfigRepository.save(entity)
        return entity
    }

    protected fun createDataProcessor(type: DataProcessorType = DataProcessorType.OPERATION,
                                      codeProject: CodeProject,
                                      inputDataType: DataType = DataType.IMAGE,
                                      outputDataType: DataType = DataType.IMAGE): DataProcessor {
        val id = UUID.randomUUID()
        return dataProcessorService.createForCodeProject(
            id = id, name = "dataprocessor-name",
            codeProject = codeProject,
            slug = "slug-$id", parameters = listOf(),
            author = null, description = "description",
            visibilityScope = VisibilityScope.PUBLIC,
            outputDataType = outputDataType,
            inputDataType = inputDataType,
            command = "command1",
            type = type
        )
    }

    protected fun createDataProcessorInstance(dataOp: ProcessorVersion): DataProcessorInstance {
        val dataProcessorInstance = DataProcessorInstance(UUID.randomUUID(), dataOp)
        val processorParameter = ProcessorParameter(
            id = UUID.randomUUID(), processorVersionId = dataProcessorInstance.dataProcessorId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)
        dataProcessorInstance.addParameterInstances(
            processorParameter, "value")
        processorParameterRepository.save(processorParameter)
        return dataProcessorInstanceRepository.save(dataProcessorInstance)
    }

    private fun tokenDetails(actualAccount: Account,
                             token: String,
                             projectIdLevelMap: MutableMap<UUID, AccessLevel?>,
                             groupIdLevelMap: MutableMap<UUID, AccessLevel?>): TokenDetails {
        return TokenDetails(
            username = actualAccount.username,
            accessToken = token,
            accountId = actualAccount.id,
            personId = actualAccount.person.id,
            gitlabUser = GitlabUser(account.person.gitlabId!!, "testuser", "Test User", "test@example.com"),
            valid = true,
            projects = projectIdLevelMap,
            groups = groupIdLevelMap
        )
    }

    protected fun accountToUserInProject(account: Account, level: AccessLevel = AccessLevel.DEVELOPER, expiredAt: Instant? = null) =
        UserInProject(account.id, account.username, account.email, account.person.gitlabId, level, expiredAt)

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

    private fun sortFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "sort.sorted").type(JsonFieldType.BOOLEAN).description("Is the result sorted. Request parameter 'sort', values '=field,direction(asc,desc)'"),
            fieldWithPath(prefix + "sort.unsorted").type(JsonFieldType.BOOLEAN).description("Is the result unsorted"),
            fieldWithPath(prefix + "sort.empty").type(JsonFieldType.BOOLEAN).description("Is the sort empty")
        )
    }

    protected fun experimentDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath(prefix + "data_project_id").type(JsonFieldType.STRING).description("Id of DataProject"),
            fieldWithPath(prefix + "data_instance_id").optional().type(JsonFieldType.STRING).description("Id of DataPipelineInstance"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Local slug scoped to DataProject"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Name of that Experiment"),
            fieldWithPath(prefix + "number").type(JsonFieldType.NUMBER).description("Number of this Experiment in its DataProject scope"),
            fieldWithPath(prefix + "pipeline_job_info").type(JsonFieldType.OBJECT).optional().description("An optional PipelineInfo describing the gitlab pipeline info"),
            fieldWithPath(prefix + "json_blob").type(JsonFieldType.STRING).optional().description("Json object describing experiments epochs statistics"),
            fieldWithPath(prefix + "post_processing").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath(prefix + "processing").optional().type(JsonFieldType.OBJECT).optional().description("An optional DataAlgorithm"),
            fieldWithPath(prefix + "status").type(JsonFieldType.STRING).description("Status of experiment"),
            fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Branch name"),
            fieldWithPath(prefix + "target_branch").type(JsonFieldType.STRING).description("Branch name")
        )
    }
}

fun FieldDescriptor.copy(path: String? = null): FieldDescriptor {
    return fieldWithPath(path ?: this.path)
        .type(this.type)
        .description(this.description)
        .also {
            if (this.isOptional) it.optional()
        }
}
