package com.mlreef.rest.integrationtests

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.assertj.core.api.Assertions.assertThat
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.web.client.HttpClientErrorException

@RunWith(SpringRunner::class)
@TestPropertySource(locations = ["/secrets.properties"])
class GitlabRestClientIntegrationTest {

    lateinit var gitlabRestClient: GitlabRestClient

    @Value("\${TEST_PRIVATE_TOKEN}")
    private val secretPrivateToken: String? = null

    @Before
    fun prepare() {
        val restTemplateBuilder = RestTemplateBuilder()
        gitlabRestClient = GitlabRestClient(restTemplateBuilder)
    }

    @Test(expected = HttpClientErrorException.Unauthorized::class)
    fun `gitlabapi rejects empty Token`() {
        gitlabRestClient.getUser("")
    }

    @Test(expected = HttpClientErrorException.Unauthorized::class)
    fun `gitlabapi rejects invalid Token`() {
        gitlabRestClient.getUser("1234-1234")
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
        assertThat(user?.id).isNotBlank()
        assertThat(user?.username).isNotBlank()
        assertThat(user?.email).isNotBlank()
        assertThat(user?.state).isNotBlank()
    }
}
