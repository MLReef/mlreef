package com.mlreef.rest.service

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Experiment
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
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.exceptions.ExperimentCreateException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.utils.RandomUtils
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ExperimentServiceTest : AbstractServiceTest() {

    private lateinit var dataProcessorVersion: ProcessorVersion
    private lateinit var dataProcessor: DataProcessor
    private lateinit var dataProcessorInstance: DataProcessorInstance
    private lateinit var pipelineInstance: PipelineInstance
    private lateinit var experimentService: ExperimentService

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var subjectRepository: SubjectRepository

    @Autowired
    private lateinit var experimentRepository: ExperimentRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var pipelineInstanceRepository: PipelineInstanceRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var baseEnvironmentsRepository: BaseEnvironmentsRepository

    @Mock
    private lateinit var gitlabRestClient: GitlabRestClient

    private var ownerId: UUID = randomUUID()
    private var dataAlgorithmId: UUID = randomUUID()
    private var codeProjectId: UUID = randomUUID()
    private var dataProjectId: UUID = randomUUID()
    private var dataPipelineConfigId: UUID = randomUUID()

    lateinit var baseEnv: BaseEnvironments

    @BeforeEach
    fun prepare() {
        truncateAllTables()

        baseEnv = baseEnvironmentsRepository.save(BaseEnvironments(UUID.randomUUID(), RandomUtils.generateRandomUserName(15), "docker1:latest", sdkVersion = "3.7"))

        experimentService = ExperimentService(
            conf = config,
            experimentRepository = experimentRepository,
            subjectRepository = subjectRepository,
            dataProjectRepository = dataProjectRepository,
            pipelineInstanceRepository = pipelineInstanceRepository,
            processorVersionRepository = processorVersionRepository,
            processorParameterRepository = processorParameterRepository
        )
        val subject = subjectRepository.save(Person(ownerId, "new-person", "person's name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now()))
        dataProjectRepository.save(DataProject(dataProjectId, "new-repo-test", "url", "Test DataProject", "", subject.id, "exp-test", "new-repo-test", 20, VisibilityScope.PUBLIC, arrayListOf()))
        codeProjectRepository.save(CodeProject(codeProjectId, "code-project-test", "url", "Test CodeProject", "", subject.id, "exp-test", "code-project-test", 21, VisibilityScope.PUBLIC))
        dataProcessor = dataProcessorRepository.save(DataAlgorithm(
            id = dataAlgorithmId, slug = "commons-augment", name = "Augment",
            inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = subject,
            description = "description",
            codeProjectId = codeProjectId))

        dataProcessorVersion = processorVersionRepository.save(ProcessorVersion(
            id = dataProcessor.id, dataProcessor = dataProcessor, publishingInfo = PublishingInfo(publisher = subject),
            command = "augment", number = 1, baseEnvironment = baseEnv))

        val dataPipeline = pipelineConfigRepository.save(PipelineConfig(dataPipelineConfigId, dataProjectId, PipelineType.DATA, "slug", "name", "source_branch", "target_branch/\$SLUG"))
        dataProcessorInstance = dataProcessorInstanceRepository.save(DataProcessorInstance(randomUUID(), dataProcessorVersion, parameterInstances = arrayListOf()))
        pipelineInstance = pipelineInstanceRepository.save(dataPipeline.createInstance(0))
    }

    @Test
    @Transactional
    fun `Cannot create for missing Owner`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                randomUUID(),
                dataProjectId,
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
    @Transactional
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
    @Transactional
    fun `Cannot create for missing name`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                ownerId,
                dataProjectId,
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
    @Transactional
    fun `Cannot create for missing source branch name`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                ownerId,
                dataProjectId,
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
    @Transactional
    fun `Can create if Owner and DataProject exist`() {
        val _dataProcessor = dataProcessorRepository.findByIdOrNull(dataAlgorithmId)!!

        val dataProcessor = ProcessorVersion(
            id = _dataProcessor.id, dataProcessor = _dataProcessor, publishingInfo = PublishingInfo(publisher = _dataProcessor.author),
            command = "augment", number = 1, baseEnvironment = baseEnv)
        processorVersionRepository.save(dataProcessor)

        val dataProcessorInstance = DataProcessorInstance(randomUUID(), dataProcessor, parameterInstances = arrayListOf())
        val experiment = experimentService.createExperiment(
            ownerId,
            dataProjectId,
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
    @Transactional
    fun `Can create if pipelineInstance is set and exists`() {
        val createExperiment = experimentService.createExperiment(
            ownerId,
            dataProjectId,
            pipelineInstance.id,
            "slug",
            "name",
            "source",
            "target",
            listOf(),
            inputFiles = listOf(FileLocation.fromPath("folder")),
            processorInstance = dataProcessorInstance)

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    fun `Cannot create if pipelineInstance is set but does not exist`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                ownerId,
                dataProjectId,
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

    @Test
    @Transactional
    fun `Can create many Experiments asynchronously`() {

        runBlocking(GlobalScope.coroutineContext) {

            val size = 1000
            val deferred = (1..size).map { n ->
                async(GlobalScope.coroutineContext) {
                    delay(1000)
                    val experiment = experimentService.createExperiment(
                        ownerId,
                        dataProjectId,
                        pipelineInstance.id,
                        "slug-$n",
                        "name-$n",
                        "source",
                        "target-$n",
                        listOf(),
                        inputFiles = listOf(FileLocation.fromPath("folder")),
                        processorInstance = dataProcessorInstance
                    )
                    experiment
                }
            }
            val experiments: List<Experiment> = deferred.map { it.await() }

            assertThat(experiments).isNotNull
            assertThat(experiments).isNotEmpty
            assertThat(experiments).hasSize(size)

            val used = arrayListOf<Int>()
            experiments.forEach {
                assertThat(it).isNotNull
                val element = it.number
                assertThat(element).isGreaterThan(0)
                assertThat(used).doesNotContain(element)

                used.add(element ?: 0)
            }
        }

    }
}
