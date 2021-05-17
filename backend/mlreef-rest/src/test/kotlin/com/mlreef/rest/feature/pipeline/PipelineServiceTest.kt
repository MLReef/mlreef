package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.api.AbstractRestApiTest
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.FileLocationType
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.domain.PipelineStatus
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.exceptions.PipelineCreateException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.Branch
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.feature.auth.AuthService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.service.AbstractServiceTest
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.test.annotation.Rollback
import java.util.UUID.randomUUID
import javax.transaction.Transactional
import kotlin.math.absoluteValue
import kotlin.random.Random

class PipelineServiceTest : AbstractServiceTest() {

    lateinit var service: PipelineService

    @Autowired
    private lateinit var projectResolverService: ProjectResolverService

    @Autowired
    private lateinit var yamlFileGenerator: YamlFileGenerator

    @MockkBean
    private lateinit var authService: AuthService

    @MockkBean
    private lateinit var restClient: GitlabRestClient

    private lateinit var dataProject1: DataProject
    private lateinit var dataProject2: DataProject

    @BeforeEach
    @Transactional
    @Rollback
    fun prepare() {
        service = PipelineService(
            conf = config,
            pipelineConfigRepository = pipelineConfigurationRepository,
            personRepository = personRepository,
            pipelinesRepository = pipelineRepository,
            processorsRepository = processorsRepository,
            gitlabRestClient = restClient,
            projectResolverService = projectResolverService,
            parametersRepository = parametersRepository,
            parameterInstancesRepository = parameterInstancesRepository,
            processorInstancesRepository = processorInstancesRepository,
            pipelineTypesRepository = pipelineTypesRepository,
            authService = authService,
            yamlFileGenerator = yamlFileGenerator,
            entityManagerFactory = entityManagerFactory,
            processorsService = processorsService,
        )

        dataProject1 = createDataProject(
            slug = "new-repo",
            name = "Test DataProject",
            ownerId = mainPerson.id,
            namespace = "pipeline-test",
            path = "new-repo",
            gitlabId = 30L,
            visibility = VisibilityScope.PUBLIC,
            inputTypes = mutableSetOf()
        )

        dataProject2 = createDataProject(
            slug = "new-repo2",
            name = "Test DataProject",
            ownerId = mainPerson.id,
            namespace = "pipeline-test",
            path = "new-repo2",
            gitlabId = 31L,
            visibility = VisibilityScope.PUBLIC,
            inputTypes = mutableSetOf()
        )

        mockBotToken()
    }

