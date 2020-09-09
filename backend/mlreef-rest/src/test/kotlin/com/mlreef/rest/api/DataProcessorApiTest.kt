package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.BaseEnvironment
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.DataProcessorCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorDto
import com.mlreef.rest.api.v1.dto.ParameterDto
import com.mlreef.rest.api.v1.dto.ProcessorVersionDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProcessorApiTest : AbstractRestApiTest() {

    private lateinit var dataOp1: ProcessorVersion
    private lateinit var dataOp2: ProcessorVersion
    private lateinit var dataOp3: ProcessorVersion
    private lateinit var subject: Person
    private lateinit var codeProject: CodeProject
    private lateinit var codeProject2: CodeProject

    val rootUrl = "/api/v1/data-processors"
    val rootUrl2 = "/api/v1/code-projects"

    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository
    @Autowired private lateinit var processorVersionRepository: ProcessorVersionRepository
    @Autowired private lateinit var codeProjectRepository: CodeProjectRepository
    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    fun clearRepo() {
        truncateAllTables()
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        token = pipelineTestPreparationTrait.token
        subject = pipelineTestPreparationTrait.subject
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3

        codeProject = codeProjectRepository.save(CodeProject(
            randomUUID(), "code-project-slug1", "url", "Test DataProject", "",
            ownerId = account.person.id, gitlabNamespace = "processor-api-test", gitlabId = 10, gitlabPath = "code-project-slug1"))

        codeProject2 = codeProjectRepository.save(CodeProject(
            randomUUID(), "code-project-slug2", "url", "Test DataProject", "",
            ownerId = account.person.id, gitlabNamespace = "processor-api-test", gitlabId = 11, gitlabPath = "code-project-slug2"))

        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all DataProcessors`() {

        createDataProcessor(DataProcessorType.OPERATION, codeProject, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject2, DataType.IMAGE)

        val returnedResult: List<DataProcessorDto> = this.performGet(rootUrl, token)
            .andExpect(status().isOk)
            .document("data-processors-retrieve-all", responseFields(dataProcessorFields("[].")))
            .returnsList(DataProcessorDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all DataProcessor's Versions`() {
        val processor = createDataProcessor(DataProcessorType.OPERATION, codeProject)

        createProcessorVersion(processor, "master", 1, "command")
        createProcessorVersion(processor, "master", 2, "command")
        createProcessorVersion(processor, "develop", 3, "command")

        val returnedResult: List<ProcessorVersionDto> = this.performGet("$rootUrl/id/${processor.id}/versions", token)
            .andExpect(status().isOk)
            .document("processor-versions-retrieve-all", responseFields(processorVersionFields("[].")))
            .returnsList(ProcessorVersionDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    private fun createProcessorVersion(processor: DataProcessor, branch: String, number: Long,
                                       command: String, parameters: List<ProcessorParameter> = listOf()
    ): ProcessorVersion {
        val processorVersion = ProcessorVersion(
            id = randomUUID(), dataProcessor = processor, publisher = processor.author,
            command = command, branch = branch, number = number, baseEnvironment = BaseEnvironment.default(),
            parameters = parameters)
        return processorVersionRepository.save(processorVersion)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all DataProcessors filtered`() {
        createManyMocks()
        val url = "$rootUrl?type=OPERATION&input_data_type=IMAGE&output_data_type=VIDEO"
        val returnedResult: List<DataProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .document("data-processors-retrieve-all-filter",
                requestParameters(
                    parameterWithName("type").description("DataProcessor Type"),
                    parameterWithName("input_data_type").description("inputDataType of DataProcessor"),
                    parameterWithName("output_data_type").description("outputDataType of DataProcessor")
                ),
                responseFields(dataProcessorFields("[]."))
            )
            .returnsList(DataProcessorDto::class.java)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
            assertThat(it.inputDataType).isEqualTo(DataType.IMAGE)
            assertThat(it.outputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters combined 1`() {
        createManyMocks()
        val url = "$rootUrl?type=OPERATION&input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
            assertThat(it.inputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters combined 2`() {
        createManyMocks()
        val url = "$rootUrl?type=VISUALIZATION&output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.VISUALIZATION)
            assertThat(it.outputDataType).isEqualTo(DataType.IMAGE)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters input DataType`() {
        createManyMocks()
        val url = "$rootUrl?input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url)
        returnedResult.forEach {
            assertThat(it.inputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters output DataType`() {
        createManyMocks()
        val url = "$rootUrl?output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url)
        returnedResult.forEach {
            assertThat(it.outputDataType).isEqualTo(DataType.IMAGE)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters OPERATION`() {
        createManyMocks()
        val url = "$rootUrl?type=OPERATION"
        val returnedResult = performFilterRequest(url)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters VISUALIZATION`() {
        createManyMocks()
        val url = "$rootUrl?type=VISUALIZATION"
        val returnedResult = performFilterRequest(url)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.VISUALIZATION)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters ALGORITHM`() {
        createManyMocks()
        val url = "$rootUrl?type=ALGORITHM"
        val returnedResult = performFilterRequest(url)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.ALGORITHM)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign DataProcessor`() {
        createDataProcessor(DataProcessorType.OPERATION, codeProject)

        this.performGet("$rootUrl/${codeProject2.id}/processor", token)
            .andExpect(status().isNotFound)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create new DataProcessor`() {
        val request = DataProcessorCreateRequest(
            slug = "slug",
            name = "New Processor",
            inputDataType = DataType.IMAGE,
            outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC,
            description = "description",
            type = DataProcessorType.OPERATION,
            parameters = listOf(
                ParameterDto("stringParam", type = ParameterType.STRING.name, defaultValue = "string value", order = 1, required = true),
                ParameterDto("floatParam", type = ParameterType.FLOAT.name, defaultValue = "0.5", order = 1, required = true),
                ParameterDto("integerParam", type = ParameterType.INTEGER.name, defaultValue = "1", order = 1, required = true),
                ParameterDto("stringList", type = ParameterType.LIST.name, defaultValue = "[]", order = 1, required = false)
            )
        )
        val url = "$rootUrl2/${codeProject.id}/processor"
        val returnedResult: DataProcessorDto = this.performPost(url, token, body = request)
            .andExpect(status().isOk)
            .document("data-processors-codeproject-create-success",
                requestFields(dataProcessorCreateRequestFields()),
                responseFields(dataProcessorFields())
            )
            .returns(DataProcessorDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProcessor`() {
        createDataProcessor(DataProcessorType.OPERATION, codeProject)

        mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)

        this.performGet("$rootUrl2/${codeProject.id}/processor", token)
            .andExpect(status().isOk)
            .document("data-processors-codeproject-retrieve-one",
                responseFields(dataProcessorFields()))
    }

    private fun createManyMocks() {
        createDataProcessor(DataProcessorType.OPERATION, codeProject, DataType.IMAGE, DataType.VIDEO)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject, DataType.IMAGE, DataType.IMAGE)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject, DataType.AUDIO, DataType.VIDEO)
        createDataProcessor(DataProcessorType.VISUALIZATION, codeProject2, DataType.IMAGE, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject2, DataType.VIDEO, DataType.VIDEO)
        createDataProcessor(DataProcessorType.VISUALIZATION, codeProject2, DataType.VIDEO, DataType.VIDEO)
        createDataProcessor(DataProcessorType.OPERATION, codeProject, DataType.VIDEO, DataType.IMAGE)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject, DataType.VIDEO, DataType.VIDEO)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject, DataType.VIDEO, DataType.IMAGE)
        createDataProcessor(DataProcessorType.VISUALIZATION, codeProject2, DataType.IMAGE, DataType.VIDEO)
        createDataProcessor(DataProcessorType.OPERATION, codeProject2, DataType.VIDEO, DataType.IMAGE)
        createDataProcessor(DataProcessorType.VISUALIZATION, codeProject2, DataType.VIDEO, DataType.IMAGE)
    }

    private fun performFilterRequest(url: String): List<DataProcessorDto> {
        return this.performGet(url, token)
            .andExpect(status().isOk)
            .returnsList(DataProcessorDto::class.java)
    }

    private fun dataProcessorCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Branch name for destination"),
            fieldWithPath("input_data_type").type(JsonFieldType.STRING).optional().description("An optional List of DataProcessors used during PreProcessing"),
            fieldWithPath("output_data_type").type(JsonFieldType.STRING).optional().description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath("type").type(JsonFieldType.STRING).optional().description("An optional DataAlgorithm"),
            fieldWithPath("visibility_scope").type(JsonFieldType.STRING).optional().description("An optional DataAlgorithm"),
            fieldWithPath("code_project_id").type(JsonFieldType.STRING).optional().description("An optional DataAlgorithm"),
            fieldWithPath("description").type(JsonFieldType.STRING).optional().description("An optional DataAlgorithm"),
            fieldWithPath("parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
            fieldWithPath("parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
            fieldWithPath("parameters[].type").type(JsonFieldType.STRING).optional().description("Provided ParameterType of this Parameter"),
            fieldWithPath("parameters[].order").type(JsonFieldType.NUMBER).optional().description("Provided ParameterType of this Parameter"),
            fieldWithPath("parameters[].default_value").type(JsonFieldType.STRING).optional().description("Provided value (as parsable String) of Parameter "),
            fieldWithPath("parameters[].required").type(JsonFieldType.BOOLEAN).optional().description("Parameter required?"),
            fieldWithPath("parameters[].description").type(JsonFieldType.STRING).optional().description("Textual description of this Parameter")
        )
    }

}
