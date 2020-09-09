package com.mlreef.rest.integration

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.Subject
import com.mlreef.rest.api.PipelineTestPreparationTrait
import com.mlreef.rest.api.v1.PipelineConfigCreateRequest
import com.mlreef.rest.api.v1.PipelineConfigUpdateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineInstanceDto
import com.mlreef.rest.feature.pipeline.GitlabVariables
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ProjectPipelinesConfigIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/data-projects"

    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @Transactional
    fun fillRepo() {
        testsHelper.generateProcessorsInDatabase()
    }

    @AfterEach
    @Transactional
    fun clearRepo() {
        testsHelper.cleanProcessorsInDatabase()
//        testsHelper.cleanUsers()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all Pipelines of own DataProject`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealDataProject(token1, account1)
        val (project2, _) = testsHelper.createRealDataProject(token2, account2)

        val dataProcessorInstance = createDataProcessorInstance()
        createPipelineConfig(dataProcessorInstance, project1.id, "slug1")
        createPipelineConfig(dataProcessorInstance, project1.id, "slug2")
        createPipelineConfig(dataProcessorInstance, project2.id, "slug1")

        val returnedResult: List<PipelineConfigDto> = this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project1.id}/pipelines"), token1))
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
    @Disabled
    // can we please get rid of IntegrationTests which test just the same as ApiTest?
    // we should focus more on testing the components working together
    fun `Can create new PipelineConfig`() {
        val (account, token, _) = testsHelper.createRealUser(index = -1)
        val (project, _) = testsHelper.createRealDataProject(token, account)

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
                DataProcessorInstanceDto("commons-data-operation", listOf(
                    ParameterInstanceDto("stringParam", type = ParameterType.STRING.name, value = "string value"),
                    ParameterInstanceDto("floatParam", type = ParameterType.FLOAT.name, value = "0.01"),
                    ParameterInstanceDto("integerParam", type = ParameterType.INTEGER.name, value = "10"),
                    ParameterInstanceDto("stringList", type = ParameterType.LIST.name, value = "[\"asdf\",\"asdf\",\"asdf\"]")
                )))
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
        val (account, token, _) = testsHelper.createRealUser(userName = "project", password = "password", index = -1)
        val (project, _) = testsHelper.createRealDataProject(token, account)

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
                DataProcessorInstanceDto("commons-data-operation", listOf(
                    ParameterInstanceDto("stringParam", type = ParameterType.STRING.name, value = "string value"),
                    ParameterInstanceDto("floatParam", type = ParameterType.FLOAT.name, value = "0.01"),
                    ParameterInstanceDto("integerParam", type = ParameterType.INTEGER.name, value = "10"),
                    ParameterInstanceDto("stringList", type = ParameterType.LIST.name, value = "[\"asdf\",\"asdf\",\"asdf\"]")
                )))
        )

        val url = "$rootUrl/${project.id}/pipelines/create-start-instance"

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(PipelineInstanceDto::class.java)

        assertThat(result).isNotNull

        val adminGetProjectVariables = restClient.adminGetProjectVariables(project.gitlabId)
        val pushUser = restClient.adminGetProjectVariable(project.gitlabId, GitlabVariables.GIT_PUSH_USER)
        val pushToken = restClient.adminGetProjectVariable(project.gitlabId, GitlabVariables.GIT_PUSH_TOKEN)
        assertThat(adminGetProjectVariables).isNotNull
        assertThat(pushUser).isNotNull
        assertThat(pushToken).isNotNull

    }

    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can update own PipelineConfig`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project, _) = testsHelper.createRealDataProject(token, account)

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
            this.acceptContentAuth(put(url), token)
                .content(objectMapper.writeValueAsString(request)))
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
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (_, _) = testsHelper.createRealDataProject(token1, account1)
        val (project2, _) = testsHelper.createRealDataProject(token2, account2)

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
            this.acceptContentAuth(post(url), token1)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden)
    }

    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific PipelineConfig of own DataProject`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project, _) = testsHelper.createRealDataProject(token, account)

        val dataProcessorInstance = createDataProcessorInstance()
        val entity = createPipelineConfig(dataProcessorInstance, project.id, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project.id}/pipelines/${entity.id}"), token))
            .andExpect(status().isOk)

    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve PipelineConfigs of foreign public DataProject`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (_, _) = testsHelper.createRealDataProject(token1, account1)
        val (project2, _) = testsHelper.createRealDataProject(token2, account2, public = true)

        val dataProcessorInstance = createDataProcessorInstance(account2.person)
        val entity2 = createPipelineConfig(dataProcessorInstance, project2.id, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project2.id}/pipelines/${entity2.id}"), token1))
            .andExpect(status().isOk)

    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve PipelineConfigs of not-own not public but member of DataProject`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)

        val (project, _) = testsHelper.createRealDataProject(token2, account2, public = false)

        testsHelper.addRealUserToProject(project.gitlabId, account1.person.gitlabId!!)

        val dataProcessorInstance = createDataProcessorInstance(owner = account2.person)
        val entity2 = createPipelineConfig(dataProcessorInstance, project.id, "slug")

        this.performGet("$rootUrl/${project.id}/pipelines/${entity2.id}", token1)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve PipelineConfigs of foreign not public DataProject`() {
        val (account1, token1, _) = testsHelper.createRealUser(index = -1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (_, _) = testsHelper.createRealDataProject(token1, account1)
        val (project2, _) = testsHelper.createRealDataProject(token2, account2, public = false)

        val dataProcessorInstance = createDataProcessorInstance()
        val entity2 = createPipelineConfig(dataProcessorInstance, project2.id, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${project2.id}/pipelines/${entity2.id}"), token1))
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

    private fun createDataProcessorInstance(owner: Subject? = null): DataProcessorInstance {
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), testsHelper.dataOp1!!)

        if (owner != null) {
            testsHelper.dataOp1 = testsHelper.adaptProcessorVersion(testsHelper.dataOp1!!, publisher = owner)
        }

        val processorParameter = ProcessorParameter(
            id = randomUUID(), processorVersionId = dataProcessorInstance.processorVersionId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)
        dataProcessorInstance.addParameterInstances(
            processorParameter, "value")
        processorParameterRepository.save(processorParameter)
        return dataProcessorInstanceRepository.save(dataProcessorInstance)
    }
}
