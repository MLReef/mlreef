package com.mlreef.rest.integration

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.ParameterType
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.PipelineTestPreparationTrait
import com.mlreef.rest.api.v1.PipelineConfigCreateRequest
import com.mlreef.rest.api.v1.PipelineConfigUpdateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ProjectPipelinesConfigApiTest : IntegrationRestApiTest() {

    val rootUrl = "/api/v1/data-projects"
    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization

    @Autowired private lateinit var pipelineConfigRepository: PipelineConfigRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        pipelineTestPreparationTrait.apply()
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all Pipelines of own DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (project1, _) = gitlabHelper.createRealDataProject(account1)
        val (project2, _) = gitlabHelper.createRealDataProject(account2)

        val dataProcessorInstance = createDataProcessorInstance()
        createPipelineConfig(dataProcessorInstance, project1.id, "slug1")
        createPipelineConfig(dataProcessorInstance, project1.id, "slug2")
        createPipelineConfig(dataProcessorInstance, project2.id, "slug1")

        val returnedResult: List<PipelineConfigDto> = this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project1.id}/pipelines"), account1))
            .andExpect(status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, PipelineConfigDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create new PipelineConfig`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        val request = PipelineConfigCreateRequest(
            sourceBranch = "source",
            targetBranchPattern = "\$SLUG-\$ID",
            pipelineType = "DATA",
            slug = "data-pipeline",
            name = "DataPipeline",
            inputFiles = listOf(
                FileLocationDto("."),
                FileLocationDto("image.png"),
                FileLocationDto("http://orf.at", "URL")
            ),
            dataOperations = listOf(
                DataProcessorInstanceDto("commons-data-operation1", listOf(
                    ParameterInstanceDto("stringParam", type = ParameterType.STRING.name, value = "string value"),
                    ParameterInstanceDto("floatParam", type = ParameterType.FLOAT.name, value = "0.01"),
                    ParameterInstanceDto("integerParam", type = ParameterType.INTEGER.name, value = "10"),
                    ParameterInstanceDto("stringList", type = ParameterType.LIST.name, value = "[\"asdf\",\"asdf\",\"asdf\"]")
                )))
        )

        val url = "$rootUrl/${project.id}/pipelines"

        val returnedResult: PipelineConfigDto = this.mockMvc.perform(
            this.acceptContentAuth(post(url), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PipelineConfigDto::class.java)
            }

        assertThat(returnedResult).isNotNull()
    }

    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can update own PipelineConfig`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1")

        val request = PipelineConfigUpdateRequest(
            sourceBranch = "source",
            name = "DataPipeline",
            inputFiles = listOf(
                FileLocationDto("."),
                FileLocationDto("image.png"),
                FileLocationDto("http://orf.at", "URL")
            ),
            dataOperations = listOf(
                DataProcessorInstanceDto("commons-data-operation1", listOf(
                    ParameterInstanceDto("stringParam", type = ParameterType.STRING.name, value = "string value"),
                    ParameterInstanceDto("floatParam", type = ParameterType.FLOAT.name, value = "0.01"),
                    ParameterInstanceDto("integerParam", type = ParameterType.INTEGER.name, value = "10"),
                    ParameterInstanceDto("stringList", type = ParameterType.LIST.name, value = "[\"asdf\",\"asdf\",\"asdf\"]")
                )))
        )

        val url = "$rootUrl/${project.id}/pipelines/${pipelineConfig.id}"

        val returnedResult: PipelineConfigDto = this.mockMvc.perform(
            this.acceptContentAuth(put(url), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PipelineConfigDto::class.java)
            }

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create new PipelineConfig in not-own DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (project1, _) = gitlabHelper.createRealDataProject(account1)
        val (project2, _) = gitlabHelper.createRealDataProject(account2)

        val request = PipelineConfigCreateRequest(
            sourceBranch = "source",
            targetBranchPattern = "\$SLUG-\$ID",
            pipelineType = "DATA",
            slug = "data-pipeline",
            name = "DataPipeline",
            inputFiles = listOf(
                FileLocationDto("."),
                FileLocationDto("image.png"),
                FileLocationDto("http://orf.at", "URL")
            ),
            dataOperations = listOf(
                DataProcessorInstanceDto("commons-data-operation1", listOf(
                    ParameterInstanceDto("stringParam", type = ParameterType.STRING.name, value = "string value"),
                    ParameterInstanceDto("floatParam", type = ParameterType.FLOAT.name, value = "0.01"),
                    ParameterInstanceDto("integerParam", type = ParameterType.INTEGER.name, value = "10"),
                    ParameterInstanceDto("stringList", type = ParameterType.LIST.name, value = "[\"asdf\",\"asdf\",\"asdf\"]")
                )))
        )
        val url = "$rootUrl/${project2.id}/pipelines"
        this.mockMvc.perform(
            this.acceptContentAuth(post(url), account1)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden)
    }

    @Disabled
    @Transactional
    @Rollback
    @Test fun `Can retrieve specific PipelineConfig of own DataProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val entity = createPipelineConfig(dataProcessorInstance, project.id, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project.id}/pipelines/${entity.id}"), account))
            .andExpect(status().isOk)

    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve PipelineConfigs of not-own DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (project1, _) = gitlabHelper.createRealDataProject(account1)
        val (project2, _) = gitlabHelper.createRealDataProject(account2)

        val dataProcessorInstance = createDataProcessorInstance()
        val entity2 = createPipelineConfig(dataProcessorInstance, project2.id, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project2.id}/pipelines/${entity2.id}"), account1))
            .andExpect(status().isForbidden)

    }

    private fun createPipelineConfig(dataProcessorInstance: DataProcessorInstance, dataProjectId: UUID, slug: String): PipelineConfig {
        val entity = PipelineConfig(
            id = randomUUID(),
            pipelineType = PipelineType.DATA, slug = slug, name = "name",
            dataProjectId = dataProjectId,
            sourceBranch = "source", targetBranchPattern = "target",
            dataOperations = arrayListOf(dataProcessorInstance))
        pipelineConfigRepository.save(entity)
        return entity
    }

    private fun createDataProcessorInstance(): DataProcessorInstance {
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), dataOp1)
        val processorParameter = ProcessorParameter(
            id = randomUUID(), dataProcessorId = dataProcessorInstance.dataProcessorId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)
        dataProcessorInstance.addParameterInstances(
            processorParameter, "value")
        processorParameterRepository.save(processorParameter)
        return dataProcessorInstanceRepository.save(dataProcessorInstance)
    }


}

internal fun pipelineConfigDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
    return listOf(
        PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
        PayloadDocumentation.fieldWithPath(prefix + "pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALISATION"),
        PayloadDocumentation.fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath(prefix + "input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
        PayloadDocumentation.fieldWithPath(prefix + "input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
        PayloadDocumentation.fieldWithPath(prefix + "input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
        PayloadDocumentation.fieldWithPath(prefix + "data_project_id").type(JsonFieldType.STRING).description("Id of DataProject"),
        PayloadDocumentation.fieldWithPath(prefix + "data_operations").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing"),
        PayloadDocumentation.fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Branch name"),
        PayloadDocumentation.fieldWithPath(prefix + "target_branch_pattern").type(JsonFieldType.STRING).description("Branch name pattern, can include \$ID and \$SLUG")
    )
}

internal fun pipelineConfigCreateRequestFields(): List<FieldDescriptor> {
    return listOf(
        PayloadDocumentation.fieldWithPath("pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALISATION"),
        PayloadDocumentation.fieldWithPath("slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
        PayloadDocumentation.fieldWithPath("input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
        PayloadDocumentation.fieldWithPath("input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
        PayloadDocumentation.fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
        PayloadDocumentation.fieldWithPath("target_branch_pattern").type(JsonFieldType.STRING).description("Branch name for destination"),
        PayloadDocumentation.fieldWithPath("data_operations").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing")
    )
}

internal fun pipelineConfigUpdateRequestFields(): List<FieldDescriptor> {
    return listOf(
        PayloadDocumentation.fieldWithPath("slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
        PayloadDocumentation.fieldWithPath("input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
        PayloadDocumentation.fieldWithPath("input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
        PayloadDocumentation.fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
        PayloadDocumentation.fieldWithPath("target_branch_pattern").type(JsonFieldType.STRING).description("Branch name for destination"),
        PayloadDocumentation.fieldWithPath("data_operations").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing")
    )
}
