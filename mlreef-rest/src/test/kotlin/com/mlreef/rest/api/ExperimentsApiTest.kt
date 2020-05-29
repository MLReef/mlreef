package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.FileLocationType
import com.mlreef.rest.I18N
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.PipelineJobInfo
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import io.mockk.MockKAnnotations
import io.mockk.every
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
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

///@RunWith(MockitoJUnitRunner::class)
@Suppress("UsePropertyAccessSyntax")
class ExperimentsApiTest : RestApiTest() {

    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject
    val rootUrl = "/api/v1/data-projects"
    val epfUrl = "/api/v1/epf"

    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @AfterEach
    @Transactional
    fun clearRepo() {
        MockKAnnotations.init(this, relaxUnitFun = true, relaxed = true)
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        subject = pipelineTestPreparationTrait.subject
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
        dataProject = pipelineTestPreparationTrait.dataProject
        dataProject2 = pipelineTestPreparationTrait.dataProject2

        mockGitlab("sourceBranch", "targetBranch")
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
        val returnedResult: ExperimentDto = this.performPost(url, account, request)
            .andExpect(status().isOk)
            .document("experiments-create-success",
                requestFields(experimentCreateRequestFields())
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(dataProcessorInstanceFields("processing.")),
                responseFields(experimentDtoResponseFields())
                    .and(experimentPipelineInfoDtoResponseFields("pipeline_job_info."))
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
        createExperiment(dataProject.id, "first-experiment")
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
        val returnedResult: ExperimentDto = performPost(url, account, body = request)
            .andExpect(status().isOk)
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create second Experiment with same slug for different project`() {
        createExperiment(dataProject.id, "experiment-slug")
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

        val returnedResult: ExperimentDto = this.performPost(url, account, body = request)
            .andExpect(status().isOk)
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create new Experiment with duplicate slug`() {

        createExperiment(dataProject.id, "experiment-slug")
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
        this.performPost(url, account, request).andExpect(status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Experiments`() {

        createExperiment(dataProject.id, "experiment-1-slug")
        createExperiment(dataProject.id, "experiment-2-slug")
        createExperiment(dataProject2.id, "experiment-3-slug")

        val returnedResult: List<ExperimentDto> = performGet("$rootUrl/${dataProject.id}/experiments", account)
            .andExpect(status().isOk)
            .document("experiments-retrieve-all",
                responseFields(experimentDtoResponseFields("[]."))
                    .and(experimentPipelineInfoDtoResponseFields("[].pipeline_job_info."))
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
        val experiment1 = createExperiment(dataProject.id)
        performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}", account)
            .andExpect(status().isOk)
            .document("experiments-retrieve-one",
                responseFields(experimentDtoResponseFields())
                    .and(experimentPipelineInfoDtoResponseFields("pipeline_job_info."))
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(fileLocationsFields("input_files[]."))
                    .and(dataProcessorInstanceFields("processing.")))

    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign Experiment`() {
        val experiment1 = createExperiment(dataProject2.id)

        this.performGet("$rootUrl/${dataProject2.id}/experiments/${experiment1.id}", account)
            .andExpect(status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can finish own Experiment's pipelineJobInfo`() {
        val experiment1 = createExperiment(dataProject.id)

        val beforeRequestTime = ZonedDateTime.now()
        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val returnedResult = this.performEPFPut(token, "$epfUrl/experiments/${experiment1.id}/finish")
            .andExpect(status().isOk)
            .document("experiments-epf-finish",
                responseFields(experimentPipelineInfoDtoResponseFields()))
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
    fun `Can retrieve own Experiment's pipelineJobInfo`() {
        val experiment1 = createExperiment(dataProject.id)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/info", account)
            .andExpect(status().isOk)
            .document(
                "experiments-retrieve-one-info",
                responseFields(experimentPipelineInfoDtoResponseFields()))
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Experiment's MLReef file`() {
        val experiment1 = createExperiment(dataProject.id)

        val returnedResult = performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/mlreef-file", account)
            .andExpect(status().isOk)
            .document("experiments-retrieve-one-mlreef-file")
            .andReturn().response.contentAsString

        assertThat(returnedResult).isNotEmpty()
        assertThat(returnedResult).contains("git checkout -b \$TARGET_BRANCH")
    }

    @Transactional
    @Rollback
    @Test
    fun `Can start own Experiment as gitlab pipeline`() {
        val experiment1 = createExperiment(dataProject.id)

        val pipelineJobInfoDto = performPost("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start", account)
            .andExpect(status().isOk)
            .returns(PipelineJobInfoDto::class.java)

        assertThat(pipelineJobInfoDto.id).isNotNull()
        assertThat(pipelineJobInfoDto.commitSha).isNotNull()
        assertThat(pipelineJobInfoDto.committedAt).isNotNull()
        assertThat(pipelineJobInfoDto.updatedAt).isNull()
        assertThat(pipelineJobInfoDto.finishedAt).isNull()
    }

    @Disabled
    @Deprecated("See IntegrationTest")
    @Transactional
    @Rollback
    @Test
    fun `Can manipulate Experiment in the correct Order PENDING - RUNNING - SUCCESS`() {
        val experiment1 = createExperiment(dataProject.id)

        mockGitlab(
            sourceBranch = experiment1.sourceBranch,
            targetBranch = experiment1.targetBranch
        )
        // Start experiment
        this.performPost("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start", account)
            .andExpect(status().isOk)

        this.performGet("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/info", account)
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


    private fun mockGitlab(sourceBranch: String, targetBranch: String) {

        val commit = Commit(id = "12341234")
        val branch = Branch(ref = sourceBranch, branch = targetBranch)
        val gitlabPipeline = GitlabPipeline(
            id = 32452345,
            coverage = "",
            sha = "sha",
            ref = "ref",
            beforeSha = "before_sha",
            user = GitlabUser(id = 1000L),
            status = "CREATED",
            committedAt = I18N.dateTime(),
            createdAt = I18N.dateTime(),
            startedAt = null,
            updatedAt = null,
            finishedAt = null
        )

        every {
            restClient.createBranch(any(), any(), any(), any())
        } returns branch
        every {
            restClient.commitFiles(any(), any(), any(), any(), any(), any())
        } returns commit
        every {
            restClient.createPipeline(any(), any(), any(), any())
        } returns gitlabPipeline
    }

    private fun createExperiment(dataProjectId: UUID, slug: String = "experiment-slug", dataInstanceId: UUID? = null): Experiment {
        val processorInstance = DataProcessorInstance(randomUUID(), dataOp1)
        val processorInstance2 = DataProcessorInstance(randomUUID(), dataOp1)

        val processorParameter = ProcessorParameter(
            id = randomUUID(), dataProcessorId = processorInstance.dataProcessorId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)

        processorInstance.addParameterInstances(processorParameter, "value")
        processorInstance2.addParameterInstances(processorParameter.copy(dataProcessorId = processorInstance2.dataProcessorId), "value")
        processorParameterRepository.save(processorParameter)
        dataProcessorInstanceRepository.save(processorInstance)
        dataProcessorInstanceRepository.save(processorInstance2)
        val experiment1 = Experiment(
            slug = slug,
            name = "Experiment Name",
            dataInstanceId = dataInstanceId,
            id = randomUUID(),
            dataProjectId = dataProjectId,
            sourceBranch = "source",
            targetBranch = "target",
            postProcessing = arrayListOf(processorInstance2),
            pipelineJobInfo = PipelineJobInfo(
                gitlabId = 4,
                createdAt = I18N.dateTime(),
                commitSha = "sha",
                ref = "branch",
                committedAt = I18N.dateTime(),
                secret = "secret"
            ),
            processing = processorInstance,
            inputFiles = listOf(FileLocation(randomUUID(), FileLocationType.PATH, "location1")))

        return experimentRepository.save(experiment1)
    }

    private fun experimentDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("UUID"),
            fieldWithPath(prefix + "data_project_id").type(JsonFieldType.STRING).description("Id of DataProject"),
            fieldWithPath(prefix + "data_instance_id").optional().type(JsonFieldType.STRING).description("Id of DataPipelineInstance"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Local slug scoped to DataProject"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Name of that Experiment"),
            fieldWithPath(prefix + "pipeline_job_info").type(JsonFieldType.OBJECT).optional().description("An optional PipelineInfo describing the pipeline info"),
            fieldWithPath(prefix + "json_blob").type(JsonFieldType.STRING).optional().description("Json object describing experiments epochs statistics"),
            fieldWithPath(prefix + "post_processing").optional().type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath(prefix + "processing").optional().type(JsonFieldType.OBJECT).optional().description("An optional DataAlgorithm"),
            fieldWithPath(prefix + "status").type(JsonFieldType.STRING).description("Status of experiment"),
            fieldWithPath(prefix + "source_branch").type(JsonFieldType.STRING).description("Branch name"),
            fieldWithPath(prefix + "target_branch").type(JsonFieldType.STRING).description("Branch name")
        )
    }

    private fun experimentPipelineInfoDtoResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.NUMBER).optional().description("Json object describing specific metrics"),
            fieldWithPath(prefix + "commit_sha").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
            fieldWithPath(prefix + "ref").type(JsonFieldType.STRING).optional().description("Json object describing specific metrics"),
            fieldWithPath(prefix + "committed_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was committed"),
            fieldWithPath(prefix + "created_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was created"),
            fieldWithPath(prefix + "started_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was started"),
            fieldWithPath(prefix + "updated_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was updated"),
            fieldWithPath(prefix + "finished_at").type(JsonFieldType.STRING).optional().description("Timestamp when the gitlab pipeline was finished")
        )
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
