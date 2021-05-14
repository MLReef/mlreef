package com.mlreef.rest.api

import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.utils.RandomUtils
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

class PipelinesApiTest : AbstractRestApiTest() {
    val rootUrl = "/api/v1/pipelines"

    @BeforeEach
    fun prepareRepo() {
        mockGitlabPipelineWithBranch("targetBranch")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all Pipelines of PipelineConfig in own Dataproject`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject()

        val pipelineConfig1 = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipelineConfig2 = createPipelineConfiguration(dataProject, "slug2", inputFiles = arrayListOf(), processorInstance = processorInstance)

        processorInstance.pipelineConfiguration = pipelineConfig1

        processorInstancesRepository.save(processorInstance)

        pipelineRepository.save(pipelineConfig1.createPipeline(1))
        pipelineRepository.save(pipelineConfig1.createPipeline(2))

        this.mockUserAuthentication(listOf(dataProject.id, codeProject.id), mainAccount, AccessLevel.OWNER)

        val returnedResult: List<PipelineDto> =
            this.performGet("$rootUrl/${pipelineConfig1.id}/instances", token)
                .expectOk()
                .document(
                    "pipelineinstance-retrieve-all",
                    responseFields(pipelineDtoResponseFields("[]."))
                        .and(dataProcessorInstanceFields("[].data_operations[]."))
                )
                .returnsList(PipelineDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve pipelines of public data project PipelineConfig`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(visibility = VisibilityScope.PUBLIC)

        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)

        pipelineRepository.save(pipelineConfig.createPipeline(1))
        pipelineRepository.save(pipelineConfig.createPipeline(2))

        this.mockUserAuthentication(forAccount = mainAccount)

        val returnedResult: List<PipelineDto> =
            this.performGet("$rootUrl/${pipelineConfig.id}/instances", token)
                .expectOk()
                .returnsList(PipelineDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve pipelines of private data project PipelineConfig`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)

        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)

        pipelineRepository.save(pipelineConfig.createPipeline(1))
        pipelineRepository.save(pipelineConfig.createPipeline(2))

        this.mockUserAuthentication(forAccount = mainAccount)

        this.performGet("$rootUrl/${pipelineConfig.id}/instances", token)
                .expectForbidden()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create new Pipeline from PipelineConfig in own DataProject`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)

        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)

        this.mockUserAuthentication(listOf(dataProject.id, codeProject.id), mainAccount, AccessLevel.OWNER)

        val pipelineInstanceDto = this.performPost("$rootUrl/${pipelineConfig.id}/instances/", token)
            .expectOk()
            .document(
                "pipelineinstance-create-success",
                responseFields(pipelineDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
            )
            .returns(PipelineDto::class.java)

        assertThat(pipelineInstanceDto).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific Pipeline of public PipelineConfig`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(visibility = VisibilityScope.PUBLIC)

        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        this.mockUserAuthentication(forAccount = mainAccount)

        this.performGet("$rootUrl/${pipelineConfig.id}/instances/${pipeline.id}", token)
            .expectOk()
            .document(
                "pipelineinstance-retrieve-one",
                responseFields(pipelineDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
            )
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update Pipeline of own PipelineConfig`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)

        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        this.mockUserAuthentication(listOf(dataProject.id, codeProject.id), mainAccount, AccessLevel.OWNER)

        this.performPut("$rootUrl/${pipelineConfig.id}/instances/${pipeline.id}/archive", token)
            .expectOk()
            .document(
                "pipelineinstance-update-success",
                responseFields(pipelineDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
            )
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can start specific DataInstance of viewable PipelineConfig`() {
        val dataProject = createDataProject()
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val files = arrayListOf(FileLocation.fromPath("folder"))
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = files, processorInstance = processorInstance)

        val pipeline = createPipeline(pipelineConfig)

        this.mockUserAuthentication(listOf(dataProject.id, codeProject.id), mainAccount, AccessLevel.MAINTAINER)

        val url = "$rootUrl/${pipelineConfig.id}/instances/${pipeline.id}/start"

        this.performPut(url, token)
            .expectOk()
            .document(
                "pipelineinstance-start-success",
                responseFields(pipelineDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info."))
            )
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete Pipeline of viewable PipelineConfig`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        this.mockUserAuthentication(listOf(dataProject.id, codeProject.id), mainAccount, AccessLevel.OWNER)

        this.performDelete("$rootUrl/${pipelineConfig.id}/instances/${pipeline.id}", token)
            .expectNoContent()
            .document("pipelineinstance-delete-success")

        val pipelineInDb = pipelineRepository.findByIdOrNull(pipeline.id)

        assertThat(pipelineInDb).isNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Pipelines`() {
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(name = RandomUtils.generateRandomUserName(10))
        val pipelineConfig1 = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipelineConfig2 = createPipelineConfiguration(dataProject, "slug2", inputFiles = arrayListOf())

        processorInstance.pipelineConfiguration = pipelineConfig1

        processorInstancesRepository.save(processorInstance)

        this.mockUserAuthentication(listOf(dataProject.id, codeProject.id), mainAccount, AccessLevel.OWNER)

        val returnedResult: List<PipelineConfigDto> = this.performGet(rootUrl, token)
            .expectOk()
            .document(
                "pipelineconfig-retrieve-all",
                responseFields(pipelineConfigDtoResponseFields("[]."))
                    .and(dataProcessorInstanceFields("[].data_operations[]."))
            )
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific PipelineConfig`() {
        val codeProject = createCodeProject(name = RandomUtils.generateRandomUserName(10))
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val dataProject = createDataProject(name = RandomUtils.generateRandomUserName(10))
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        processorInstance.pipelineConfiguration = pipelineConfig

        processorInstancesRepository.save(processorInstance)

        this.mockUserAuthentication(listOf(dataProject.id, codeProject.id), mainAccount, AccessLevel.OWNER)

        this.performGet("$rootUrl/${pipelineConfig.id}", token)
            .expectOk()
            .document(
                "pipelineconfig-retrieve-one",
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[]."))
            )
    }
}


