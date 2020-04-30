package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
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
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import io.mockk.MockKAnnotations
import io.mockk.every
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

///@RunWith(MockitoJUnitRunner::class)
@Suppress("UsePropertyAccessSyntax") class ExperimentsApiTest : RestApiTest() {

    private lateinit var account: Account
    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization
    private lateinit var subject: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject
    val rootUrl = "/api/v1/data-projects"
    val epfUrl = "/api/v1/epf"

    //    @Autowired private lateinit var subjectRepository: SubjectRepository
//    @Autowired private lateinit var dataProjectRepository: DataProjectRepository
//    @Autowired private lateinit var pipelineConfigRepository: PipelineConfigRepository
//    @Autowired private lateinit var pipelineInstanceRepository: PipelineInstanceRepository
//    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository
//
    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository
//    @Autowired private lateinit var parameterInstanceRepository: ParameterInstanceRepository

    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @AfterEach
    @Transactional
    fun clearRepo() {
//        MockitoAnnotations.initMocks(this)
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
    }

    @Transactional
    @Rollback
    @Test fun `Can create new Experiment`() {
        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            )),
            postProcessing = listOf(
                DataProcessorInstanceDto("commons-data-visualisation", listOf(
                    ParameterInstanceDto("tupleParam", type = ParameterType.TUPLE.name, value = "(\"asdf\", 1.0)"),
                    ParameterInstanceDto("hashParam", type = ParameterType.DICTIONARY.name, value = "{\"key\":\"value\"}")
                ))))
        val url = "$rootUrl/${dataProject.id}/experiments"
        val returnedResult: ExperimentDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(post(url))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andDo(document(
                "experiments-create-success",
                requestFields(experimentCreateRequestFields())
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(dataProcessorInstanceFields("processing.")),
                responseFields(experimentDtoResponseFields())
                    .and(experimentPipelineInfoDtoResponseFields("pipeline_job_info."))
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(dataProcessorInstanceFields("processing."))
            ))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, ExperimentDto::class.java)
            }

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can create second Experiment with different slug for same project`() {
        createExperiment(dataProject.id, "first-experiment")
        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            ))
        )
        val url = "$rootUrl/${dataProject.id}/experiments"
        val returnedResult: ExperimentDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(post(url))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, ExperimentDto::class.java)
            }

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can create second Experiment with same slug for different project`() {
        createExperiment(dataProject2.id, "experiment-slug")
        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            ))
        )
        val url = "$rootUrl/${dataProject.id}/experiments"
        val returnedResult: ExperimentDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(post(url))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, ExperimentDto::class.java)
            }

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Cannot create new Experiment with duplicate slug`() {

        createExperiment(dataProject.id, "experiment-slug")
        val request = ExperimentCreateRequest(
            slug = "experiment-slug",
            name = "Experiment Name",
            dataInstanceId = null,
            sourceBranch = "source",
            targetBranch = "target",
            processing = DataProcessorInstanceDto("commons-algorithm", listOf(
                ParameterInstanceDto("booleanParam", type = ParameterType.BOOLEAN.name, value = "true"),
                ParameterInstanceDto("complexName", type = ParameterType.COMPLEX.name, value = "(1.0, 2.0)")
            ))
        )
        val url = "$rootUrl/${dataProject.id}/experiments"
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(post(url))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest)

    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all own Experiments`() {

        createExperiment(dataProject.id, "experiment-1-slug")
        createExperiment(dataProject.id, "experiment-2-slug")
        createExperiment(dataProject2.id, "experiment-3-slug")

        val returnedResult: List<ExperimentDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments")))
            .andExpect(status().isOk)
            .andDo(document(
                "experiments-retrieve-all",
                responseFields(experimentDtoResponseFields("[]."))
                    .and(experimentPipelineInfoDtoResponseFields("[].pipeline_job_info."))
                    .and(dataProcessorInstanceFields("[].post_processing[]."))
                    .and(dataProcessorInstanceFields("[].processing."))))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, ExperimentDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own Experiment`() {
        val experiment1 = createExperiment(dataProject.id)
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments/${experiment1.id}")))
            .andExpect(status().isOk)
            .andDo(document(
                "experiments-retrieve-one",
                responseFields(experimentDtoResponseFields())
                    .and(experimentPipelineInfoDtoResponseFields("pipeline_job_info."))
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(dataProcessorInstanceFields("processing."))))

    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve foreign Experiment`() {
        val experiment1 = createExperiment(dataProject.id)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject2.id}/experiments/${experiment1.id}")))
            .andExpect(status().isNotFound)
    }

//    @Transactional

