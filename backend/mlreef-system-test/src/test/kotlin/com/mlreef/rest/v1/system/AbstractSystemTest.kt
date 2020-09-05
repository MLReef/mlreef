package com.mlreef.rest.v1.system

import com.mlreef.rest.ApplicationConfiguration
import com.mlreef.rest.EpfConfiguration
import com.mlreef.rest.GitlabConfiguration
import com.mlreef.rest.api.v1.GroupCreateRequest
import com.mlreef.rest.api.v1.LoginRequest
import com.mlreef.rest.api.v1.RegisterRequest
import com.mlreef.rest.api.v1.dto.GroupDto
import com.mlreef.rest.api.v1.dto.GroupOfUserDto
import com.mlreef.rest.api.v1.dto.SecretUserDto
import com.mlreef.rest.config.MLReefObjectMapper
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.v1.system.ScenarioState.globalEmail
import com.mlreef.rest.v1.system.ScenarioState.globalRandomPassword
import com.mlreef.rest.v1.system.ScenarioState.globalRandomUserName
import org.assertj.core.api.Assertions
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.api.GitCommand
import org.eclipse.jgit.api.TransportCommand
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.MethodOrderer
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Tags
import org.junit.jupiter.api.TestMethodOrder
import org.junit.jupiter.api.io.TempDir
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.StringHttpMessageConverter
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import java.io.File
import java.nio.charset.Charset

object ScenarioState {
    val globalRandomUserName = RandomUtils.generateRandomUserName(10)
    val globalRandomPassword = RandomUtils.generateRandomPassword(30, true)
    val globalEmail = "$globalRandomUserName@example.com"
}

object SystemTestTags {
    const val SLOW = "slow"
    const val PIPELINE = "pipeline"
    const val SYSTEM = "system"
}

@Tags(value = [Tag(SystemTestTags.SLOW)])
@TestMethodOrder(value = MethodOrderer.Alphanumeric::class)
open class AbstractSystemTest() {

    lateinit var objectMapper: MLReefObjectMapper
    protected lateinit var gitlabRestClient: GitlabRestClient

    protected lateinit var backendRestClient: GenericRestClient

    @TempDir
    lateinit var tempFolder: File

    protected lateinit var MLREEF_BACKEND_URL: String
    protected lateinit var GITLAB_ROOT_URL: String
    protected lateinit var GITLAB_ADMIN_TOKEN: String
//    protected lateinit var GITLAB_ADMIN_USERNAME: String
//    protected lateinit var GITLAB_ADMIN_PASSWORD: String

    @BeforeEach
    fun prepare() {

        MLREEF_BACKEND_URL = System.getenv("MLREEF_BACKEND_URL")
        GITLAB_ROOT_URL = System.getenv("GITLAB_ROOT_URL")
        GITLAB_ADMIN_TOKEN = System.getenv("GITLAB_ADMIN_TOKEN")
//        GITLAB_ADMIN_USERNAME = System.getenv("GITLAB_ADMIN_USERNAME")
//        GITLAB_ADMIN_PASSWORD = System.getenv("GITLAB_ADMIN_PASSWORD")

        GITLAB_ROOT_URL = useCorrectUrl(GITLAB_ROOT_URL)
        MLREEF_BACKEND_URL = useCorrectUrl(MLREEF_BACKEND_URL)
        val conf = ApplicationConfiguration(
            EpfConfiguration().apply {
                imageTag = "latest"
                backendUrl = MLREEF_BACKEND_URL
                gitlabUrl = GITLAB_ROOT_URL
            },
            GitlabConfiguration().apply {
                rootUrl = GITLAB_ROOT_URL
                adminUserToken = GITLAB_ADMIN_TOKEN
                adminUsername = "GITLAB_ADMIN_USERNAME" //FIXME
                adminPassword = "GITLAB_ADMIN_PASSWORD" //FIXME
            })

        objectMapper = MLReefObjectMapper()
        val jsonConverter = MappingJackson2HttpMessageConverter(objectMapper)
        val stringConverter = StringHttpMessageConverter(Charset.defaultCharset())
//        converter.supportedMediaTypes = listOf(MediaType.APPLICATION_JSON,MediaType.TEXT_PLAIN)
        val builder = RestTemplateBuilder().messageConverters(jsonConverter, stringConverter)
        gitlabRestClient = GitlabRestClient(conf, builder)
        backendRestClient = GenericRestClient(MLREEF_BACKEND_URL, builder)
    }

