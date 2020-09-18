package com.mlreef.rest.integration

import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.FileLocationType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.ZonedDateTime
import java.util.*
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Suppress("UsePropertyAccessSyntax")
class ExperimentsIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/data-projects"
    val epfUrl = "/api/v1/epf"

    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository

    @BeforeEach
    @Transactional
    fun fillRepo() {
        testsHelper.generateProcessorsInDatabase()
    }

    @AfterEach
    @Transactional
    fun clearRepo() {
        testsHelper.cleanProcessorsInDatabase()
    }


    @Transactional
    @Rollback
    @Test fun `Can create new Experiment`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project, _) = testsHelper.createRealDataProject(token, account)

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

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(ExperimentDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can create second Experiment with different slug for same project`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project, _) = testsHelper.createRealDataProject(token, account)

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

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(ExperimentDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can create second Experiment with same slug for different project`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project, _) = testsHelper.createRealDataProject(token, account)
        val (project2, _) = testsHelper.createRealDataProject(token, account)

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

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(ExperimentDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Deprecated("Unsure if needed")
    fun `Cannot create new Experiment with duplicate slug`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project, _) = testsHelper.createRealDataProject(token, account)

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

        this.performPost(url, token, request)
            .expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    @Deprecated("unsure")
    fun `Can retrieve all own Experiments`() {
        val (account, token, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealDataProject(token, account)
        val (project2, _) = testsHelper.createRealDataProject(token, account)

        createExperiment(project1.id, "experiment-1-slug")
        createExperiment(project1.id, "experiment-2-slug")
        createExperiment(project2.id, "experiment-3-slug")

        val returnedResult: List<ExperimentDto> = performGet("$rootUrl/${project1.id}/experiments", token)
            .expectOk()
            .returnsList(ExperimentDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve own Experiment`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, account)

        val experiment1 = createExperiment(project1.id)

        performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", token)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve foreign public Experiment`() {
        val (realAccount1, token1, _) = testsHelper.createRealUser()
        val (_, token2, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token1, realAccount1, public = true)

        val experiment1 = createExperiment(project1.id)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", token2)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve foreign member Experiment`() {
        val (account1, token1, _) = testsHelper.createRealUser()
        val (account2, token2, _) = testsHelper.createRealUser()
        val (project, _) = testsHelper.createRealDataProject(token1, account1, public = false)

        testsHelper.addRealUserToProject(project.gitlabId, account2.person.gitlabId!!)

        val experiment1 = createExperiment(project.id)

        this.performGet("$rootUrl/${project.id}/experiments/${experiment1.id}", token2)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign public Experiment`() {
        val (realAccount1, token1, _) = testsHelper.createRealUser()
        val (_, token2, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token1, realAccount1, public = false)

        val experiment1 = createExperiment(project1.id)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", token2)
            .expectForbidden()
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can update own Experiment's pipelineJobInfo with arbitrary json hashmap blob`() {
        val (realAccount1, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, realAccount1)

        val experiment1 = createExperiment(project1.id)

        val request: String = "" +
            """{"metric1": 20.0, "metrik2": 3, "string":"yes"}"""

        val epfToken = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/update")).content(request))
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
        val (account, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, account)

        val experiment1 = createExperiment(project1.id)

        val beforeRequestTime = ZonedDateTime.now()
        val epfToken = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/finish")))
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
    fun `Can retrieve own Experiment's pipelineJobInfo`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, account)

        val experiment1 = createExperiment(project1.id)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/info", token)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own Experiment's MLReef file`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, account)

        val experiment1 = createExperiment(project1.id)

        val returnedResult = performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/mlreef-file", token)
            .andExpect(status().isOk)
            .andReturn().response.contentAsString

        assertThat(returnedResult).isNotEmpty()

        //FIXME: Doesn't pass
        //assertThat(returnedResult).contains("git checkout -b target")
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can start own Experiment as gitlab pipeline`() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, account)

        val experiment1 = createExperiment(project1.id)

        val pipelineJobInfoDto = performPost("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", token)
            .expectOk()
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
        val (account, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, account)

        val experiment1 = createExperiment(project1.id)

        // Start experiment
        this.performPost("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", token)
            .expectOk()

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/info", token)
            .expectOk()
            .returns(PipelineJobInfoDto::class.java)

        val epfToken = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        val update = performEPFPut(epfToken, "$epfUrl/experiments/${experiment1.id}/update", body = Object())
            .returns(PipelineJobInfoDto::class.java)

        assertThat(update).isNotNull()
        val finish = performEPFPut(epfToken, "$epfUrl/experiments/${experiment1.id}/finish")
            .returns(PipelineJobInfoDto::class.java)
        assertThat(finish).isNotNull()
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Cannot manipulate Experiment in the wrong Order PENDING - SUCCESS - RUNNING `() {
        val (account, token, _) = testsHelper.createRealUser()
        val (project1, _) = testsHelper.createRealDataProject(token, account)

        val experiment1 = createExperiment(project1.id)

        // PENDING
        this.performPost("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", token)
            .expectOk()

        val epfToken = experimentRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret

        // SUCCESS
        this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/finish")))
            .andExpect(status().isOk).andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
            }

        // MUST fail after here
        // RUNNING
        this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/update"))
                .content("{}"))
            .andExpect(status().isBadRequest)
    }


    private fun createExperiment(dataProjectId: UUID, slug: String = "experiment-slug", dataInstanceId: UUID? = null): Experiment {
        val processorInstance = DataProcessorInstance(randomUUID(), testsHelper.dataOp1!!)
        val processorInstance2 = DataProcessorInstance(randomUUID(), testsHelper.dataOp1!!)

        val processorParameter = ProcessorParameter(
            id = randomUUID(), processorVersionId = processorInstance.processorVersionId,
            name = "param1", type = ParameterType.STRING,
            defaultValue = "default", description = "not empty",
            order = 1, required = true)

        processorInstance.addParameterInstances(processorParameter, "value")
        processorInstance2.addParameterInstances(processorParameter.copy(processorVersionId = processorInstance2.processorVersionId), "value")
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
            number = 1 + experimentRepository.countByDataProjectId(dataProjectId),
            pipelineJobInfo = null,
            processing = processorInstance,
            inputFiles = listOf(FileLocation(randomUUID(), FileLocationType.PATH, "location1")))
        return experimentRepository.save(experiment1)
    }
}
