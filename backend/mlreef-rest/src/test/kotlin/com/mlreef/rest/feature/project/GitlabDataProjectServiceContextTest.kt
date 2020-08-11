package com.mlreef.rest.feature.project

import com.mlreef.rest.DataProject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.AbstractContextTest
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.testcommons.ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT
import com.mlreef.rest.testcommons.EntityMocks
import com.ninjasquad.springmockk.SpykBean
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import java.util.UUID
import kotlin.random.Random

class GitlabDataProjectServiceContextTest : AbstractContextTest() {
    @SpykBean
    private lateinit var service: ProjectService<DataProject>

    @Test
    @Disabled
    fun `test create project`() {
        val slugSlot = slot<String>()
        val projectNameSlot = slot<String>()
        val visibilitySlot = slot<String>()
        var gitlabProject: GitlabProject? = null

        every {
            gitlabRestClient.createProject(
                token = any(),
                slug = capture(slugSlot),
                name = capture(projectNameSlot),
                defaultBranch = any(),
                nameSpaceId = any(),
                description = any(),
                visibility = capture(visibilitySlot),
                initializeWithReadme = any()
            )
        } answers {
            gitlabProject = GitlabProject(
                Random.nextLong(),
                projectNameSlot.captured,
                "test-name-withnamespace",
                slugSlot.captured,
                "tes-path-with-namespace",
                GitlabUser(1L, "testusername", "testuser"),
                1L,
                visibility = GitlabVisibility.valueOf(visibilitySlot.captured.toUpperCase())
            )
            gitlabProject!!
        }

        every {
            gitlabRestClient.adminGetProject(any())
        } answers { gitlabProject!! }

        val result = service.createProject(
            "test-token",
            UUID.randomUUID(),
            "test-slug",
            "test-name",
            "test-namespace",
            "Description",
            VisibilityScope.PUBLIC,
            true,
            listOf()
        )

        assertThat(result.slug).isEqualTo("test-slug")
        assertThat(result.name).isEqualTo("test-name")

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }
        verify(exactly = 0, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }
    }

    @Test
    fun `test update project name without visibility change`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = EntityMocks.dataProject(ownerId)
        dataProjectRepository.save(dataProject)

        val projectNameSlot = slot<String>()
        var gitlabProject: GitlabProject? = null

        every {
            gitlabRestClient.userUpdateProject(
                id = eq(dataProject.gitlabId),
                token = any(),
                name = capture(projectNameSlot),
                description = any(),
                visibility = isNull()
            )
        } answers {
            gitlabProject = GitlabProject(
                dataProject.gitlabId,
                projectNameSlot.captured,
                "test-name-withnamespace",
                dataProject.slug,
                "tes-path-with-namespace",
                GitlabUser(1L, "testusername", "testuser"),
                1L,
                visibility = GitlabVisibility.valueOf(dataProject.visibilityScope.name.toUpperCase())
            )
            gitlabProject!!
        }

        every {
            gitlabRestClient.adminGetProject(any())
        } answers { gitlabProject!! }

        every {
            gitlabRestClient.unauthenticatedGetAllPublicProjects()
        } answers { listOf(gitlabProject!!) }

        //when
        val result = service.updateProject(
            "test-token",
            ownerId,
            dataProject.id,
            "new-test-name",
            "New Test Description"
        )

        //then
        assertThat(result.slug).isEqualTo(dataProject.slug)
        assertThat(result.name).isEqualTo("new-test-name")

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }

        verify(exactly = 0, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }
    }

    @Test
    fun `test update project name with visibility change from PRIVATE to PUBLIC`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = EntityMocks.dataProject(ownerId, visibilityScope = VisibilityScope.PRIVATE)
        dataProjectRepository.save(dataProject)

        val visibilitySlot = slot<String>()
        var gitlabProject: GitlabProject? = null

        every {
            gitlabRestClient.userUpdateProject(
                id = eq(dataProject.gitlabId),
                token = any(),
                name = any(),
                description = any(),
                visibility = capture(visibilitySlot)
            )
        } answers {
            gitlabProject = GitlabProject(
                dataProject.gitlabId,
                dataProject.name,
                "test-name-withnamespace",
                dataProject.slug,
                "tes-path-with-namespace",
                GitlabUser(1L, "testusername", "testuser"),
                1L,
                visibility = GitlabVisibility.valueOf(visibilitySlot.captured.toUpperCase())
            )
            gitlabProject!!
        }

        every {
            gitlabRestClient.adminGetProject(any())
        } answers { gitlabProject!! }

        every {
            gitlabRestClient.unauthenticatedGetAllPublicProjects()
        } answers { listOf(gitlabProject!!) }

        //when
        val result = service.updateProject(
            "test-token",
            ownerId,
            dataProject.id,
            visibility = VisibilityScope.PUBLIC
        )

        //then
        assertThat(result.slug).isEqualTo(dataProject.slug)
        assertThat(result.name).isEqualTo(dataProject.name)

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }

        verify(exactly = 0, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }
    }

    @Test
    fun `test update project name with visibility change from PUBLIC to PRIVATE`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = EntityMocks.dataProject(ownerId, visibilityScope = VisibilityScope.PUBLIC)
        dataProjectRepository.save(dataProject)
        publicProjectRepository.save(PublicProjectHash(dataProject.gitlabId, dataProject.id))

        val visibilitySlot = slot<String>()
        var gitlabProject: GitlabProject? = null

        every {
            gitlabRestClient.userUpdateProject(
                id = eq(dataProject.gitlabId),
                token = any(),
                name = any(),
                description = any(),
                visibility = capture(visibilitySlot)
            )
        } answers {
            gitlabProject = GitlabProject(
                dataProject.gitlabId,
                dataProject.name,
                "test-name-withnamespace",
                dataProject.slug,
                "tes-path-with-namespace",
                GitlabUser(1L, "testusername", "testuser"),
                1L,
                visibility = GitlabVisibility.valueOf(visibilitySlot.captured.toUpperCase())
            )
            gitlabProject!!
        }

        every {
            gitlabRestClient.adminGetProject(any())
        } answers { gitlabProject!! }

        every {
            gitlabRestClient.unauthenticatedGetAllPublicProjects()
        } answers { listOf(gitlabProject!!) }

        //when
        val result = service.updateProject(
            "test-token",
            ownerId,
            dataProject.id,
            visibility = VisibilityScope.PRIVATE
        )

        //then
        assertThat(result.slug).isEqualTo(dataProject.slug)
        assertThat(result.name).isEqualTo(dataProject.name)

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }

        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }
    }

    /**
     * Broken without Change?
     */
    @Disabled
    @Test
    fun `test delete project`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = EntityMocks.dataProject(ownerId, visibilityScope = VisibilityScope.PUBLIC)
        dataProjectRepository.save(dataProject)
        publicProjectRepository.save(PublicProjectHash(dataProject.gitlabId, dataProject.id))

        val visibilitySlot = slot<String>()

        every {
            gitlabRestClient.deleteProject(
                id = eq(dataProject.gitlabId),
                token = any()
            )
        } just Runs

        every {
            gitlabRestClient.unauthenticatedGetAllPublicProjects()
        } answers { listOf() }

        //when
        service.deleteProject(
            "test-token",
            ownerId,
            dataProject.id
        )

        //then
        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(dataProject.gitlabId, dataProject.id))
            )
        }

        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(dataProject.gitlabId, dataProject.id))
            )
        }
    }
}