//        val experiment1 = createExperiment(dataProject.id)
//    @Test fun `Cannot manipulate Experiment in the wrong Order PENDING - SUCCESS - SUCCESS `() {
//    @Rollback
//    @Transactional
//    @Rollback
//    @Test fun `Can update own Experiment's pipelineJobInfo with arbitrary json hashmap blob`() {
//        val experiment1 = createExperiment(dataProject.id)
//
//        val request: String = "" +
//            """{"metric1": 20.0, "metrik2": 3, "string":"yes"}"""
//
//        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret
//
//        val returnedResult = this.mockMvc.perform(
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/update"))                .content(request))
//            .andExpect(status().isOk)
//            .andDo(document(
//                "experiments-epf-update",
//                responseFields(experimentPipelineInfoDtoResponseFields())))
//            .andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//
//        assertThat(returnedResult).isNotNull()
//    }
//
//    @Transactional
//    @Rollback
//    @Test fun `Can finish own Experiment's pipelineJobInfo`() {
//        val experiment1 = createExperiment(dataProject.id)
//
//        val beforeRequestTime = ZonedDateTime.now()
//        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret
//
//        val returnedResult = this.mockMvc.perform(
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/finish")))
//            .andExpect(status().isOk)
//            .andDo(document(
//                "experiments-epf-finish",
//                responseFields(experimentPipelineInfoDtoResponseFields())))
//            .andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//
//        assertThat(returnedResult).isNotNull()
//        assertThat(returnedResult.finishedAt).isNotNull()
//        assertThat(returnedResult.finishedAt).isAfter(beforeRequestTime)
//        assertThat(returnedResult.finishedAt).isBefore(ZonedDateTime.now())
//    }
//
//    @Transactional
//    @Rollback
//    @Test fun `Can retrieve own Experiment's pipelineJobInfo`() {
//        val experiment1 = createExperiment(dataProject.id)
//
//        this.mockMvc.perform(
//            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/metrics")))
//            .andExpect(status().isOk)
//            .andDo(document(
//                "experiments-retrieve-one-metrics",
//                responseFields(experimentPipelineInfoDtoResponseFields())))
//
//    }
//
//    @Transactional
//    @Rollback
//    @Test fun `Can retrieve own Experiment's MLReef file`() {
//        val experiment1 = createExperiment(dataProject.id)
//
//        val returnedResult = this.mockMvc.perform(
//            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/mlreef-file")))
//            .andExpect(status().isOk)
//            .andDo(document("experiments-retrieve-one-mlreef-file"))
//            .andReturn().response.contentAsString
//
//        assertThat(returnedResult).isNotEmpty()
//        assertThat(returnedResult).contains("git checkout -b target")
//    }
//
//    @Transactional
//    @Rollback
//    @Test fun `Can start own Experiment as gitlab pipeline`() {
//        val experiment1 = createExperiment(dataProject.id)
//
//        val pipelineJobInfoDto = this.mockMvc.perform(
//            this.defaultAcceptContentAuth(post("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start")))
//            .andExpect(status().isOk)
//            .andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//
//        assertThat(pipelineJobInfoDto.id).isNotNull()
//        assertThat(pipelineJobInfoDto.commitSha).isNotNull()
//        assertThat(pipelineJobInfoDto.committedAt).isNotNull()
//        assertThat(pipelineJobInfoDto.updatedAt).isNull()
//        assertThat(pipelineJobInfoDto.finishedAt).isNull()
//    }
//
//    @Transactional
//    @Rollback
//    @Test fun `Can manipulate Experiment in the correct Order PENDING - RUNNING - SUCCESS`() {
//        val experiment1 = createExperiment(dataProject.id)
//
//        mockGitlab(
//            sourceBranch = experiment1.sourceBranch,
//            targetBranch = experiment1.targetBranch
//        )
//        // Start experiment
//        this.mockMvc.perform(
//            this.defaultAcceptContentAuth(post("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start")))
//            .andExpect(status().isOk)
//
//        val pipelineJobInfoDto = this.mockMvc.perform(
//            this.defaultAcceptContentAuth(get("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/metrics"))
//        ).andExpect(status().isOk)
//            .andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//
//        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret
//
//        val update = this.mockMvc.perform( //experiment/{id}/{token}/update
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/update"))
//                .content("{}"))
//            .andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//
//        assertThat(update).isNotNull()
//        val finish = this.mockMvc.perform(
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/finish")))
//            .andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//        assertThat(finish).isNotNull()
//    }
//
//    @Transactional
//    @Rollback
//    @Test fun `Cannot manipulate Experiment in the wrong Order PENDING - SUCCESS - RUNNING `() {
//        val experiment1 = createExperiment(dataProject.id)
//
//        mockGitlab(
//            sourceBranch = experiment1.sourceBranch,
//            targetBranch = experiment1.targetBranch
//        )
//        // PENDING
//        this.mockMvc.perform(
//            this.defaultAcceptContentAuth(post("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start")))
//            .andExpect(status().isOk)
//
//        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret
//
//        // SUCCESS
//        this.mockMvc.perform(
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/finish")))
//            .andExpect(status().isOk).andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//
//        // MUST fail after here
//        // RUNNING
//        this.mockMvc.perform(
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/update"))
//                .content("{}"))
//            .andExpect(status().isBadRequest)
//    }
//
//
//        // PENDING
//        this.mockMvc.perform(
//            this.defaultAcceptContentAuth(post("$rootUrl/${dataProject.id}/experiments/${experiment1.id}/start")))
//            .andExpect(status().isOk)
//
//        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret
//
//        // SUCCESS
//        this.mockMvc.perform(
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/finish")))
//            .andExpect(status().isOk).andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
//            }
//
//        // MUST fail after here
//        // SUCCESS
//        this.mockMvc.perform(
//            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/finish")))
//            .andExpect(status().isBadRequest)
//    }

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
        val parameterInstances = processorInstance2.addParameterInstances(processorParameter.copy(dataProcessorId = processorInstance2.dataProcessorId), "value")
        processorParameterRepository.save(processorParameter)
//        parameterInstanceRepository.save(parameterInstances)
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
            processing = processorInstance)
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
            fieldWithPath("source_branch").type(JsonFieldType.STRING).description("Branch name for initial checkout"),
            fieldWithPath("target_branch").type(JsonFieldType.STRING).description("Branch name for destination"),
            fieldWithPath("post_processing").type(JsonFieldType.ARRAY).optional().description("An optional List of DataProcessors used during PostProcessing"),
            fieldWithPath("processing").type(JsonFieldType.OBJECT).optional().description("An optional DataAlgorithm")
        )
    }


}
