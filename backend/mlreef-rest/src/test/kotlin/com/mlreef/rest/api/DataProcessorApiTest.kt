package com.mlreef.rest.api

import com.mlreef.rest.api.v1.ProcessorCreateRequest
import com.mlreef.rest.api.v1.dto.ProcessorDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.testcommons.RestResponsePage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import javax.transaction.Transactional

class DataProcessorApiTest : AbstractRestApiTest() {
    private lateinit var codeProject: CodeProject
    private lateinit var codeProject2: CodeProject

    val rootUrl = "/api/v1/data-processors"
    val rootUrl2 = "/api/v1/code-projects"

    @BeforeEach
    fun clearRepo() {
        codeProject = createCodeProject(
            slug = "code-project-slug1",
            name = "Test CodeProject",
            ownerId = mainPerson3.id,
            namespace = "processor-api-test",
            gitlabId = 10,
            path = "code-project-slug1",
            inputTypes = listOf(imageDataType),
            outputTypes = listOf(videoDataType),
            processorType = operationProcessorType,
        )

        codeProject2 = createCodeProject(
            slug = "code-project-slug2",
            name = "Test CodeProject 2",
            ownerId = mainPerson3.id,
            namespace = "processor-api-test",
            gitlabId = 11,
            path = "code-project-slug2",
            processorType = operationProcessorType,
            visibility = VisibilityScope.PRIVATE,
        )

        println("Code project 1 ${codeProject.id}")
        println("Code project 2 ${codeProject2.id}")

        this.mockUserAuthentication(listOf(codeProject.id), mainAccount3, AccessLevel.OWNER)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all DataProcessors`() {
        val codeProject =
            createCodeProject(name = "Processor test code project", slug = UUID.randomUUID().toString())
        val codeProject2 =
            createCodeProject(name = "Processor test code project", slug = UUID.randomUUID().toString())

        createProcessor(codeProject, branch = "master", version = "1", slug = UUID.randomUUID().toString())
        createProcessor(codeProject, branch = "dev", version = "2", slug = UUID.randomUUID().toString())
        createProcessor(codeProject2, branch = "branch", version = "1", slug = UUID.randomUUID().toString())

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(rootUrl, token)
            .andExpect(status().isOk)
            .document(
                "data-processors-retrieve-all",
                responseFields(
                    wrapToPage(dataProcessorFields())
                )
            )
            .returns()

        assertThat(returnedResult.content.size).isEqualTo(3 + 4) //Plus 4 predefined in BaseTest
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all DataProcessors filtered`() {
        val url = "$rootUrl?type=OPERATION&input_data_type=IMAGE&output_data_type=VIDEO"

        val codeProject =
            createCodeProject(
                name = "Processor test code project",
                inputTypes = listOf(imageDataType),
                outputTypes = listOf(videoDataType)
            )

        createProcessor(codeProject, branch = "master", version = "1", slug = UUID.randomUUID().toString())
        createProcessor(codeProject, branch = "master", version = "2", slug = UUID.randomUUID().toString())

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .document(
                "data-processors-retrieve-all-filter",
                requestParameters(
                    parameterWithName("type").description("DataProcessor Type"),
                    parameterWithName("input_data_type").description("inputDataType of DataProcessor"),
                    parameterWithName("output_data_type").description("outputDataType of DataProcessor")
                ),
                responseFields(wrapToPage(dataProcessorFields()))
            )
            .returns()

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("OPERATION")
            assertThat(it.inputDataType.contains("IMAGE")).isTrue()
            assertThat(it.outputDataType.contains("VIDEO")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters combined 1`() {
        val url = "$rootUrl?type=OPERATION&input_data_type=VIDEO"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .returns()

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("OPERATION")
            assertThat(it.inputDataType.contains("VIDEO")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters combined 2`() {
        val url = "$rootUrl?type=VISUALIZATION&output_data_type=IMAGE"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .returns()

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("VISUALIZATION")
            assertThat(it.outputDataType.contains("IMAGE")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters input DataType`() {
        val url = "$rootUrl?input_data_type=VIDEO"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .returns()

        returnedResult.forEach {
            assertThat(it.inputDataType.contains("VIDEO")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters output DataType`() {
        val url = "$rootUrl?output_data_type=IMAGE"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .returns()

        returnedResult.forEach {
            assertThat(it.outputDataType.contains("IMAGE")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters OPERATION`() {
        val url = "$rootUrl?type=OPERATION"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .returns()

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("OPERATION")
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters VISUALIZATION`() {
        val url = "$rootUrl?type=VISUALIZATION"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .andExpect(status().isOk)
            .returns()

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("VISUALIZATION")
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters ALGORITHM`() {
        val url = "$rootUrl?type=ALGORITHM"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, mainToken3)
            .andExpect(status().isOk)
            .returns()

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("ALGORITHM")
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign DataProcessor`() {
        this.performGet("$rootUrl/${codeProject2.id}/processor", mainToken3)
            .andExpect(status().isNotFound)
    }

    @Transactional
    @Rollback
    @Test
    @Disabled("Data processor must be created using publishing")
    @Tag(TestTags.RESTDOC)
    fun `Can create new DataProcessor`() {
        val request = ProcessorCreateRequest(
            slug = "slug",
            name = "New Processor",
            branch = "master",
            description = "description",
            version = "0.1",
        )
        val url = "$rootUrl2/${codeProject.id}/processor"
        val returnedResult: ProcessorDto = this.performPost(url, mainToken3, body = request)
            .andExpect(status().isOk)
            .document(
                "data-processors-codeproject-create-success",
                requestFields(dataProcessorCreateRequestFields()),
                responseFields(dataProcessorFields())
            )
            .returns(ProcessorDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Disabled("No need to call this endpoint from /code-projects")
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProcessor`() {
        mockUserAuthentication(listOf(codeProject.id), mainAccount3, AccessLevel.OWNER)

        this.performGet("$rootUrl2/${codeProject.id}/processor", token)
            .andExpect(status().isOk)
            .document(
                "data-processors-codeproject-retrieve-one",
                responseFields(wrapToPage(dataProcessorFields()))
            )
    }

    private fun dataProcessorCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Branch name for destination"),
            fieldWithPath("input_data_type").type(JsonFieldType.STRING).optional()
                .description("An optional List of DataProcessors used during PreProcessing"),
            fieldWithPath("output_data_type").type(JsonFieldType.STRING).optional()
                .description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath("type").type(JsonFieldType.STRING).optional().description("An optional DataAlgorithm"),
            fieldWithPath("visibility_scope").type(JsonFieldType.STRING).optional()
                .description("An optional DataAlgorithm"),
            fieldWithPath("code_project_id").type(JsonFieldType.STRING).optional()
                .description("An optional DataAlgorithm"),
            fieldWithPath("description").type(JsonFieldType.STRING).optional().description("An optional DataAlgorithm"),
            fieldWithPath("parameters").type(JsonFieldType.ARRAY).optional().description("Name of Parameter"),
            fieldWithPath("parameters[].name").type(JsonFieldType.STRING).optional().description("Name of Parameter"),
            fieldWithPath("parameters[].type").type(JsonFieldType.STRING).optional()
                .description("Provided ParameterType of this Parameter"),
            fieldWithPath("parameters[].order").type(JsonFieldType.NUMBER).optional()
                .description("Provided ParameterType of this Parameter"),
            fieldWithPath("parameters[].default_value").type(JsonFieldType.STRING).optional()
                .description("Provided value (as parsable String) of Parameter "),
            fieldWithPath("parameters[].required").type(JsonFieldType.BOOLEAN).optional()
                .description("Parameter required?"),
            fieldWithPath("parameters[].description").type(JsonFieldType.STRING).optional()
                .description("Textual description of this Parameter")
        )
    }

}
