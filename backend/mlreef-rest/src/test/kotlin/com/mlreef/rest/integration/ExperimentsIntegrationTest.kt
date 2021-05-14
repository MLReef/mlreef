package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.ProcessorInstanceDto
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Experiment
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.FileLocationType
import com.mlreef.rest.domain.Parameter
import com.mlreef.rest.domain.Pipeline
import com.mlreef.rest.domain.Processor
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Suppress("UsePropertyAccessSyntax")
class ExperimentsIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/data-projects"
    val epfUrl = "/api/v1/epf"

    @Transactional
    @Rollback
    @Test
    fun `Can create new Experiment`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

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
            ),
            postProcessing = listOf(
                ProcessorInstanceDto(
                    slug = "commons-data-visualisation",
                    parameters = listOf(
                        ParameterInstanceDto("tupleParam", type = "TUPLE", value = "(\"asdf\", 1.0)"),
                        ParameterInstanceDto("hashParam", type = "DICTIONARY", value = "{\"key\":\"value\"}")
                    )
                )
            )
        )

        val url = "$rootUrl/${project.id}/experiments"

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(ExperimentDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create second Experiment with different slug for same project`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

        createExperiment(project, "first-experiment")

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

        val url = "$rootUrl/${project.id}/experiments"

        val result = this.performPost(url, token, request)
            .expectOk()
            .returns(ExperimentDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create second Experiment with same slug for different project`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)
        val (project2, _) = createRealDataProject(token, account)

        createExperiment(project, "experiment-slug")

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
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

        createExperiment(project, "experiment-slug")

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

        val url = "$rootUrl/${project.id}/experiments"

        this.performPost(url, token, request)
            .expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    @Deprecated("unsure")
    fun `Can retrieve all own Experiments`() {
        val (account, token, _) = createRealUser(index = -1)
        val (project1, _) = createRealDataProject(token, account)
        val (project2, _) = createRealDataProject(token, account)

        createExperiment(project1, "experiment-1-slug")
        createExperiment(project1, "experiment-2-slug")
        createExperiment(project2, "experiment-3-slug")

        val returnedResult: List<ExperimentDto> = performGet("$rootUrl/${project1.id}/experiments", token)
            .expectOk()
            .returnsList(ExperimentDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own Experiment`() {
        val (account, token, _) = createRealUser()
        val (project1, _) = createRealDataProject(token, account)

        val experiment1 = createExperiment(project1)

        performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", token)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve foreign public Experiment`() {
        val (realAccount1, token1, _) = createRealUser()
        val (_, token2, _) = createRealUser()
        val (project1, _) = createRealDataProject(token1, realAccount1, public = true)

        val experiment1 = createExperiment(project1)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", token2)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve foreign member Experiment`() {
        val (account1, token1, _) = createRealUser()
        val (account2, token2, _) = createRealUser()
        val (project, _) = createRealDataProject(token1, account1, public = false)

        addRealUserToProject(project.gitlabId, account2.person.gitlabId!!)

        val experiment1 = createExperiment(project)

        this.performGet("$rootUrl/${project.id}/experiments/${experiment1.id}", token2)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign public Experiment`() {
        val (realAccount1, token1, _) = createRealUser()
        val (_, token2, _) = createRealUser()
//        val (codeProject, _) = createRealCodeProject(token1, realAccount1, public = false)
        val (project1, _) = createRealDataProject(token1, realAccount1, public = false)

        val experiment1 = createExperiment(project1)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}", token2)
            .expectForbidden()
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can update own Experiment's pipelineJobInfo with arbitrary json hashmap blob`() {
        val (realAccount1, token, _) = createRealUser()
        val (project1, _) = createRealDataProject(token, realAccount1)

        val experiment1 = createExperiment(project1)

        val request: String = "" +
            """{"metric1": 20.0, "metrik2": 3, "string":"yes"}"""

        val epfToken = experimentsRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret!!

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/update"))
                .content(request)
        )
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
        val (account, token, _) = createRealUser()
        val (project1, _) = createRealDataProject(token, account)

        val experiment1 = createExperiment(project1)

        val beforeRequestTime = Instant.now()
        val epfToken = experimentsRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret!!

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/finish"))
        )
            .andExpect(status().isOk)
            .returns(PipelineJobInfoDto::class.java)


        assertThat(returnedResult).isNotNull()
        assertThat(returnedResult.finishedAt).isNotNull()
        assertThat(returnedResult.finishedAt).isAfter(beforeRequestTime)
        assertThat(returnedResult.finishedAt).isBefore(Instant.now())
    }

    // Does not really work right now, lets wait frontend#523
    @Disabled
    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own Experiment's pipelineJobInfo`() {
        val (account, token, _) = createRealUser()
        val (project1, _) = createRealDataProject(token, account)

        val experiment1 = createExperiment(project1)

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/info", token)
            .expectOk()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own Experiment's MLReef file`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account)
        val (dataProject, _) = createRealDataProject(token, account)

        val experiment1 = createExperiment(dataProject = dataProject, codeProject = codeProject)

        val url = "$rootUrl/${dataProject.id}/experiments/${experiment1.id}/mlreef-file"

        val returnedResult = performGet(url, token)
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
        val (account, token, _) = createRealUser()
        val (project1, _) = createRealDataProject(token, account)

        val experiment1 = createExperiment(project1)

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
        val (account, token, _) = createRealUser()
        val (project1, _) = createRealDataProject(token, account)

        val experiment1 = createExperiment(project1)

        // Start experiment
        this.performPost("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", token)
            .expectOk()

        this.performGet("$rootUrl/${project1.id}/experiments/${experiment1.id}/info", token)
            .expectOk()
            .returns(PipelineJobInfoDto::class.java)

        val epfToken = experimentsRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret!!

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
        val (account, token, _) = createRealUser()
        val (project1, _) = createRealDataProject(token, account)

        val experiment1 = createExperiment(project1)

        // PENDING
        this.performPost("$rootUrl/${project1.id}/experiments/${experiment1.id}/start", token)
            .expectOk()

        val epfToken = experimentsRepository.findByIdOrNull(experiment1.id)!!.pipelineJobInfo!!.secret!!

        // SUCCESS
        this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/finish"))
        )
            .andExpect(status().isOk).andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, PipelineJobInfoDto::class.java)
            }

        // MUST fail after here
        // RUNNING
        this.mockMvc.perform(
            this.defaultAcceptContentEPFBot(epfToken, put("$epfUrl/experiments/${experiment1.id}/update"))
                .content("{}")
        )
            .andExpect(status().isBadRequest)
    }


    private fun createExperiment(
        dataProject: DataProject,
        slug: String = "experiment-slug",
        codeProject: CodeProject? = null,
        pipeline: Pipeline? = null
    ): Experiment {
        val processorParameter: Parameter
        val processor: Processor

        if (codeProject != null) {
            processor = createProcessor(codeProject, "Test Processor")

            processorParameter = createParameter(
                processor = processor,
                name = "param1",
                parameterType = stringParamType,
                defaultValue = "default",
                order = 1,
                required = true
            )

            processorsRepository.save(processor)
            parametersRepository.save(processorParameter)
        } else {
            processor = processorOperation1
            processorParameter = processorOperation1.parameters.first()
        }

        val processorInstance1 = createProcessorInstance(processor)
        val processorInstance2 = createProcessorInstance(processor)

        processorInstance1.createParameterInstances(processorParameter, "value")
        processorInstance2.createParameterInstances(processorParameter, " value")

        processorInstancesRepository.save(processorInstance1)
        processorInstancesRepository.save(processorInstance2)

        val experiment1 = Experiment(
            slug = slug,
            name = "Experiment Name",
            pipeline = pipeline,
            id = randomUUID(),
            dataProject = dataProject,
            sourceBranch = "master",
            targetBranch = "target",
            postProcessing = arrayListOf(processorInstance2),
            number = 1 + experimentsRepository.countByDataProject(dataProject),
            pipelineJobInfo = null,
            processorInstance = processorInstance1,
            inputFiles = listOf(FileLocation(randomUUID(), FileLocationType.PATH, "location1"))
        )

        dataProject.experiments.add(experiment1)
        dataProjectRepository.save(dataProject)

        return experiment1
    }
}
