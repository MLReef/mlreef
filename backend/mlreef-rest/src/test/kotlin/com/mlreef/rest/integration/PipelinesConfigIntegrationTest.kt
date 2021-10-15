package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.PipelineConfigCreateRequest
import com.mlreef.rest.api.v1.PipelineConfigUpdateRequest
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineDto
import com.mlreef.rest.api.v1.dto.ProcessorInstanceDto
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.feature.pipeline.GIT_PUSH_TOKEN
import com.mlreef.rest.feature.pipeline.GIT_PUSH_USER
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import javax.transaction.Transactional

class PipelinesConfigIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/data-projects"

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all Pipelines of own DataProject`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)
        val (project1, _) = createRealDataProject(token1, account1)
        val (project2, _) = createRealDataProject(token2, account2)

        val dataProcessorInstance = createTestProcessorInstance()
        createTestPipelineConfig(dataProcessorInstance, project1, "slug1")
        createTestPipelineConfig(dataProcessorInstance, project1, "slug2")
        createTestPipelineConfig(dataProcessorInstance, project2, "slug1")

        val returnedResult: List<PipelineConfigDto> = this.performGet("$rootUrl/${project1.id}/pipelines", token1)
            .expectOk()
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Disabled
    // can we please get rid of IntegrationTests which test just the same as ApiTest?
    // we should focus more on testing the components working together
    fun `Can create new PipelineConfig`() {
        val (account, token, _) = createRealUser(index = -1)
        val (project, _) = createRealDataProject(token, account)

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

        val url = "$rootUrl/${project.id}/pipelines"

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(PipelineConfigDto::class.java)

        assertThat(result).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create new PipelineConfig via create-start-instance`() {
        val (account, token, _) = createRealUser(userName = "project", password = "password", index = -1)
        val (project, _) = createRealDataProject(token, account)

        val request = PipelineConfigCreateRequest(
            sourceBranch = "master",
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

        val url = "$rootUrl/${project.id}/pipelines/create-start-instance"

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(PipelineDto::class.java)

        assertThat(result).isNotNull

        val adminGetProjectVariables = restClient.adminGetProjectVariables(project.gitlabId)
        val pushUser = restClient.adminGetProjectVariable(project.gitlabId, GIT_PUSH_USER)
        val pushToken = restClient.adminGetProjectVariable(project.gitlabId, GIT_PUSH_TOKEN)
        assertThat(adminGetProjectVariables).isNotNull
        assertThat(pushUser).isNotNull
        assertThat(pushToken).isNotNull

    }

    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can update own PipelineConfig`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

        val dataProcessorInstance = createTestProcessorInstance()
        val pipelineConfig = createTestPipelineConfig(dataProcessorInstance, project, "slug1")

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

        val url = "$rootUrl/${project.id}/pipelines/${pipelineConfig.id}"

        val returnedResult: PipelineConfigDto = this.mockMvc.perform(
            this.acceptContentAuth(put(url), token)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PipelineConfigDto::class.java)
            }

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create new PipelineConfig in not-own DataProject`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)
        val (_, _) = createRealDataProject(token1, account1)
        val (project2, _) = createRealDataProject(token2, account2)

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
        val url = "$rootUrl/${project2.id}/pipelines"
        this.mockMvc.perform(
            this.acceptContentAuth(post(url), token1)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isForbidden)
    }

    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific PipelineConfig of own DataProject`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

        val dataProcessorInstance = createTestProcessorInstance()
        val entity = createTestPipelineConfig(dataProcessorInstance, project, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project.id}/pipelines/${entity.id}"), token)
        )
            .andExpect(status().isOk)

    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve PipelineConfigs of foreign public DataProject`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)
        val (_, _) = createRealDataProject(token1, account1)
        val (project2, _) = createRealDataProject(token2, account2, public = true)

        val dataProcessorInstance = createTestProcessorInstance()
        val entity2 = createTestPipelineConfig(dataProcessorInstance, project2, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project2.id}/pipelines/${entity2.id}"), token1)
        )
            .andExpect(status().isOk)

    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve PipelineConfigs of not-own not public but member of DataProject`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)

        val (project, _) = createRealDataProject(token2, account2, public = false)

        addRealUserToProject(project.gitlabId, account1.gitlabId!!)

        val dataProcessorInstance = createTestProcessorInstance()
        val entity2 = createTestPipelineConfig(dataProcessorInstance, project, "slug")

        this.performGet("$rootUrl/${project.id}/pipelines/${entity2.id}", token1)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve PipelineConfigs of foreign not public DataProject`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)
        val (_, _) = createRealDataProject(token1, account1)
        val (project2, _) = createRealDataProject(token2, account2, public = false)

        val dataProcessorInstance = createTestProcessorInstance()
        val entity2 = createTestPipelineConfig(dataProcessorInstance, project2, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project2.id}/pipelines/${entity2.id}"), token1)
        )
            .andExpect(status().isForbidden)

    }


    private fun createTestPipelineConfig(
        processorInstance: ProcessorInstance,
        dataProject: DataProject? = null,
        slug: String? = null
    ): PipelineConfiguration {
        return createPipelineConfiguration(
            dataProject ?: createDataProject(),
            slug ?: UUID.randomUUID().toString(),
            processorInstance = processorInstance,
        )
    }

    private fun createTestProcessorInstance(codeProject: CodeProject? = null): ProcessorInstance {
        val processor = createProcessor(
            codeProject ?: createCodeProject()
        )

        val processorParameter = createParameter(
            processor,
            name = "param1",
            parameterType = stringParamType,
            defaultValue = "default",
            order = 1,
            required = true
        )

        return createProcessorInstance(processor)
    }
}
