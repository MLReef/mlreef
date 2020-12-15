package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.BaseEnvironmentsRepository
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
import com.mlreef.rest.ParameterInstanceRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInProject
import com.mlreef.rest.utils.RandomUtils
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
import kotlin.math.absoluteValue
import kotlin.random.Random

object TestTags {
    const val SLOW = "slow"
    const val UNIT = "unit"
    const val INTEGRATION = "integration"
    const val RESTDOC = "restdoc"
}

internal fun projectResponseFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "global_slug").optional().type(JsonFieldType.STRING).description("Global Slug must be unique for the whole platform"),
        fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).description("Visibility scope"),
        fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("A Name which is unique per scope (owner's domain)"),
        fieldWithPath(prefix + "description").type(JsonFieldType.STRING).description("Text for description"),
        fieldWithPath(prefix + "tags").type(JsonFieldType.ARRAY).description("All Tags for this Project"),
        fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("UUID of Subject who owns this Project"),
        fieldWithPath(prefix + "stars_count").type(JsonFieldType.NUMBER).description("Number of Stars"),
        fieldWithPath(prefix + "forks_count").type(JsonFieldType.NUMBER).description("Number of Forks"),
        fieldWithPath(prefix + "input_data_types").type(JsonFieldType.ARRAY).description("List of DataTypes used for Input"),
        fieldWithPath(prefix + "output_data_types").type(JsonFieldType.ARRAY).description("List of DataTypes used for Output"),
        fieldWithPath(prefix + "searchable_type").type(JsonFieldType.STRING).description("Type of searchable Entity"),
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Data project id"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Data project slug"),
        fieldWithPath(prefix + "url").type(JsonFieldType.STRING).description("URL in Gitlab domain"),
        fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("Onwer id of the data project"),
        fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Project name"),
        fieldWithPath(prefix + "gitlab_namespace").type(JsonFieldType.STRING).description("The group/namespace where the project is in"),
        fieldWithPath(prefix + "gitlab_path").type(JsonFieldType.STRING).description("Project path"),
        fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab")
    ).apply {
        this.add(fieldWithPath(prefix + "data_processor").optional().type(JsonFieldType.OBJECT).description("DataProcessor"))
        this.addAll(dataProcessorFields(prefix + "data_processor."))
        this.addAll(searchableTags(prefix + "tags[]."))
    }.apply {
        this.add(fieldWithPath(prefix + "experiments").optional().type(JsonFieldType.ARRAY).description("Experiments"))
    }
}

internal fun searchableTags(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Unique UUID"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Name of Tag, unique, useful and readable"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).optional().description("Type or Family of this Tag"),
        fieldWithPath(prefix + "public").type(JsonFieldType.BOOLEAN).optional().description("Flag indicating whether this is public or not")
    )
}

internal fun searchableTagsRequestFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Unique UUID"),
        fieldWithPath(prefix + "owner_id").optional().type(JsonFieldType.STRING).optional().description("Nullable owner_id"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Name of Tag, unique, useful and readable"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).optional().description("Type or Family of this Tag"),
        fieldWithPath(prefix + "public").type(JsonFieldType.BOOLEAN).optional().description("Flag indicating whether this is public or not")
    )
}

internal fun projectUpdateRequestFields(): List<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath("description").type(JsonFieldType.STRING).optional().description("Description of Project"),
        fieldWithPath("name").type(JsonFieldType.STRING).optional().description("Name of Project"),
        fieldWithPath("visibility").type(JsonFieldType.STRING).optional().description("Visibility of Project"),
        fieldWithPath("input_data_types").type(JsonFieldType.ARRAY).optional().description("List of DataTypes for input"),
        fieldWithPath("output_data_types").type(JsonFieldType.ARRAY).optional().description("List of DataTypes for output"),
        fieldWithPath("tags").type(JsonFieldType.ARRAY).optional().description("List of Tags")
    ).apply {
        addAll(searchableTagsRequestFields("tags[]."))
    }
}

internal fun dataProcessorInstanceFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
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

internal fun pageable(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "content").type(JsonFieldType.ARRAY).optional().description(""),
        fieldWithPath(prefix + "pageable.sort").type(JsonFieldType.OBJECT).optional().description(""),
        fieldWithPath(prefix + "pageable.sort.unsorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.sort.sorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.sort.empty").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.page_size").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "pageable.page_number").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "pageable.offset").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "pageable.paged").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "pageable.unpaged").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "total_elements").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "total_pages").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "last").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "first").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "number_of_elements").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "sort").type(JsonFieldType.OBJECT).optional().description(""),
        fieldWithPath(prefix + "sort.unsorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "sort.sorted").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "sort.empty").type(JsonFieldType.BOOLEAN).optional().description(""),
        fieldWithPath(prefix + "size").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "number").type(JsonFieldType.NUMBER).optional().description(""),
        fieldWithPath(prefix + "empty").type(JsonFieldType.BOOLEAN).optional().description("")
    )
}

