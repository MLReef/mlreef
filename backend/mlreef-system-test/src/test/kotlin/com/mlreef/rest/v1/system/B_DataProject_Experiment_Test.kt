package com.mlreef.rest.v1.system

import com.mlreef.rest.DataType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.ExperimentCreateRequest
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineJobInfoDto
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.junit.jupiter.api.fail
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import java.io.File

@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("B: DataProject & Experiments")

class B_DataProject_Experiment_Test : AbstractSystemTest() {

    companion object {
        lateinit var accessToken: String
        lateinit var currentUser: SecretUserDto

        lateinit var ownDataProjectDto: DataProjectDto
        lateinit var createdExperiment: ExperimentDto
        lateinit var startedExperiment: ExperimentDto
        lateinit var yamlFile: String
        lateinit var epfExperimentUrl: String
        lateinit var epfExperimentSecret: String
    }

    @Test
    fun `B00 Prepare new User & Login `() {
        val returnedResult = prepareCurrentUser(globalRandomUserName, globalEmail, globalRandomPassword)
        Thread.sleep(1000)
        accessToken = returnedResult.accessToken ?: returnedResult.token!!
        currentUser = returnedResult
        Thread.sleep(2000)
    }

    @Test
    fun `B01 Can create DataProject`() {
        val request = ProjectCreateRequest(
            "test-project",
            currentUser.username,
            "Test project",
            "description",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PUBLIC
        )

        val response: ResponseEntity<DataProjectDto> = backendRestClient.post("/projects/data", accessToken, request)
        ownDataProjectDto = response.expectOk().returns()

        assertThat(ownDataProjectDto).isNotNull
        assertThat(ownDataProjectDto.slug).isEqualTo("test-project")

        Thread.sleep(500)

    }

    @Test
    fun `B01-01 DataProject was created in gitlab`() {

        val userInProjectDto = gitlabRestClient.userGetUserInProject(accessToken, ownDataProjectDto.gitlabId, currentUser.gitlabId!!)
        assertThat(userInProjectDto).isNotNull

        val branch = gitlabRestClient.getBranch(accessToken, ownDataProjectDto.gitlabId, "master")
        assertThat(branch).isNotNull

        val adminGetProject = gitlabRestClient.adminGetProject(ownDataProjectDto.gitlabId)
        assertThat(adminGetProject).isNotNull

    }

    @Test
    fun `B01-02 Can use own DataProject as git repo`() {
        val (_, repo) = prepareGit()
        val call = repo.pull().call()
        assertThat(call).isNotNull
    }

    @Test
    fun `B02 Can update own DataProject as git repo`() {
        val (newFolder, repo) = prepareGit()
        repo.pull().call()

        val url = this.javaClass.getResource("/training-foto.png")
        val testFile = File(url.file)

        testFile.copyTo(File(newFolder.absolutePath + "/data/copy1.png"))
        testFile.copyTo(File(newFolder.absolutePath + "/data/copy2.png"))
        repo.add().addFilepattern("*").setUpdate(true).call()
        repo.commit().setMessage("commit").call()
        val call = repo.push().setCredentialsProvider(credentialsProvider()).call()
        assertThat(call).isNotNull
    }

    @Test
    fun `B03 Can create Experiment in own DataProject with Resnet50`() {
        val request = ExperimentCreateRequest(
            null,
            "qa-experiment",
            "QA Experiment",
            "master",
            "experiment/test",
            listOf("data/"),
            DataProcessorInstanceDto(slug = "commons-resnet-50",
                parameters = listOf(
                    ParameterInstanceDto("input-path", "data"),
                    ParameterInstanceDto("output-path", "."),
                    ParameterInstanceDto("epochs", "2"),
                    ParameterInstanceDto("height", "36"),
                    ParameterInstanceDto("height", "36")
                )
            )
        )

        val response: ResponseEntity<ExperimentDto> = backendRestClient.post("/data-projects/${ownDataProjectDto.id}/experiments", accessToken, request)
        createdExperiment = response.expectOk().returns()

        assertThat(createdExperiment).isNotNull
        assertThat(createdExperiment.slug).isEqualTo("qa-experiment")
    }

    @Test
    fun `B03-01 Experiment exists in MLReef backend`() {
        val response3: ResponseEntity<ExperimentDto> = backendRestClient.get("/data-projects/${ownDataProjectDto.id}/experiments/${createdExperiment.id}", accessToken)
        val dto = response3.expectOk().returns()
        assertThat(dto).isNotNull
        assertThat(dto.id).isNotNull()
        assertThat(dto.pipelineJobInfo).isNull()
    }

