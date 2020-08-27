package com.mlreef.rest.v1.system

import com.mlreef.rest.DataType
import com.mlreef.rest.PipelineType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.PipelineConfigCreateRequest
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.dto.DataProcessorInstanceDto
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.FileLocationDto
import com.mlreef.rest.api.v1.dto.ParameterInstanceDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineInstanceDto
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

@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("C: DataProject Pipelines")
class C_DataProject_Pipelines_Test : AbstractSystemTest() {

    companion object {
        lateinit var accessToken: String
        lateinit var currentUser: SecretUserDto

        lateinit var ownDataProjectDto: DataProjectDto
        lateinit var createdPipeline: PipelineInstanceDto
        lateinit var startedPipeline: PipelineInstanceDto
        lateinit var yamlFile: String
        lateinit var epfPipelineUrl: String
        lateinit var epfPipelineSecret: String
    }

    @Test
    fun `C00 Prepare new User & Login `() {
        val returnedResult = prepareCurrentUser(globalRandomUserName, globalEmail, globalRandomPassword)
        accessToken = returnedResult.accessToken ?: returnedResult.token!!
        currentUser = returnedResult
    }

    @Test
    fun `C01 Can create DataProject`() {
        val request = ProjectCreateRequest(
            "test-project-pipelines",
            currentUser.username,
            "Test project for Pipelines",
            "description",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PUBLIC
        )

        val response: ResponseEntity<DataProjectDto> = backendRestClient.post("/projects/data", accessToken, request)
        ownDataProjectDto = response.expectOk().returns()

        val adminGetProject = gitlabRestClient.adminGetProject(ownDataProjectDto.gitlabId)
        assertThat(adminGetProject).isNotNull
        assertThat(adminGetProject.path).isEqualTo(request.slug)
    }

    @Test
    fun `C02 Can create PipelineConfig in own DataProject`() {
        val request = PipelineConfigCreateRequest(
            name = "PipelineConfigTest",
            slug = "pipeline-config-test",
            sourceBranch = "master",
            targetBranchPattern = "pipeline-config-test-\$NUMBER",
            inputFiles = listOf(FileLocationDto("data/")),
            pipelineType = PipelineType.DATA.name,
            dataOperations = listOf(DataProcessorInstanceDto(slug = "commons-add-noise",
                parameters = listOf(
                    ParameterInstanceDto("input-path", "data"),
                    ParameterInstanceDto("output-path", "."),
                    ParameterInstanceDto("mode", "gaussian")
                )
            )
            )
        )

        val response: ResponseEntity<PipelineConfigDto> = backendRestClient.post("/data-projects/${ownDataProjectDto.id}/pipelines", accessToken, request)
        val configDto = response.expectOk().returns()

        assertThat(configDto).isNotNull
        assertThat(configDto.slug).isEqualTo("data-pipeline-pipelineconfigtest")
    }

    @Test
    fun `C03 Can create-start PipelineInstance in own DataProject`() {
        val request = PipelineConfigCreateRequest(
            name = "PipelineInstanceTest",
            slug = "pipeline-instance-test",
            sourceBranch = "master",
            targetBranchPattern = "pipeline-config-test-\$NUMBER",
            inputFiles = listOf(FileLocationDto("data/")),
            pipelineType = PipelineType.DATA.name,
            dataOperations = listOf(DataProcessorInstanceDto(slug = "commons-add-noise",
                parameters = listOf(
                    ParameterInstanceDto("input-path", "data"),
                    ParameterInstanceDto("output-path", "."),
                    ParameterInstanceDto("mode", "gaussian")
                )
            )
            )
        )

        val response: ResponseEntity<PipelineInstanceDto> = backendRestClient.post("/data-projects/${ownDataProjectDto.id}/pipelines/create-start-instance", accessToken, request)
        createdPipeline = response.expectOk().returns()

        assertThat(createdPipeline).isNotNull
        assertThat(createdPipeline.slug).isEqualTo("data-pipeline-pipelineinstancetest-1")
    }

    @Test
    fun `C03-01 PipelineConfig exists in MLReef backend under DatapProject`() {
        val response3: ResponseEntity<PipelineConfigDto> =
            backendRestClient.get("/data-projects/${ownDataProjectDto.id}/pipelines/${createdPipeline.pipelineConfigId}", accessToken)
        val dto = response3.expectOk().returns()
        assertThat(dto).isNotNull
        assertThat(dto.id).isNotNull()
    }

