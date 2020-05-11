package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataAlgorithmRepository
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataOperationRepository
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.DataVisualizationRepository
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.ParameterInstanceRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInProject
import com.mlreef.rest.external_api.gitlab.dto.toGitlabUserInProject
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.SpykBean
import io.mockk.every
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional
import kotlin.random.Random


internal fun dataProcessorInstanceFields(prefix: String = ""): List<FieldDescriptor> {
    return listOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Unique UUID of this DataProcessor"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).optional().description("Unique slug of this DataProcessor"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Optional Name of this DataProcessor ( not needed in Inputs)"),
        fieldWithPath(prefix + "parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].type").type(JsonFieldType.STRING).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].required").type(JsonFieldType.BOOLEAN).optional().description("Parameter required?"),
        fieldWithPath(prefix + "parameters[].description").type(JsonFieldType.STRING).optional().description("Textual description of this Parameter"),
        fieldWithPath(prefix + "parameters[].value").type(JsonFieldType.STRING).optional().description("Provided value (as parsable String) of Parameter ")
    )
}

internal fun dataProcessorFields(prefix: String = ""): List<FieldDescriptor> {
    return listOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Unique UUID of this DataProcessor"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this DataProcessor"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).description("Optional Name of this DataProcessor ( not needed in Inputs)"),
        fieldWithPath(prefix + "input_data_type").type(JsonFieldType.STRING).description("DataType for input data"),
        fieldWithPath(prefix + "output_data_type").type(JsonFieldType.STRING).description("DataType for output data"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).description("ALGORITHM, OPERATION or VISUALISATION"),
        fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).optional().description("PUBLIC or PRIVATE"),
        fieldWithPath(prefix + "description").optional().type(JsonFieldType.STRING).description("Description"),
        fieldWithPath(prefix + "code_project_id").type(JsonFieldType.STRING).optional().description("CodeProject this Processor belongs to"),
        fieldWithPath(prefix + "author_id").optional().type(JsonFieldType.STRING).optional().description("Author who created this"),
        fieldWithPath(prefix + "metric_type").type(JsonFieldType.STRING).description("Type of Metric"),
        fieldWithPath(prefix + "parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].type").type(JsonFieldType.STRING).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].order").type(JsonFieldType.NUMBER).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].default_value").type(JsonFieldType.STRING).optional().description("Provided value (as parsable String) of Parameter "),
        fieldWithPath(prefix + "parameters[].required").type(JsonFieldType.BOOLEAN).optional().description("Parameter required?"),
        fieldWithPath(prefix + "parameters[].description").type(JsonFieldType.STRING).optional().description("Textual description of this Parameter")
    )
}

@Component
internal class AccountSubjectPreparationTrait {

    lateinit var account: Account
    lateinit var account2: Account
    lateinit var subject: Person
    lateinit var subject2: Person

    private val gitlabProjectMembers = HashMap<Long, MutableSet<GitlabUserInProject>>()
    private val gitlabUsersProjects = HashMap<Long, MutableSet<GitlabProject>>()

    @Autowired
    protected lateinit var accountTokenRepository: AccountTokenRepository

    @Autowired
    protected lateinit var personRepository: PersonRepository

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    fun apply() {
        deleteAll()
        applyAccount()
    }

    private fun applyAccount() {
        account = createMockUser()
        account2 = createMockUser(userOverrideSuffix = "0002")
        subject = account.person
        subject2 = account2.person
    }

    private fun deleteAll() {
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
        gitlabProjectMembers.clear()
        gitlabUsersProjects.clear()
    }

