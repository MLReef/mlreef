package com.mlreef.rest.integration

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.PipelineTestPreparationTrait
import com.mlreef.rest.api.v1.DataProcessorCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorDto
import com.mlreef.rest.api.v1.dto.ParameterDto
import com.mlreef.rest.feature.data_processors.DataProcessorService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProcessorIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/data-processors"
    val rootUrl2 = "/api/v1/code-projects"

    @Autowired
    private lateinit var dataProcessorService: DataProcessorService

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @Autowired
    private lateinit var integrationTestsHelper: IntegrationTestsHelper

    @BeforeEach
    @AfterEach
    fun clearRepo() {
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createDataProcessor(DataProcessorType.OPERATION, codeProject, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject2, DataType.IMAGE)

        val returnedResult: List<DataProcessorDto> = this.performGet(rootUrl, token)
            .expectOk()
            .returnsList(DataProcessorDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filtered`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)
        val url = "$rootUrl?type=OPERATION&input_data_type=IMAGE&output_data_type=VIDEO"

        val returnedResult: List<DataProcessorDto> = this.performGet(url, token)
            .expectOk()
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
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=OPERATION&input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url, token)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
            assertThat(it.inputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters combined 2`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=VISUALIZATION&output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url, token)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.VISUALIZATION)
            assertThat(it.outputDataType).isEqualTo(DataType.IMAGE)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters input DataType`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.inputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters output DataType`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.outputDataType).isEqualTo(DataType.IMAGE)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters OPERATION`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=OPERATION"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters VISUALIZATION`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=VISUALIZATION"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.VISUALIZATION)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters ALGORITHM`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=ALGORITHM"
        val returnedResult = performFilterRequest(url, token)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.ALGORITHM)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign DataProcessor`() {
        val (account, token1, _) = integrationTestsHelper.createRealUser()
        val (account2, token2, _) = integrationTestsHelper.createRealUser()

        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(token1, account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(token2, account2)

        createDataProcessor(DataProcessorType.OPERATION, codeProject)

        this.performGet("$rootUrl/${codeProject2.id}/processor", token1)
            .expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create new DataProcessor`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealCodeProject(token, account)

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

        val url = "$rootUrl2/${project.id}/processor"

        val returnedResult: DataProcessorDto = this.performPost(url, token, body = request)
            .expectOk()
            .returns(DataProcessorDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own DataProcessor`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealCodeProject(token, account)

        createDataProcessor(DataProcessorType.OPERATION, project)

        this.performGet("$rootUrl2/${project.id}/processor", token)
            .expectOk()
    }

    private fun createManyMocks(codeProject: CodeProject, codeProject2: CodeProject) {
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

    private fun performFilterRequest(url: String, token: String): List<DataProcessorDto> {
        val returnedResult: List<DataProcessorDto> = this.mockMvc.perform(
            this.acceptContentAuth(get(url), token))
            .andExpect(status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProcessorDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }
        return returnedResult
    }


    private fun createDataProcessor(type: DataProcessorType = DataProcessorType.OPERATION, codeProject: CodeProject, inputDataType: DataType = DataType.IMAGE, outputDataType: DataType = DataType.IMAGE): DataProcessor {
        val id = randomUUID()
        val entity = dataProcessorService.createForCodeProject(
            id = id, name = "name",
            slug = "slug-$id", parameters = listOf(),
            author = null, description = "description", visibilityScope = VisibilityScope.PUBLIC,
            outputDataType = outputDataType,
            inputDataType = inputDataType,
            codeProject = codeProject,
            command = "command1",
            type = type
        )
        return entity
    }
}
