package com.mlreef.rest.api

import com.mlreef.rest.api.v1.PipelineConfigCreateRequest
import com.mlreef.rest.api.v1.PipelineConfigUpdateRequest
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineDto
import com.mlreef.rest.api.v1.dto.ProcessorInstanceDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.VisibilityScope
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import javax.transaction.Transactional

class ProjectPipelinesConfigApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/data-projects"

    @BeforeEach
    fun prepareRepo() {
        mockGitlabPipelineWithBranch("targetBranch")
    }

    @AfterEach
    fun clearRepo() {
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all Pipelines of own DataProject`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val notOwn_dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject =
            createCodeProject(name = "Pipeline config test code project", slug = UUID.randomUUID().toString())
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)

        val pipelineConfig1 = createPipelineConfiguration(
            dataProject,
            "slug1",
            inputFiles = arrayListOf(),
            processorInstance = processorInstance
        )
        val pipelineConfig2 = createPipelineConfiguration(
            dataProject,
            "slug2",
            inputFiles = arrayListOf(),
            processorInstance = processorInstance
        )
        val pipelineConfig3 = createPipelineConfiguration(
            notOwn_dataProject,
            "slug1",
            inputFiles = arrayListOf(),
            processorInstance = processorInstance
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val returnedResult: List<PipelineConfigDto> = this
            .performGet("$rootUrl/${dataProject.id}/pipelines", token)
            .andExpect(status().isOk)
            .document(
                "project-pipelineconfig-retrieve-all",
                responseFields(pipelineConfigDtoResponseFields("[]."))
                    .and(dataProcessorInstanceFields("[].data_operations[]."))
            )
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create new PipelineConfig`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)

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
                ProcessorInstanceDto(
                    slug = "commons-data-operation",
                    parameters = listOf(
                        ParameterInstanceDto("stringParam", type = "STRING", value = "string value"),
                        ParameterInstanceDto("floatParam", type = "FLOAT", value = "0.01"),
                        ParameterInstanceDto("integerParam", type = "INTEGER", value = "10"),
                        ParameterInstanceDto("stringList", type = "LIST", value = "[\"asdf\",\"asdf\",\"asdf\"]")
                    )
                )
            )
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/pipelines"
        val returnedResult: PipelineConfigDto = performPost(url, token, body = request)
            .andExpect(status().isOk)
            .document(
                "project-pipelineconfig-create-success",
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
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)

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
                ProcessorInstanceDto(
                    slug = "commons-data-operation",
                    parameters = listOf(
                        ParameterInstanceDto("stringParam", type = "STRING", value = "string value"),
                        ParameterInstanceDto("floatParam", type = "FLOAT", value = "0.01"),
                        ParameterInstanceDto("integerParam", type = "INTEGER", value = "10"),
                        ParameterInstanceDto("stringList", type = "LIST", value = "[\"asdf\",\"asdf\",\"asdf\"]")
                    )
                )
            )
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/pipelines/create-start-instance"
        val returnedResult: PipelineDto = performPost(url, token, body = request)
            .andExpect(status().isOk)
            .document(
                "project-pipelineconfig-create-start-instance-success",
                requestFields(pipelineConfigCreateRequestFields())
                    .and(dataProcessorInstanceFields("data_operations[].")),
                responseFields(pipelineDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info."))
            )
            .returns(PipelineDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own PipelineConfig`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject =
            createCodeProject(name = "Pipeline config test code project", slug = UUID.randomUUID().toString())
        val processor = createProcessor(codeProject)
        val processorInstance =
            createProcessorInstance(processor, slug = "pipeline-config-test-update-processor-instance")
        val pipelineConfig = createPipelineConfiguration(
            dataProject,
            "pipeline-config-test-update-pipeline-config",
            inputFiles = arrayListOf(),
            processorInstance = processorInstance
        )

        val request = PipelineConfigUpdateRequest(
            sourceBranch = "source",
            name = "DataPipeline",
            inputFiles = listOf(
                FileLocationDto("."),
                FileLocationDto("image.png"),
                FileLocationDto("http://orf.at", "URL")
            ),
            dataOperations = listOf(
                ProcessorInstanceDto(
                    slug = "commons-data-operation",
                    parameters = listOf(
                        ParameterInstanceDto("stringParam", type = "STRING", value = "string value"),
                        ParameterInstanceDto("floatParam", type = "FLOAT", value = "0.01"),
                        ParameterInstanceDto("integerParam", type = "INTEGER", value = "10"),
                        ParameterInstanceDto("stringList", type = "LIST", value = "[\"asdf\",\"asdf\",\"asdf\"]")
                    )
                )
            )
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/pipelines/${pipelineConfig.id}"
        val returnedResult: PipelineConfigDto = this
            .performPut(url, token, request)
            .andExpect(status().isOk)
            .document(
                "project-pipelineconfig-update-success",
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
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val notOwn_dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)

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
                ProcessorInstanceDto(
                    slug = "commons-data-operation1",
                    parameters = listOf(
                        ParameterInstanceDto("stringParam", type = "STRING", value = "string value"),
                        ParameterInstanceDto("floatParam", type = "FLOAT", value = "0.01"),
                        ParameterInstanceDto("integerParam", type = "INTEGER", value = "10"),
                        ParameterInstanceDto("stringList", type = "LIST", value = "[\"asdf\",\"asdf\",\"asdf\"]")
                    )
                )
            )
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${notOwn_dataProject.id}/pipelines"
        performPost(url, token, body = request).andExpect(status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific PipelineConfig of own DataProject`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject =
            createCodeProject(name = "Pipeline config test code project", slug = UUID.randomUUID().toString())
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)

        val pipelineConfig = createPipelineConfiguration(
            dataProject,
            "slug1",
            inputFiles = arrayListOf(),
            processorInstance = processorInstance
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        performGet("$rootUrl/${dataProject.id}/pipelines/${pipelineConfig.id}", token)
            .andExpect(status().isOk)
            .document(
                "project-pipelineconfig-retrieve-one",
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
            )

    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve PipelineConfigs of not-own DataProject`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val notOwn_dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject =
            createCodeProject(name = "Pipeline config test code project", slug = UUID.randomUUID().toString())
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)

        val pipelineConfig = createPipelineConfiguration(
            notOwn_dataProject,
            "slug1",
            inputFiles = arrayListOf(),
            processorInstance = processorInstance
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        this.performGet("$rootUrl/${notOwn_dataProject.id}/pipelines/${pipelineConfig.id}", token)
            .andExpect(status().isForbidden)
    }
}


fun pipelineConfigCreateRequestFields(): List<FieldDescriptor> {
    return listOf(
        PayloadDocumentation.fieldWithPath("pipeline_type").type(JsonFieldType.STRING).description("Type of this Pipeline, can be DATA or VISUALIZATION"),
        PayloadDocumentation.fieldWithPath("slug").type(JsonFieldType.STRING).description("Unique slug of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
        PayloadDocumentation.fieldWithPath("input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
        PayloadDocumentation.fieldWithPath("input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
        PayloadDocumentation.fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
        PayloadDocumentation.fieldWithPath("target_branch_pattern").type(JsonFieldType.STRING).description("Branch name for destination"),
        PayloadDocumentation.fieldWithPath("data_operations").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing"),
    )
}

fun pipelineConfigUpdateRequestFields(): List<FieldDescriptor> {
    return listOf(
        PayloadDocumentation.fieldWithPath("name").type(JsonFieldType.STRING).description("Name of this PipelineConfig"),
        PayloadDocumentation.fieldWithPath("input_files").type(JsonFieldType.ARRAY).optional().description("FileLocation used as input files"),
        PayloadDocumentation.fieldWithPath("input_files[].location").type(JsonFieldType.STRING).optional().description("FileLocation path or url"),
        PayloadDocumentation.fieldWithPath("input_files[].location_type").type(JsonFieldType.STRING).optional().description("FileLocationType: AWS, URL, or PATH (default)"),
        PayloadDocumentation.fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
        PayloadDocumentation.fieldWithPath("data_operations").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PreProcessing")
    )
}
