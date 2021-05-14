package com.mlreef.rest.integration

import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.api.TestTags
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.DataType
import com.mlreef.rest.domain.Group
import com.mlreef.rest.domain.ProcessorType
import com.mlreef.rest.domain.UserRole
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.repositories.DataTypesRepository
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.feature.caches.repositories.PublicProjectsRepository
import com.mlreef.rest.testcommons.AbstractRestTest
import com.mlreef.rest.testcommons.TestGitlabContainer
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.utils.Slugs
import com.ninjasquad.springmockk.MockkClear
import com.ninjasquad.springmockk.SpykBean
import io.mockk.every
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Tags
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.context.WebApplicationContext
import java.util.UUID
import kotlin.random.Random

@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.INTEGRATION_TEST)
@ContextConfiguration(initializers = [
    TestRedisContainer.Initializer::class,
    TestPostgresContainer.Initializer::class,
    TestGitlabContainer.Initializer::class])
@Tags(value = [Tag(TestTags.SLOW), Tag(TestTags.INTEGRATION)])
abstract class AbstractIntegrationTest : AbstractRestTest() {

    companion object {
        val allCreatedUsersNames = mutableListOf<String>()
        val allCreatedProjectsNames = mutableListOf<String>()
    }

    @SpykBean
    protected lateinit var restClient: GitlabRestClient

    @Autowired
    private lateinit var builder: RestTemplateBuilder

    @SpykBean(clear = MockkClear.BEFORE)
    protected lateinit var publicProjectRepository: PublicProjectsRepository

    @SpykBean
    protected lateinit var publicProjectsCacheService: PublicProjectsCacheService

    @Autowired
    protected lateinit var accountTokenRepository: AccountTokenRepository

    @Autowired
    protected lateinit var dataTypeRepository: DataTypesRepository

    private val realCreatedUsersCache: MutableList<Triple<Account, String, GitlabUser>> = mutableListOf()

    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .build()

