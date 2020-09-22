package com.mlreef.rest.v1.system

import com.mlreef.rest.DataType
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestMethodOrder
import org.springframework.http.ResponseEntity

@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@DisplayName("D: Experiments")
@Tag(value = SystemTestTags.SYSTEM)
class E_Publishing_Data_Processor_Test : AbstractSystemTest() {

    companion object {
        lateinit var accessToken: String
        lateinit var currentUser: SecretUserDto

        lateinit var ownCodeProjectDto: CodeProjectDto
    }

    @Test
    fun `E00 Prepare new User & Login `() {
        val returnedResult = prepareCurrentUser(globalRandomUserName, globalEmail, globalRandomPassword)
        Thread.sleep(1000)
        accessToken = returnedResult.accessToken ?: returnedResult.token!!
        currentUser = returnedResult
        Thread.sleep(2000)
    }

    @Test
    fun `E01 Can create Code Project`() {
        val request = ProjectCreateRequest(
            slug = "test-code-project-e",
            namespace = currentUser.username,
            name = "Test Code Project E",
            description = "description",
            initializeWithReadme = true,
            inputDataTypes = listOf(DataType.IMAGE),
            visibility = VisibilityScope.PUBLIC
        )

        val response: ResponseEntity<CodeProjectDto> = backendRestClient.post("/projects/code", accessToken, request)
        ownCodeProjectDto = response.expectOk().returns()

        assertThat(ownCodeProjectDto).isNotNull
    }

    @Test
    fun `E02 Can trigger basic publishing process `() {
    }

    @Test
    fun `E03 Pipeline has finished successfully `() {
    }

    @Test
    fun `E04 Docker image-latest is available via Gitlab API`() {
    }

    @Test
    fun `E05 Latest Data Processor version and Docker image are available`() {
    }

}
