package com.mlreef.rest.api

import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.ProcessorInstanceDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.external_api.gitlab.TokenDetails
import io.mockk.MockKAnnotations
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.time.ZonedDateTime
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Suppress("UsePropertyAccessSyntax")
class ExperimentsApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/data-projects"
    val epfUrl = "/api/v1/epf"

    @BeforeEach
    @Transactional
    fun prepareRepo() {
        MockKAnnotations.init(this, relaxUnitFun = true, relaxed = true)
        mockGitlabPipelineWithBranch("targetBranch")
    }

    @AfterEach
    @Transactional
    fun clearRepo() {
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create new Experiment`() {
        val dataProject = createDataProject()

        val request = ExperimentCreateRequest(
            slug = "experiment-slug-2",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf(FileLocationDto("folder")),
            processing = ProcessorInstanceDto(
                slug = "commons-algorithm",
                parameters = listOf(
                    ParameterInstanceDto("booleanParam", type = "BOOLEAN", value = "true"),
                    ParameterInstanceDto("complexName", type = "COMPLEX", value = "(1.0, 2.0)")
                )
            ),
            postProcessing = listOf(
                ProcessorInstanceDto(
                    slug = "commons-data-visualisation",
                    parameters = listOf(
                        ParameterInstanceDto(
                            "tupleParam",
                            type = "TUPLE",
                            value = "(\"asdf\", 1.0)"
                        ),
                        ParameterInstanceDto(
                            "hashParam",
                            type = "DICTIONARY",
                            value = "{\"key\":\"value\"}"
                        )
                    )
                )
            )
        )

        this.mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/experiments"
        val returnedResult: ExperimentDto = this.performPost(url, token, request)
            .andExpect(status().isOk)
            .document(
                "experiments-create-success",
                requestFields(experimentRequestFields()),
                responseFields(experimentResponseFields())
            )
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create second Experiment with different slug for same project`() {
        val dataProject = createDataProject()
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        createExperiment(
            pipeline,
            "slug1",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf(FileLocationDto("folder")),
            processing = ProcessorInstanceDto(
                slug = "commons-algorithm",
                parameters = listOf(
                    ParameterInstanceDto("booleanParam", type = "BOOLEAN", value = "true"),
                    ParameterInstanceDto("complexName", type = "COMPLEX", value = "(1.0, 2.0)")
                )
            )
        )
        val url = "$rootUrl/${dataProject.id}/experiments"
        val returnedResult: ExperimentDto = performPost(url, token, body = request)
            .andExpect(status().isOk)
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create second Experiment with same slug for different project`() {
        val dataProject1 = createDataProject()
        val dataProject2 = createDataProject()
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject1, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject1
        )

        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf(FileLocationDto("folder")),
            processing = ProcessorInstanceDto(
                slug = "commons-algorithm",
                parameters = listOf(
                    ParameterInstanceDto("booleanParam", type = "BOOLEAN", value = "true"),
                    ParameterInstanceDto("complexName", type = "COMPLEX", value = "(1.0, 2.0)")
                )
            )
        )

        mockUserAuthentication(listOf(dataProject1.id, dataProject2.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject2.id}/experiments"

        val returnedResult: ExperimentDto = this.performPost(url, token, body = request)
            .andExpect(status().isOk)
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create new Experiment with duplicate slug`() {
        val dataProject = createDataProject()
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf(FileLocationDto("folder")),
            processing = ProcessorInstanceDto(
                slug = "commons-algorithm",
                parameters = listOf(
                    ParameterInstanceDto("booleanParam", type = "BOOLEAN", value = "true"),
                    ParameterInstanceDto("complexName", type = "COMPLEX", value = "(1.0, 2.0)")
                )
            )
        )
        val url = "$rootUrl/${dataProject.id}/experiments"
        this.performPost(url, token, request).andExpect(status().isConflict)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Experiments`() {
        val dataProject1 = createDataProject(visibility = VisibilityScope.PRIVATE)
        val dataProject2 = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject1, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)
        val files = arrayListOf(FileLocation.fromPath("folder"))

        createExperiment(
            pipeline,
            "experiment-slug-1",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject1,
            inputFiles = files
        )
        createExperiment(
            pipeline,
            "experiment-slug-2",
            "My second experiment",
            processorInstance = processorInstance,
            dataProject = dataProject1,
            inputFiles = files
        )
        createExperiment(
            pipeline,
            "experiment-slug-3",
            "My third experiment",
            processorInstance = processorInstance,
            dataProject = dataProject2,
            inputFiles = files
        )

        mockUserAuthentication(listOf(dataProject1.id, dataProject2.id), mainAccount, AccessLevel.OWNER)

        val returnedResult: List<ExperimentDto> = performGet("$rootUrl/${dataProject1.id}/experiments", token)
            .andExpect(status().isOk)
            .document(
                "experiments-retrieve-all",
                responseFields(experimentResponseFields("[]."))
                    .and(pipelineInfoDtoResponseFields("[].pipeline_job_info."))
                    .and(dataProcessorInstanceFields("[].post_processing[]."))
                    .and(fileLocationsFields("[].input_files[]."))
                    .and(dataProcessorInstanceFields("[].processing."))
            )
            .returnsList(ExperimentDto::class.java)
        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Experiment`() {
        val dataProject = createDataProject()
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)
        val files = arrayListOf(FileLocation.fromPath("folder"))

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            inputFiles = files,
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        performGet("$rootUrl/${dataProject.id}/experiments/${experiment.id}", token)
            .andExpect(status().isOk)
            .document(
                "experiments-retrieve-one",
                responseFields(experimentResponseFields())
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info."))
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(fileLocationsFields("input_files[]."))
                    .and(dataProcessorInstanceFields("processing."))
            )

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Experiment via number`() {
        val dataProject = createDataProject()
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        performGet("$rootUrl/${dataProject.id}/experiments/${experiment.number}", token).andExpect(status().isOk)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign Experiment of Private DataProject`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject
        )

        mockUserAuthentication(listOf(), mainAccount, AccessLevel.OWNER)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment.id}", token)
            .andExpect(status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve foreign Experiment of Public DataProject`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PUBLIC)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject
        )

        mockUserAuthentication(listOf(), mainAccount, AccessLevel.OWNER)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment.id}", token)
            .andExpect(status().isOk)
    }


    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can finish own Experiment's pipelineJobInfo`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PUBLIC)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            testPipelineJobInfo = createTestPipelineInfo(),
        )

        val beforeRequestTime = Instant.now()
        val secret = experimentsRepository.findByIdOrNull(experiment.id)!!.pipelineJobInfo!!.secret!!

        val tokenDetails = TokenDetails(
            "testusername",
            "test-token",
            randomUUID(),
            randomUUID(),
            projects = mutableMapOf(dataProject.id to AccessLevel.DEVELOPER)
        )

        mockSecurityContextHolder(tokenDetails)

        val returnedResult = this.performEPFPut(secret, "$epfUrl/experiments/${experiment.id}/finish")
            .andExpect(status().isOk)
            .document(
                "experiments-epf-finish",
                responseFields(pipelineInfoDtoResponseFields())
            )
            .returns(PipelineJobInfoDto::class.java)

        assertThat(returnedResult).isNotNull()
        assertThat(returnedResult.finishedAt).isNotNull()
        assertThat(returnedResult.finishedAt).isAfter(beforeRequestTime)
        assertThat(returnedResult.finishedAt).isBefore(Instant.now())
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own Experiment's pipelineJobInfo`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PUBLIC)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            testPipelineJobInfo = createTestPipelineInfo(),
        )

        val beforeRequestTime = ZonedDateTime.now()
        val secret = experimentsRepository.findByIdOrNull(experiment.id)!!.pipelineJobInfo!!.secret!!

        val tokenDetails = TokenDetails(
            "testusername",
            "test-token",
            randomUUID(),
            randomUUID(),
            projects = mutableMapOf(dataProject.id to AccessLevel.DEVELOPER)
        )

        mockSecurityContextHolder(tokenDetails)

        val returnedResult = this.performEPFPut(
            secret,
            "$epfUrl/experiments/${experiment.id}/update",
            FileLocationDto("file")
        )
            .andExpect(status().isOk)
            .document(
                "experiments-epf-update",
                responseFields(pipelineInfoDtoResponseFields())
            )
            .returns(PipelineJobInfoDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's pipelineJobInfo`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            testPipelineJobInfo = createTestPipelineInfo(),
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment.id}/info", token)
            .andExpect(status().isOk)
            .document(
                "experiments-retrieve-one-info",
                responseFields(pipelineInfoDtoResponseFields())
            )
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's pipelineJobInfo via number`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            testPipelineJobInfo = createTestPipelineInfo(),
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        performGet("$rootUrl/${dataProject.id}/experiments/${experiment.number}/info", token).andExpect(status().isOk)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's MLReef file`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val files = arrayListOf(FileLocation.fromPath("folder"))
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            inputFiles = files,
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val result = performGet("$rootUrl/${dataProject.id}/experiments/${experiment.id}/mlreef-file", token)
            .andExpect(status().isOk)
            .document("experiments-retrieve-one-mlreef-file")
            .andReturn()
            .response
            .contentAsString

        assertThat(result).isNotEmpty()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's MLReef file via number`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val files = arrayListOf(FileLocation.fromPath("folder"))
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            inputFiles = files,
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        performGet(
            "$rootUrl/${dataProject.id}/experiments/${experiment.number}/mlreef-file",
            token
        ).andExpect(status().isOk)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can start own Experiment as gitlab pipeline`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)
        val files = arrayListOf(FileLocation.fromPath("folder"))

        mockGitlabBranchExisting(branchName = pipeline.targetBranch, exists = true)
        mockGitlabBranchExisting(branchName = "${pipeline.targetBranch}-1", exists = true)
        mockGitlabBranchExisting(branchName = "${pipeline.targetBranch}-2", exists = true)
        mockGitlabBranchExisting(branchName = "${pipeline.targetBranch}-3", exists = true)
        mockGitlabBranchExisting(branchName = "${pipeline.targetBranch}-4", exists = false)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject,
            inputFiles = files,
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        val pipelineJobInfoDto = performPost("$rootUrl/${dataProject.id}/experiments/${experiment.id}/start", token)
            .andExpect(status().isOk)
            .document("experiments-create-mlreef-file-commit")
            .returns(PipelineJobInfoDto::class.java)

        assertThat(pipelineJobInfoDto.id).isNotNull()
        assertThat(pipelineJobInfoDto.commitSha).isNotNull()
        assertThat(pipelineJobInfoDto.committedAt).isNotNull()
        assertThat(pipelineJobInfoDto.updatedAt).isNull()
        assertThat(pipelineJobInfoDto.finishedAt).isNull()

        val experimentInDb = experimentsRepository.findByIdOrNull(experiment.id)!!
        assertThat(experimentInDb.targetBranch).isEqualTo("${pipeline.targetBranch}-4")
    }

    @Deprecated("See IntegrationTest")
    @Transactional
    @Rollback
    @Test
    @Disabled
    fun `Can manipulate Experiment in the correct Order PENDING - RUNNING - SUCCESS`() {
        val dataProject = createDataProject(visibility = VisibilityScope.PRIVATE)
        val codeProject = createCodeProject()
        val processor = createProcessor(codeProject)
        val processorInstance = createProcessorInstance(processor)
        val pipelineConfig = createPipelineConfiguration(dataProject, "slug1", inputFiles = arrayListOf(), processorInstance = processorInstance)
        val pipeline = createPipeline(pipelineConfig, number = 1)

        val experiment = createExperiment(
            pipeline,
            "experiment-slug",
            "My first experiment",
            processorInstance = processorInstance,
            dataProject = dataProject
        )

        mockUserAuthentication(listOf(dataProject.id), mainAccount, AccessLevel.OWNER)

        mockGitlabPipelineWithBranch(
            targetBranch = experiment.targetBranch
        )
        // Start experiment
        this.performPost("$rootUrl/${dataProject.id}/experiments/${experiment.id}/start", token)
            .andExpect(status().isOk)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment.id}/info", token)
            .andExpect(status().isOk)
            .returns(PipelineJobInfoDto::class.java)

        val secret = experimentsRepository.findByIdOrNull(experiment.id)!!.pipelineJobInfo!!.secret!!

        val update = performEPFPut(secret, "$epfUrl/experiments/${experiment.id}/update", body = Object())
            .returns(PipelineJobInfoDto::class.java)

        assertThat(update).isNotNull()
        val finish = performEPFPut(secret, "$epfUrl/experiments/${experiment.id}/finish")
            .returns(PipelineJobInfoDto::class.java)
        assertThat(finish).isNotNull()
    }


}
