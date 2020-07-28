package com.mlreef.rest.integration

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.ParameterType
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.api.PipelineTestPreparationTrait
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.annotation.Rollback
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelineInstanceIntegrationTest : AbstractIntegrationTest() {

    private lateinit var dataOp1: ProcessorVersion
    private lateinit var dataOp2: ProcessorVersion
    private lateinit var dataOp3: ProcessorVersion

    val rootUrl = "/api/v1/pipelines"

    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var pipelineInstanceRepository: PipelineInstanceRepository

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

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

    /**
     * Only IntegrationTest with actual benefit, as it will test creating pipelines in gitlab
     */
    @Transactional
    @Rollback
    @Test
    fun `Can start specific DataInstance of viewable PipelineConfig`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(token, account)

        val fileList = arrayListOf(FileLocation.fromPath("folder"))
        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1", fileList)
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.performPut("$rootUrl/${pipelineConfig.id}/instances/${entity.id}/start", token)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot start specific DataInstance with invalid source branch`() {
        val (account, token, _) = integrationTestsHelper.createRealUser()
        val (project, _) = integrationTestsHelper.createRealDataProject(token, account)

        val fileList = arrayListOf(FileLocation.fromPath("folder"))
        val dataProcessorInstance = createDataProcessorInstance()
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project.id, "slug1", fileList, sourceBranch = "not-existing")
        val entity = pipelineConfig.createInstance(1)

        pipelineInstanceRepository.save(entity)

        this.performPut("$rootUrl/${pipelineConfig.id}/instances/${entity.id}/start", token)
            .expect4xx()
    }

    private fun createPipelineConfig(
        dataProcessorInstance: DataProcessorInstance,
        dataProjectId: UUID,
        slug: String,
        inputFiles: List<FileLocation>,
        sourceBranch: String = "master",
        targetBranchPattern: String = "target"
    ): PipelineConfig {
        val entity = PipelineConfig(
            id = randomUUID(),
            pipelineType = PipelineType.DATA,
            slug = slug,
            name = "name",
            dataProjectId = dataProjectId,
            sourceBranch = sourceBranch,
            targetBranchPattern = targetBranchPattern,
            dataOperations = arrayListOf(dataProcessorInstance),
            inputFiles = inputFiles.toMutableList())

        pipelineConfigRepository.save(entity)
        return entity
    }

    private fun createDataProcessorInstance(): DataProcessorInstance {
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), dataOp1)
        val processorParameter = ProcessorParameter(
            id = randomUUID(),
            processorVersionId = dataProcessorInstance.dataProcessorId,
            name = "param1",
            type = ParameterType.STRING,
            defaultValue = "default",
            description = "not empty",
            order = 1,
            required = true)
        dataProcessorInstance.addParameterInstances(
            processorParameter, "value")
        processorParameterRepository.save(processorParameter)
        return dataProcessorInstanceRepository.save(dataProcessorInstance)
    }
}
