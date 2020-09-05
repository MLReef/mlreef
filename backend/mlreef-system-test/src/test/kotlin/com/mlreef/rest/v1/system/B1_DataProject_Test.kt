package com.mlreef.rest.v1.system

import com.mlreef.rest.DataType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.GroupDto
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.springframework.http.ResponseEntity
import java.io.File

@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("B: DataProject 01-04")
@Tag(value = SystemTestTags.SYSTEM)
class B1_DataProject_Test : AbstractSystemTest() {

    companion object {
        lateinit var accessToken: String
        lateinit var currentUser: SecretUserDto
        lateinit var currentGroup: GroupDto
        lateinit var ownDataProjectDto: DataProjectDto
        lateinit var privateGroupProjectDto: DataProjectDto
    }

    @Test
    fun `B00 Prepare new User & Login `() {
        val returnedResult = prepareCurrentUser(globalRandomUserName, globalEmail, globalRandomPassword)
        sleep()
        accessToken = returnedResult.accessToken ?: returnedResult.token!!
        currentUser = returnedResult
    }

    @Test
    fun `B00-01 Prepare new Group `() {
        val returnedResult = prepareCurrentGroup(accessToken, RandomUtils.generateRandomUserName(10))
        sleep()
        currentGroup = returnedResult
    }

    @Test
    fun `B01 Can create own DataProject`() {
        val request = ProjectCreateRequest(
            "test-project-b",
            currentUser.username,
            "Test Project B",
            "description",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PUBLIC
        )

        val response: ResponseEntity<DataProjectDto> = backendRestClient.post("/projects/data", accessToken, request)
        ownDataProjectDto = response.expectOk().returns()

        assertThat(ownDataProjectDto).isNotNull
        assertThat(ownDataProjectDto.slug).isEqualTo("test-project-b")

        Thread.sleep(500)
    }

    @Test
    fun `B01-01 DataProject was created in gitlab`() {

        val userInProjectDto = gitlabRestClient.userGetUserInProject(accessToken, ownDataProjectDto.gitlabId, currentUser.gitlabId!!)
        assertThat(userInProjectDto).isNotNull

        val branch = gitlabRestClient.getBranch(accessToken, ownDataProjectDto.gitlabId, "master")
        assertThat(branch).isNotNull

        // FIXME: AWS GITLAB ENVs still wont support proper variables, but test succeeds locally
        // DO NOT DELETES THIS LINES. Just fix the ENVs for gods sake
//        val adminGetProject = gitlabRestClient.adminGetProject(ownDataProjectDto.gitlabId)
//        assertThat(adminGetProject).isNotNull
    }

    @Test
    fun `B01-02 Can use own DataProject as git repo`() {
        val (_, repo) = prepareGit(ownDataProjectDto.url)
        val call = repo.pull().call()
        assertThat(call).isNotNull
    }

    @Test
    fun `B02 Can update own DataProject as git repo`() {
        val (newFolder, repo) = prepareGit(ownDataProjectDto.url)
        repo.pull().call()

        val url = this.javaClass.getResource("/training-foto.png")
        val testFile = File(url.file)

        testFile.copyTo(File(newFolder.absolutePath + "/data/copy1.png"))
        testFile.copyTo(File(newFolder.absolutePath + "/data/copy2.png"))
        repo.add().addFilepattern("*").setUpdate(true).call()
        repo.commit().setMessage("commit").call()
        val call = repo.push().withCp().call()
        assertThat(call).isNotNull
    }

    @Test
    fun `B03 Can create group DataProject`() {
        val request = ProjectCreateRequest(
            "test-project-b-2",
            currentGroup.name,
            "Test Project B Group",
            "description",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PUBLIC
        )

        val response: ResponseEntity<DataProjectDto> = backendRestClient.post("/projects/data", accessToken, request)
        privateGroupProjectDto = response.expectOk().returns()
        assertThat(privateGroupProjectDto).isNotNull
        Thread.sleep(500)
    }

    @Disabled("disabled now for sanity")
    @Test
    fun `B03-01 Group DataProject was created in gitlab`() {

        val userInProjectDto = gitlabRestClient.userGetUserInProject(accessToken, privateGroupProjectDto.gitlabId, currentUser.gitlabId!!)
        assertThat(userInProjectDto).isNotNull

        val branch = gitlabRestClient.getBranch(accessToken, privateGroupProjectDto.gitlabId, "master")
        assertThat(branch).isNotNull
    }

    @Test
    fun `B03-02 Can use group DataProject as git repo`() {
        val (_, repo) = prepareGit(privateGroupProjectDto.url)
        val call = repo.pull().withCp().call()
        assertThat(call).isNotNull
    }

    @Test
    fun `B04 Can update group DataProject as git repo`() {
        val (newFolder, repo) = prepareGit(privateGroupProjectDto.url)
        repo.pull().withCp().call()

        val url = this.javaClass.getResource("/training-foto.png")
        val testFile = File(url.file)

        testFile.copyTo(File(newFolder.absolutePath + "/data/copy1.png"))
        testFile.copyTo(File(newFolder.absolutePath + "/data/copy2.png"))
        repo.add().addFilepattern("*").setUpdate(true).call()
        repo.commit().setMessage("commit").call()
        val call = repo.push().withCp().call()
        assertThat(call).isNotNull
    }

}