    @Transactional
    protected fun createMockUser(plainPassword: String = "password", userOverrideSuffix: String? = null): Account {

        var mockToken = RestApiTest.testPrivateUserTokenMock1
        var userSuffix = "0000"
        if (userOverrideSuffix != null) {
            userSuffix = userOverrideSuffix
            mockToken = "second-token-$userSuffix"
        }
        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val accountId = UUID.fromString("aaaa0000-0002-0000-$userSuffix-aaaaaaaaaaaa")
        val token = AccountToken(
            id = UUID.fromString("aaaa0000-0003-0000-$userSuffix-bbbbbbbbbbbb"),
            accountId = accountId,
            token = mockToken,
            gitlabId = 0)
        val person = Person(
            id = UUID.fromString("aaaa0000-0001-0000-$userSuffix-cccccccccccc"),
            slug = "person_slug$userSuffix",
            name = "user name",
            gitlabId = Random.nextLong())
        val account = Account(
            id = accountId,
            username = "username$userSuffix",
            email = "email$userSuffix@example.com",
            passwordEncrypted = passwordEncrypted,
            person = person,
            tokens = mutableListOf(token))

        personRepository.save(person)
        accountRepository.save(account)
        accountTokenRepository.save(token)
        return account
    }

    fun mockGitlabProjectsWithLevel(mockedRestClient: GitlabRestClient, projectGitlabId: Long, ownerGitlabId: Long, accessLevel: GroupAccessLevel?) {
        val gitlabMockUser = GitlabUser(ownerGitlabId, "testuser", "Test User", "test@example.com")

        val gitlabMockMembership = gitlabMockUser.toGitlabUserInProject(accessLevel = accessLevel
            ?: GroupAccessLevel.GUEST)

        val gitlabMockProject = GitlabProject(projectGitlabId, "My own test Project 101", "mlreef/project100", "path", "/path/project", gitlabMockUser, ownerGitlabId)

        val projectsList = gitlabUsersProjects.getOrPut(ownerGitlabId) { mutableSetOf() }
        projectsList.add(gitlabMockProject)

        val membersList = gitlabProjectMembers.getOrPut(gitlabMockProject.id) { mutableSetOf() }
        membersList.add(gitlabMockMembership)

        every {
            mockedRestClient.adminGetUserOwnProjects(ownerGitlabId)
        } returns projectsList.toList()

        every {
            mockedRestClient.adminGetProjectMembers(gitlabMockProject.id)
        } returns membersList.toList()

    }

    fun mockGitlabProjectsWithLevel(mockedRestClient: GitlabRestClient, projectGitlabIds: List<Long>, ownerGitlabId: Long, accessLevels: List<GroupAccessLevel?>) {
        val gitlabMockUser = GitlabUser(ownerGitlabId, "testuser", "Test User", "test@example.com")

        projectGitlabIds.forEachIndexed { index, l ->
            val project = GitlabProject(l, "My own test Project 101", "mlreef/project100", "path", "/path/project", gitlabMockUser, ownerGitlabId)
            val member = gitlabMockUser.toGitlabUserInProject(accessLevel = accessLevels.getOrNull(index)
                ?: GroupAccessLevel.GUEST)

            val projectsList = gitlabUsersProjects.getOrPut(ownerGitlabId) { mutableSetOf() }
            projectsList.add(project)

            val membersList = gitlabProjectMembers.getOrPut(project.id) { mutableSetOf() }
            membersList.add(member)

            every {
                mockedRestClient.adminGetProjectMembers(project.id)
            } returns membersList.toList()
        }

        every {
            mockedRestClient.adminGetUserOwnProjects(ownerGitlabId)
        } returns gitlabUsersProjects.getOrDefault(ownerGitlabId, mutableSetOf()).toList()
    }


}

@Component
internal class PipelineTestPreparationTrait {

