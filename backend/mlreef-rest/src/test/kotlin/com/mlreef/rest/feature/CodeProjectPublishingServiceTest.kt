package com.mlreef.rest.feature

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.Subject
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.service.AbstractServiceTest
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.MockkBean
import io.mockk.confirmVerified
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.util.Random
import java.util.UUID
import kotlin.math.absoluteValue

internal class CodeProjectPublishingServiceTest : AbstractServiceTest() {

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var projectResolverService: ProjectResolverService

    @Autowired
    private lateinit var subjectRepository: SubjectRepository

    @MockkBean
    private lateinit var gitlabClient: GitlabRestClient

    lateinit var subject: Subject
    lateinit var project: CodeProject

    private lateinit var service: PublishingService

    @Transactional
    @BeforeEach
    internal fun setUp() {
        service = PublishingService(
            gitlabRestClient = gitlabClient,
            projectResolverService
        )

        subject = subjectRepository.save(
            Person(
                UUID.randomUUID(),
                "new-person-${UUID.randomUUID()}",
                "person's name-${UUID.randomUUID()}",
                Random().nextLong().absoluteValue,
                hasNewsletters = true,
                userRole = UserRole.DEVELOPER,
                termsAcceptedAt = ZonedDateTime.now()
            )
        )

        project = codeProjectRepository.save(
            CodeProject(
                UUID.randomUUID(),
                "new-project-${UUID.randomUUID()}",
                "url",
                "CodeProject-${UUID.randomUUID()}",
                "description",
                subject.id,
                RandomUtils.generateRandomUserName(10),
                RandomUtils.generateRandomUserName(10),
                Random().nextInt().toLong().absoluteValue,
                VisibilityScope.PUBLIC,
            )
        )
    }

    @Test
    fun `Can find file templates`() {
        assertThat(dockerfileTemplate).isNotEmpty()
        assertThat(dockerfileTemplate).isNotBlank()
        assertThat(mlreefTemplate).isNotEmpty()
        assertThat(mlreefTemplate).isNotBlank()
    }

    @Test
    @Transactional
    fun `Can start publishing pipeline`() {
        val token = "test-token"

        service.startPublishing(userToken = token, projectId = project.id)

        verify {
            gitlabClient.commitFiles(
                token = token,
                projectId = project.gitlabId,
                targetBranch = TARGET_BRANCH,
                // verify that the first commit does **NOT** start the CI pipeline
                commitMessage = match { !it.contains("[skip ci]") },
                fileContents = match {
                    it.containsKey(MLREEF_NAME)
                        && it.containsKey(DOCKERFILE_NAME)
//                        && it[MLREEF_NAME]?.contains(project.name)
//                        ?: throw NullPointerException()
                },
                action = "create"
            )
        }
        confirmVerified(gitlabClient)
    }

    @Test
    fun `Can render publishing YAML`() {
        with(service.generateCodePublishingYAML("Project")) {
            assertThat(this).contains("job:")
            assertThat(this).contains("image:")
            assertThat(this).contains("script:")
        }
    }
}

