package com.mlreef.rest.integration

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataAlgorithmRepository
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataOperationRepository
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.DataVisualizationRepository
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.PublishingMachineType
import com.mlreef.rest.Subject
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.feature.caches.repositories.PublicProjectsRepository
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.utils.Slugs
import com.ninjasquad.springmockk.SpykBean
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.time.ZonedDateTime
import java.util.UUID
import javax.transaction.Transactional

@Component
class IntegrationTestsHelper {
    companion object {
        val allCreatedUsersNames = mutableListOf<String>()
        val allCreatedProjectsNames = mutableListOf<String>()
    }

    @Autowired
    protected lateinit var restClient: GitlabRestClient

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @SpykBean
    protected lateinit var groupsRepository: GroupRepository

    @Autowired
    lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    lateinit var personRepository: PersonRepository

    @Autowired
    lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var dataOperationRepository: DataOperationRepository

    @Autowired
    private lateinit var dataAlgorithmRepository: DataAlgorithmRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var dataVisualizationRepository: DataVisualizationRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    protected lateinit var publicProjectRepository: PublicProjectsRepository

    @Autowired
    private lateinit var baseEnvironmentsRepository: BaseEnvironmentsRepository

    var dataOp1: ProcessorVersion? = null
    var dataOp2: ProcessorVersion? = null
    var dataOp3: ProcessorVersion? = null

    lateinit var baseEnv: BaseEnvironments

    private val processorParametersCache = mutableListOf<ProcessorParameter>()

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    private val realCreatedUsersCache: MutableList<Triple<Account, String, GitlabUser>> = mutableListOf()

    @Transactional
    fun createRealUser(userName: String? = null, password: String? = null, index: Int = -1): Triple<Account, String, GitlabUser> {
        if (realCreatedUsersCache.size < index)
            return realCreatedUsersCache[index]

        val accountId = UUID.randomUUID()
        val username = userName ?: RandomUtils.generateRandomUserName(20)
        val email = "$username@example.com"
        val plainPassword = password ?: RandomUtils.generateRandomPassword(30, true)

        val userInGitlab = restClient.adminCreateUser(email, username, "Existing $username", plainPassword)

        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val person = personRepository.save(Person(
            UUID.randomUUID(), Slugs.toSlug(username), "Name $username", userInGitlab.id, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now()))
        val account = Account(accountId, username, email, passwordEncrypted, person)

        accountRepository.save(account)

        val loggedClient = restClient.userLoginOAuthToGitlab(username, plainPassword)

        val result = Triple(account, loggedClient.accessToken, userInGitlab)
        realCreatedUsersCache.add(result)

        allCreatedUsersNames.add(username)

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

    fun createRealProjectInGitlab(
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

        val result = restClient.createProject(
            token = token,
            slug = projectSlug,
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id,
            description = "Test description $projectName",
            visibility = if (public) "public" else "private",
            initializeWithReadme = true)

        allCreatedProjectsNames.add(projectName)

        return result
    }

    fun createRealCodeProject(
        token: String,
        account: Account,
        name: String? = null,
        slug: String? = null,
        namespace: String? = null,
        public: Boolean = true
    ): Pair<CodeProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(token, name, slug, namespace, public)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        var projectInDb = CodeProject(
            id = UUID.randomUUID(),
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            description = gitLabProject.description ?: "",
            gitlabPath = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabNamespace = group,
            gitlabId = gitLabProject.id,
            visibilityScope = VisibilityScope.valueOf(gitLabProject.visibility.name)
        )

        projectInDb = codeProjectRepository.save(projectInDb)

        if (public) publicProjectRepository.save(PublicProjectHash(gitLabProject.id, projectInDb.id))

        return Pair(projectInDb, gitLabProject)
    }

    fun createRealDataProject(
        token: String,
        account: Account,
        name: String? = null,
        slug: String? = null,
        namespace: String? = null,
        public: Boolean = true
    ): Pair<DataProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(token, name, slug, namespace, public)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        var projectInDb = DataProject(
            id = UUID.randomUUID(),
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            description = gitLabProject.description ?: "",
            gitlabPath = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabNamespace = group,
            gitlabId = gitLabProject.id,
            visibilityScope = VisibilityScope.valueOf(gitLabProject.visibility.name)
        )

        projectInDb = dataProjectRepository.save(projectInDb)

        if (public) publicProjectRepository.save(PublicProjectHash(gitLabProject.id, projectInDb.id))

