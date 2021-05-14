package com.mlreef.rest.feature.project

import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.AbstractContextTest
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.testcommons.ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT
import com.ninjasquad.springmockk.SpykBean
import io.mockk.Runs
import io.mockk.every
import io.mockk.just
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.annotation.Rollback
import java.util.UUID
import javax.transaction.Transactional

class GitlabDataProjectServiceContextTest : AbstractContextTest() {
    //    @SpykBean
    @Autowired
    private lateinit var service: ProjectService<DataProject>

    @SpykBean
    private lateinit var projectResolverService: ProjectResolverService

    @Test
    @Disabled
    @Transactional
    @Rollback
    fun `test create project`() {
        val slugSlot = slot<String>()
        val projectNameSlot = slot<String>()
        val visibilitySlot = slot<String>()
        var gitlabProject: GitlabProject? = null

        val gitlabId = 109L

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
                gitlabId,
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

        assertThat(result.gitlabId).isEqualTo(gitlabId)
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
    @Transactional
    @Rollback
    fun `test update project name without visibility change`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = createDataProject(
            ownerId = mainPerson.id,
            gitlabId = 110L,
        )

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

        //Because of transactional nature of tests the repository can not contain any entities because of trx rollback
        every {
            projectResolverService.resolveProject(projectId = any())
        } returns dataProject

        //when
        val result = service.updateProject(
            "test-token",
            ownerId,
            dataProject.id,
            "new-test-name",
            "New Test Description"
        )

        //then
        assertThat(result.gitlabId).isEqualTo(dataProject.gitlabId)
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
    @Transactional
    @Rollback
    fun `test update project name with visibility change from PRIVATE to PUBLIC`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = createDataProject(
            ownerId = mainPerson.id,
            gitlabId = 111L,
            visibility = VisibilityScope.PRIVATE,
        )

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

        //Because of transactional nature of tests the repository can not contain any entities because of trx rollback
        every {
            projectResolverService.resolveProject(projectId = any())
        } returns dataProject
        every {
            projectResolverService.resolveProject(projectGitlabId = any())
        } returns dataProject

        //when
        val result = service.updateProject(
            "test-token",
            ownerId,
            dataProject.id,
            visibility = VisibilityScope.PUBLIC
        )

        //then
        assertThat(result.gitlabId).isEqualTo(dataProject.gitlabId)
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
    @Transactional
    @Rollback
    fun `test update project name with visibility change from PUBLIC to PRIVATE`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = createDataProject(
            ownerId = mainPerson.id,
            gitlabId = 112L,
            visibility = VisibilityScope.PUBLIC,
        )

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

        //Because of transactional nature of tests the repository can not contain any entities because of trx rollback and async update
        every {
            projectResolverService.resolveProject(projectId = any())
        } returns dataProject
        every {
            projectResolverService.resolveProject(projectGitlabId = any())
        } returns dataProject

        //when
        val result = service.updateProject(
            "test-token",
            ownerId,
            dataProject.id,
            visibility = VisibilityScope.PRIVATE
        )

        //then
        assertThat(result.gitlabId).isEqualTo(dataProject.gitlabId)
        assertThat(result.slug).isEqualTo(dataProject.slug)
        assertThat(result.name).isEqualTo(dataProject.name)

        //Ensure that public project cache was updated
        // The test does work incorrectly
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
    @Transactional
    @Rollback
    fun `test delete project`() {
        //given
        val ownerId = UUID.randomUUID()
        val dataProject = createDataProject(ownerId = ownerId, visibility = VisibilityScope.PUBLIC)

        publicProjectRepository.save(PublicProjectHash(dataProject.gitlabId, dataProject.id))

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