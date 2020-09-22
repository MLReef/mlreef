package com.mlreef.rest.v1.system

import com.mlreef.rest.DataType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.ProjectUserMembershipRequest
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.junit.jupiter.api.assertThrows
import org.springframework.http.ResponseEntity

@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("B: DataProject 05-08 Permissions")
@Tag(value = SystemTestTags.SYSTEM)
class B2_DataProject_Permission_Test : AbstractSystemTest() {

    companion object {
        // advanced user & project test
        lateinit var userA: SecretUserDto
        lateinit var userA_token: String
        lateinit var userB: SecretUserDto
        lateinit var userB_token: String
        lateinit var userC: SecretUserDto
        lateinit var userC_token: String

        // projects
        lateinit var projectA1private: DataProjectDto
        lateinit var projectA2shared: DataProjectDto
        lateinit var projectA3public: DataProjectDto
    }

    @Test
    fun `B00 Prepare Users`() {
        // User A
        val userAUsername = "user-B-" + RandomUtils.generateRandomUserName(6)
        userA = prepareCurrentUser(userAUsername, "$userAUsername@example.com", globalRandomPassword)
        userA_token = userA.accessToken ?: userA.token!!

        // User A
        val userBUsername = "user-B-" + RandomUtils.generateRandomUserName(6)
        userB = prepareCurrentUser(userBUsername, "$userBUsername@example.com", globalRandomPassword)
        userB_token = userB.accessToken ?: userB.token!!

        // User A
        val userCUsername = "user-B-" + RandomUtils.generateRandomUserName(6)
        userC = prepareCurrentUser(userCUsername, "$userCUsername@example.com", globalRandomPassword)
        userC_token = userC.accessToken ?: userC.token!!
    }

    @Test
    fun `B05-00 OWN - Prepare`() {
        // B05 Private
        val request = ProjectCreateRequest(
            "user-A-A1-private",
            userA.username,
            "Project A1 Private",
            "",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PRIVATE
        )

        val response: ResponseEntity<DataProjectDto> = backendRestClient.post("/projects/data", userA_token, request)
        projectA1private = response.expectOk().returns()
        assertThat(projectA1private).isNotNull
    }

    @Test
    fun `B05-01 OWN - User A can find own private Project A1`() = projectA1private.let {
        userA_token.let { token ->
            findOne(token, it, true)
            findInAll(token, it, true)
            findInOwn(token, it, true)
            findInMy(token, it, true)
            findInPublic(token, it, false)
        }
    }

    @Test
    fun `B05-02 OWN - User B must not find A's private Project A1`() = projectA1private.let {
        userB_token.let { token ->
            findOne(token, it, false)
            findInAll(token, it, false)
            findInOwn(token, it, false)
            findInMy(token, it, false)
            findInPublic(token, it, false)
        }
    }

    @Test
    fun `B05-03 OWN - User C must not find A's private Project A1`() = projectA1private.let {
        userC_token.let { token ->
            findOne(token, it, false)
            findInAll(token, it, false)
            findInOwn(token, it, false)
            findInMy(token, it, false)
            findInPublic(token, it, false)
        }
    }

    @Test
    fun `B06-00 ACCESSIBLE - Prepare`() {
        val response1: ResponseEntity<DataProjectDto> = backendRestClient.post("/projects/data", userA_token, ProjectCreateRequest(
            "user-A-A2-shared",
            userA.username,
            "Project A2 SHARED",
            "",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PRIVATE
        ))
        projectA2shared = response1.expectOk().returns()
        assertThat(projectA2shared).isNotNull

        // Add User B to Project A2
        val url = "/projects/${projectA2shared.id}/users"
        val response2: ResponseEntity<List<UserInProjectDto>> = backendRestClient.post(url, userA_token, ProjectUserMembershipRequest(
            userId = userB.id
        ))
        val projectUsers = response2.expectOk().returnsList(UserInProjectDto::class.java)
        assertThat(projectUsers.map { it.userName }).contains(userB.username)
    }

