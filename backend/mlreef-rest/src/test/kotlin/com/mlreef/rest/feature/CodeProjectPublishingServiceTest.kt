package com.mlreef.rest.feature

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import io.mockk.confirmVerified
import io.mockk.mockk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class CodeProjectPublishingServiceTest {

    private val gitlabClient: GitlabRestClient = mockk()

    private val service = PublishingService(
        gitlabRestClient = gitlabClient
    )

    @Test
    fun `Can find file templates`() {
        assertThat(dockerfileTemplate).isNotEmpty()
        assertThat(dockerfileTemplate).isNotBlank()
        assertThat(mlreefTemplate).isNotEmpty()
        assertThat(mlreefTemplate).isNotBlank()
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
                // verify that the first commit does **NOT** start the CI pipeline
                commitMessage = match { !it.contains("[skip ci]") },
                fileContents = match {
                    it.containsKey(MLREEF_NAME)
                        && it.containsKey(DOCKERFILE_NAME)
                        && it[MLREEF_NAME]?.contains("Hello World")
                        ?: throw NullPointerException()
                },
                action = "create"
            )
        }
        confirmVerified(gitlabClient)
    }

    @Test
    fun `Can render publishing YAML`() {
        with(generateCodePublishingYAML()) {
            assertThat(this).contains("job:")
            assertThat(this).contains("image:")
            assertThat(this).contains("script:")
        }
    }
}

