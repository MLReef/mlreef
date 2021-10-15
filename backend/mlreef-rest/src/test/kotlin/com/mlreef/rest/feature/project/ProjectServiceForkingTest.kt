package com.mlreef.rest.feature.project

import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.ProjectsConfiguration
import com.mlreef.rest.domain.*
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import io.mockk.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime.now
import java.util.*

internal open class ProjectServiceForkingTest {

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
        visibilityScope = VisibilityScope.PUBLIC,
        processorType = ProcessorType(UUID.randomUUID(), "Type")
    )

    private val repoMock: CodeProjectRepository = mockk {
        every { this@mockk.findByIdOrNull(originalCodeProject.id) } answers { originalCodeProject }
        every { this@mockk.findByOwnerIdAndForkParent(any(), any()) } returns null
        //let the save function return the same entity that was saved
        every { this@mockk.save(any()) } answers { this.arg(0) }
    }

    private val projectsConfiguration = ProjectsConfiguration(
        false, 1, 1
    )

//    private val repoMock: CodeProjectRepository = mockk {
//        every { this@mockk.findByIdOrNull(originalCodeProject.id) } answers { originalCodeProject }
//        //let the save function return the same entity that was saved
//        every { this@mockk.save(any()) } answers { this.arg(0) }
//    }

    private val gitlabRestClientMock: GitlabRestClient = mockk {
        val sourceId = slot<Long>()
        every { this@mockk.forkProject(any(), capture(sourceId), any(), any()) } answers {
            GitlabProject(
                id = sourceId.captured + 1, // The forked Gitlab project will have a different id than the original
                name = "targetName.captured",
                nameWithNamespace = "Forking Namespace / Forking Name",
                path = "forking-path",
                pathWithNamespace = "forking-namespace/forking-path",
                visibility = GitlabVisibility.PUBLIC,
            )
        }
    }

    private val codeProjectService: ProjectService<CodeProject> = ProjectServiceImpl(
        baseClass = CodeProject::class.java,
        repository = repoMock,
        publicProjectsCacheService = mockk(),
        gitlabRestClient = gitlabRestClientMock,
        reservedNamesService = mockk(),
        accountRepository = mockk(),
        groupRepository = mockk(),
        userResolverService = mockk(),
        dataTypesRepository = mockk(),
        processorTypeRepository = mockk(),
        projectsConfiguration = projectsConfiguration,
        filesManagementService = mockk(),
    )


    @Transactional
    @Rollback
    @Test
    open fun `Can fork CodeProject`() = `Can fork project`(originalCodeProject)

    @Transactional
    @Rollback
    open fun `Can fork project`(original: Project) {
        // Capture what is saved to the repository
        val capture = slot<CodeProject>()
        every { repoMock.save(capture(capture)) } answers { this.arg(0) }
        val ret = codeProjectService.forkProject(userToken = "test-token", creator = Account(UUID.randomUUID(), username = "account", email="account@mlreef.com", passwordEncrypted = "password", slug = "slug-slug-slug", name = "Name", gitlabId = 2948492L), originalId = original.id)
        verify {
            repoMock.findByOwnerIdAndForkParent(ret.ownerId, original)
            repoMock.findById(original.id)
            gitlabRestClientMock.forkProject(
                token = "test-token",
                sourceId = original.gitlabId,
                targetName = any(),
                targetPath = any(),
            )
            repoMock.save(any())
        }
        // makes sure all calls were covered with verification
        confirmVerified(gitlabRestClientMock)
        confirmVerified(repoMock)

        // assert that what was saved is what was returned
        with(capture.captured) {
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
