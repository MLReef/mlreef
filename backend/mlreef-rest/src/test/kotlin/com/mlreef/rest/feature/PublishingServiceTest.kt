package com.mlreef.rest.feature

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import io.mockk.confirmVerified
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test


internal class PublishingServiceTest {

    private val gitlabClient: GitlabRestClient = mockk()
    private val service = PublishingService(
        gitlabRestClient = gitlabClient
    )

    @Test
    fun `Can find Dockerfile template`() {
        assertThat(service.dockerfileTemplate).isNotEmpty()
        assertThat(service.dockerfileTemplate).isNotBlank()
    }

    @Test
    fun `Can start publishing pipeline`() {
        val token = "test-token"
        val projectId = -1L
        service.startPublishing(userToken = token, projectId = projectId)

        verify {
            gitlabClient.commitFiles(
                token = token,
                projectId = projectId,
                targetBranch = TARGET_BRANCH,
                commitMessage = any(),
                fileContents = any(),
                action = "create"
            )
        }
        confirmVerified(gitlabClient)
    }
}
