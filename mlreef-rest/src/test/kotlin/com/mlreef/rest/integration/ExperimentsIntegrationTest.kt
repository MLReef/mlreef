package com.mlreef.rest.integration

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.FileLocationType
import com.mlreef.rest.I18N
import com.mlreef.rest.ParameterType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.PipelineTestPreparationTrait
import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import io.mockk.MockKAnnotations
import io.mockk.every
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

///@RunWith(MockitoJUnitRunner::class)
@Suppress("UsePropertyAccessSyntax")
class ExperimentsIntegrationTest : IntegrationRestApiTest() {

    private lateinit var dataOp1: DataOperation
    private lateinit var dataOp2: DataAlgorithm
    private lateinit var dataOp3: DataVisualization
    val rootUrl = "/api/v1/data-projects"
    val epfUrl = "/api/v1/epf"

    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @BeforeEach
    @AfterEach
    @Transactional
    fun clearRepo() {
        MockKAnnotations.init(this, relaxUnitFun = true, relaxed = true)
        pipelineTestPreparationTrait.apply()
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataOp2 = pipelineTestPreparationTrait.dataOp2
        dataOp3 = pipelineTestPreparationTrait.dataOp3
    }

    @Transactional
    @Rollback
    @Test fun `Can create new Experiment`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

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
            )),
            postProcessing = listOf(
                DataProcessorInstanceDto("commons-data-visualisation", listOf(
                    ParameterInstanceDto("tupleParam", type = ParameterType.TUPLE.name, value = "(\"asdf\", 1.0)"),
                    ParameterInstanceDto("hashParam", type = ParameterType.DICTIONARY.name, value = "{\"key\":\"value\"}")
                ))))

        val url = "$rootUrl/${project.id}/experiments"

        val returnedResult: ExperimentDto = this.mockMvc.perform(
            this.acceptContentAuth(post(url), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)

            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can create second Experiment with different slug for same project`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        createExperiment(project.id, "first-experiment")

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

        val url = "$rootUrl/${project.id}/experiments"

        val returnedResult: ExperimentDto = performPost(url, account, body = request)
            .andExpect(status().isOk)
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can create second Experiment with same slug for different project`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)
        val (project2, _) = gitlabHelper.createRealDataProject(account)

        createExperiment(project.id, "experiment-slug")

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

        val url = "$rootUrl/${project2.id}/experiments"

        val returnedResult: ExperimentDto = this.mockMvc.perform(
            this.acceptContentAuth(post(url), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .returns(ExperimentDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Deprecated("Unsure if needed")
    fun `Cannot create new Experiment with duplicate slug`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        createExperiment(project.id, "experiment-slug")

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

        val url = "$rootUrl/${project.id}/experiments"

        this.performPost(url, account, request)
            .andExpect(status().isBadRequest)

    }

    @Transactional
    @Rollback
    @Test
    @Deprecated("unsure")
    fun `Can retrieve all own Experiments`() {
        val (account, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealDataProject(account)
        val (project2, _) = gitlabHelper.createRealDataProject(account)

        createExperiment(project1.id, "experiment-1-slug")
        createExperiment(project1.id, "experiment-2-slug")
        createExperiment(project2.id, "experiment-3-slug")

        val returnedResult: List<ExperimentDto> = performGet("$rootUrl/${project1.id}/experiments", account)
            .andExpect(status().isOk)
            .returnsList(ExperimentDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own Experiment`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(account)

        val experiment1 = createExperiment(project1.id)

        performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", account)
            .andExpect(status().isOk)
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve foreign Experiment`() {
        val (realAccount1, _, _) = gitlabHelper.createRealUser()
        val (realAccount2, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(realAccount1)

        val experiment1 = createExperiment(project1.id)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", realAccount2)
            .andExpect(status().isForbidden)
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can update own Experiment's pipelineJobInfo with arbitrary json hashmap blob`() {
        val (realAccount1, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(realAccount1)

        val experiment1 = createExperiment(project1.id)

        val request: String = "" +
            """{"metric1": 20.0, "metrik2": 3, "string":"yes"}"""

        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/update")).content(request))
            .andExpect(status().isOk)
            .returns(PipelineJobInfoDto::class.java)


        assertThat(returnedResult).isNotNull()
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can finish own Experiment's pipelineJobInfo`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(account)

        val experiment1 = createExperiment(project1.id)

        val beforeRequestTime = ZonedDateTime.now()
        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/finish")))
            .andExpect(status().isOk)
            .returns(PipelineJobInfoDto::class.java)


        assertThat(returnedResult).isNotNull()
        assertThat(returnedResult.finishedAt).isNotNull()
        assertThat(returnedResult.finishedAt).isAfter(beforeRequestTime)
        assertThat(returnedResult.finishedAt).isBefore(ZonedDateTime.now())
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    @Deprecated("Unsure")
    fun `Can retrieve own Experiment's pipelineJobInfo`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(account)

        val experiment1 = createExperiment(project1.id)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/info", account)
            .andExpect(status().isOk)


    }

    @Transactional
    @Disabled
    @Rollback
    @Test fun `Can retrieve own Experiment's MLReef file`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(account)

        val experiment1 = createExperiment(project1.id)

        val returnedResult = performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/mlreef-file", account)
            .andExpect(status().isOk)
            .andReturn().response.contentAsString

        assertThat(returnedResult).isNotEmpty()
        assertThat(returnedResult).contains("git checkout -b target")
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can start own Experiment as gitlab pipeline`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(account)

        val experiment1 = createExperiment(project1.id)

        val pipelineJobInfoDto = performPost("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", account)
            .andExpect(status().isOk)
            .returns(PipelineJobInfoDto::class.java)

        assertThat(pipelineJobInfoDto.id).isNotNull()
        assertThat(pipelineJobInfoDto.commitSha).isNotNull()
        assertThat(pipelineJobInfoDto.committedAt).isNotNull()
        assertThat(pipelineJobInfoDto.updatedAt).isNull()
        assertThat(pipelineJobInfoDto.finishedAt).isNull()
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can manipulate Experiment in the correct Order PENDING - RUNNING - SUCCESS`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(account)

        val experiment1 = createExperiment(project1.id)

        // Start experiment
        this.performPost("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", account)
            .andExpect(status().isOk)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/info", account)
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

    // Does not really work right now, lets wait frontend#523
    @Transactional
    @Rollback
    @Disabled
    @Test
    fun `Cannot manipulate Experiment in the wrong Order PENDING - SUCCESS - RUNNING `() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealDataProject(account)

        val experiment1 = createExperiment(project1.id)

        // PENDING
        this.mockMvc.perform(
            this.acceptContentAuth(post("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", account)))
            .andExpect(status().isOk)

        val token = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        // SUCCESS
        this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/finish")))
            .andExpect(status().isOk).andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
            }

        // MUST fail after here
        // RUNNING
        this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(token, put("$epfUrl/experiments/${experiment1.id}/update"))
                .content("{}"))
            .andExpect(status().isBadRequest)
    }


    private fun createMockedPipeline(user: GitlabUser): GitlabPipeline {
        val pipeline = GitlabPipeline(
            id = 32452345,
            coverage = "",
            sha = "sha",
            ref = "ref",
            beforeSha = "before_sha",
            user = user,
            status = "CREATED",
            committedAt = I18N.dateTime(),
            createdAt = I18N.dateTime(),
            startedAt = null,
            updatedAt = null,
            finishedAt = null
        )

        every {
            restClient.createPipeline(any(), any(), any(), any())
        } returns pipeline

        return pipeline
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
            sourceBranch = "master",
            targetBranch = "target",
            postProcessing = arrayListOf(processorInstance2),
            pipelineJobInfo = null,
            processing = processorInstance,
            inputFiles = listOf(FileLocation(randomUUID(), FileLocationType.PATH, "location1")))
        return experimentRepository.save(experiment1)
    }


}