        return Pair(projectInDb, gitLabProject)
    }

    fun addRealUserToProject(projectId: Long, userId: Long, accessLevel: GitlabAccessLevel? = null) {
        restClient.adminAddUserToProject(projectId = projectId, userId = userId, accessLevel = accessLevel
            ?: GitlabAccessLevel.DEVELOPER)
    }

    fun addRealUserToGroup(groupId: Long, userId: Long, accessLevel: GitlabAccessLevel? = null) {
        restClient.adminAddUserToGroup(groupId = groupId, userId = userId, accessLevel = accessLevel
            ?: GitlabAccessLevel.DEVELOPER)
    }


    fun generateProcessorsInDatabase(person: Person? = null) {
        val _dataOp1 = createDataOperation()
        val _dataOp2 = createDataAlgorithm()
        val _dataOp3 = createDataVisualization()

        val publisher = person
            ?: personRepository.save(Person(UUID.randomUUID(), "subject", RandomUtils.generateRandomUserName(20), 1, hasNewsletters = true,
                userRole = UserRole.DEVELOPER,
                termsAcceptedAt = ZonedDateTime.now()))

        dataOp1 = createProcessorVersion(_dataOp1, publisher)
        dataOp2 = createProcessorVersion(_dataOp2, publisher)
        dataOp3 = createProcessorVersion(_dataOp3, publisher)

        processorParametersCache.add(createProcessorParameter(dataOp1!!, "stringParam", ParameterType.STRING, 0))
        processorParametersCache.add(createProcessorParameter(dataOp1!!, "floatParam", ParameterType.FLOAT, 1))
        processorParametersCache.add(createProcessorParameter(dataOp1!!, "integerParam", ParameterType.INTEGER, 2))
        processorParametersCache.add(createProcessorParameter(dataOp1!!, "stringList", ParameterType.LIST, 3))

        processorParametersCache.add(createProcessorParameter(dataOp2!!, "booleanParam", ParameterType.BOOLEAN, 0))
        processorParametersCache.add(createProcessorParameter(dataOp2!!, "complexName", ParameterType.COMPLEX, 1))

        processorParametersCache.add(createProcessorParameter(dataOp3!!, "tupleParam", ParameterType.TUPLE, 0))
        processorParametersCache.add(createProcessorParameter(dataOp3!!, "hashParam", ParameterType.DICTIONARY, 1))
    }

    fun cleanProcessorsInDatabase() {
        processorParametersCache.forEach {
            processorParameterRepository.deleteById(it.id)
        }
        processorParametersCache.clear()

        dataProcessorRepository.delete(dataOp1!!.dataProcessor)
        dataProcessorRepository.delete(dataOp2!!.dataProcessor)
        dataProcessorRepository.delete(dataOp3!!.dataProcessor)

        dataOp1 = null
        dataOp2 = null
        dataOp3 = null
    }

    fun cleanUsers() {
        personRepository.deleteAll()
        accountRepository.deleteAll()
    }

    fun cleanGroups() {
        groupsRepository.deleteAll()
    }

    fun cleanEnvironments() {
        baseEnvironmentsRepository.deleteAll()
    }

    fun createDataOperation(slug: String? = null, name: String? = null, command: String? = null): DataOperation {
        return dataOperationRepository.save(
            DataOperation(
                UUID.randomUUID(),
                slug ?: "commons-data-operation",
                name ?: "name",
                DataType.ANY,
                DataType.ANY)
        )
    }

    fun createDataAlgorithm(slug: String? = null, name: String? = null, command: String? = null): DataAlgorithm {
        return dataAlgorithmRepository.save(
            DataAlgorithm(
                UUID.randomUUID(),
                slug ?: "commons-algorithm",
                name ?: "name",
                DataType.ANY,
                DataType.ANY)
        )
    }

    fun createBaseEnvironment(title: String? = null): BaseEnvironments {
        return baseEnvironmentsRepository.save(
            BaseEnvironments(
                UUID.randomUUID(),
                title ?: "Test environment",
                "docker:shmoker",
                "description",
                "no requirements",
                PublishingMachineType.CPU,
                "3.7"
            )
        )
    }

    fun putFileToRepository(token: String, projectId: Long, fileName: String, content: String? = null, resourceName: String? = null): String { //returns commit sha
        return restClient.commitFiles(
            token = token,
            projectId = projectId,
            targetBranch = "master",
            commitMessage = "Test commit",
            fileContents = mapOf(fileName to (content ?: readResource(resourceName!!))),
            action = "create",
        ).id
    }

    private fun readResource(pathToFile: String): String {
        return javaClass.classLoader.getResource(pathToFile)!!.readText()
    }

    fun createProcessorVersion(dataOp1: DataProcessor, publisher: Subject, command: String = "command"): ProcessorVersion {
        baseEnv = baseEnvironmentsRepository.save(BaseEnvironments(UUID.randomUUID(), RandomUtils.generateRandomUserName(15), "docker1:latest", sdkVersion = "3.7"))
        return processorVersionRepository.save(ProcessorVersion(
            id = dataOp1.id, dataProcessor = dataOp1, publishingInfo = PublishingInfo(publisher = publisher),
            command = command, number = 1, baseEnvironment = baseEnv))
    }

    fun adaptProcessorVersion(version: ProcessorVersion, publisher: Subject, command: String = "command"): ProcessorVersion {
        return processorVersionRepository.save(version.copy(
            publishingInfo = PublishingInfo(publisher = publisher)
        ))
    }

    fun createDataVisualization(slug: String? = null, name: String? = null, command: String? = null): DataVisualization {
        return dataVisualizationRepository.save(
            DataVisualization(
                UUID.randomUUID(),
                slug ?: "commons-data-visualisation",
                name ?: "name",
                DataType.ANY)
        )
    }

    fun createProcessorParameter(processor: ProcessorVersion, name: String? = null, type: ParameterType = ParameterType.STRING, order: Int = 0): ProcessorParameter {
        return processorParameterRepository.save(
            ProcessorParameter(
                UUID.randomUUID(),
                processor.id,
                name ?: "stringParam",
                type = type,
                order = order,
                defaultValue = "")
        )
    }
}