    private fun useCorrectUrl(url: String): String {
        return if (!url.startsWith("https://") && !url.startsWith("http://")) {
            "http://$url" //FIXME:using http:// as default right now
        } else {
            url
        }
    }

    protected fun prepareCurrentUser(
        username: String = globalRandomUserName,
        email: String = globalEmail,
        password: String = globalRandomPassword
    ): SecretUserDto {
        try {
            val prepare: ResponseEntity<SecretUserDto> = backendRestClient.post(
                "/auth/register",
                body = RegisterRequest(username, email, password, "name"))
            prepare.expectOk()
        } catch (ignore: Exception) {
            ignore.printStackTrace()
        }

        val loginRequest = LoginRequest(username, email, password)
        val response: ResponseEntity<SecretUserDto> = backendRestClient.post("/auth/login", body = loginRequest)
        return response.expectOk().returns()
    }

    protected fun prepareCurrentGroup(
        accessToken: String,
        groupName: String,
    ): GroupDto {
        return try {
            val registerRequest = GroupCreateRequest(groupName, "unused", groupName)
            val response: ResponseEntity<GroupDto> = backendRestClient.post("/groups", accessToken, registerRequest)
            val returnedResult = response.expectOk()
            returnedResult.returns()
        } catch (ignore: Exception) {
            ignore.printStackTrace()

            val response: ResponseEntity<List<GroupOfUserDto>> = backendRestClient.get("/groups/my", accessToken)
            val lists = response.expectOk().body ?: listOf()
            val first = lists.first { it.name == groupName }
            GroupDto(first.id, first.name, first.gitlabId)
        }
    }

    fun <T> ResponseEntity<T>.expectOk(): ResponseEntity<T> {
        Assertions.assertThat(this.statusCode).isEqualTo(HttpStatus.OK)
        return this
    }

    fun <T> ResponseEntity<T>.returns(): T {
        return this.body!!
    }

    fun <T> ResponseEntity<*>.returnsList(clazz: Class<T>): List<T> {
        return if (body is List<*>) {
            val items = this.body as List<*>
            return items.map {
                objectMapper.convertValue(it, clazz)
            }
        } else {
            arrayListOf()
        }
    }

    protected fun fixDockerUrlProblems(url: String): String {
        return url.replace("gitlab:", "localhost:")
    }

    protected fun sanitizeWrongEnvUrl(epfPipelineUrl: String): String {
        return if (epfPipelineUrl.startsWith("http://")
            || epfPipelineUrl.startsWith("https://")) {
            epfPipelineUrl
        } else {
            "http://$epfPipelineUrl"
        }
    }

    protected fun prepareGit(url: String): Pair<File, Git> {
        val url = fixDockerUrlProblems(url)
        val newFolder = File(tempFolder, "repo").apply { mkdir() }
        val repo = prepareGit(url, newFolder)
        return Pair(newFolder, repo)
    }

    protected fun prepareGit(
        url: String,
        newFolder: File,
        username: String = globalRandomUserName,
        password: String = globalRandomPassword
    ) = Git.cloneRepository()
        .setCredentialsProvider(credentialsProvider(username, password))
        .setURI(url)
        .setDirectory(newFolder)
        .call()

    protected fun credentialsProvider(
        username: String = globalRandomUserName,
        password: String = globalRandomPassword) = UsernamePasswordCredentialsProvider(username, password)

    protected fun <C : GitCommand<C>, T> TransportCommand<C, T>.withCp(
        username: String = globalRandomUserName,
        password: String = globalRandomPassword
    ): C {
        return this.setCredentialsProvider(UsernamePasswordCredentialsProvider(username, password))
    }

    protected fun sleep(time: Long = 500) {
        Thread.sleep(time)
    }
}


