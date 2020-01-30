package com.mlreef.rest.service

import com.mlreef.rest.DataAlgorithmRepository
import com.mlreef.rest.DataOperationRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualizationRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.data_processors.DataProcessorService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.springframework.beans.factory.annotation.Autowired
import java.util.*
import java.util.UUID.randomUUID

class DataProcessorServiceTest : AbstractServiceTest() {

    private lateinit var dataProcessorService: DataProcessorService

    @Autowired private lateinit var subjectRepository: SubjectRepository
    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository
    @Autowired private lateinit var dataOperationRepository: DataOperationRepository
    @Autowired private lateinit var dataAlgorithmRepository: DataAlgorithmRepository
    @Autowired private lateinit var dataVisualizationRepository: DataVisualizationRepository

    @Mock private lateinit var gitlabRestClient: GitlabRestClient

    private var ownerId: UUID = randomUUID()
    private var dataRepositoryId: UUID = randomUUID()

    @BeforeEach
    fun prepare() {
        dataProcessorService = DataProcessorService(dataProcessorRepository = dataProcessorRepository)

        val subject = Person(ownerId, "new-person", "person's name")
        val dataRepository = DataProject(dataRepositoryId, "new-repo", "url", "Project", subject.id, "mlreef", "project", 0, arrayListOf())

        subjectRepository.save(subject)
    }

    @Test
    fun `Can parse python example files`() {
        val filename = "resnet_annotations_demo.py"
        val resource = javaClass.classLoader.getResource(filename)
        val dataProcessor = dataProcessorService.parsePythonFile(resource)
        assertNotNull(dataProcessor)
    }

    @Test
    fun `Can save parsed DataProcessors`() {
        val filename = "resnet_annotations_demo.py"
        val resource = javaClass.classLoader.getResource(filename)
        val dataProcessor = dataProcessorService.parseAndSave(resource)
        assertNotNull(dataProcessor)
        assertThat(dataProcessor.name).isEqualTo("Resnet 2.0 Filter")
        assertThat(dataProcessor.description).isEqualTo("Transforms images with lots of magic")
        assertThat(dataProcessor.visibilityScope).isEqualTo(VisibilityScope.PUBLIC)
        assertThat(dataProcessor.inputDataType).isEqualTo(DataType.IMAGE)
        assertThat(dataProcessor.outputDataType).isEqualTo(DataType.IMAGE)
//        assertThat(dataProcessor.author).isEqualTo("MLReef")
        assertThat(dataProcessor.parameters).isNotEmpty
        val parameters = dataProcessor.parameters
        val parameter = parameters.first()
        assertThat(parameter.name).isEqualTo("images_path")
        assertThat(parameter.type).isEqualTo(ParameterType.STRING)
        assertThat(parameter.required).isEqualTo(true)
        assertThat(parameter.defaultValue).isEqualTo(".")
        assertThat(parameter.order).isEqualTo(1)


    }

}
