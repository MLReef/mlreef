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
import com.mlreef.rest.ParameterInstanceRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.SubjectRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.util.*
import javax.transaction.Transactional


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

    @Autowired protected lateinit var accountTokenRepository: AccountTokenRepository
    @Autowired protected lateinit var personRepository: PersonRepository
    @Autowired protected lateinit var accountRepository: AccountRepository

    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    fun apply() {
        deleteAll()
        applyAccount()
    }

    private fun applyAccount() {
        account = createMockUser()
        account2 = createMockUser(userOverrideSuffix = "0002")
        subject = account.person
    }

    private fun deleteAll() {
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
    }

    @Transactional
    protected fun createMockUser(plainPassword: String = "password", userOverrideSuffix: String? = null): Account {

        var mockToken = RestApiTest.testPrivateUserTokenMock
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
        applyAccount()

        dataProject = dataProjectRepository.save(DataProject(
            UUID.fromString("aaaa0001-0000-0000-0000-dbdbdbdbdbdb"), "slug1", "url", "Test DataProject",
            ownerId = account.person.id, gitlabId = 1, gitlabGroup = "mlreef", gitlabProject = "project1"
        ))
        dataProject2 = dataProjectRepository.save(DataProject(
            UUID.fromString("aaaa0001-0000-0000-0002-dbdbdbdbdbdb"), "slug2", "url", "Test DataProject",
            ownerId = account2.person.id, gitlabId = 2, gitlabGroup = "mlreef", gitlabProject = "project1")
        )
        codeProjectRepository.save(CodeProject(UUID.randomUUID(), "slug", "url", "Test DataProject", ownerId = account.person.id,
            gitlabGroup = "", gitlabId = 0, gitlabProject = ""))

        dataOp1 = dataOperationRepository.save(DataOperation(UUID.randomUUID(), "commons-data-operation1", "name", "command", DataType.ANY, DataType.ANY))
        dataOp2 = dataAlgorithmRepository.save(DataAlgorithm(UUID.randomUUID(), "commons-algorithm", "name", "command", DataType.ANY, DataType.ANY))
        dataOp3 = dataVisualizationRepository.save(DataVisualization(UUID.randomUUID(), "commons-data-visualisation", "name", "command", DataType.ANY))

        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp1.id, "stringParam", type = ParameterType.STRING, order = 0, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp1.id, "floatParam", type = ParameterType.FLOAT, order = 1, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp1.id, "integerParam", type = ParameterType.INTEGER, order = 2, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp1.id, "stringList", type = ParameterType.LIST, order = 3, defaultValue = ""))

        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp2.id, "booleanParam", type = ParameterType.BOOLEAN, order = 0, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp2.id, "complexName", type = ParameterType.COMPLEX, order = 1, defaultValue = ""))

        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp3.id, "tupleParam", type = ParameterType.TUPLE, order = 0, defaultValue = ""))
        processorParameterRepository.save(ProcessorParameter(UUID.randomUUID(), dataOp3.id, "hashParam", type = ParameterType.DICTIONARY, order = 1, defaultValue = ""))

    }

    private fun applyAccount() {
        account = createMockUser()
        account2 = createMockUser(userOverrideSuffix = "0002")
        subject = account.person
    }

    private fun deleteAll() {
        parameterInstanceRepository.deleteAll()
        dataProcessorInstanceRepository.deleteAll()

        processorParameterRepository.deleteAll()
        pipelineInstanceRepository.deleteAll()
        pipelineConfigRepository.deleteAll()
        experimentRepository.deleteAll()

        dataProcessorRepository.deleteAll()

        dataProjectRepository.deleteAll()
        codeProjectRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
    }

    @Transactional
    protected fun createMockUser(plainPassword: String = "password", userOverrideSuffix: String? = null): Account {

        var mockToken = RestApiTest.testPrivateUserTokenMock
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
}
