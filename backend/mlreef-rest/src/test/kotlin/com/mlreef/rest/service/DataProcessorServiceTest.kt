package com.mlreef.rest.service

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.data_processors.DataProcessorService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.springframework.beans.factory.annotation.Autowired
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProcessorServiceTest : AbstractServiceTest() {

    private lateinit var dataProcessorService: DataProcessorService

    @Autowired
    private lateinit var subjectRepository: SubjectRepository
    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Mock
    private lateinit var gitlabRestClient: GitlabRestClient
    private lateinit var codeProject: CodeProject
    private lateinit var codeProject2: CodeProject

    private var ownerId: UUID = randomUUID()
    private var dataRepositoryId: UUID = randomUUID()

    @BeforeEach
    fun prepare() {
        truncateAllTables()
        dataProcessorService = DataProcessorService(
            dataProcessorRepository = dataProcessorRepository,
            processorVersionRepository = processorVersionRepository
        )
        val subject = subjectRepository.save(Person(ownerId, "new-person", "person's name", 2, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now()))

        codeProject = codeProjectRepository.save(CodeProject(
            id = randomUUID(), slug = "slug", url = "orf.at", name = "name", description = "",
            dataProcessor = null,
            gitlabId = codeProjectRepository.count(), ownerId = subject.id, gitlabPath = "slug",
            gitlabNamespace = "mlreef"))
        codeProject2 = codeProjectRepository.save(CodeProject(
            id = randomUUID(), slug = "slug2", url = "orf.at", name = "name", description = "",
            dataProcessor = null,
            gitlabId = codeProjectRepository.count(), ownerId = subject.id, gitlabPath = "slug2",
            gitlabNamespace = "mlreef"))

    }

    @Test
    @Transactional
    fun `Can parse python example files`() {
        val filename = "resnet_annotations_demo.py"
        val resource = javaClass.classLoader.getResource(filename)!!
        val dataProcessor = dataProcessorService.parsePythonFile(resource)
        assertNotNull(dataProcessor)
    }

    @Test
    @Transactional
    fun `Can save parsed DataProcessors`() {
        val filename = "resnet_annotations_demo.py"
        val resource = javaClass.classLoader.getResource(filename)!!
        val processorVersion = dataProcessorService.parseAndSave(resource)
        val dataProcessor = processorVersion.dataProcessor
        assertNotNull(dataProcessor)
        assertThat(dataProcessor.name).isEqualTo("Resnet 2.0 Filter")
        assertThat(dataProcessor.description).isEqualTo("Transforms images with lots of magic")
        assertThat(dataProcessor.visibilityScope).isEqualTo(VisibilityScope.PUBLIC)
        assertThat(dataProcessor.inputDataType).isEqualTo(DataType.IMAGE)
        assertThat(dataProcessor.outputDataType).isEqualTo(DataType.IMAGE)
        val parameters = processorVersion.parameters
        val parameter = parameters.first()
        assertThat(parameter.name).isEqualTo("images_path")
        assertThat(parameter.type).isEqualTo(ParameterType.STRING)
        assertThat(parameter.required).isEqualTo(true)
        assertThat(parameter.defaultValue).isEqualTo(".")
        assertThat(parameter.order).isEqualTo(1)
    }

    @Test
    @Transactional
    fun `Can create for CodeProject`() {
        val dataProcessor = testCreateDataProcessor(
            slug = "slug",
            codeProject = codeProject,
            type = DataProcessorType.VISUALIZATION
        )
        assertNotNull(dataProcessor)
        assertThat(dataProcessor.isNew).isFalse()
        assertThat(dataProcessor.createdAt).isNotNull()
    }

    @Test
    @Transactional
    fun `Can create with correct type`() {
        val dataProcessor = testCreateDataProcessor(
            slug = "slug1",
            codeProject = codeProject,
            type = DataProcessorType.ALGORITHM
        )
        assertTrue(dataProcessor is DataAlgorithm)

        val dataProcessor2 = testCreateDataProcessor(
            slug = "slug2",
            codeProject = codeProject,
            type = DataProcessorType.OPERATION
        )
        assertTrue(dataProcessor2 is DataOperation)

        val dataProcessor3 = testCreateDataProcessor(
            slug = "slug3",
            codeProject = codeProject,
            type = DataProcessorType.VISUALIZATION
        )
        assertTrue(dataProcessor3 is DataVisualization)
    }

    @Test
    @Transactional
    fun `Can create second for CodeProject`() {
        testCreateDataProcessor(
            slug = "slug1",
            codeProject = codeProject,
            type = DataProcessorType.VISUALIZATION
        )
        val dataProcessor = testCreateDataProcessor(
            slug = "slug2",
            codeProject = codeProject,
            type = DataProcessorType.VISUALIZATION
        )
        assertNotNull(dataProcessor)
    }

    @Test
    @Transactional
    fun `Can create same slug for another CodeProject`() {
        testCreateDataProcessor(
            slug = "slug",
            codeProject = codeProject,
            type = DataProcessorType.VISUALIZATION
        )
        val dataProcessor = testCreateDataProcessor(
            slug = "slug",
            codeProject = codeProject2,
            type = DataProcessorType.VISUALIZATION
        )
        assertNotNull(dataProcessor)
    }

    @Test
    @Transactional
    fun `Cannot create duplicate in CodeProject`() {
        val dataProcessor = testCreateDataProcessor(
            slug = "slug",
            codeProject = codeProject,
            type = DataProcessorType.VISUALIZATION
        )
        assertNotNull(dataProcessor)

        assertThrows<IllegalArgumentException> {
            testCreateDataProcessor(
                slug = "slug",
                codeProject = codeProject,
                type = DataProcessorType.VISUALIZATION
            )
        }
    }

    private fun testCreateDataProcessor(codeProject: CodeProject, type: DataProcessorType, slug: String): DataProcessor {
        return dataProcessorService.createForCodeProject(
            id = randomUUID(),
            codeProject = codeProject,
            slug = slug,
            name = "name",
            inputDataType = DataType.IMAGE,
            outputDataType = DataType.IMAGE,
            type = type,
            visibilityScope = VisibilityScope.PUBLIC,
            description = "description",
            author = null,
            parameters = listOf()
        )
    }
}
