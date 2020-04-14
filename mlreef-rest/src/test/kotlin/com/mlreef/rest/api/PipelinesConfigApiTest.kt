package com.mlreef.rest.api

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.Person
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineType
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
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject
    val rootUrl = "/api/v1/pipelines"

    @Autowired private lateinit var pipelineConfigRepository: PipelineConfigRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        pipelineTestPreparationTrait.apply()
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
        subject = pipelineTestPreparationTrait.subject
        dataProject = pipelineTestPreparationTrait.dataProject
        dataProject2 = pipelineTestPreparationTrait.dataProject2
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all own Pipelines`() {

        val dataProcessorInstance = createDataProcessorInstance()
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1")
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug2")

        val returnedResult: List<PipelineConfigDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(get(rootUrl)))
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
        val dataProcessorInstance = createDataProcessorInstance()
        val entity = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug")

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${entity.id}")))
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
        return dataProcessorInstanceRepository.save(DataProcessorInstance(randomUUID(), dataOp1))
    }
}