    lateinit var account: Account
    lateinit var account2: Account
    lateinit var dataOp1: DataOperation
    lateinit var dataOp2: DataAlgorithm
    lateinit var dataOp3: DataVisualization
    lateinit var subject: Person
    lateinit var dataProject: DataProject
    lateinit var dataProject2: DataProject

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository
    @Autowired protected lateinit var subjectRepository: SubjectRepository
    @Autowired private lateinit var pipelineConfigRepository: PipelineConfigRepository
    @Autowired private lateinit var pipelineInstanceRepository: PipelineInstanceRepository
    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired private lateinit var codeProjectRepository: CodeProjectRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var parameterInstanceRepository: ParameterInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository
    @Autowired private lateinit var dataOperationRepository: DataOperationRepository
    @Autowired private lateinit var dataAlgorithmRepository: DataAlgorithmRepository
    @Autowired private lateinit var dataVisualizationRepository: DataVisualizationRepository
    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    fun apply() {

        deleteAll()
//        applyAccount()
//
//        dataProject = dataProjectRepository.save(DataProject(
//            UUID.fromString("aaaa0001-0000-0000-0000-dbdbdbdbdbdb"), "slug1", "url", "Test DataProject",
//            ownerId = account.person.id, gitlabId = 1, gitlabGroup = "mlreef", gitlabProject = "project1"
//        ))
//        dataProject2 = dataProjectRepository.save(DataProject(
//            UUID.fromString("aaaa0001-0000-0000-0002-dbdbdbdbdbdb"), "slug2", "url", "Test DataProject",
//            ownerId = account2.person.id, gitlabId = 2, gitlabGroup = "mlreef", gitlabProject = "project1")
//        )
//        codeProjectRepository.save(CodeProject(randomUUID(), "slug", "url", "Test DataProject", ownerId = account.person.id,
//            gitlabGroup = "", gitlabId = 0, gitlabProject = ""))

        dataOp1 = dataOperationRepository.save(DataOperation(randomUUID(), "commons-data-operation1", "name", "command", DataType.ANY, DataType.ANY))
        dataOp2 = dataAlgorithmRepository.save(DataAlgorithm(randomUUID(), "commons-algorithm", "name", "command", DataType.ANY, DataType.ANY))
        dataOp3 = dataVisualizationRepository.save(DataVisualization(randomUUID(), "commons-data-visualisation", "name", "command", DataType.ANY))

        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "stringParam", type = ParameterType.STRING, order = 0, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "floatParam", type = ParameterType.FLOAT, order = 1, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "integerParam", type = ParameterType.INTEGER, order = 2, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "stringList", type = ParameterType.LIST, order = 3, defaultValue = ""))

        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "booleanParam", type = ParameterType.BOOLEAN, order = 0, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "complexName", type = ParameterType.COMPLEX, order = 1, defaultValue = ""))

        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "tupleParam", type = ParameterType.TUPLE, order = 0, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "hashParam", type = ParameterType.DICTIONARY, order = 1, defaultValue = ""))

    }

    private fun applyAccount() {
        account = createMockUser()
        account2 = createMockUser(userOverrideSuffix = "0002")
        subject = account.person
    }

    private fun deleteAll() {
        parameterInstanceRepository.deleteAll()
        dataProcessorInstanceRepository.deleteAll()
        experimentRepository.deleteAll()
        pipelineInstanceRepository.deleteAll()
        pipelineConfigRepository.deleteAll()
        processorParameterRepository.deleteAll()
        dataProcessorRepository.deleteAll()

        dataProjectRepository.deleteAll()
        codeProjectRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
    }

    @Transactional
    protected fun createMockUser(plainPassword: String = "password", userOverrideSuffix: String? = null): Account {

        var mockToken = RestApiTest.testPrivateUserTokenMock1
        var userSuffix = "0000"
        if (userOverrideSuffix != null) {
            userSuffix = userOverrideSuffix
            mockToken = "second-token-$userSuffix"
        }
        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val accountId = UUID.fromString("aaaa0000-0002-0000-$userSuffix-aaaaaaaaaaaa")
        val token = AccountToken(
            id = UUID.fromString("aaaa0000-0003-0000-$userSuffix-bbbbbbbbbbbb"),
            accountId = accountId,
            token = mockToken,
            gitlabId = 0)
        val person = Person(
            id = UUID.fromString("aaaa0000-0001-0000-$userSuffix-cccccccccccc"),
            slug = "person_slug$userSuffix",
            name = "user name",
            gitlabId = Random.nextLong())
        val account = Account(
            id = accountId,
            username = "username$userSuffix",
            email = "email$userSuffix@example.com",
            passwordEncrypted = passwordEncrypted,
            person = person,
            tokens = mutableListOf(token))

        personRepository.save(person)
        accountRepository.save(account)
        accountTokenRepository.save(token)
        return account
    }


}