    @Test
    fun `C03-02 PipelineConfig exists in MLReef backend under Pipelines`() {
        val response3: ResponseEntity<PipelineConfigDto> =
            backendRestClient.get("/pipelines/${createdPipeline.pipelineConfigId}", accessToken)
        val dto = response3.expectOk().returns()
        assertThat(dto).isNotNull
        assertThat(dto.id).isNotNull()
    }

    @Test
    fun `C03-03 PipelineInstance exists in MLReef backend under Pipelines`() {
        val response3: ResponseEntity<PipelineInstanceDto> =
            backendRestClient.get("/pipelines/${createdPipeline.pipelineConfigId}/instances/${createdPipeline.id}", accessToken)
        startedPipeline = response3.expectOk().returns()

        assertThat(startedPipeline).isNotNull
        assertThat(startedPipeline.id).isNotNull()

        val pipelineJobInfo = startedPipeline.pipelineJobInfo

        assertThat(pipelineJobInfo).isNotNull
        assertThat(pipelineJobInfo?.id).isEqualTo(pipelineJobInfo?.id)
        assertThat(pipelineJobInfo?.commitSha).isNotNull()
        assertThat(pipelineJobInfo?.createdAt).isNotNull()
    }

    @Test
    fun `C03-04 PipelineInstance was created in gitlab as a branch`() {
        val branches = gitlabRestClient.getBranches(accessToken, ownDataProjectDto.gitlabId)
        assertThat(branches).isNotNull
        assertThat(branches).isNotEmpty
        val foundBranches = branches.find { it.name.contains(startedPipeline.targetBranch) }
        assertThat(foundBranches).isNotNull
    }

    @Test
    fun `C03-05 PipelineInstance was started in gitlab as a pipeline`() {
        val pipeline = gitlabRestClient.getPipeline(accessToken, ownDataProjectDto.gitlabId, startedPipeline.pipelineJobInfo!!.id)
        assertThat(pipeline).isNotNull
    }

    @Test
    fun `C03-06 Gitlab runners working = Pipeline should be started after some seconds`() {
        var pipelineStarted = false
        var iteration = 0
        var pipelineStatus = ""
        val seconds = 6
        while (iteration < 10 && !pipelineStarted) {
            Thread.sleep((seconds * 1000).toLong())
            val pipeline = gitlabRestClient.getPipeline(accessToken, ownDataProjectDto.gitlabId, startedPipeline.pipelineJobInfo!!.id)
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
    fun `C04 Can retrieve PipelineInstance mlreef-yaml`() {
        val response: ResponseEntity<String> = backendRestClient.get("/pipelines/${createdPipeline.pipelineConfigId}/instances/${createdPipeline.id}/mlreef-file", accessToken)
        yamlFile = response.expectOk().returns()

        assertThat(yamlFile).isNotNull()

        val epfUrlString = "EPF_PIPELINE_URL:    \""
        val epfSecretPrefix = "EPF_PIPELINE_SECRET: \""
        assertThat(yamlFile).contains("- git push --set-upstream origin")
        assertThat(yamlFile).contains(epfUrlString)
        assertThat(yamlFile).contains(epfSecretPrefix)
        assertThat(yamlFile).contains("INPUT_FILE_LIST:")
        assertThat(yamlFile).contains("TARGET_BRANCH:")
        epfPipelineUrl = yamlFile.substringAfter(epfUrlString).substringBefore("\"").trim()
        epfPipelineSecret = yamlFile.substringAfter(epfSecretPrefix).substringBefore("\"").trim()
    }

//    @Test
//    fun `C04-01 YAML contains current imageTag`() {
//        assertThat(yamlFile).contains(conf.epf.imageTag)
//    }

    @Test
    fun `C04-02 EPF_PIPELINE_URL seems valid`() {
        assertThat(epfPipelineUrl).isNotNull()
        assertThat(epfPipelineUrl).contains("/api/v1/epf/pipeline_instance/")
        assertThat(epfPipelineUrl).contains("/api/v1/epf/pipeline_instance/${createdPipeline.id}")
        assertThat(epfPipelineUrl).startsWith("http")
    }

    @Test
    fun `C05 Can update EPF PipelineInstance with EPF secret`() {
        val response: ResponseEntity<PipelineJobInfoDto> =
            backendRestClient.sendEpfRequest(epfPipelineUrl + "/finish", HttpMethod.PUT, epfPipelineSecret, "{}")
        response.expectOk()
    }
}
