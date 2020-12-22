package com.mlreef.rest.feature

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.Subject
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
import com.mlreef.rest.external_api.gitlab.dto.RepositoryFileFullInfo
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTree
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTreePaged
import com.mlreef.rest.feature.data_processors.DataProcessorService
import com.mlreef.rest.feature.data_processors.PythonParserService
import com.mlreef.rest.feature.data_processors.RepositoryService
import com.mlreef.rest.feature.pipeline.PipelineService
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

    @Autowired
    private lateinit var baseEnvironmentsRepository: BaseEnvironmentsRepository

    @Autowired
    private lateinit var repositoryService: RepositoryService

    @Autowired
    private lateinit var pipelineService: PipelineService

    @MockkBean
    private lateinit var gitlabClient: GitlabRestClient

    @Autowired
    private lateinit var pythonParserService: PythonParserService


    lateinit var subject: Subject
    lateinit var project: CodeProject
    lateinit var baseEnvironments: BaseEnvironments

    private lateinit var service: PublishingService

    @Transactional
    @BeforeEach
    internal fun setUp() {
        service = spyk(
            PublishingService(
                config,
                gitlabRestClient = gitlabClient,
                projectResolverService,
                dataProcessorService,
                pythonParserService,
                baseEnvironmentsRepository,
                repositoryService,
                subjectRepository,
                pipelineService
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

        baseEnvironments = baseEnvironmentsRepository.save(
            BaseEnvironments(UUID.randomUUID(), RandomUtils.generateRandomUserName(15), "docker:latest")
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
            gitlabClient.adminGetProjectTree(any(), isNull(), any(), any())
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
            gitlabClient.adminGetProjectTree(any(), isNull(inverse = true), any(), any())
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
                ),
                page = 1,
                totalPages = 1,
                totalElements = 2,
                perPage = 10
            )
        }


        every {
            gitlabClient.adminGetRepositoryFileContentAndInformation(any(), any())
        } answers {
            val filename = "resnet_annotations_demo.py"
            val content = javaClass.classLoader.getResource(filename)!!.content as InputStream

            RepositoryFileFullInfo(
                "main.py",
                "main.py",
                blobId = UUID.randomUUID().toString(),
                size = 100L,
                encoding = "Base64",
                content = Base64Utils.encodeToString(content.readBytes()),
                contentSha256 = "230148ea3aa5aed560b9313d0c560731f76752961140d46f5a10a3b1e2bbf408",
                ref = "master",
                commitId = UUID.randomUUID().toString(),
                lastCommitId = UUID.randomUUID().toString(),
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

        service.startPublishing(userToken = token, projectId = project.id, mainFilePath = null, environmentId = baseEnvironments.id, mlCategory = null, modelType = null, publisherSubjectId = subject.id)

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
                },
                action = "create"
            )
        }
        verify(exactly = 2) {
            gitlabClient.adminGetProjectTree(any(), any(), any(), any())
        }

        verify(exactly = 1) {
            gitlabClient.adminGetRepositoryFileContentAndInformation(any(), any())
        }

        confirmVerified(gitlabClient)
    }
}

