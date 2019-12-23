package com.mlreef.rest.integrationtests

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.test.context.ConfigFileApplicationContextInitializer
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import org.springframework.web.client.HttpClientErrorException

@SpringJUnitConfig(initializers = [ConfigFileApplicationContextInitializer::class])
@ActiveProfiles(ApplicationProfiles.TEST)
class GitlabRestClientIntegrationTest {

    lateinit var gitlabRestClient: GitlabRestClient

    @Value("\${mlreef.gitlab.adminUserToken}")
    private lateinit var adminUserToken: String

    @Value("\${mlreef.gitlab.rootUrl}")
    lateinit var gitlabSocket: String

    @BeforeEach
    fun prepare() {
        val restTemplateBuilder = RestTemplateBuilder()
        gitlabRestClient = GitlabRestClient(restTemplateBuilder, gitlabSocket, adminUserToken)
    }

    @Disabled
    @Test
    fun `gitlabapi rejects empty Token`() {
        assertThrows<HttpClientErrorException.Unauthorized> {
            gitlabRestClient.getUser("")
        }
    }

    @Disabled
    @Test
    fun `gitlabapi rejects invalid Token`() {
        assertThrows<HttpClientErrorException.Unauthorized> {
            gitlabRestClient.getUser("1234-1234")
        }
    }

    @Disabled
    @Test
    fun `gitlabapi accepts valid Token`() {
        val user = gitlabRestClient.getUser(adminUserToken)
        assertThat(user).isNotNull
    }

    @Test
    @Disabled
    fun `API |user returns at least id, name and email`() {
        val user = gitlabRestClient.getUser(adminUserToken)
        assertThat(user).isNotNull

        assertThat(user.username).isNotBlank()
        assertThat(user.email).isNotBlank()
        assertThat(user.state).isNotBlank()
    }
}
