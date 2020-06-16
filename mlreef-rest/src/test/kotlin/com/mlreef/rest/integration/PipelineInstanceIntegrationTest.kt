package com.mlreef.rest.integration

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.ParameterType
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.AbstractRestApiTest
import com.mlreef.rest.api.PipelineTestPreparationTrait
import com.mlreef.rest.api.v1.dto.PipelineInstanceDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.delete
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Disabled
class PipelineInstanceApiTest : AbstractRestApiTest() {

    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization

    val rootUrl = "/api/v1/pipelines"

    @Autowired private lateinit var pipelineConfigRepository: PipelineConfigRepository
    @Autowired private lateinit var pipelineInstanceRepository: PipelineInstanceRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository
    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @Autowired
    private lateinit var integrationTestsHelper: IntegrationTestsHelper

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
    @Test fun `Can retrieve all DataInstances of viewable PipelineConfig`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1")
        pipelineInstanceRepository.save(pipelineConfig.createInstance(1))
        pipelineInstanceRepository.save(pipelineConfig.createInstance(2))
        createPipelineConfig(dataProcessorInstance, project.id, "slug2")

        val returnedResult: List<PipelineInstanceDto> = this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${pipelineConfig.id}/instances"), account))
            .andExpect(status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, PipelineInstanceDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve DataInstances of not-viewable PipelineConfig`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1")
        pipelineInstanceRepository.save(pipelineConfig.createInstance(1))
        pipelineInstanceRepository.save(pipelineConfig.createInstance(2))

        val returnedResult: List<PipelineInstanceDto> = this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${pipelineConfig.id}/instances"), account))
            .andExpect(status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, PipelineInstanceDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can create new DataInstance of viewable PipelineConfig`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1")

        val pipelineInstanceDto = this.mockMvc.perform(
            this.acceptContentAuth(post("$rootUrl/${pipelineConfig.id}/instances/"), account))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PipelineInstanceDto::class.java)
            }
        assertThat(pipelineInstanceDto).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific DataInstance of viewable PipelineConfig`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1")
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${pipelineConfig.id}/instances/${entity.id}"), account))
            .andExpect(status().isOk)

    }

    @Transactional
    @Rollback
    @Disabled
    @Test fun `Can update specific DataInstance of viewable PipelineConfig`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1")
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.mockMvc.perform(
            this.acceptContentAuth(put("$rootUrl/${pipelineConfig.id}/instances/${entity.id}/archive"), account))
            .andExpect(status().isOk)

    }

    @Transactional
    @Rollback
    @Test fun `Can delete specific DataInstance of viewable PipelineConfig`() {
        val (account, _, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1")
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.mockMvc.perform(
            this.acceptContentAuth(delete("$rootUrl/${pipelineConfig.id}/instances/${entity.id}"), account))
            .andExpect(status().isOk)
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
