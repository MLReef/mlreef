package com.mlreef.rest.integration

import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
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
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProcessorIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/data-processors"
    val rootUrl2 = "/api/v1/code-projects"

    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository
    @Autowired private lateinit var dataProcessorService: DataProcessorService
    @Autowired private lateinit var codeProjectRepository: CodeProjectRepository
    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @Autowired
    private lateinit var integrationTestsHelper: IntegrationTestsHelper

    @BeforeEach
    @AfterEach
    fun clearRepo() {
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createDataProcessor(DataProcessorType.OPERATION, codeProject.id, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject.id, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject2.id, DataType.IMAGE)

        val returnedResult: List<DataProcessorDto> = this.mockMvc.perform(
            this.acceptContentAuth(get(rootUrl), account))
            .andExpect(status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProcessorDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filtered`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)
        val url = "$rootUrl?type=OPERATION&input_data_type=IMAGE&output_data_type=VIDEO"
        val returnedResult: List<DataProcessorDto> = this.mockMvc.perform(
            this.acceptContentAuth(get(url), account))
            .andExpect(status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProcessorDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
            assertThat(it.inputDataType).isEqualTo(DataType.IMAGE)
            assertThat(it.outputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filters combined 1`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=OPERATION&input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url, account)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
            assertThat(it.inputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filters combined 2`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=VISUALISATION&output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url, account)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.VISUALISATION)
            assertThat(it.outputDataType).isEqualTo(DataType.IMAGE)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filters input DataType`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url, account)
        returnedResult.forEach {
            assertThat(it.inputDataType).isEqualTo(DataType.VIDEO)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filters output DataType`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url, account)
        returnedResult.forEach {
            assertThat(it.outputDataType).isEqualTo(DataType.IMAGE)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filters OPERATION`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=OPERATION"
        val returnedResult = performFilterRequest(url, account)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.OPERATION)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filters VISUALISATION`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=VISUALISATION"
        val returnedResult = performFilterRequest(url, account)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.VISUALISATION)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all DataProcessors filters ALGORITHM`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=ALGORITHM"
        val returnedResult = performFilterRequest(url, account)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo(DataProcessorType.ALGORITHM)
        }
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve foreign DataProcessor`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (account2, _, _) = integrationTestsHelper.createRealUser()

        val (codeProject, _) = integrationTestsHelper.createRealCodeProject(account)
        val (codeProject2, _) = integrationTestsHelper.createRealCodeProject(account2)

        createDataProcessor(DataProcessorType.OPERATION, codeProject.id)

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${codeProject2.id}/processor"), account))
            .andExpect(status().isNotFound)
    }

    @Transactional
    @Rollback
    @Test fun `Can create new DataProcessor`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealCodeProject(account)

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

        val returnedResult: DataProcessorDto = this.mockMvc.perform(
            this.acceptContentAuth(post(url), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProcessorDto::class.java)
            }

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own DataProcessor`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealCodeProject(account)

        createDataProcessor(DataProcessorType.OPERATION, project.id)

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl2/${project.id}/processor"), account))
            .andExpect(status().isOk)

    }

    private fun createManyMocks(codeProject: CodeProject, codeProject2: CodeProject) {
        createDataProcessor(DataProcessorType.OPERATION, codeProject.id, DataType.IMAGE, DataType.VIDEO)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject.id, DataType.IMAGE, DataType.IMAGE)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject.id, DataType.TEXT, DataType.VIDEO)
        createDataProcessor(DataProcessorType.VISUALISATION, codeProject2.id, DataType.IMAGE, DataType.IMAGE)
        createDataProcessor(DataProcessorType.OPERATION, codeProject2.id, DataType.VIDEO, DataType.VIDEO)
        createDataProcessor(DataProcessorType.VISUALISATION, codeProject2.id, DataType.VIDEO, DataType.VIDEO)
        createDataProcessor(DataProcessorType.OPERATION, codeProject.id, DataType.VIDEO, DataType.IMAGE)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject.id, DataType.VIDEO, DataType.VIDEO)
        createDataProcessor(DataProcessorType.ALGORITHM, codeProject.id, DataType.VIDEO, DataType.IMAGE)
        createDataProcessor(DataProcessorType.VISUALISATION, codeProject2.id, DataType.IMAGE, DataType.VIDEO)
        createDataProcessor(DataProcessorType.OPERATION, codeProject2.id, DataType.VIDEO, DataType.IMAGE)
        createDataProcessor(DataProcessorType.VISUALISATION, codeProject2.id, DataType.VIDEO, DataType.IMAGE)
    }

    private fun performFilterRequest(url: String, account: Account): List<DataProcessorDto> {
        val returnedResult: List<DataProcessorDto> = this.mockMvc.perform(
            this.acceptContentAuth(get(url), account))
            .andExpect(status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProcessorDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }
        return returnedResult
    }


    private fun createDataProcessor(type: DataProcessorType = DataProcessorType.OPERATION, codeProjectId: UUID, inputDataType: DataType = DataType.IMAGE, outputDataType: DataType = DataType.IMAGE): DataProcessor {
        val id = randomUUID()
        val entity = dataProcessorService.createForCodeProject(
            id = id, name = "name",
            slug = "slug-$id", parameters = listOf(),
            author = null, description = "description", visibilityScope = VisibilityScope.PUBLIC,
            outputDataType = outputDataType,
            inputDataType = inputDataType,
            codeProjectId = codeProjectId,
            command = "command1",
            type = type
        )
        return entity
    }
}
