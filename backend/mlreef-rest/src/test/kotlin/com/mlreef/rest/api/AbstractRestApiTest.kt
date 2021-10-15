package com.mlreef.rest.api

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.EmailRepository
import com.mlreef.rest.domain.*
import com.mlreef.rest.domain.helpers.UserInProject
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.*
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
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
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.context.transaction.TestTransaction
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.util.Base64Utils
import org.springframework.web.context.WebApplicationContext
import java.io.InputStream
import java.time.Instant
import java.util.*
import java.util.regex.Pattern
import javax.transaction.Transactional
import kotlin.math.absoluteValue
import kotlin.random.Random

@TestPropertySource("classpath:application-test.yml")
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

    @MockkBean(relaxed = true, relaxUnitFun = false)
    protected lateinit var currentUserService: CurrentUserService

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var publicProjectsCacheService: PublicProjectsCacheService

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var emailRepository: EmailRepository

    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        val censoredSecretHash = testPrivateUserTokenMock1.substring(0, 5) + "**********"
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .apply<DefaultMockMvcBuilder>(
                documentationConfiguration(restDocumentation)
                    .operationPreprocessors()
                    .withRequestDefaults(
                        removeHeaders(HEADER_PRIVATE_TOKEN),
                        Preprocessors.prettyPrint(),
                        Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock1), censoredSecretHash)
                    )
                    .withResponseDefaults(
                        Preprocessors.prettyPrint(),
                        Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock1), censoredSecretHash)
                    )
            )
            .build()

        every { restClient.userLoginOAuthToGitlab(any(), any()) } returns OAuthToken(
            "accesstoken12345",
            "refreshtoken1234567",
            "bearer",
            "api",
            1585910424
        )

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

        every { restClient.adminCreateGroup(any(), any(), any()) } returns GitlabGroup(
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

        val pathSlot = slot<String>()
        val nameSlot = slot<String>()
        every {
            restClient.createProject(
                any(),
                capture(pathSlot),
                capture(nameSlot),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
            )
        } answers {
            val name = nameSlot.captured
            val path = pathSlot.captured
            GitlabProject(
                id = 2,
                name = name,
                nameWithNamespace = "mlreef / $name",
                path = path,
                pathWithNamespace = "mlreef/$path",
                owner = gitlabUser,
                creatorId = 1L,
                webUrl = "http://127.0.0.1/"
            )
        }

        val targetNameSlot = slot<String>()
        val targetPathSlot = slot<String>()
        val sourceIdSlot = slot<Long>()
        every {
            restClient.forkProject(
                token = any(),
                sourceId = capture(sourceIdSlot),
                targetName = capture(targetNameSlot),
                targetPath = capture(targetPathSlot)
            )
        } answers {
            GitlabProject(
                id = sourceIdSlot.captured + 2, // the forked Gitlab must will have a different id than the original
                name = targetNameSlot.captured,
                nameWithNamespace = "mlreef / ${targetNameSlot.captured}",
                path = targetPathSlot.captured,
                pathWithNamespace = "mlreef/${targetPathSlot.captured}",
                owner = gitlabUser,
                creatorId = 1L,
                webUrl = "http://127.0.0.1/",
                visibility = GitlabVisibility.PUBLIC
            )
        }

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
        every { currentUserService.account() } answers { accountRepository.findAll().first() }
        every { currentUserService.accountOrNull() } answers { accountRepository.findAll().first() }
        every { currentUserService.accessToken() } answers { testPrivateUserTokenMock1 }

        every {
            restClient.adminGetProjectTree(any(), isNull(), any(), any())
        } answers {
            RepositoryTreePaged(
                listOf(
                    RepositoryTree(
                        id = UUID.randomUUID().toString(),
                        name = "main.py",
                        type = RepositoryTreeType.BLOB,
                        path = "main.py",
                        mode = "rw"
                    ),
                    RepositoryTree(
                        id = UUID.randomUUID().toString(),
                        name = "main.pyt",
                        type = RepositoryTreeType.BLOB,
                        path = "main.pyt",
                        mode = "rw"
                    ),
                ),
                page = 1,
                totalPages = 1,
                totalElements = 2,
                perPage = 10
            )
        }

        every {
            restClient.adminGetProjectTree(any(), isNull(inverse = true), any(), any())
        } answers {
            RepositoryTreePaged(
                listOf(
                    RepositoryTree(
                        id = UUID.randomUUID().toString(),
                        name = "main.py",
                        type = RepositoryTreeType.BLOB,
                        path = "main.py",
                        mode = "rw"
                    ),
                ),
                page = 1,
                totalPages = 1,
                totalElements = 2,
                perPage = 10
            )
        }

        every {
            restClient.adminGetRepositoryFileContent(any(), any())
        } answers {
            val filename = "resnet_annotations_demo.py"
            val content = javaClass.classLoader.getResource(filename)!!.content as InputStream

            RepositoryFile(
                sha = UUID.randomUUID().toString(),
                size = 100L,
                encoding = "Base64",
                content = Base64Utils.encodeToString(content.readBytes())
            )
        }

        every {
            restClient.adminGetRepositoryFileContentAndInformation(any(), any())
        } answers {
            val filename = "resnet_annotations_demo.py"
            val content = javaClass.classLoader.getResource(filename)!!.content as InputStream

            RepositoryFileFullInfo(
                "main.py",
                "main.py",
                blobId = UUID.randomUUID().toString(),
                size = 100L,
                encoding = "Base64",
                content = Base64Utils.encodeToString(content.readBytes()),
                contentSha256 = "230148ea3aa5aed560b9313d0c560731f76752961140d46f5a10a3b1e2bbf408",
                ref = "master",
                commitId = UUID.randomUUID().toString(),
                lastCommitId = UUID.randomUUID().toString(),
            )
        }
    }

    protected fun mockGitlabPipelineWithBranch(targetBranch: String) {
        val commit = Commit(id = UUID.randomUUID().toString())
        val branch = Branch(name = targetBranch)
        val gitlabPipeline = GitlabPipeline(
            RandomUtils.randomGitlabId(),
            coverage = "",
            sha = "sha",
            ref = "ref",
            beforeSha = "before_sha",
            user = GitlabUser(id = RandomUtils.randomGitlabId()),
            status = "CREATED",
            committedAt = Instant.now(),
            createdAt = Instant.now(),
            startedAt = null,
            updatedAt = null,
            finishedAt = null
        )
        val gitlabRegistry = GitlabRegistry(
            12819L,
            "",
            "path",
            73432L,
            "location",
            Instant.now(),
            Instant.now()
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
        every {
            restClient.adminGetRepositoriesList(any())
        } returns listOf(gitlabRegistry)
        every {
            restClient.adminDeleteTagFromRepository(any(), any(), any())
        } returns Unit
    }

    protected fun mockGitlabBranchExisting(projectId: Long? = null, branchName: String? = null, exists: Boolean = false) {
//        val projectIdToMock = projectId?.let { eq(it) } ?: any()
//        val branchToMock = branchName?.let { eq(it) } ?: any()
//
        if (exists) {
            val branchToReturn = Branch(
                branchName ?: generateRandomUserName(10),
            )
            every {
                restClient.adminGetBranch(
                    projectId?.let { eq(it) } ?: any(),
                    branchName?.let { eq(it) } ?: any()
                )
            } returns branchToReturn
        } else {
            every {
                restClient.adminGetBranch(
                    projectId?.let { eq(it) } ?: any(),
                    branchName?.let { eq(it) } ?: any()
                )
            } throws GitlabCommonException(404, ErrorCode.NotFound, "Branch not found exception")
        }
    }

    protected fun mockFilesInBranch(fileName: String) {
        val repoTree = RepositoryTree(UUID.randomUUID().toString(), fileName, RepositoryTreeType.BLOB, "/", "064")
        val repoTreePage = RepositoryTreePaged(listOf(repoTree), 1, 1, 1, 1)
        every {
            restClient.adminGetProjectTree(any(), any(), any(), any())
        } returns repoTreePage
        every {
            restClient.adminGetProjectTree(any(), any(), branch = any())
        } returns repoTreePage
    }

    protected fun mockFilesInBranchOnlyOnce(fileName: String, fileNameAlwaysPresent: String) {
        val alwaysRepoTree = RepositoryTree(UUID.randomUUID().toString(), fileNameAlwaysPresent, RepositoryTreeType.BLOB, "/", "064")
        val repoTree = RepositoryTree(UUID.randomUUID().toString(), fileName, RepositoryTreeType.BLOB, "/", "064")
        val repoTreePage = RepositoryTreePaged(listOf(repoTree, alwaysRepoTree), 1, 1, 1, 1)
        val repoTreePageEmpty = RepositoryTreePaged(listOf(alwaysRepoTree), 1, 1, 1, 1)
        every {
            restClient.adminGetProjectTree(any(), any(), any(), any())
        } returns repoTreePage andThen repoTreePageEmpty
    }

    protected fun mockFilesInBranch2Times(fileName: String, fileNameAlwaysPresent: String) {
        val alwaysRepoTree = RepositoryTree(UUID.randomUUID().toString(), fileNameAlwaysPresent, RepositoryTreeType.BLOB, "/", "064")
        val repoTree = RepositoryTree(UUID.randomUUID().toString(), fileName, RepositoryTreeType.BLOB, "/", "064")
        val repoTreePage = RepositoryTreePaged(listOf(repoTree, alwaysRepoTree), 1, 1, 1, 1)
        val repoTreePageEmpty = RepositoryTreePaged(listOf(alwaysRepoTree), 1, 1, 1, 1)
        every {
            restClient.adminGetProjectTree(any(), any(), any(), any())
        } returns repoTreePage andThen repoTreePage andThen repoTreePageEmpty
    }

    protected fun mockNoFilesInBranch(fileName: String) {
        val repoTreePage = RepositoryTreePaged(listOf(), 1, 1, 1, 1)
        every {
            restClient.adminGetProjectTree(any(), any(), any(), any())
        } returns repoTreePage
    }

    protected fun mockFilesInBranchForCommit() {
        val file1InRoot = RepositoryTree(UUID.randomUUID().toString(), "file1.py", RepositoryTreeType.BLOB, "file1.py", "064")
        val file2InRoot = RepositoryTree(UUID.randomUUID().toString(), "master.py", RepositoryTreeType.BLOB, "master.py", "064")
        val file3InRoot = RepositoryTree(UUID.randomUUID().toString(), "readme.md", RepositoryTreeType.BLOB, "readme.md", "064")

        val folder1InRoot = RepositoryTree(UUID.randomUUID().toString(), "folder", RepositoryTreeType.TREE, "folder", "064")
        val folder2InRoot = RepositoryTree(UUID.randomUUID().toString(), "folder_2", RepositoryTreeType.TREE, "folder_2", "064")

        val file1InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "file1.txt", RepositoryTreeType.BLOB, "folder/file1.txt", "064")
        val file2InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "bigfile.jpg", RepositoryTreeType.BLOB, "folder/bigfile.jpg", "064")
        val file3InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "unknownfile", RepositoryTreeType.BLOB, "folder/unknownfile", "064")
        val file4InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "script.py", RepositoryTreeType.BLOB, "folder/script.py", "064")

        val folder1InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "folder_in_folder", RepositoryTreeType.TREE, "folder/folder_in_folder", "064")
        val folder2InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "folder_in_folder_2", RepositoryTreeType.TREE, "folder/folder_in_folder_2", "064")

        val file1InFolder1InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "fileInFolder_1_1.txt", RepositoryTreeType.BLOB, "folder/folder_in_folder/fileInFolder_1_1.txt", "064")
        val file2InFolder1InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "fileInFolder_2_1.txt", RepositoryTreeType.BLOB, "folder/folder_in_folder/fileInFolder_2_1.txt", "064")

        val folder1InFolder1InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "folder_in_folder_in_folder", RepositoryTreeType.TREE, "folder/folder_in_folder/folder_in_folder_in_folder", "064")

        val file1InFolder1InFolder1InFolder1 = RepositoryTree(UUID.randomUUID().toString(), "fileInFolder_1_1_1.java", RepositoryTreeType.BLOB, "folder/folder_in_folder/folder_in_folder_in_folder/fileInFolder_1_1_1.java", "064")

        val file1InFolder1InFolder2 = RepositoryTree(UUID.randomUUID().toString(), "fileInFolder_1_2.txt", RepositoryTreeType.BLOB, "folder/folder_in_folder_2/fileInFolder_1_2.txt", "064")

        val file1InFolder2 = RepositoryTree(UUID.randomUUID().toString(), "file2.txt", RepositoryTreeType.BLOB, "folder_2/file2.txt", "064")

        val rootRepoTreePage = RepositoryTreePaged(listOf(file1InRoot, file2InRoot, file3InRoot, folder1InRoot, folder2InRoot), 1, 1, 5, 10)
        val folder1RepoTreePage = RepositoryTreePaged(listOf(file1InFolder1, file2InFolder1, file3InFolder1, file4InFolder1, folder1InFolder1, folder2InFolder1), 1, 1, 6, 10)
        val folder1InFolder1RepoTreePage = RepositoryTreePaged(listOf(file1InFolder1InFolder1, file2InFolder1InFolder1, folder1InFolder1InFolder1), 1, 1, 3, 10)
        val folder1InFolder1InFolder1RepoTreePage = RepositoryTreePaged(listOf(file1InFolder1InFolder1InFolder1), 1, 1, 1, 10)
        val folder2InFolder1RepoTreePage = RepositoryTreePaged(listOf(file1InFolder1InFolder2), 1, 1, 1, 10)
        val folder2RepoTreePage = RepositoryTreePaged(listOf(file1InFolder2), 1, 1, 1, 10)

        every {
            restClient.adminGetProjectTree(any(), isNull(), branch = any())
        } returns rootRepoTreePage

        every {
            restClient.adminGetProjectTree(any(), eq("folder"), branch = any())
        } returns folder1RepoTreePage

        every {
            restClient.adminGetProjectTree(any(), eq("folder/folder_in_folder"), branch = any())
        } returns folder1InFolder1RepoTreePage

        every {
            restClient.adminGetProjectTree(any(), eq("folder/folder_in_folder/folder_in_folder_in_folder"), branch = any())
        } returns folder1InFolder1InFolder1RepoTreePage

        every {
            restClient.adminGetProjectTree(any(), eq("folder/folder_in_folder_2"), branch = any())
        } returns folder2InFolder1RepoTreePage

        every {
            restClient.adminGetProjectTree(any(), eq("folder_2"), branch = any())
        } returns folder2RepoTreePage
    }

    fun generateAdminTokenDetails(): TokenDetails {
        return TokenDetails(
            username = "test-admin",
            accessToken = "test-token",
            accountId = UUID.randomUUID(),
            gitlabUser = GitlabUser(
                id = Random.nextLong(),
                username = "test-admin",
                name = "Admin",
                email = "admin@mlreef.com",
                isAdmin = true
            )
        )
    }

    fun mockSecurityContextHolder(token: TokenDetails? = null) {
        val finalToken = token ?: TokenDetails(
            "testusername",
            "test-token",
            UUID.randomUUID(),
        )

        val secContext = mockk<SecurityContext>()
        val authentication = mockk<Authentication>()

        every { authentication.principal } answers { finalToken }
        every { secContext.authentication } answers { UsernamePasswordAuthenticationToken(token, token) }
        every { sessionRegistry.retrieveFromSession(any()) } answers { finalToken }

        SecurityContextHolder.setContext(secContext)
    }

    fun mockGetPublicProjectsIdsList(ids: List<UUID>) {
        every { publicProjectsCacheService.getPublicProjectsIdsList() } answers {
            ids
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
            GitlabProject(
                Random.nextLong().absoluteValue,
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
    fun createMockUser(
        plainPassword: String = "password",
        userOverrideSuffix: String? = null,
        avatar: MlreefFile? = null
    ): Account {
        val accountId = UUID.randomUUID()
        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val name = generateRandomUserName(30)
        val account = accountRepository.save(
            Account(
                accountId,
                name,
                "$name@example.com",
                passwordEncrypted,
                gitlabId = 10L,
                slug = generateRandomUserName(30),
                name = generateRandomUserName(30),
                userRole = UserRole.DEVELOPER,
                termsAcceptedAt = Instant.now(),
                hasNewsletters = true,
                avatar = avatar,
            )
        )
        return account
    }

    @Transactional
    fun updateMockUser(
        user: Account,
        name:String? = null,
        gitlabId: Long? = null,
        slug: String? = null,
        plainPassword: String? = null,
        avatar: MlreefFile? = null
    ): Account {
        return accountRepository.save(
            user.copy(
                name = name ?: user.name,
                gitlabId = gitlabId ?: user.gitlabId,
                slug = slug ?: user.slug,
                avatar = avatar,
            )
        )
    }

    protected fun accountToUserInProject(
        account: Account,
        level: AccessLevel = AccessLevel.DEVELOPER,
        expiredAt: Instant? = null
    ) = UserInProject(account.id, account.username, account.email, account.gitlabId, level, expiredAt)

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
            fieldWithPath(prefix + "sort.sorted").type(JsonFieldType.BOOLEAN)
                .description("Is the result sorted. Request parameter 'sort', values '=field,direction(asc,desc)'"),
            fieldWithPath(prefix + "sort.unsorted").type(JsonFieldType.BOOLEAN).description("Is the result unsorted"),
            fieldWithPath(prefix + "sort.empty").type(JsonFieldType.BOOLEAN).description("Is the sort empty")
        )
    }


    fun pipelineConfigDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return mutableListOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath(prefix + "pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALIZATION"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
            fieldWithPath(prefix + "input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
            fieldWithPath(prefix + "input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
            fieldWithPath(prefix + "input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
            fieldWithPath(prefix + "data_project_id").type(JsonFieldType.STRING).description("Id of DataProject"),
            fieldWithPath(prefix + "data_operations").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing"),
            fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Branch name"),
            fieldWithPath(prefix + "target_branch_pattern").type(JsonFieldType.STRING).description("Branch name pattern, can include \$ID and \$SLUG"),
            fieldWithPath(prefix + "created_by").optional().type(JsonFieldType.STRING).description("Creator id"),
        ).apply {
            this.add(
                PayloadDocumentation.fieldWithPath(prefix + "instances").optional().type(JsonFieldType.ARRAY)
                    .description("Instances")
            )
            this.addAll(pipelineDtoResponseFields(prefix + "instances[]."))
        }
    }

    fun pipelineDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath(prefix + "pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALIZATION"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
            fieldWithPath(prefix + "input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
            fieldWithPath(prefix + "input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
            fieldWithPath(prefix + "input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
            fieldWithPath(prefix + "data_project_id").type(JsonFieldType.STRING).description("Id of DataProject"),
            fieldWithPath(prefix + "pipeline_config_id").type(JsonFieldType.STRING).description("Id of PipelineConfig"),
            fieldWithPath(prefix + "pipeline").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing"),
            fieldWithPath(prefix + "pipeline_job_info").type(JsonFieldType.OBJECT).optional().description("An optional PipelineInfo describing the gitlab pipeline info"),
            fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Source branch name"),
            fieldWithPath(prefix + "target_branch").type(JsonFieldType.STRING).description("Target branch name"),
            fieldWithPath(prefix + "number").type(JsonFieldType.NUMBER).description("Local unique number of this Instance, represents the number of created instances"),
            fieldWithPath(prefix + "commit").optional().type(JsonFieldType.STRING).description("Optional commit ref of first Pipeline commit (mlreef.yml)"),
            fieldWithPath(prefix + "status").type(JsonFieldType.STRING).description("PipelineStatus of this PipelineInstance: CREATED, PENDING, RUNNING, SKIPPED, SUCCESS, FAILED, CANCELED, ARCHIVED "),
            fieldWithPath(prefix + "created_by").optional().type(JsonFieldType.STRING).description("Creator id"),
        )
    }

    fun commitAndFail(f: () -> Unit) {
        assertThrows<Exception> {
            withinTransaction {
                f.invoke()
            }
        }
    }

    fun <T> withinTransaction(commit: Boolean = true, func: () -> T): T {
        if (!TestTransaction.isActive()) TestTransaction.start()
        val result = func.invoke()
        if (commit) {
            TestTransaction.flagForCommit()
        } else {
            TestTransaction.flagForRollback()
        }
        try {
            TestTransaction.end()
        } catch (e: Exception) {
            throw e
        }
        return result
    }

    private fun getDefaultProcessorType(): ProcessorType {
        algorithmProcessorType = processorTypeRepository.findByNameIgnoreCase("ALGORITHM")
            ?: processorTypeRepository.save(ProcessorType(UUID.randomUUID(), "ALGORITHM"))

        operationProcessorType = processorTypeRepository.findByNameIgnoreCase("OPERATION")
            ?: processorTypeRepository.save(ProcessorType(UUID.randomUUID(), "OPERATION"))

        visualizationProcessorType = processorTypeRepository.findByNameIgnoreCase("VISUALIZATION")
            ?: processorTypeRepository.save(ProcessorType(UUID.randomUUID(), "VISUALIZATION"))

        return operationProcessorType
    }

    private fun getDefaultDataTypesSet(): MutableSet<DataType> {
        textDataType = dataTypesRepository.findByNameIgnoreCase("TEXT")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "TEXT"))

        imageDataType = dataTypesRepository.findByNameIgnoreCase("IMAGE")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "IMAGE"))

        videoDataType = dataTypesRepository.findByNameIgnoreCase("VIDEO")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "VIDEO"))

        noneDataType = dataTypesRepository.findByNameIgnoreCase("NONE")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "NONE"))

        timeSeriesDataType = dataTypesRepository.findByNameIgnoreCase("TIME_SERIES")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "TIME_SERIES"))

        modelDataType = dataTypesRepository.findByNameIgnoreCase("MODEL")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "MODEL"))

        tabularDataType = dataTypesRepository.findByNameIgnoreCase("TABULAR")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "TABULAR"))

        audioDataType = dataTypesRepository.findByNameIgnoreCase("AUDIO")
            ?: dataTypesRepository.save(DataType(UUID.randomUUID(), "AUDIO"))

        return mutableSetOf(imageDataType)
    }

    private fun getDefaultParameterType(): ParameterType {
        stringParamType = parameterTypesRepository.findByNameIgnoreCase("STRING")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "STRING"))

        integerParamType = parameterTypesRepository.findByNameIgnoreCase("INTEGER")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "INTEGER"))

        undefinedParamType = parameterTypesRepository.findByNameIgnoreCase("UNDEFINED")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "UNDEFINED"))

        complexParamType = parameterTypesRepository.findByNameIgnoreCase("COMPLEX")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "COMPLEX"))

        dictionaryParamType = parameterTypesRepository.findByNameIgnoreCase("DICTIONARY")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "DICTIONARY"))

        tupleParamType = parameterTypesRepository.findByNameIgnoreCase("TUPLE")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "TUPLE"))

        booleanParamType = parameterTypesRepository.findByNameIgnoreCase("BOOLEAN")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "BOOLEAN"))

        floatParamType = parameterTypesRepository.findByNameIgnoreCase("FLOAT")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "FLOAT"))

        listParamType = parameterTypesRepository.findByNameIgnoreCase("LIST")
            ?: parameterTypesRepository.save(ParameterType(UUID.randomUUID(), "LIST"))

        return stringParamType
    }

    protected fun truncateDbTables(tables: List<String>, cascade: Boolean = true) {
        println("Truncating tables: $tables")
        val joinToString = tables.joinToString("\", \"", "\"", "\"")

        if (cascade) {
            entityManager.createNativeQuery("truncate table $joinToString CASCADE ").executeUpdate()
        } else {
            entityManager.createNativeQuery("truncate table $joinToString ").executeUpdate()
        }
    }

    protected fun truncateAllTables() {
        truncateDbTables(
            listOf(
                "account",
                "account_token",
                "data_processor",
                "data_processor_instance",
                "email",
                "experiment",
                "experiment_input_files",
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
                "processor_types",
                "data_types",
                "parameter_types",
                "metric_types",
            ), cascade = true
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