    @Test
    fun `B04 Can start own Experiment in DataProject with Resnet50`() {
        val response2: ResponseEntity<PipelineJobInfoDto> = backendRestClient.post("/data-projects/${ownDataProjectDto.id}/experiments/${createdExperiment.id}/start", accessToken)
        val pipelineJobInfoDto = response2.expectOk().returns()

        assertThat(pipelineJobInfoDto).isNotNull
        assertThat(pipelineJobInfoDto.id).isNotNull()
        assertThat(pipelineJobInfoDto.commitSha).isNotNull()
        assertThat(pipelineJobInfoDto.createdAt).isNotNull()

        Thread.sleep(5000)
    }

    @Test
    fun `B04-01 Experiment was updated in backend`() {
        val response3: ResponseEntity<ExperimentDto> = backendRestClient.get("/data-projects/${ownDataProjectDto.id}/experiments/${createdExperiment.id}", accessToken)
        startedExperiment = response3.expectOk().returns()

        assertThat(startedExperiment).isNotNull
        assertThat(startedExperiment.id).isNotNull()

        val pipelineJobInfo = startedExperiment.pipelineJobInfo

        assertThat(pipelineJobInfo).isNotNull
        assertThat(pipelineJobInfo?.id).isEqualTo(pipelineJobInfo?.id)
        assertThat(pipelineJobInfo?.commitSha).isNotNull()
        assertThat(pipelineJobInfo?.createdAt).isNotNull()
    }

    @Test
    fun `B04-02 Experiment was created in gitlab as a branch`() {
        val branches = gitlabRestClient.getBranches(accessToken, ownDataProjectDto.gitlabId)
        assertThat(branches).isNotNull
        assertThat(branches).isNotEmpty
        val foundBranches = branches.find { it.name.contains(createdExperiment.targetBranch) }
        assertThat(foundBranches).isNotNull
    }

    @Test
    fun `B04-03 Experiment was started in gitlab as a pipeline`() {
        val pipeline = gitlabRestClient.getPipeline(accessToken, ownDataProjectDto.gitlabId, startedExperiment.pipelineJobInfo!!.id)
        assertThat(pipeline).isNotNull
    }

    @Test
    fun `B04-04 Gitlab runners working = Pipeline should be started after some seconds`() {

        var pipelineStarted = false
        var iteration = 0
        var pipelineStatus = ""
        val seconds = 6
        while (iteration < 10 && !pipelineStarted) {
            Thread.sleep((seconds * 1000).toLong())
            val pipeline = gitlabRestClient.getPipeline(accessToken, ownDataProjectDto.gitlabId, startedExperiment.pipelineJobInfo!!.id)
            assertThat(pipeline).isNotNull
            pipelineStatus = pipeline.status.toString().toLowerCase()
            // could be "running" or "failed", but should not be pending!
            pipelineStarted = pipelineStatus != "pending"
            iteration++
            println("Sleep for $seconds seconds -> current pipeline status : $pipelineStatus")
        }

        if (!pipelineStarted) {
            fail("PIPELINES NOT RUNNING: After $iteration iterations with $seconds s (${iteration * seconds}s total), the pipeline status is still: $pipelineStatus")
        }
    }

    @Test
    fun `B05 Can retrieve Experiment mlreef-yaml`() {
        val response: ResponseEntity<String> = backendRestClient.get("/data-projects/${ownDataProjectDto.id}/experiments/${createdExperiment.id}/mlreef-file", accessToken)
        yamlFile = response.expectOk().returns()

        assertThat(yamlFile).isNotNull()

        val epfUrlString = "EPF_PIPELINE_URL:    \""
        val epfSecretPrefix = "EPF_PIPELINE_SECRET: \""
        assertThat(yamlFile).contains("- git push --set-upstream origin")
        assertThat(yamlFile).contains(epfUrlString)
        assertThat(yamlFile).contains(epfSecretPrefix)
        assertThat(yamlFile).contains("INPUT_FILE_LIST:")
        assertThat(yamlFile).contains("TARGET_BRANCH:")
        epfExperimentUrl = yamlFile.substringAfter(epfUrlString).substringBefore("\"").trim()
        epfExperimentSecret = yamlFile.substringAfter(epfSecretPrefix).substringBefore("\"").trim()
    }
//
//    @Test
//    fun `B05-03 YAML contains current imageTag`() {
//        assertThat(yamlFile).contains(conf.epf.imageTag)
//    }

    @Test
    fun `B05-04 EPF_PIPELINE_URL seems valid`() {
        assertThat(epfExperimentUrl).isNotNull()
        assertThat(epfExperimentUrl).contains("/api/v1/epf/experiments/")
        assertThat(epfExperimentUrl).contains("/api/v1/epf/experiments/${createdExperiment.id}")
        assertThat(epfExperimentUrl).startsWith("http")
    }

    @Test
    fun `B06 Can finish EPF experiment with EPF secret`() {
        val response: ResponseEntity<PipelineJobInfoDto> =
            backendRestClient.sendEpfRequest(epfExperimentUrl + "/finish", HttpMethod.PUT, epfExperimentSecret, "{}")
        response.expectOk()
    }
}