internal fun dataProcessorFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Unique UUID of this DataProcessor"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this DataProcessor"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).description("Optional Name of this DataProcessor ( not needed in Inputs)"),
        fieldWithPath(prefix + "input_data_type").type(JsonFieldType.STRING).description("DataType for input data"),
        fieldWithPath(prefix + "output_data_type").type(JsonFieldType.STRING).description("DataType for output data"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).description("ALGORITHM, OPERATION or VISUALIZATION"),
        fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).optional().description("PUBLIC or PRIVATE"),
        fieldWithPath(prefix + "description").optional().type(JsonFieldType.STRING).description("Description"),
        fieldWithPath(prefix + "code_project_id").type(JsonFieldType.STRING).optional().description("CodeProject this Processor belongs to"),
        fieldWithPath(prefix + "author_id").optional().type(JsonFieldType.STRING).optional().description("Author who created this")
    )
}

internal fun processorVersionFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Unique UUID of this DataProcessorVersion"),
        fieldWithPath(prefix + "data_processor_id").type(JsonFieldType.STRING).description("Unique UUID of this DataProcessor"),
        fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this DataProcessor"),
        fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).description("Optional Name of this DataProcessor ( not needed in Inputs)"),
        fieldWithPath(prefix + "number").optional().type(JsonFieldType.NUMBER).description("Relative number of this DataProcessor Version"),
        fieldWithPath(prefix + "branch").optional().type(JsonFieldType.STRING).description("Branch this Version was built on"),
        fieldWithPath(prefix + "command").optional().type(JsonFieldType.STRING).description("Python command to execute"),
//        fieldWithPath(prefix + "base_environment").optional().type(JsonFieldType.STRING).description("Identifier of BaseEnvironment"),
        fieldWithPath(prefix + "published_at").optional().type(JsonFieldType.STRING).description("Timestamp of publication"),
        fieldWithPath(prefix + "input_data_type").type(JsonFieldType.STRING).description("DataType for input data"),
        fieldWithPath(prefix + "output_data_type").type(JsonFieldType.STRING).description("DataType for output data"),
        fieldWithPath(prefix + "type").type(JsonFieldType.STRING).description("ALGORITHM, OPERATION or VISUALIZATION"),
        fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).optional().description("PUBLIC or PRIVATE"),
        fieldWithPath(prefix + "description").optional().type(JsonFieldType.STRING).description("Description"),
        fieldWithPath(prefix + "code_project_id").type(JsonFieldType.STRING).optional().description("CodeProject this Processor belongs to"),
        fieldWithPath(prefix + "author_id").optional().type(JsonFieldType.STRING).optional().description("Author who created this"),
        fieldWithPath(prefix + "publisher_id").optional().type(JsonFieldType.STRING).optional().description("Author who created this"),
        fieldWithPath(prefix + "metric_type").type(JsonFieldType.STRING).description("Type of Metric"),
        fieldWithPath(prefix + "parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
        fieldWithPath(prefix + "parameters[].type").type(JsonFieldType.STRING).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].order").type(JsonFieldType.NUMBER).optional().description("Provided ParameterType of this Parameter"),
        fieldWithPath(prefix + "parameters[].default_value").type(JsonFieldType.STRING).optional().description("Provided value (as parsable String) of Parameter "),
        fieldWithPath(prefix + "parameters[].required").type(JsonFieldType.BOOLEAN).optional().description("Parameter required?"),
        fieldWithPath(prefix + "parameters[].description").type(JsonFieldType.STRING).optional().description("Textual description of this Parameter"),
        fieldWithPath(prefix + "pipeline_job_info").optional().type(JsonFieldType.OBJECT).optional().description("Gitlab Pipeline information")
    ).apply {
        addAll(pipelineInfoDtoResponseFields(prefix + "pipeline_job_info."))
    }.apply {
        addAll(environmentsFields(prefix + "base_environment."))
    }
}

internal fun pipelineInfoDtoResponseFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "id").type(JsonFieldType.NUMBER).optional().description("Json object describing specific metrics"),
        fieldWithPath(prefix + "commit_sha").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
        fieldWithPath(prefix + "ref").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
        fieldWithPath(prefix + "committed_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was committed"),
        fieldWithPath(prefix + "created_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was created"),
        fieldWithPath(prefix + "started_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was started"),
        fieldWithPath(prefix + "updated_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was updated"),
        fieldWithPath(prefix + "finished_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was finished")
    )
}

