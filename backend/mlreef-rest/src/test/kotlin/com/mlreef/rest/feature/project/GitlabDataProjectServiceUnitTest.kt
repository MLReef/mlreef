package com.mlreef.rest.feature.project

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import io.mockk.slot
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import java.util.UUID

@ExtendWith(MockKExtension::class)
internal class GitlabDataProjectServiceUnitTest {

    @MockK
    private lateinit var dataProjectRepository: DataProjectRepository

    @MockK
    private lateinit var accountRepository: AccountRepository

    @MockK
    private lateinit var publicProjectsCacheService: PublicProjectsCacheService

    @MockK
    private lateinit var gitlabRestClient: GitlabRestClient

    @MockK
    private lateinit var groupRepository: GroupRepository

    @MockK
    private lateinit var subjectRepository: SubjectRepository

    private lateinit var service: ProjectService<DataProject>

    @BeforeEach
    fun setUp() {
        service = ProjectServiceImpl(DataProject::class.java, dataProjectRepository, publicProjectsCacheService, gitlabRestClient, accountRepository, groupRepository, subjectRepository)
    }

    @Test
    internal fun `can create project`() {
        val dataProjectSlot = slot<DataProject>()
        val slugSlot = slot<String>()
        val projectNameSlot = slot<String>()

        every {
            dataProjectRepository.save(capture(dataProjectSlot))
        } answers {
            dataProjectSlot.captured
        }

        every {
            gitlabRestClient.createProject(
                token = any(),
                slug = capture(slugSlot),
                name = capture(projectNameSlot),
                defaultBranch = any(),
                nameSpaceId = any(),
                description = any(),
                visibility = any(),
                initializeWithReadme = any()
            )
        } answers {
            GitlabProject(
                1L,
                projectNameSlot.captured,
                "test-name-withnamespace",
                slugSlot.captured,
                "tes-path-with-namespace",
                GitlabUser(1L, "testusername", "testuser"),
                1L
            )
        }

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
    }
}