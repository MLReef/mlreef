package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.ProcessorInstance
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import java.util.UUID
import javax.transaction.Transactional

class PipelinesIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/pipelines"

    private lateinit var account: Account;
    private lateinit var token: String;

    private lateinit var codeProject1: CodeProject
    private lateinit var codeProject2: CodeProject
    private lateinit var codeProject3: CodeProject

    private lateinit var processor1: Processor
    private lateinit var processor2: Processor
    private lateinit var processor3: Processor

    @BeforeEach
    @Transactional
    @Rollback
    fun fillRepo() {
        val createdAccount = createRealUser()
        account = createdAccount.first
        token = createdAccount.second

        codeProject1 = createCodeProject(
            name = "Pipeline config test operation code project",
            processorType = operationProcessorType
        )
        codeProject2 = createCodeProject(
            name = "Pipeline config test algorithm code project",
            processorType = algorithmProcessorType
        )
        codeProject3 = createCodeProject(
            name = "Pipeline config test visualization code project",
            processorType = visualizationProcessorType
        )

        processor1 = createProcessor(codeProject1, name = "Processor 1", branch = "master", version = "1")
        processor2 = createProcessor(codeProject1, name = "Processor 2", branch = "master", version = "2")
        processor3 = createProcessor(codeProject2, name = "Processor 3", branch = "master", version = "1")

        createParameter(processor1, "param1_1", stringParamType, order = 1)
        createParameter(processor1, "param2_1", integerParamType, order = 2)
        createParameter(processor1, "param3_1", booleanParamType, order = 3)
        createParameter(processor2, "param1_2", dictionaryParamType, order = 1)
        createParameter(processor3, "param1_3", objectParamType, order = 1)
        createParameter(processor3, "param2_3", floatParamType, order = 2)

//        testsHelper.generateProcessorsInDatabase(account.person)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all own Pipelines`() {
        val (project, _) = createRealDataProject(token, account)

        val dataProcessorInstance = createDataProcessorInstance(processor2)
        createPipelineConfig(dataProcessorInstance, project, "slug1")
        createPipelineConfig(dataProcessorInstance, project, "slug2")

        val returnedResult: List<PipelineConfigDto> = this.performGet(rootUrl, token)
            .expectOk()
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific PipelineConfig`() {
        val (project, _) = createRealDataProject(token, account)

        val dataProcessorInstance = createDataProcessorInstance(processor1)
        val entity = createPipelineConfig(dataProcessorInstance, project, "slug")

        this.performGet("$rootUrl/${entity.id}", token)
            .expectOk()
    }

    /**
     * Only IntegrationTest with actual benefit, as it will test creating pipelines in gitlab
     */
    @Transactional
    @Rollback
    @Test
    fun `Can start specific Pipeline of viewable PipelineConfig`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

        val fileList = arrayListOf(FileLocation.fromPath("folder"))
        val dataProcessorInstance = createDataProcessorInstance(processor1)
        val pipelineConfig = createPipelineConfig(dataProcessorInstance, project, "slug1", fileList)
        val pipeline = createPipeline(pipelineConfig, mainPerson)

        this.performPut("$rootUrl/${pipelineConfig.id}/instances/${pipeline.id}/start", token)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot start specific Pipeline with invalid source branch`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

        val fileList = arrayListOf(FileLocation.fromPath("folder"))
        val dataProcessorInstance = createDataProcessorInstance(processor1)
        val pipelineConfig =
            createPipelineConfig(dataProcessorInstance, project, "slug1", fileList, sourceBranch = "not-existing")

        this.performPut("$rootUrl/${pipelineConfig.id}/instances/${dataProcessorInstance.id}/start", token)
            .expect4xx()
    }

    private fun createPipelineConfig(
        processorInstance: ProcessorInstance?,
        dataProject: DataProject,
        slug: String,
        inputFiles: List<FileLocation>? = null,
        sourceBranch: String = "master",
        targetBranchPattern: String = "target",
    ): PipelineConfiguration {
        return createPipelineConfiguration(
            dataProject,
            slug,
            name = "Configuration for project ${dataProject.name}",
            processorInstance = processorInstance,
            inputFiles = inputFiles,
            sourceBranch = sourceBranch,
            targetBranchPattern = targetBranchPattern,
        )
    }

    private fun createDataProcessorInstance(
        processor: Processor,
        config: PipelineConfiguration? = null
    ): ProcessorInstance {
        val instance = createProcessorInstance(
            processor,
            config,
            name = "Processor instance for processor ${processor.name}",
        )

        val parameters = processor.parameters.forEach {
            createParameterInstance(it, instance, UUID.randomUUID().toString())
        }

        return processorInstancesRepository.save(instance)
    }
}