internal fun fileLocationsFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return arrayListOf(
        fieldWithPath(prefix + "location").type(JsonFieldType.STRING).description("A URL, URI or simple path describing the location of a file/folder"),
        fieldWithPath(prefix + "location_type").type(JsonFieldType.STRING).description("PATH, URL or AWS_ID ")
    )
}

internal fun commitFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return mutableListOf(
        fieldWithPath(prefix + "author_email").optional().type(JsonFieldType.STRING).description("User's email"),
        fieldWithPath(prefix + "author_name").optional().type(JsonFieldType.STRING).description("Username"),
        fieldWithPath(prefix + "authored_date").optional().type(JsonFieldType.STRING).description("Date of publish"),
        fieldWithPath(prefix + "committer_email").optional().type(JsonFieldType.STRING).description("Commiter email"),
        fieldWithPath(prefix + "committer_name").optional().type(JsonFieldType.STRING).description("Commiter name"),
        fieldWithPath(prefix + "committed_date").optional().type(JsonFieldType.STRING).description("Date of commit"),
        fieldWithPath(prefix + "title").type(JsonFieldType.STRING).description("Commit title"),
        fieldWithPath(prefix + "message").type(JsonFieldType.STRING).description("Commit message"),
        fieldWithPath(prefix + "id").optional().type(JsonFieldType.STRING).description("Username"),
        fieldWithPath(prefix + "short_id").optional().type(JsonFieldType.STRING).description("Username"),
    )
}

internal fun publishingInformationFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return mutableListOf(
        fieldWithPath(prefix + "id").optional().type(JsonFieldType.STRING).description("Data processor id"),
        fieldWithPath(prefix + "branch").optional().type(JsonFieldType.STRING).description("Published branch"),
        fieldWithPath(prefix + "command").optional().type(JsonFieldType.STRING).description("Command"),
        fieldWithPath(prefix + "path").optional().type(JsonFieldType.STRING).description("Main script path"),
    ).apply {
        addAll(pipelineInfoDtoResponseFields(prefix + "pipeline_job_info."))
    }.apply {
        addAll(environmentsFields(prefix + "environment."))
    }
}

internal fun environmentsFields(prefix: String = ""): MutableList<FieldDescriptor> {
    return mutableListOf(
        fieldWithPath(prefix + "id").optional().type(JsonFieldType.STRING).description("Environment id"),
        fieldWithPath(prefix + "title").optional().type(JsonFieldType.STRING).description("Title"),
        fieldWithPath(prefix + "description").type(JsonFieldType.STRING).optional().description("Description"),
        fieldWithPath(prefix + "requirements").type(JsonFieldType.STRING).optional().description("Library requirements"),
        fieldWithPath(prefix + "docker_image").optional().type(JsonFieldType.STRING).description("Docker image"),
        fieldWithPath(prefix + "machine_type").optional().type(JsonFieldType.STRING).description("Machine type"),
        fieldWithPath(prefix + "sdk_version").optional().type(JsonFieldType.STRING).description("SDK version (Python, Java etc)"),
    )
}


@Component
internal class AccountSubjectPreparationTrait {

    lateinit var account: Account
    lateinit var account2: Account
    lateinit var subject: Person
    lateinit var subject2: Person
    var token: String = "test-dummy-token-"
    lateinit var token2: String

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
        account = createMockUser(personGitlabId = 1L)
        account2 = createMockUser(userOverrideSuffix = "0002", personGitlabId = 2L)
        subject = account.person
        subject2 = account2.person
        token = RandomUtils.generateRandomUserName(25)
        token2 = RandomUtils.generateRandomUserName(25)
    }

    protected fun deleteAll() {
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
        gitlabProjectMembers.clear()
        gitlabUsersProjects.clear()
    }

    @Transactional
    protected fun createMockUser(plainPassword: String = "password", userOverrideSuffix: String? = null, personGitlabId: Long? = null): Account {

        var mockToken = AbstractRestApiTest.testPrivateUserTokenMock1
        var userSuffix = "0000"
        if (userOverrideSuffix != null) {
            userSuffix = userOverrideSuffix
            mockToken = "second-token-$userSuffix"
        }
        val passwordEncrypted = passwordEncoder.encode(plainPassword)

        val person = personRepository.save(Person(
            id = randomUUID(),
            slug = "person_slug$userSuffix",
            name = "user name $userSuffix",
            gitlabId = personGitlabId ?: Random.nextLong().absoluteValue))
        val account = accountRepository.save(Account(
            id = randomUUID(),
            username = "username$userSuffix",
            email = "email$userSuffix@example.com",
            passwordEncrypted = passwordEncrypted,
            person = person))
        accountTokenRepository.save(AccountToken(
            id = randomUUID(),
            accountId = account.id,
            token = mockToken,
            gitlabId = 0))
        return account
    }
}