    private fun mockBotToken(initialTokenReturned: Boolean = true) {
        val userToken = if (initialTokenReturned) {
            GitlabUserToken(
                id = 1,
                revoked = false,
                token = AbstractRestApiTest.testPrivateUserTokenMock1,
                active = true,
                name = "mlreef-token"
            )
        } else {
            null
        }
        every {
            authService.ensureBotExistsWithToken(any(), any(), any())
        } returns (Pair(
            GitlabUser(
                id = 1,
                name = "Mock Gitlab User",
                username = "mock_user",
                email = "mock@example.com",
                state = "active"
            ),
            userToken
        ))
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create PipelineConfig for missing Owner`() {
        assertThrows<PipelineCreateException> {
            service.createPipelineConfig(
                randomUUID(),
                dataProject1.id,
                "DATA",
                "name",
                "sourcebranch",
                listOf(), listOf()
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create PipelineConfig for missing DataProject`() {
        assertThrows<PipelineCreateException> {
            service.createPipelineConfig(
                mainPerson.id,
                randomUUID(),
                "DATA",
                "name",
                "sourcebranch",
                listOf(), listOf()
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create PipelineConfig for missing branch name`() {
        assertThrows<PipelineCreateException> {
            service.createPipelineConfig(
                mainPerson.id,
                dataProject1.id,
                "DATA",
                "name",
                "",
                listOf(), listOf()
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create PipelineConfig for missing slug`() {
        assertThrows<PipelineCreateException> {
            service.createPipelineConfig(
                mainPerson.id,
                dataProject1.id,
                "DATA",
                "name",
                "",
                listOf(), listOf()
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create PipelineConfig for missing pipelineType`() {
        assertThrows<PipelineCreateException> {
            service.createPipelineConfig(
                mainPerson.id,
                dataProject1.id,
                "",
                "name",
                "sourcebranch",
                listOf(), listOf()
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create PipelineConfig for invalid pipelineType`() {
        assertThrows<PipelineCreateException> {
            service.createPipelineConfig(
                mainPerson.id,
                dataProject1.id,
                "DATEN",
                "name",
                "sourcebranch",
                listOf(), listOf()
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create PipelineConfig for duplicate slug scoped to DataProject`() {
        service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "name",
            "source",
            listOf(), listOf()
        )
        assertThrows<DataIntegrityViolationException> {
            service.createPipelineConfig(
                mainPerson.id,
                dataProject1.id,
                "DATA",
                "name",
                "source",
                listOf(), listOf()
            )
            pipelineConfigurationRepository.findAll()
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig if Owner and DataProject exist`() {
        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig with reused slug scoped to different DataProject`() {
        service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject2.id,
            "DATA",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig with different slug scoped same DataProject`() {
        service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "another-name",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig for pipelineType DATA`() {
        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig with nullable and therefore generated name`() {
        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
        assertThat(createExperiment.name).isNotEmpty()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig for pipelineType VISUAL`() {
        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "VISUAL",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig for pipelineType VISUALisation`() {
        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "VISUALIZATION",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig with empty targetBranchPattern`() {
        val createExperiment = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            "name",
            "sourcebranch",
            listOf(), listOf()
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create PipelineConfig with DataProcessors`() {
        val pipelineConfig = createFullMockData()

        assertThat(pipelineConfig).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create DataInstance from PipelineConfig`() {
        val pipelineConfig = createFullMockData()

        val createdInstance = pipelineConfig.createPipeline(mainPerson, 1)

        assertThat(createdInstance).isNotNull
        assertThat(createdInstance.status).isEqualTo(PipelineStatus.CREATED)
    }

    @Test
    @Transactional
    @Rollback
    fun `createStartGitlabPipeline works with initial token`() {
        createFullMockData()
        val pipelineJobInfo = service.createStartGitlabPipeline(
            userToken = "userToken",
            projectGitlabId = 1,
            sourceBranch = "sourceBranch",
            targetBranch = "targetBranch",
            fileContent = "fileContent", secret = "secret"
        )

        assertThat(pipelineJobInfo).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `createStartGitlabPipeline works without initial token`() {
        createFullMockData()
        mockBotToken(initialTokenReturned = false)
        val pipelineJobInfo = service.createStartGitlabPipeline(
            userToken = "userToken",
            projectGitlabId = 1,
            sourceBranch = "sourceBranch",
            targetBranch = "targetBranch",
            fileContent = "fileContent", secret = "secret"
        )

        assertThat(pipelineJobInfo).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create DataInstance from PipelineConfig as deep copy`() {
        val pipelineConfig = createFullMockData()

        val pipeline = pipelineConfig.createPipeline(mainPerson, 1)

        assertThat(pipeline.dataProject!!.id).isEqualTo(pipelineConfig.dataProject!!.id)
        assertThat(pipeline.pipelineConfiguration!!.id).isEqualTo(pipelineConfig.id)
        assertThat(pipeline.sourceBranch).isEqualTo(pipelineConfig.sourceBranch)
        assertThat(pipeline.name).isEqualTo(pipelineConfig.name)
        assertThat(pipeline.number).isEqualTo(1)
        assertThat(pipeline.slug).isEqualTo("${pipelineConfig.slug}-${pipeline.number}")

        assertThat(pipeline.inputFiles.size).isEqualTo(pipelineConfig.inputFiles.size)
        assertThat(pipeline.processorInstances.size).isEqualTo(pipelineConfig.processorInstances.size)

        pipeline.processorInstances.forEachIndexed { index, newInstance ->
            val oldInstance = pipelineConfig.processorInstances.toTypedArray()[index]
            assertThat(newInstance.slug).isEqualTo(oldInstance.slug)
            assertThat(oldInstance.pipelineConfiguration!!.id).isEqualTo(pipelineConfig.id)
            assertThat(newInstance.pipelineConfiguration).isEqualTo(null)
            assertThat(oldInstance.pipeline).isEqualTo(null)
            assertThat(newInstance.pipeline).isEqualTo(pipeline)
            assertThat(oldInstance.experimentProcessingId).isEqualTo(null)
            assertThat(newInstance.experimentProcessingId).isEqualTo(null)
            assertThat(newInstance.experimentPostProcessingId).isEqualTo(null)
            assertThat(newInstance.experimentPreProcessingId).isEqualTo(null)
        }

        pipeline.inputFiles.forEachIndexed { index, file ->
            val oldFile = pipelineConfig.inputFiles.toTypedArray()[index]

            assertThat(file.location).isEqualTo(oldFile.location)
            assertThat(file.locationType).isEqualTo(oldFile.locationType)
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create DataInstance from PipelineConfig with useful targetBranchPattern`() {
        val testId = randomUUID()
        assertThat(createFullMockData("slug1").createTargetBranchName(testId, 1)).isEqualTo("data-pipeline/slug1-1")
        assertThat(createFullMockData("slug2").createTargetBranchName(testId, 3)).isEqualTo("data-pipeline/slug2-3")
        assertThat(createFullMockData("slug3").createTargetBranchName(testId, 8)).isEqualTo("data-pipeline/slug3-8")
    }

    @Test
    @Transactional
    @Rollback
    fun `Can commit mlreef file to gitlab`() {
        val userToken = "userToken"
        val projectId = 1L
        val targetBranch = "targetBranch"
        val fileContent = "fileContent"
        val sourceBranch = "master"

        val fileContents: Map<String, String> = mapOf(Pair(".mlreef.yml", fileContent))

        every {
            restClient.createBranch(userToken, projectId, targetBranch, sourceBranch)
        } returns (Branch(name = targetBranch))
        every {
            restClient.commitFiles(
                token = userToken, targetBranch = targetBranch,
                fileContents = fileContents, projectId = projectId, commitMessage = any(),
                action = "create"
            )
        } returns (Commit())

        val commit = service.commitYamlFile(userToken, projectId, targetBranch, fileContent, sourceBranch)

        verify { restClient.createBranch(userToken, projectId, targetBranch, sourceBranch) }
        verify { restClient.commitFiles(userToken, projectId, targetBranch, any(), fileContents, action = "create") }

        assertThat(commit).isNotNull
    }

    private fun createFullMockData(name: String = "name", version: String? = null): PipelineConfiguration {
        val codeProject = createCodeProject(
            name = "Pipeline test code project",
            slug = "code-project-pipeline-test-${randomUUID()}",
            namespace = "test-$name",
            gitlabId = Random.nextInt().absoluteValue.toLong(),
            path = "path-$name",
            processorType = operationProcessorType
        )

        val processor = createProcessor(
            project = codeProject,
            environment = baseEnv1,
            branch = "master",
            version = version ?: Random.nextLong().toString(),
            mainScript = "main.py"
        )

        val createPipelineConfig = service.createPipelineConfig(
            mainPerson.id,
            dataProject1.id,
            "DATA",
            name,
            "sourcebranch",
            listOf(),
            listOf(),
        )

        createProcessorInstance(processor, createPipelineConfig)

        createPipelineConfig.addInputFile(FileLocation(randomUUID(), FileLocationType.PATH, "/path"))
        createPipelineConfig.addInputFile(FileLocation(randomUUID(), FileLocationType.PATH, "/path2"))

        return saveEntity(createPipelineConfig, createPipelineConfig.id, pipelineConfigurationRepository)
    }
}
