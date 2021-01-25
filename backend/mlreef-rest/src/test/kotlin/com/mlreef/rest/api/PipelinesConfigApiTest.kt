package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
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
import javax.transaction.Transactional

class PipelinesConfigApiTest : AbstractRestApiTest() {

    private lateinit var dataOp1: ProcessorVersion
    private lateinit var dataOp2: ProcessorVersion
    private lateinit var dataOp3: ProcessorVersion
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject
    val rootUrl = "/api/v1/pipelines"

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    fun prepareRepo() {
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        dataOp1 = pipelineTestPreparationTrait.procVersion1!!
        dataOp2 = pipelineTestPreparationTrait.procVersion2!!
        dataOp3 = pipelineTestPreparationTrait.procVersion3!!
        subject = pipelineTestPreparationTrait.subject
        dataProject = pipelineTestPreparationTrait.dataProject
        dataProject2 = pipelineTestPreparationTrait.dataProject2

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)
    }

    @AfterEach
    fun clearRepo() {
        pipelineTestPreparationTrait.deleteAll()
    }


    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Pipelines`() {

        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1")
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug2")

        val returnedResult: List<PipelineConfigDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(get(rootUrl), token))
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
        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        val entity = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug")

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${entity.id}"), token))
            .andExpect(status().isOk)
            .document("pipelineconfig-retrieve-one",
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[].")))

    }

    private fun pipelineConfigCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALIZATION"),
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
