package com.mlreef.rest.v1.system

import com.mlreef.rest.DataType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions.assertThat
import org.eclipse.jgit.api.CreateBranchCommand
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.junit.jupiter.api.fail
import org.springframework.http.ResponseEntity
import java.io.File

@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("E: Docker Push")
@Tag(value = SystemTestTags.PIPELINE)
class E_Docker_Test : AbstractSystemTest() {

    companion object {
        lateinit var accessToken: String
        lateinit var currentUser: SecretUserDto
        lateinit var codeProjectDto: CodeProjectDto
        lateinit var gitlabPipeline: GitlabPipeline
    }

    @Test
    fun `E00 Prepare new User & Login `() {
        val returnedResult = prepareCurrentUser(globalRandomUserName, globalEmail, globalRandomPassword)
        accessToken = returnedResult.accessToken ?: returnedResult.token!!
        currentUser = returnedResult
    }

    @Test
    fun `E01 Can create CodeProject`() {
        val request = ProjectCreateRequest(
            "test-project-pipelines-e",
            currentUser.username,
            "Test Project E for Docker",
            "description",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PUBLIC
        )

        val response: ResponseEntity<CodeProjectDto> = backendRestClient.post("/projects/code", accessToken, request)
        codeProjectDto = response.expectOk().returns()
        val adminGetProject = gitlabRestClient.adminGetProject(codeProjectDto.gitlabId)
        assertThat(adminGetProject).isNotNull
        assertThat(adminGetProject.path).isEqualTo(request.slug)
    }

    @Test
    fun `E01-01 CodeProject was created in gitlab`() {
        val userInProjectDto = gitlabRestClient.userGetUserInProject(accessToken, codeProjectDto.gitlabId, currentUser.gitlabId!!)
        assertThat(userInProjectDto).isNotNull

        val branch = gitlabRestClient.getBranch(accessToken, codeProjectDto.gitlabId, "master")
        assertThat(branch).isNotNull
    }

    @Test
    fun `E01-02 Can use own CodeProject as git repo`() {
        val (_, repo) = prepareGit(codeProjectDto.url)
        val call = repo.pull().call()
        assertThat(call).isNotNull
    }

    @Test
    fun `E02 Can trigger Pipeline with own CodeProject as git repo with mlreef-yml`() {
        val (newFolder, repo) = prepareGit(codeProjectDto.url)
        repo.pull().call()

        val branchName = "publish"
        repo.checkout()
            .setCreateBranch(true)
            .setName(branchName)
            .setUpstreamMode(CreateBranchCommand.SetupUpstreamMode.TRACK)
            .call()

        File(this.javaClass.getResource("/docker_test.mlreef.yml").file)
            .copyTo(File(newFolder.absolutePath + "/.mlreef.yml"))
        File(this.javaClass.getResource("/docker_test.Dockerfile").file)
            .copyTo(File(newFolder.absolutePath + "/Dockerfile"))

        repo.add().addFilepattern(".").setUpdate(false).call()
        repo.commit().setMessage("commit").call()
        val call = repo.push().withCp().call()
        assertThat(call).isNotNull
    }

    @Test
    fun `E02-01 PipelineInstance was started in gitlab as a pipeline`() {
        Thread.sleep(800)
        val pipelines = gitlabRestClient.getPipelines(accessToken, codeProjectDto.gitlabId)
        assertThat(pipelines).isNotNull
        assertThat(pipelines).isNotEmpty
        gitlabPipeline = pipelines.first { it.ref == "publish" }
    }

    @Test
    fun `E02-02 Gitlab runners working = Pipeline should be started after some seconds`() {
        var pipelineStarted = false
        var iteration = 0
        var pipelineStatus = ""
        val seconds = 6
        while (iteration < 10 && !pipelineStarted) {
            val pipeline = gitlabRestClient.getPipeline(accessToken, codeProjectDto.gitlabId, gitlabPipeline.id)
            pipelineStatus = pipeline.status.toString().toLowerCase()
            pipelineStarted = pipelineStatus != "pending"
            println("Sleep for $seconds seconds -> current pipeline status : $pipelineStatus")
            Thread.sleep((seconds * 1000).toLong())
            iteration++
        }
        if (!pipelineStarted) {
            fail("PIPELINES NOT RUNNING: After $iteration iterations with $seconds s (${iteration * seconds}s total), the pipeline status is still: $pipelineStatus")
        }
    }

    @Test
    fun `E02-03 Gitlab runners success = Pipeline should succeed after some seconds`() {
        var pipelineStatus = ""
        val pipeline = gitlabRestClient.getPipeline(accessToken, codeProjectDto.gitlabId, gitlabPipeline.id)
        assertThat(pipeline).isNotNull
        pipelineStatus = pipeline.status.toString().toLowerCase()
        assertThat(pipelineStatus).isNotEqualTo("failed")
    }
}
