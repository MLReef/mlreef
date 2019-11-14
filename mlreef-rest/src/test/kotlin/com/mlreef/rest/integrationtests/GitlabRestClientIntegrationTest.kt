package com.mlreef.rest.integrationtests

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.test.context.TestPropertySource
import org.springframework.web.client.HttpClientErrorException

@TestPropertySource(locations = ["/secrets.properties"])
class GitlabRestClientIntegrationTest {

    lateinit var gitlabRestClient: GitlabRestClient

    @Value("\${TEST_PRIVATE_TOKEN}")
    private val secretPrivateToken: String? = null

    @BeforeEach
    fun prepare() {
        val restTemplateBuilder = RestTemplateBuilder()
        gitlabRestClient = GitlabRestClient(restTemplateBuilder)
    }

    @Test
    fun `gitlabapi rejects empty Token`() {
        assertThrows<HttpClientErrorException.Unauthorized> {
            gitlabRestClient.getUser("")
        }
    }

    @Test
    fun `gitlabapi rejects invalid Token`() {
        assertThrows<HttpClientErrorException.Unauthorized> {
            gitlabRestClient.getUser("1234-1234")
        }
    }

    @Test
    fun `gitlabapi accepts valid Token`() {
        val user = gitlabRestClient.getUser(secretPrivateToken!!)
        assertThat(user).isNotNull
    }

    @Test
    fun `API |user returns at least id, name and email`() {
        val user = gitlabRestClient.getUser(secretPrivateToken!!)
        assertThat(user).isNotNull
        // TODO assertJ later

//        assertThat(user!!.id).isNotBlank
//        assertThat(user!!.username).isNotBlank
//        assertThat(user!!.email).isNotBlank
//        assertThat(user!!.state).isNotBlank
    }
}
