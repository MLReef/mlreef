package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.FileLocation
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.api.v1.dto.PipelineInstanceDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.delete
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelineInstanceApiTest : AbstractRestApiTest() {

    private lateinit var dataOp1: ProcessorVersion
    private lateinit var dataOp2: ProcessorVersion
    private lateinit var dataOp3: ProcessorVersion
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject
    val rootUrl = "/api/v1/pipelines"

    @Autowired
    private lateinit var pipelineInstanceRepository: PipelineInstanceRepository

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @AfterEach
    fun clearRepo() {
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        token = "test-dummy-token-"
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
        subject = pipelineTestPreparationTrait.subject
        dataProject = pipelineTestPreparationTrait.dataProject
        dataProject2 = pipelineTestPreparationTrait.dataProject2
        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.MAINTAINER)
        mockGitlabPipelineWithBranch("targetBranch")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all DataInstances of viewable PipelineConfig`() {

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1", arrayListOf())
        pipelineInstanceRepository.save(pipelineConfig.createInstance(1))
        pipelineInstanceRepository.save(pipelineConfig.createInstance(2))
        createPipelineConfig(dataProcessorInstance, dataProject.id, "slug2", arrayListOf())

        val returnedResult: List<PipelineInstanceDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${pipelineConfig.id}/instances"), token))
            .andExpect(status().isOk)
            .document("pipelineinstance-retrieve-all",
                responseFields(pipelineInstanceDtoResponseFields("[]."))
                    .and(dataProcessorInstanceFields("[].data_operations[].")))
            .returnsList(PipelineInstanceDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve DataInstances of not-viewable PipelineConfig`() {

        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1", arrayListOf())
        pipelineInstanceRepository.save(pipelineConfig.createInstance(1))
        pipelineInstanceRepository.save(pipelineConfig.createInstance(2))

        val returnedResult: List<PipelineInstanceDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${pipelineConfig.id}/instances"), token))
            .andExpect(status().isOk)
            .returnsList(PipelineInstanceDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create new DataInstance of viewable PipelineConfig`() {
        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1", arrayListOf())

        val pipelineInstanceDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(post("$rootUrl/${pipelineConfig.id}/instances/"), token))
            .andExpect(status().isOk)
            .document("pipelineinstance-create-success",
                responseFields(pipelineInstanceDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[].")))
            .returns(PipelineInstanceDto::class.java)
        assertThat(pipelineInstanceDto).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific DataInstance of viewable PipelineConfig`() {
        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1", arrayListOf())
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${pipelineConfig.id}/instances/${entity.id}"), token))
            .andExpect(status().isOk)
            .document(
                "pipelineinstance-retrieve-one",
                responseFields(pipelineInstanceDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[].")))

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update DataInstance of viewable PipelineConfig`() {
        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1", arrayListOf())
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(put("$rootUrl/${pipelineConfig.id}/instances/${entity.id}/archive"), token))
            .andExpect(status().isOk)
            .document("pipelineinstance-update-success",
                responseFields(pipelineInstanceDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[].")))

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can start specific DataInstance of viewable PipelineConfig`() {
        val dataProcessorInstance = createDataProcessorInstance()
        val files = arrayListOf(FileLocation.fromPath("folder"))
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1", files)
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(put("$rootUrl/${pipelineConfig.id}/instances/${entity.id}/start"), token))
            .andExpect(status().isOk)
            .document("pipelineinstance-start-success",
                responseFields(pipelineInstanceDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info.")))

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete DataInstance of viewable PipelineConfig`() {
        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, dataProject.id, "slug1", arrayListOf())
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(delete("$rootUrl/${pipelineConfig.id}/instances/${entity.id}"), token))
            .andExpect(status().isOk)
            .document("pipelineinstance-delete-success")

    }


    private fun createPipelineConfig(dataProcessorInstance: DataProcessorInstance, dataProjectId: UUID, slug: String, inputFiles: MutableList<FileLocation>): PipelineConfig {
        val entity = PipelineConfig(
            id = randomUUID(),
            pipelineType = PipelineType.DATA,
            slug = slug, name = "name",
            dataProjectId = dataProjectId,
            sourceBranch = "sourceBranch",
            targetBranchPattern = "targetBranch",
            dataOperations = arrayListOf(dataProcessorInstance),
            inputFiles = inputFiles)
        pipelineConfigRepository.save(entity)
        return entity
    }

    private fun createDataProcessorInstance(): DataProcessorInstance {
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), dataOp1)
        val processorParameter = ProcessorParameter(
            id = randomUUID(), processorVersionId = dataProcessorInstance.dataProcessorId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)
        dataProcessorInstance.addParameterInstances(processorParameter, "value")
        processorParameterRepository.save(processorParameter)
        return dataProcessorInstanceRepository.save(dataProcessorInstance)
    }
}


