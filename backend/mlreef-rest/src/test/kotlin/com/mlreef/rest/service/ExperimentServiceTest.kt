package com.mlreef.rest.service

import com.mlreef.rest.BaseEnvironment
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.FileLocation
import com.mlreef.rest.Person
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineType
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.exceptions.ExperimentCreateException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.experiment.ExperimentService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import java.util.UUID.randomUUID

class ExperimentServiceTest : AbstractServiceTest() {

    private lateinit var dataProcessorInstance: DataProcessorInstance
    private lateinit var pipelineInstance: PipelineInstance
    private lateinit var experimentService: ExperimentService

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired
    private lateinit var subjectRepository: SubjectRepository
    @Autowired
    private lateinit var experimentRepository: ExperimentRepository
    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository
    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var pipelineInstanceRepository: PipelineInstanceRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository
    @Mock
    private lateinit var gitlabRestClient: GitlabRestClient

    private var ownerId: UUID = randomUUID()
    private var dataAlgorithmId: UUID = randomUUID()
    private var codeProjectId: UUID = randomUUID()
    private var dataRepositoryId: UUID = randomUUID()
    private var dataPipelineConfigId: UUID = randomUUID()

    @BeforeEach
    fun prepare() {
        experimentService = ExperimentService(
            conf = config,
            experimentRepository = experimentRepository,
            subjectRepository = subjectRepository,
            dataProjectRepository = dataProjectRepository,
            pipelineInstanceRepository = pipelineInstanceRepository,
            processorVersionRepository = processorVersionRepository,
            processorParameterRepository = processorParameterRepository
        )
        val subject = Person(ownerId, "new-person", "person's name", 1L)
        val dataRepository = DataProject(dataRepositoryId, "new-repo", "url", "Test DataProject", "", subject.id, "mlreef", "project", 0, VisibilityScope.PUBLIC, arrayListOf())
        val dataPipeline = PipelineConfig(dataPipelineConfigId, dataRepositoryId, PipelineType.DATA, "slug", "name", "source_branch", "target_branch/\$SLUG")
        val entity = DataAlgorithm(
            id = dataAlgorithmId, slug = "commons-augment", name = "Augment",
            inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = subject,
            description = "description",
            codeProjectId = codeProjectId)
        val _dataProcessor = dataProcessorRepository.save(entity)

        val dataProcessor = ProcessorVersion(
            id = _dataProcessor.id, dataProcessor = _dataProcessor, publisher = subject,
            command = "augment", number = 1, baseEnvironment = BaseEnvironment.default())
        processorVersionRepository.save(dataProcessor)

        dataProcessorInstance = DataProcessorInstance(randomUUID(), dataProcessor, parameterInstances = arrayListOf())
        pipelineInstance = dataPipeline.createInstance(0)
        pipelineConfigRepository.save(dataPipeline)
        pipelineInstanceRepository.save(pipelineInstance)
        subjectRepository.save(subject)
        dataProjectRepository.save(dataRepository)
    }

    @Test
    fun `Cannot create for missing Owner`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                randomUUID(),
                dataRepositoryId,
                pipelineInstance.id,
                "slug",
                "name",
                "source",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = dataProcessorInstance)
        }
    }

    @Test
    fun `Cannot create for missing DataProject`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                ownerId,
                randomUUID(),
                pipelineInstance.id,
                "slug",
                "name",
                "source",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = dataProcessorInstance)
        }
    }

    @Test
    fun `Cannot create for missing name`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                ownerId,
                dataRepositoryId,
                pipelineInstance.id,
                "slug",
                "",
                "source",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = dataProcessorInstance)
        }
    }

    @Test
    fun `Cannot create for missing source branch name`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                ownerId,
                dataRepositoryId,
                pipelineInstance.id,
                "slug",
                "name",
                "",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = dataProcessorInstance)
        }
    }

    @Test
    fun `Can create if Owner and DataProject exist`() {
        val _dataProcessor = dataProcessorRepository.findByIdOrNull(dataAlgorithmId)!!

        val dataProcessor = ProcessorVersion(
            id = _dataProcessor.id, dataProcessor = _dataProcessor, publisher = _dataProcessor.author,
            command = "augment", number = 1, baseEnvironment = BaseEnvironment.default())
        processorVersionRepository.save(dataProcessor)

        val dataProcessorInstance = DataProcessorInstance(randomUUID(), dataProcessor, parameterInstances = arrayListOf())
        val experiment = experimentService.createExperiment(
            ownerId,
            dataRepositoryId,
            pipelineInstance.id,
            "slug",
            "name",
            "source",
            "target",
            listOf(),
            inputFiles = listOf(FileLocation.fromPath("folder")),
            processorInstance = dataProcessorInstance
        )

        assertThat(experiment).isNotNull
    }

    @Test
    fun `Can create if pipelineInstance is set and exists`() {
        val createExperiment = experimentService.createExperiment(
            ownerId,
            dataRepositoryId,
            pipelineInstance.id,
            "slug",
            "name",
            "source",
            "target",
            listOf(),
            inputFiles = listOf(FileLocation.fromPath("folder")),
            processorInstance = dataProcessorInstance)

        assertThat(createExperiment).isNotNull()
    }

    @Test
    fun `Cannot create if pipelineInstance is set but does not exist`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                ownerId,
                dataRepositoryId,
                randomUUID(),
                "slug",
                "name",
                "source",
                "",
                listOf(),
                inputFiles = listOf(),
                processorInstance = dataProcessorInstance)
        }
    }
}
