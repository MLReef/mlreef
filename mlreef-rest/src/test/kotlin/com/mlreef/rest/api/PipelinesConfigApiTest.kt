package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelinesConfigApiTest : AbstractRestApiTest() {

    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject
    val rootUrl = "/api/v1/pipelines"

    @Autowired private lateinit var pipelineConfigRepository: PipelineConfigRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
        subject = pipelineTestPreparationTrait.subject
        dataProject = pipelineTestPreparationTrait.dataProject
        dataProject2 = pipelineTestPreparationTrait.dataProject2

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Pipelines`() {

        val dataProcessorInstance = createDataProcessorInstance()
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1")
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug2")

        val returnedResult: List<PipelineConfigDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(get(rootUrl)))
            .andExpect(status().isOk)
            .document("pipelineconfig-retrieve-all",
                responseFields(pipelineConfigDtoResponseFields("[]."))
                    .and(dataProcessorInstanceFields("[].data_operations[].")))
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific PipelineConfig`() {
        val dataProcessorInstance = createDataProcessorInstance()
        val entity = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug")

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${entity.id}")))
            .andExpect(status().isOk)
            .document("pipelineconfig-retrieve-one",
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[].")))

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

    private fun pipelineConfigDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath(prefix + "pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALISATION"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
            fieldWithPath(prefix + "input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
            fieldWithPath(prefix + "input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
            fieldWithPath(prefix + "input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
            fieldWithPath(prefix + "data_project_id").type(JsonFieldType.STRING).description("Id of DataProject"),
            fieldWithPath(prefix + "data_operations").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing"),
            fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Branch name"),
            fieldWithPath(prefix + "target_branch_pattern").type(JsonFieldType.STRING).description("Branch name pattern, can include \$ID and \$SLUG")
        )
    }

    private fun pipelineConfigCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALISATION"),
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
            fieldWithPath("input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
            fieldWithPath("input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
            fieldWithPath("input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
            fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
            fieldWithPath("target_branch_pattern").type(JsonFieldType.STRING).description("Branch name for destination"),
            fieldWithPath("data_operations").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing")
        )
    }

    private fun pipelineConfigUpdateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
            fieldWithPath("input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
            fieldWithPath("input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
            fieldWithPath("input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
            fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
            fieldWithPath("target_branch_pattern").type(JsonFieldType.STRING).description("Branch name for destination"),
            fieldWithPath("data_operations").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing")
        )
    }
}
