package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.api.v1.PipelineConfigCreateRequest
import com.mlreef.rest.api.v1.PipelineConfigUpdateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineInstanceDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import javax.transaction.Transactional

class ProjectPipelinesConfigApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/data-projects"
    private lateinit var dataOp1: ProcessorVersion
    private lateinit var dataOp2: ProcessorVersion
    private lateinit var dataOp3: ProcessorVersion
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var notOwn_dataProject: DataProject

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        token = pipelineTestPreparationTrait.token
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
        subject = pipelineTestPreparationTrait.subject
        dataProject = pipelineTestPreparationTrait.dataProject
        notOwn_dataProject = pipelineTestPreparationTrait.dataProject2

        mockGitlabPipelineWithBranch("sourceBranch", "targetBranch")

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all Pipelines of own DataProject`() {

        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1")
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug2")
        createPipelineConfig(dataProcessorInstance, notOwn_dataProject.id, "slug1")

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        val returnedResult: List<PipelineConfigDto> = this
            .performGet("$rootUrl/${dataProject.id}/pipelines", token)
            .andExpect(status().isOk)
            .document("project-pipelineconfig-retrieve-all",
                responseFields(pipelineConfigDtoResponseFields("[]."))
                    .and(dataProcessorInstanceFields("[].data_operations[].")))
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create new PipelineConfig`() {
        val request = PipelineConfigCreateRequest(
            sourceBranch = "sourceBranch",
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

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/pipelines"
        val returnedResult: PipelineConfigDto = performPost(url, token, body = request)
            .andExpect(status().isOk)
            .document("project-pipelineconfig-create-success",
                requestFields(pipelineConfigCreateRequestFields())
                    .and(dataProcessorInstanceFields("data_operations[].")),
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
            )
            .returns(PipelineConfigDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create-start new PipelineConfig and Instance`() {
        val request = PipelineConfigCreateRequest(
            sourceBranch = "sourceBranch",
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

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/pipelines/create-start-instance"
        val returnedResult: PipelineInstanceDto = performPost(url, token, body = request)
            .andExpect(status().isOk)
            .document("project-pipelineconfig-create-start-instance-success",
                requestFields(pipelineConfigCreateRequestFields())
                    .and(dataProcessorInstanceFields("data_operations[].")),
                responseFields(pipelineInstanceDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info."))
            )
            .returns(PipelineInstanceDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own PipelineConfig`() {

        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1")

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

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/pipelines/${pipelineConfig.id}"
        val returnedResult: PipelineConfigDto = this
            .performPut(url, token, request)
            .andExpect(status().isOk)
            .document("project-pipelineconfig-update-success",
                requestFields(pipelineConfigUpdateRequestFields())
                    .and(dataProcessorInstanceFields("data_operations[].")),
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
            )
            .returns(PipelineConfigDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create new PipelineConfig in not-own DataProject`() {
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
        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${notOwn_dataProject.id}/pipelines"
        performPost(url, token, body = request).andExpect(status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific PipelineConfig of own DataProject`() {
        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        val entity = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug")

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        performGet("$rootUrl/${dataProject.id}/pipelines/${entity.id}", token)
            .andExpect(status().isOk)
            .document("project-pipelineconfig-retrieve-one",
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[].")))

    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve PipelineConfigs of not-own DataProject`() {
        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        val entity2 = createPipelineConfig(dataProcessorInstance, notOwn_dataProject.id, "slug")

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        this.performGet("$rootUrl/${notOwn_dataProject.id}/pipelines/${entity2.id}", token)
            .andExpect(status().isForbidden)

    }

}

internal fun pipelineConfigDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
    return listOf(
        PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
        PayloadDocumentation.fieldWithPath(prefix + "pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALIZATION"),
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
        PayloadDocumentation.fieldWithPath("pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALIZATION"),
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
        PayloadDocumentation.fieldWithPath("name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
        PayloadDocumentation.fieldWithPath("input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
        PayloadDocumentation.fieldWithPath("input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
        PayloadDocumentation.fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
        PayloadDocumentation.fieldWithPath("data_operations").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing")
    )
}
