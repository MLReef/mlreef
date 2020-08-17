package com.mlreef.rest.v1.system

import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.SystemTestConfiguration
import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.RegisterRequest
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Tags
import org.junit.jupiter.api.TestMethodOrder
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.io.TempDir
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.io.File

object ScenarioState {
    val globalRandomUserName = RandomUtils.generateRandomUserName(10)
    val globalRandomPassword = RandomUtils.generateRandomPassword(30, true)
    val globalEmail = "$globalRandomUserName@example.com"
}

@Tags(value = [Tag("system")])
@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
@ExtendWith(value = [SpringExtension::class])
@ActiveProfiles(ApplicationProfiles.SYSTEM_TEST)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class AbstractSystemTest() {

    @Autowired
    protected lateinit var gitlabRestClient: GitlabRestClient

    @Autowired
    protected lateinit var backendRestClient: GenericRestClient

    @Autowired
    protected lateinit var testConf: SystemTestConfiguration

    @Autowired
    protected lateinit var conf: ApplicationConfiguration

    @Autowired
    protected lateinit var objectMapper: ObjectMapper

    @TempDir
    lateinit var tempFolder: File

    protected fun prepareCurrentUser(
        username: String = globalRandomUserName,
        email: String = globalEmail,
        password: String = globalRandomPassword
    ): SecretUserDto {
        try {
            val prepare: ResponseEntity<SecretUserDto> = backendRestClient.post(
                "/auth/register",
                body = RegisterRequest(globalRandomUserName, globalEmail, globalRandomPassword, "name"))
            prepare.expectOk()
        } catch (ignore: Exception) {
            ignore.printStackTrace()
            // register not neccessary
        }

        val loginRequest = LoginRequest(globalRandomUserName, globalEmail, globalRandomPassword)
        val response: ResponseEntity<SecretUserDto> = backendRestClient.post("/auth/login", body = loginRequest)
        return response.expectOk().returns()
    }

    fun <T> ResponseEntity<T>.expectOk(): ResponseEntity<T> {
        Assertions.assertThat(this.statusCode).isEqualTo(HttpStatus.OK)
        return this
    }

    fun <T> ResponseEntity<T>.returns(): T {
        return this.body!!
    }

    protected fun fixUrl(url: String): String {
        return url.replace("gitlab:", "localhost:")
    }

    protected fun prepareGit(): Pair<File, Git> {
        val url = fixUrl(B_DataProject_Experiment_Test.ownDataProjectDto.url)
        val newFolder = File(tempFolder, "repo").apply { mkdir() }
        val repo = prepareGit(url, newFolder)
        return Pair(newFolder, repo)
    }

    protected fun prepareGit(
        url: String,
        newFolder: File,
        username: String = ScenarioState.globalRandomUserName,
        password: String = ScenarioState.globalRandomPassword
    ) = Git.cloneRepository()
        .setCredentialsProvider(credentialsProvider(username, password))
        .setURI(url)
        .setDirectory(newFolder)
        .call()

    protected fun credentialsProvider(
        username: String = ScenarioState.globalRandomUserName,
        password: String = ScenarioState.globalRandomPassword) = UsernamePasswordCredentialsProvider(username, password)

}


