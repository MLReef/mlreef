package com.mlreef.rest.integration

import com.mlreef.rest.Account
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.PipelineTestPreparationTrait
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.annotation.Rollback
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelinesConfigIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/pipelines"

    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    private lateinit var account: Account;
    private lateinit var token: String;

    @BeforeEach
    @Transactional
    fun fillRepo() {
        val createdAccount = testsHelper.createRealUser(index = -1)
        account = createdAccount.first
        token = createdAccount.second
        testsHelper.generateProcessorsInDatabase(account.person)
    }

    @AfterEach
    @Transactional
    fun clearRepo() {
        testsHelper.cleanProcessorsInDatabase()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all own Pipelines`() {
        val (project, _) = testsHelper.createRealDataProject(token, account)

        val dataProcessorInstance = createDataProcessorInstance()
        createPipelineConfig(dataProcessorInstance, project.id, "slug1")
        createPipelineConfig(dataProcessorInstance, project.id, "slug2")

        val returnedResult: List<PipelineConfigDto> = this.performGet(rootUrl, token)
            .expectOk()
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific PipelineConfig`() {
        val (project, _) = testsHelper.createRealDataProject(token, account)

        val dataProcessorInstance = createDataProcessorInstance()
        val entity = createPipelineConfig(dataProcessorInstance, project.id, "slug")

        this.performGet("$rootUrl/${entity.id}", token)
            .expectOk()
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
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), testsHelper.dataOp1!!)
        val processorParameter = ProcessorParameter(
            id = randomUUID(), processorVersionId = dataProcessorInstance.dataProcessorId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)
        dataProcessorInstance.addParameterInstances(
            processorParameter, "value")
        processorParameterRepository.save(processorParameter)
        return dataProcessorInstanceRepository.save(dataProcessorInstance)
    }
}
