package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataProject
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.external_api.gitlab.TokenDetails
import io.mockk.MockKAnnotations
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Suppress("UsePropertyAccessSyntax")
class ExperimentsApiTest : AbstractRestApiTest() {

    private lateinit var dataOp1: ProcessorVersion
    private lateinit var dataOp2: ProcessorVersion
    private lateinit var dataOp3: ProcessorVersion
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject
    val rootUrl = "/api/v1/data-projects"
    val epfUrl = "/api/v1/epf"

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @AfterEach
    @Transactional
    fun clearRepo() {
        MockKAnnotations.init(this, relaxUnitFun = true, relaxed = true)
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        token = pipelineTestPreparationTrait.token
        subject = pipelineTestPreparationTrait.subject
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
        dataProject = pipelineTestPreparationTrait.dataProject
        dataProject2 = pipelineTestPreparationTrait.dataProject2

        mockGitlabPipelineWithBranch("targetBranch")
        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create new Experiment`() {
        val request = ExperimentCreateRequest(
            slug = "experiment-slug-2",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf("folder"),
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            )),
            postProcessing = listOf(
                DataProcessorInstanceDto("commons-data-visualisation", listOf(
                    ParameterInstanceDto("tupleParam", type = ParameterType.TUPLE.name, value = "(\"asdf\", 1.0)"),
                    ParameterInstanceDto("hashParam", type = ParameterType.DICTIONARY.name, value = "{\"key\":\"value\"}")
                ))))

        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject.id}/experiments"
        val returnedResult: ExperimentDto = this.performPost(url, token, request)
            .andExpect(status().isOk)
            .document("experiments-create-success",
                requestFields(experimentCreateRequestFields())
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(dataProcessorInstanceFields("processing.")),
                responseFields(experimentDtoResponseFields())
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info."))
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(dataProcessorInstanceFields("processing."))
                    .and(fileLocationsFields("input_files[]."))
            )
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create second Experiment with different slug for same project`() {
        createExperiment(dataProject.id, dataOp1, "first-experiment")
        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf("folder"),
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            ))
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
        createExperiment(dataProject.id, dataOp1, "experiment-slug")
        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf("folder"),
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            ))
        )

        this.mockGetUserProjectsList(listOf(dataProject.id, dataProject2.id), account, AccessLevel.OWNER)

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

        createExperiment(dataProject.id, dataOp1, "experiment-slug")
        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf("folder"),
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            ))
        )
        val url = "$rootUrl/${dataProject.id}/experiments"
        this.performPost(url, token, request).andExpect(status().isConflict)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Experiments`() {

        createExperiment(dataProject.id, dataOp1, "experiment-1-slug")
        createExperiment(dataProject.id, dataOp1, "experiment-2-slug")
        createExperiment(dataProject2.id, dataOp1, "experiment-3-slug")

        val returnedResult: List<ExperimentDto> = performGet("$rootUrl/${dataProject.id}/experiments", token)
            .andExpect(status().isOk)
            .document("experiments-retrieve-all",
                responseFields(experimentDtoResponseFields("[]."))
                    .and(pipelineInfoDtoResponseFields("[].pipeline_job_info."))
                    .and(dataProcessorInstanceFields("[].post_processing[]."))
                    .and(fileLocationsFields("[].input_files[]."))
                    .and(dataProcessorInstanceFields("[].processing.")))
            .returnsList(ExperimentDto::class.java)
        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Experiment`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)
        performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}", token)
            .andExpect(status().isOk)
            .document("experiments-retrieve-one",
                responseFields(experimentDtoResponseFields())
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info."))
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(fileLocationsFields("input_files[]."))
                    .and(dataProcessorInstanceFields("processing.")))

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Experiment via number`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)
        performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.number}", token).andExpect(status().isOk)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign Experiment`() {
        val experiment1 = createExperiment(dataProject2.id, dataOp1)

        this.performGet("$rootUrl/${dataProject2.id}/experiments/${experiment1.id}", token)
            .andExpect(status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can finish own Experiment's pipelineJobInfo`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)

        val beforeRequestTime = ZonedDateTime.now()
        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val tokenDetails = TokenDetails(
            "testusername",
            "test-token",
            randomUUID(),
            randomUUID(),
            projects = mutableMapOf(dataProject.id to AccessLevel.DEVELOPER)
        )

        mockSecurityContextHolder(tokenDetails)

        val returnedResult = this.performEPFPut(token, "$epfUrl/experiments/${experiment1.id}/finish")
            .andExpect(status().isOk)
            .document("experiments-epf-finish",
                responseFields(pipelineInfoDtoResponseFields()))
            .returns(PipelineJobInfoDto::class.java)

        assertThat(returnedResult).isNotNull()
        assertThat(returnedResult.finishedAt).isNotNull()
        assertThat(returnedResult.finishedAt).isAfter(beforeRequestTime)
        assertThat(returnedResult.finishedAt).isBefore(ZonedDateTime.now())
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own Experiment's pipelineJobInfo`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)

        val beforeRequestTime = ZonedDateTime.now()
        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val tokenDetails = TokenDetails(
            "testusername",
            "test-token",
            randomUUID(),
            randomUUID(),
            projects = mutableMapOf(dataProject.id to AccessLevel.DEVELOPER)
        )

        mockSecurityContextHolder(tokenDetails)

        val returnedResult = this.performEPFPut(token,
            "$epfUrl/experiments/${experiment1.id}/update",
            FileLocationDto("file"))
            .andExpect(status().isOk)
            .document("experiments-epf-update",
                responseFields(pipelineInfoDtoResponseFields()))
            .returns(PipelineJobInfoDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's pipelineJobInfo`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/info", token)
            .andExpect(status().isOk)
            .document(
                "experiments-retrieve-one-info",
                responseFields(pipelineInfoDtoResponseFields()))
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's pipelineJobInfo via number`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)
        performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.number}/info", token).andExpect(status().isOk)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's MLReef file`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)

        val result = performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/mlreef-file", token)
            .andExpect(status().isOk)
            .document("experiments-retrieve-one-mlreef-file")
            .andReturn()
            .response
            .contentAsString

        assertThat(result).isNotEmpty()
        assertThat(result).contains("image: registry.gitlab.com/mlreef/mlreef/epf:")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's MLReef file via number`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)
        performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.number}/mlreef-file", token).andExpect(status().isOk)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can start own Experiment as gitlab pipeline`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)

        val pipelineJobInfoDto = performPost("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start", token)
            .andExpect(status().isOk)
            .document("experiments-create-mlreef-file-commit")
            .returns(PipelineJobInfoDto::class.java)

        assertThat(pipelineJobInfoDto.id).isNotNull()
        assertThat(pipelineJobInfoDto.commitSha).isNotNull()
        assertThat(pipelineJobInfoDto.committedAt).isNotNull()
        assertThat(pipelineJobInfoDto.updatedAt).isNull()
        assertThat(pipelineJobInfoDto.finishedAt).isNull()
    }

    @Deprecated("See IntegrationTest")
    @Transactional
    @Rollback
    @Test
    @Disabled
    fun `Can manipulate Experiment in the correct Order PENDING - RUNNING - SUCCESS`() {
        val experiment1 = createExperiment(dataProject.id, dataOp1)

        mockGitlabPipelineWithBranch(
            targetBranch = experiment1.targetBranch
        )
        // Start experiment
        this.performPost("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start", token)
            .andExpect(status().isOk)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/info", token)
            .andExpect(status().isOk)
            .returns(PipelineJobInfoDto::class.java)

        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val update = performEPFPut(token, "$epfUrl/experiments/${experiment1.id}/update", body = Object())
            .returns(PipelineJobInfoDto::class.java)

        assertThat(update).isNotNull()
        val finish = performEPFPut(token, "$epfUrl/experiments/${experiment1.id}/finish")
            .returns(PipelineJobInfoDto::class.java)
        assertThat(finish).isNotNull()
    }

    private fun experimentCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("data_instance_id").optional().type(JsonFieldType.STRING).description("An optional UUID of a optional DataInstance. Check that it matches the source_branch"),
            fieldWithPath("slug").type(JsonFieldType.STRING).description("A slug which is unique scoped to this DataProject"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("A name for that Experiment. I does not have to be unique, but it should be."),
            fieldWithPath("input_files").type(JsonFieldType.ARRAY).description("List of input files (folders) for processing"),
            fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
            fieldWithPath("target_branch").type(JsonFieldType.STRING).description("Branch name for destination"),
            fieldWithPath("post_processing").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath("processing").type(JsonFieldType.OBJECT).optional().description("An optional DataAlgorithm")
        )
    }
}
