package com.mlreef.rest.feature

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.Subject
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
import com.mlreef.rest.external_api.gitlab.dto.RepositoryFile
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTree
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTreePaged
import com.mlreef.rest.feature.data_processors.DataProcessorService
import com.mlreef.rest.feature.data_processors.PythonParserService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.service.AbstractServiceTest
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.MockkBean
import io.mockk.confirmVerified
import io.mockk.every
import io.mockk.spyk
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import org.springframework.util.Base64Utils
import java.io.InputStream
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

    @Autowired
    private lateinit var dataProcessorService: DataProcessorService

    @MockkBean
    private lateinit var gitlabClient: GitlabRestClient

    @Autowired
    private lateinit var pythonParserService: PythonParserService


    lateinit var subject: Subject
    lateinit var project: CodeProject

    private lateinit var service: PublishingService

    @Transactional
    @BeforeEach
    internal fun setUp() {
        service = spyk(
            PublishingService(
                gitlabRestClient = gitlabClient,
                projectResolverService,
                dataProcessorService,
                pythonParserService,
            ),
            recordPrivateCalls = true
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

        every {
            gitlabClient.adminGetProjectTree(any(), any(), any(), any())
        } answers {
            RepositoryTreePaged(
                listOf(
                    RepositoryTree(
                        id = UUID.randomUUID().toString(),
                        name = "main.py",
                        type = RepositoryTreeType.BLOB,
                        path = "main.py",
                        mode = "rw"
                    ),
                    RepositoryTree(
                        id = UUID.randomUUID().toString(),
                        name = "main.pyt",
                        type = RepositoryTreeType.BLOB,
                        path = "main.pyt",
                        mode = "rw"
                    ),
                ),
                page = 1,
                totalPages = 1,
                totalElements = 2,
                perPage = 10
            )
        }

        every {
            gitlabClient.adminGetRepositoryFileContent(any(), any())
        } answers {
            val filename = "resnet_annotations_demo.py"
            val content = javaClass.classLoader.getResource(filename)!!.content as InputStream

            RepositoryFile(
                sha = UUID.randomUUID().toString(),
                size = 100L,
                encoding = "Base64",
                content = Base64Utils.encodeToString(content.readBytes())
            )
        }
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

        service.startPublishing(userToken = token, projectId = project.id, mainFilePath = null)

        verify(exactly = 1) {
            gitlabClient.commitFiles(
                token = token,
                projectId = project.gitlabId,
                targetBranch = TARGET_BRANCH,
                // verify that the first commit does **NOT** start the CI pipeline
                commitMessage = match { !it.contains("[skip ci]") },
                fileContents = match {
                    it.containsKey(MLREEF_NAME)
                        && it.containsKey(DOCKERFILE_NAME)
//                        && it[MLREEF_NAME]?.contains(project.name) ?: false
                        && it[MLREEF_NAME]?.contains("job:") ?: false
                        && it[MLREEF_NAME]?.contains("image:") ?: false
                        && it[MLREEF_NAME]?.contains("script:") ?: false
                        && it[DOCKERFILE_NAME]?.contains(EPF_DOCKER_IMAGE) ?: false
                        && it[DOCKERFILE_NAME]?.contains("main.py") ?: false

                },
                action = "create"
            )
        }
        verify(exactly = 1) {
            gitlabClient.adminGetProjectTree(any(), any(), any(), any())
        }

        verify(exactly = 1) {
            gitlabClient.adminGetRepositoryFileContent(any(), any())
        }

        confirmVerified(gitlabClient)
    }
}