        every {
            sessionRegistry.retrieveFromSession(any())
        } returns null
    }

    @Transactional
    fun createRealUser(
        userName: String? = null,
        password: String? = null,
        index: Int = -1
    ): Triple<Account, String, GitlabUser> {
        if (realCreatedUsersCache.size < index)
            return realCreatedUsersCache[index]

        val username = userName ?: RandomUtils.generateRandomUserName(20)
        val email = "$username@example.com"
        val plainPassword = password ?: RandomUtils.generateRandomPassword(30, true)

        val userInGitlab = try {
            restClient.adminGetUsers(email).firstOrNull()
                ?: restClient.adminCreateUser(email, username, "Existing $username", plainPassword)
        } catch (ex: Exception) {
            GitlabUser(Random.nextLong())
        }

        val person = createPerson(
            "Name $username",
            Slugs.toSlug(username),
            userInGitlab.id,
            role = UserRole.DEVELOPER
        )

        val account = createAccount(
            username,
            person,
            email,
            plainPassword
        )

        val loggedClient = restClient.userLoginOAuthToGitlab(username, plainPassword)

        val result = Triple(account, loggedClient.accessToken, userInGitlab)

        realCreatedUsersCache.add(result)
        allCreatedUsersNames.add(username)

        return result
    }

    protected fun createRealDataProject(
        token: String,
        account: Account,
        name: String? = null,
        slug: String? = null,
        namespace: String? = null,
        public: Boolean = true,
        inputTypes: List<DataType>? = null,
    ): Pair<DataProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(token, name, slug, namespace, public)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        val projectInDb = createDataProject(
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            path = gitLabProject.path,
            pathWithNamespace = gitLabProject.pathWithNamespace,
            namespace = group,
            gitlabId = gitLabProject.id,
            visibility = VisibilityScope.valueOf(gitLabProject.visibility.name),
            inputTypes = inputTypes?.toMutableSet() ?: mutableSetOf(),
        )

        if (public) publicProjectRepository.save(PublicProjectHash(gitLabProject.id, projectInDb.id))

        return Pair(projectInDb, gitLabProject)
    }

    protected fun createRealCodeProject(
        token: String,
        account: Account,
        name: String? = null,
        slug: String? = null,
        namespace: String? = null,
        public: Boolean = true,
        processorType: ProcessorType? = null,
        inputTypes: List<DataType>? = null,
        outputTypes: List<DataType>? = null,
    ): Pair<CodeProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(token, name, slug, namespace, public)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        val projectInDb = createCodeProject(
            id = UUID.randomUUID(),
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            path = gitLabProject.path,
            pathWithNamespace = gitLabProject.pathWithNamespace,
            namespace = group,
            gitlabId = gitLabProject.id,
            visibility = VisibilityScope.valueOf(gitLabProject.visibility.name),
            processorType = processorType ?: operationProcessorType,
            inputTypes = inputTypes?.toMutableSet() ?: mutableSetOf(),
            outputTypes = outputTypes?.toMutableSet() ?: mutableSetOf(),
        )

        if (public) publicProjectRepository.save(PublicProjectHash(gitLabProject.id, projectInDb.id))

        return Pair(projectInDb, gitLabProject)
    }

    protected fun createRealPipelineInGitlab(projectId: Long, commitHash: String): GitlabPipeline {
        return restClient.adminCreatePipeline(projectId, commitHash)
    }

    private fun createRealProjectInGitlab(
        token: String,
        name: String? = null,
        slug: String? = null,
        namespace: String? = null,
        public: Boolean = true,
    ): GitlabProject {
        val projectName = name ?: RandomUtils.generateRandomUserName(20)
        val projectSlug = Slugs.toSlug(slug ?: "slug-$projectName")
        val projectNamespace = namespace ?: "mlreef"

        val findNamespace = try {
            restClient.findNamespace(token, projectNamespace).firstOrNull()
        } catch (e: Exception) {
            null
        }

        val result = restClient.adminGetProjects(projectName).firstOrNull()
            ?: restClient.createProject(
                token = token,
                slug = projectSlug,
                name = projectName,
                defaultBranch = "master",
                nameSpaceId = findNamespace?.id,
                description = "Test description $projectName",
                visibility = if (public) "public" else "private",
                initializeWithReadme = true
            )

        allCreatedProjectsNames.add(projectName)

        return result
    }

    fun createRealGroup(token: String, name: String? = null): Pair<Group, GitlabGroup> {
        val groupName = name ?: RandomUtils.generateRandomUserName(10)
        val groupPath = "path-$groupName"
        val groupInGitlab = restClient.userCreateGroup(token, groupName, groupPath, GitlabVisibility.PRIVATE)

        var groupInDatabase = Group(UUID.randomUUID(), "slug-$groupName", groupName, groupInGitlab.id)

        groupInDatabase = groupsRepository.save(groupInDatabase)

        return Pair(groupInDatabase, groupInGitlab)
    }

    fun addRealUserToProject(projectId: Long, userId: Long, accessLevel: GitlabAccessLevel? = null) {
        restClient.adminAddUserToProject(
            projectId = projectId, userId = userId, accessLevel = accessLevel
                ?: GitlabAccessLevel.DEVELOPER
        )
    }

    fun addRealUserToGroup(groupId: Long, userId: Long, accessLevel: GitlabAccessLevel? = null) {
        restClient.adminAddUserToGroup(
            groupId = groupId, userId = userId, accessLevel = accessLevel
                ?: GitlabAccessLevel.DEVELOPER
        )
    }

    fun putFileToRepository(
        token: String,
        projectId: Long,
        fileName: String,
        content: String? = null,
        resourceName: String? = null,
        branch: String? = null,
    ): String { //returns commit sha
        return restClient.commitFiles(
            token = token,
            projectId = projectId,
            targetBranch = branch ?: "master",
            commitMessage = "Test commit",
            fileContents = mapOf(fileName to (content ?: javaClass.classLoader.getResource(resourceName)!!.readText())),
            action = "create",
        ).id
    }
}