@Component
internal class PipelineTestPreparationTrait : AccountSubjectPreparationTrait() {

    lateinit var dataOp1: ProcessorVersion
    lateinit var dataOp2: ProcessorVersion
    lateinit var dataOp3: ProcessorVersion
    lateinit var dataProject: DataProject
    lateinit var dataProject2: DataProject
    lateinit var codeProject: CodeProject
    lateinit var baseEnv1: BaseEnvironments
    lateinit var baseEnv2: BaseEnvironments
    lateinit var baseEnv3: BaseEnvironments

    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var pipelineInstanceRepository: PipelineInstanceRepository

    @Autowired
    private lateinit var experimentRepository: ExperimentRepository

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var parameterInstanceRepository: ParameterInstanceRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var dataOperationRepository: DataOperationRepository

    @Autowired
    private lateinit var dataAlgorithmRepository: DataAlgorithmRepository

    @Autowired
    private lateinit var dataVisualizationRepository: DataVisualizationRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    private lateinit var baseEnvironmentsRepository: BaseEnvironmentsRepository

    override fun apply() {
        deleteAll()
        super.deleteAll()
        applyAccount()

        baseEnv1 = baseEnvironmentsRepository.save(BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker1:latest", sdkVersion = "3.7"))
        baseEnv2 = baseEnvironmentsRepository.save(BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker2:latest", sdkVersion = "3.7"))
        baseEnv3 = baseEnvironmentsRepository.save(BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker3:latest", sdkVersion = "3.7"))

        dataProject = dataProjectRepository.save(DataProject(
            UUID.fromString("aaaa0001-0000-0000-0000-dbdbdbdbdbdb"), "data-project1", "url", "Test DataProject",
            "", ownerId = account.person.id, gitlabId = Random.nextInt().toLong().absoluteValue, gitlabNamespace = "commons", gitlabPath = "data-project1"
        ))
        dataProject2 = dataProjectRepository.save(DataProject(
            UUID.fromString("aaaa0001-0000-0000-0002-dbdbdbdbdbdb"), "data-project2", "url", "Test DataProject",
            "", ownerId = account2.person.id, gitlabId = Random.nextInt().toLong().absoluteValue, gitlabNamespace = "commons", gitlabPath = "data-project2")
        )
        codeProject = codeProjectRepository.save(CodeProject(randomUUID(), "code-project1", "url", "Test DataProject", "", ownerId = account.person.id,
            gitlabNamespace = "commons", gitlabId = Random.nextInt().toLong().absoluteValue, gitlabPath = "code-project1"))

        val _dataOp1 = dataOperationRepository.save(DataOperation(randomUUID(), "commons-data-operation1", "name", DataType.ANY, DataType.ANY))
        val _dataOp2 = dataAlgorithmRepository.save(DataAlgorithm(randomUUID(), "commons-algorithm", "name", DataType.ANY, DataType.ANY))
        val _dataOp3 = dataVisualizationRepository.save(DataVisualization(randomUUID(), "commons-data-visualisation", "name", DataType.ANY))

        dataOp1 = processorVersionRepository.save(ProcessorVersion(
            id = _dataOp1.id, dataProcessor = _dataOp1, publisher = account.person,
            command = "command", number = 1, baseEnvironment = baseEnv1))

        dataOp2 = processorVersionRepository.save(ProcessorVersion(
            id = _dataOp2.id, dataProcessor = _dataOp2, publisher = account.person,
            command = "command", number = 1, baseEnvironment = baseEnv2))

        dataOp3 = processorVersionRepository.save(ProcessorVersion(
            id = _dataOp3.id, dataProcessor = _dataOp3, publisher = account.person,
            command = "command", number = 1, baseEnvironment = baseEnv3))

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

    public override fun deleteAll() {
        parameterInstanceRepository.deleteAll()
        dataProcessorInstanceRepository.deleteAll()
        experimentRepository.deleteAll()
        pipelineInstanceRepository.deleteAll()
        pipelineConfigRepository.deleteAll()
        processorParameterRepository.deleteAll()
        processorVersionRepository.deleteAll()
        dataProcessorRepository.deleteAll()

        dataProjectRepository.deleteAll()
        codeProjectRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
        baseEnvironmentsRepository.deleteAll()
    }


}

