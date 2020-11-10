package com.mlreef.rest.feature.project

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.Project
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import io.mockk.confirmVerified
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import java.time.ZonedDateTime.*
import java.util.UUID
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull

internal class ProjectServiceForkingTest {

    private val originalCodeProject = CodeProject(
        id = UUID.randomUUID(),
        ownerId = UUID.randomUUID(),
        name = "Test Project",
        slug = "test-project",
        url = "test-url",
        description = "Test description",
        forksCount = 7,
        gitlabNamespace = "test-namespace",
        gitlabId = 1,
        gitlabPath = "test-project",
        createdAt = now().minusYears(1),
        updatedAt = now().minusMonths(1),
    )

    private val repoMock: CodeProjectRepository = mockk {
        every { this@mockk.findByIdOrNull(originalCodeProject.id) } answers { originalCodeProject }
        //let the save function return the same entity that was saved
        every { this@mockk.save(any()) } answers { this.arg(0) }
    }

    private val gitlabRestClientMock: GitlabRestClient = mockk()

    private val codeProjectService: ProjectService<CodeProject> = ProjectServiceImpl(
        baseClass = CodeProject::class.java,
        repository = repoMock,
        publicProjectsCacheService = mockk(),
        gitlabRestClient = gitlabRestClientMock,
        reservedNamesService = mockk(),
        accountRepository = mockk(),
        groupRepository = mockk(),
        subjectRepository = mockk()
    )


    @Test
    fun `Can fork CodeProject`() = `Can fork project`(originalCodeProject)

    private fun `Can fork project`(original: Project) {
        // Capture what is saved to the repository
        val capture = slot<CodeProject>()
        every { repoMock.save(capture(capture)) } answers { this.arg(0) }

        val ret = codeProjectService.forkProject(userToken = "test-token", originalId = original.id)
        verify {
            repoMock.findById(original.id)
            gitlabRestClientMock.forkProject("test-token", original.gitlabId)
            repoMock.save(any())
        }
        // makes sure all calls were covered with verification
        confirmVerified(gitlabRestClientMock)
        confirmVerified(repoMock)

        // assert that what was saved is what was returned
        with (capture.captured) {
            assertThat(id).isEqualTo(ret.id)
            assertThat(gitlabId).isEqualTo(ret.gitlabId)
        }

        // assert the forked project is different from the original
        with(ret) {
            // assert the forked project has a new id
            assertThat(id).isNotEqualTo(original.id)
            // assert that the forked project points to a different gitlab project
            assertThat(gitlabId).isNotEqualTo(original.gitlabId)
            // assertThat(this.gitlabId).isNotEqualTo(original.gitlabId)
            // ensure that the new project was created and updated "now"
            assertThat(createdAt).isBetween(now().minusMinutes(1), now().plusMinutes(1))
            assertThat(updatedAt).isBetween(now().minusMinutes(1), now().plusMinutes(1))
        }
    }
}