    @Test
    fun `B06-01 ACCESSIBLE - User A can find own private Project A2`() = projectA2shared.let {
        userA_token.let { token ->
            findOne(token, it, true)
            findInAll(token, it, true)
            findInOwn(token, it, true)
            findInMy(token, it, true)
            findInPublic(token, it, false)
        }
    }

    @Test
    fun `B06-02 ACCESSIBLE - User B can find A's shared private Project A2`() = projectA2shared.let {
        userB_token.let { token ->
            findOne(token, it, true)
            findInAll(token, it, true)
            findInOwn(token, it, false)
            findInMy(token, it, true)
            findInPublic(token, it, false)
        }
    }

    @Test
    fun `B06-03 ACCESSIBLE - User C must not find A's private Project A2`() = projectA2shared.let {
        userC_token.let { token ->
            findOne(token, it, false)
            findInAll(token, it, false)
            findInOwn(token, it, false)
            findInMy(token, it, false)
            findInPublic(token, it, false)
        }
    }

    @Test
    fun `B07-00 PUBLIC - Prepare`() {
        val response: ResponseEntity<DataProjectDto> = backendRestClient.post("/projects/data", userA_token, ProjectCreateRequest(
            "user-A-A3-public",
            userA.username,
            "Project A3 PUBLIC",
            "",
            true,
            listOf(DataType.IMAGE),
            VisibilityScope.PUBLIC
        ))
        projectA3public = response.expectOk().returns()
        assertThat(projectA3public).isNotNull
    }

    @Test
    fun `B07-01 PUBLIC - User A can find own public Project A3`() = projectA3public.let {
        userA_token.let { token ->
            findOne(token, it, true)
            findInOwn(token, it, true)
            findInPublic(token, it, true)
            findInMy(token, it, true)
            findInAll(token, it, true)
        }
    }

    @Test
    fun `B07-02 PUBLIC - User B can find A's public Project A3`() = projectA3public.let {
        userB_token.let { token ->
            findOne(token, it, true)
            findInOwn(token, it, false)
            findInPublic(token, it, true)
            findInMy(token, it, false)
            findInAll(token, it, true)
        }
    }

    @Test
    fun `B07-03 PUBLIC - User C can find A's public Project A3`() = projectA3public.let {
        userC_token.let { token ->
            findOne(token, it, true)
            findInOwn(token, it, false)
            findInPublic(token, it, true)
            findInMy(token, it, false)
            findInAll(token, it, true)
        }
    }

    private fun findOne(token: String, projectToFind: DataProjectDto, success: Boolean) {
        val url = "/projects/" + projectToFind.id
        if (success) {
            val response: ResponseEntity<DataProjectDto> = backendRestClient.get(url, token)
            val project = response.expectOk().returns()
            assertThat(project).isNotNull
        } else {
            assertThrows {
                backendRestClient.get<DataProjectDto>(url, token)
            }
        }
    }

    private fun findInList(path: String, token: String, projectToFind: DataProjectDto, shouldSucceed: Boolean) {
        val response: ResponseEntity<List<ProjectDto>> = backendRestClient
            .get("/projects/$path", token)
        val list = response.expectOk().returnsList(ProjectDto::class.java)
        if (shouldSucceed) {
            assertThat(list).isNotNull
            assertThat(list).isNotEmpty
            assertThat(list.map { it.id }).contains(projectToFind.id)
        } else {
            assertThat(list).isNotNull
            assertThat(list.map { it.id }).doesNotContain(projectToFind.id)
        }
    }

    private fun findInAll(token: String, project: DataProjectDto, succeed: Boolean) = findInList("", token, project, succeed)
    private fun findInOwn(token: String, project: DataProjectDto, succeed: Boolean) = findInList("own", token, project, succeed)
    private fun findInMy(token: String, project: DataProjectDto, succeed: Boolean) = findInList("my", token, project, succeed)
    private fun findInPublic(token: String, project: DataProjectDto, succeed: Boolean) = findInList("public/all", token, project, succeed)

}

