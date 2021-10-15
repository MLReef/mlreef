package com.mlreef.rest.feature.processors

import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.service.AbstractServiceTest
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

class ProcessorServiceTest : AbstractServiceTest() {

    private lateinit var processorService: ProcessorsService

    @Autowired
    private lateinit var pythonParserService: PythonParserService

    @Autowired
    protected lateinit var projectResolverService: ProjectResolverService

    @Mock
    private lateinit var gitlabRestClient: GitlabRestClient

    private lateinit var codeProject1: CodeProject
    private lateinit var codeProject2: CodeProject

    @BeforeEach
    fun prepare() {
        processorService = ProcessorsService(
            projectResolverService,
            processorsRepository,
            parameterTypesRepository,
            metricTypesRepository,
            processorTypeRepository,
            dataTypesRepository,
            baseEnvironmentsRepository,
            entityManager,
            userResolverService,
        )

        codeProject1 = createCodeProject(
            slug = "slug", url = "orf.at", name = "name",
            gitlabId = 1111L, ownerId = mainAccount.id, path = "path1",
            namespace = "mlreef", processorType = operationProcessorType
        )

        codeProject2 = createCodeProject(
            slug = "slug2", url = "orf.at", name = "name",
            gitlabId = 2222L, ownerId = mainAccount.id, path = "path2",
            namespace = "mlreef", processorType = algorithmProcessorType
        )
    }

    @Test
    @Transactional
    @Rollback
    fun `Can parse python example files`() {
        val filename = "resnet_annotations_demo.py"
        val resource = javaClass.classLoader.getResource(filename)!!
        val dataProcessor = pythonParserService.parsePythonFile(resource)
        assertNotNull(dataProcessor)
    }

    @Test
    @Transactional
    @Rollback
    fun `Can save parsed DataProcessors`() {
        val filename = "resnet_annotations_demo.py"
        val resource = javaClass.classLoader.getResource(filename)!!
        val dataProcessor = pythonParserService.parseAndSave(resource)

        assertNotNull(dataProcessor)
//        assertThat(dataProcessor.name).isEqualTo("Resnet 2.0 Filter") //Due to new version the name should not be set in python decorators
        assertThat(dataProcessor.description).isEqualTo("Transforms images with lots of magic")

        val parameters = dataProcessor.parameters
        val parameter = parameters.first()

        assertThat(parameter.name).isEqualTo("images_path")
        assertThat(parameter.parameterType).isEqualTo(stringParamType)
        assertThat(parameter.required).isEqualTo(true)
        assertThat(parameter.defaultValue).isEqualTo(".")
        assertThat(parameter.order).isEqualTo(1)
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create for CodeProject`() {
        val dataProcessor = testCreateDataProcessorInService(
            slug = "slug",
            codeProject = codeProject1,
            version = "1",
            author = mainAccount,
        )

        assertNotNull(dataProcessor)
        assertThat(dataProcessor.publishedAt).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create with correct type with the same branch and different versions`() {
        val dataProcessor = testCreateDataProcessorInService(
            slug = "slug1",
            codeProject = codeProject1,
            branch = "master",
            version = "1"
        )
        assertThat(dataProcessor).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndBranchAndVersionIgnoreCase(codeProject1, "master", "1"))

        val dataProcessor2 = testCreateDataProcessorInService(
            slug = "slug2",
            codeProject = codeProject1,
            branch = "master",
            version = "2"
        )
        assertThat(dataProcessor2).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndBranchAndVersionIgnoreCase(codeProject1, "master", "2"))
        assertThat(processorsRepository.getByCodeProjectAndBranch(codeProject1, "master").size).isEqualTo(2)

        val dataProcessor3 = testCreateDataProcessorInService(
            slug = "slug3",
            codeProject = codeProject1,
            branch = "master",
            version = "3"
        )
        assertThat(dataProcessor3).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndBranchAndVersionIgnoreCase(codeProject1, "master", "3"))
        assertThat(processorsRepository.getByCodeProjectAndBranch(codeProject1, "master").size).isEqualTo(3)
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create second for CodeProject`() {
        testCreateDataProcessorInService(
            slug = "slug1",
            codeProject = codeProject1,
        )
        val dataProcessor = testCreateDataProcessorInService(
            slug = "slug2",
            codeProject = codeProject1,
        )
        assertNotNull(dataProcessor)
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create same slug for another CodeProject`() {
        testCreateDataProcessorInService(
            slug = "slug",
            codeProject = codeProject1,
        )
        val dataProcessor = testCreateDataProcessorInService(
            slug = "slug",
            codeProject = codeProject2,
        )
        assertNotNull(dataProcessor)
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create duplicate in CodeProject`() {
        val dataProcessor = testCreateDataProcessorInService(
            slug = "slug",
            codeProject = codeProject1,
        )
        assertNotNull(dataProcessor)

        assertThrows<DataIntegrityViolationException> {
            testCreateDataProcessorInService(
                slug = "slug",
                codeProject = codeProject1,
            )
            processorsRepository.getByCodeProjectAndSlug(
                codeProject1,
                "slug"
            ) //The error appears only after db request due to transactional
        }
    }

    private fun testCreateDataProcessorInService(
        codeProject: CodeProject,
        slug: String,
        branch: String? = null,
        version: String? = null,
        author: Account? = null,
    ): Processor {
        return processorService.createProcessorForCodeProject(
            codeProject = codeProject,
            slug = slug,
            name = "name",
            branch = branch ?: "master",
            version = version ?: "1",
            mainScriptPath = "main.py",
            description = "description",
            author = author ?: mainAccount,
            parameters = listOf()
        )
    }
}