@Component
internal class GitlabHelper {
    companion object {
        val allCreatedUsersNames = mutableListOf<String>()
        val allCreatedProjectsNames = mutableListOf<String>()
    }

    @SpykBean()
    protected lateinit var restClient: GitlabRestClient

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @SpykBean
    lateinit var groupsRepository: GroupRepository

    @Autowired
    lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    lateinit var dataProjectRepository: DataProjectRepository

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    private val realCreatedUsersCache: MutableList<Triple<Account, String, GitlabUser>> = mutableListOf()

    @Transactional
    fun createRealUser(userName: String? = null, password: String? = null, index: Int = 0): Triple<Account, String, GitlabUser> {
        if (realCreatedUsersCache.size < index)
            return realCreatedUsersCache[index]

        val accountId = UUID.randomUUID()
        val username = userName ?: RandomUtils.generateRandomUserName(20)
        val email = "$username@example.com"
        val plainPassword = password ?: RandomUtils.generateRandomPassword(30, true)

        val userInGitlab = restClient.adminCreateUser(email, username, "Existing user", plainPassword)
        val tokenInGitlab = restClient.adminCreateUserToken(gitlabUserId = userInGitlab.id, tokenName = "TestTokenName")

        val passwordEncrypted = passwordEncoder.encode(plainPassword)
        val person = Person(UUID.randomUUID(), "person_slug", "user name", userInGitlab.id)
        val token = AccountToken(UUID.randomUUID(), accountId, tokenInGitlab.token, tokenInGitlab.id)
        val account = Account(accountId, username, email, passwordEncrypted, person, mutableListOf(token))

        accountRepository.save(account)

        val result = Triple(account, plainPassword, userInGitlab)
        realCreatedUsersCache.add(result)

        allCreatedUsersNames.add(username)

        return result
    }

    fun createRealGroup(account: Account, name: String? = null): Pair<Group, GitlabGroup> {
        val groupName = name ?: RandomUtils.generateRandomUserName(10)
        val groupPath = "path-$groupName"
        val groupInGitlab = restClient.userCreateGroup(account.bestToken?.token!!, groupName, groupPath)

        var groupInDatabase = Group(randomUUID(), "slug-$groupName", groupName,groupInGitlab.id)

        groupInDatabase = groupsRepository.save(groupInDatabase)

        return Pair(groupInDatabase, groupInGitlab)
    }

    fun createRealProjectInGitlab(account: Account, name: String? = null, slug: String? = null, namespace: String? = null): GitlabProject {
        val projectName = name ?: RandomUtils.generateRandomUserName(20)
        val projectSlug = slug ?: "slug-$projectName"
        val nameSpace = namespace ?: "mlreef/$projectName"

        val findNamespace = try {
            restClient.findNamespace(account.bestToken!!.token, nameSpace)
        } catch (e: Exception) {
            null
        }

        val result = restClient.createProject(
            token = account.bestToken?.token!!,
            slug = projectSlug,
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id,
            description = "Test description $projectName",
            visibility = "public",
            initializeWithReadme = false)

        allCreatedProjectsNames.add(projectName)

        return result
    }

    fun createRealCodeProject(account: Account, name: String? = null, slug: String? = null, namespace: String? = null): Pair<CodeProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(account, name, slug, namespace)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        var projectInDb = CodeProject(
            id = UUID.randomUUID(),
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabGroup = group,
            gitlabId = gitLabProject.id
        )

        projectInDb = codeProjectRepository.save(projectInDb)

        return Pair(projectInDb, gitLabProject)
    }

    fun createRealDataProject(account: Account, name: String? = null, slug: String? = null, namespace: String? = null): Pair<DataProject, GitlabProject> {
        val gitLabProject = createRealProjectInGitlab(account, name, slug, namespace)

        val group = gitLabProject.pathWithNamespace.split("/")[0]

        var projectInDb = DataProject(
            id = randomUUID(),
            slug = gitLabProject.path,
            ownerId = account.person.id,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabGroup = group,
            gitlabId = gitLabProject.id
        )

        projectInDb = dataProjectRepository.save(projectInDb)

        return Pair(projectInDb, gitLabProject)
    }
}

