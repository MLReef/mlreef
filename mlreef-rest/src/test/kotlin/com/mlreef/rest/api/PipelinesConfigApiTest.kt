package com.mlreef.rest.api

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
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelinesConfigApiTest : RestApiTest() {

    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization

    val rootUrl = "/api/v1/pipelines"

    @Autowired private lateinit var pipelineConfigRepository: PipelineConfigRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository

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
    @Test fun `Can retrieve all own Pipelines`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        createPipelineConfig(dataProcessorInstance, project.id, "slug1")
        createPipelineConfig(dataProcessorInstance, project.id, "slug2")

        val returnedResult: List<PipelineConfigDto> = this.mockMvc.perform(
            this.acceptContentAuth(get(rootUrl), account))
            .andExpect(status().isOk)
            .andDo(document(
                "pipelineconfig-retrieve-all",
                responseFields(pipelineConfigDtoResponseFields("[]."))
                    .and(dataProcessorInstanceFields("[].data_operations[]."))))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, PipelineConfigDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific PipelineConfig`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        val dataProcessorInstance = createDataProcessorInstance()
        val entity = createPipelineConfig(dataProcessorInstance, project.id, "slug")

        this.mockMvc.perform(
            this.acceptContentAuth(get("$rootUrl/${entity.id}"), account))
            .andExpect(status().isOk)
            .andDo(document(
                "pipelineconfig-retrieve-one",
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))))

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
