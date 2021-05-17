package com.mlreef.rest.service

import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Experiment
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.Pipeline
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.exceptions.ExperimentCreateException
import com.mlreef.rest.exceptions.PipelineCreateException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.pipeline.YamlFileGenerator
import com.mlreef.rest.feature.project.ProjectResolverService
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
import org.springframework.test.annotation.Rollback
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ExperimentServiceTest : AbstractServiceTest() {
    private lateinit var processor: Processor
    private lateinit var processorInstance: ProcessorInstance
    private lateinit var pipelineInstance: Pipeline
    private lateinit var experimentService: ExperimentService

    @Autowired
    private lateinit var projectResolverService: ProjectResolverService

    @Autowired
    private lateinit var yamlFileGenerator: YamlFileGenerator

    @Autowired
    private lateinit var pipelineService: PipelineService

    @Mock
    private lateinit var gitlabRestClient: GitlabRestClient

    private lateinit var codeProject: CodeProject
    private lateinit var dataProject: DataProject
    private lateinit var pipelineConfig: PipelineConfiguration

    @BeforeEach
    fun prepare() {
        experimentService = ExperimentService(
            conf = config,
            experimentRepository = experimentsRepository,
            subjectRepository = subjectRepository,
            projectResolverService = projectResolverService,
            pipelineInstanceRepository = pipelineRepository,
            processorsRepository = processorsRepository,
            parametersRepository = parametersRepository,
            yamlFileGenerator = yamlFileGenerator,
            processorsService = processorsService,
            gitlabRestClient = gitlabRestClient,
            pipelineService = pipelineService,
            personRepository = personRepository,
        )

        dataProject = createDataProject(
            slug = "new-repo-test",
            name = "Test DataProject",
            ownerId = mainPerson.id,
            path = "new-repo-test",
            namespace = "exp-test",
            gitlabId = 20,
            visibility = VisibilityScope.PUBLIC,
            inputTypes = mutableSetOf(),
            url = "url",
        )

        codeProject = createCodeProject(
            slug = "code-project-test",
            name = "Test CodeProject",
            ownerId = mainPerson.id,
            namespace = "exp-test",
            path = "code-project-test",
            gitlabId = 21,
            visibility = VisibilityScope.PUBLIC,
            processorType = operationProcessorType,
            inputTypes = mutableSetOf(imageDataType, videoDataType),
            outputTypes = mutableSetOf(modelDataType),
        )

        processor = createProcessor(
            codeProject,
            slug = "commons-augment",
            name = "Augment",
            author = mainPerson,
        )

        pipelineConfig = createPipelineConfiguration(
            dataProject,
            "slug",
            "name",
            "source_branch",
            "target_branch/\$SLUG",
            dataPipelineType,
        )

        processorInstance = createProcessorInstance(
            processor,
            pipelineConfig,
            "Test processor instance",
            "test-processor-instance-slug"
        )

        pipelineInstance = createPipeline(
            pipelineConfig,
            mainPerson,
            "test-pipeline-slug",
            1,
        )
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create for missing Owner`() {
        assertThrows<PipelineCreateException> {
            experimentService.createExperiment(
                randomUUID(),
                dataProject.id,
                pipelineInstance.id,
                "slug",
                "name",
                "source",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = processorInstance
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create for missing DataProject`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                mainPerson.id,
                randomUUID(),
                pipelineInstance.id,
                "slug",
                "name",
                "source",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = processorInstance
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create for missing name`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                mainPerson.id,
                dataProject.id,
                pipelineInstance.id,
                "slug",
                "",
                "source",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = processorInstance
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create for missing source branch name`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                mainPerson.id,
                dataProject.id,
                pipelineInstance.id,
                "slug",
                "name",
                "",
                "target",
                listOf(),
                inputFiles = listOf(),
                processorInstance = processorInstance
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create if Owner and DataProject exist`() {
        val dataProcessor = createProcessor(
            project = codeProject,
            mainScript = "augment.py",
            version = "1",
            branch = "master",
            name = "Test processor",
            slug = "test-processor",
            author = mainPerson,
        )

        processorsRepository.save(dataProcessor)

        val dataProcessorInstance = createProcessorInstance(
            dataProcessor,
        )

        val experiment = experimentService.createExperiment(
            mainPerson.id,
            dataProject.id,
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
    @Rollback
    fun `Can create if pipelineInstance is set and exists`() {
        val createExperiment = experimentService.createExperiment(
            mainPerson.id,
            dataProject.id,
            pipelineInstance.id,
            "slug",
            "name",
            "source",
            "target",
            listOf(),
            inputFiles = listOf(FileLocation.fromPath("folder")),
            processorInstance = processorInstance
        )

        assertThat(createExperiment).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Cannot create if pipelineInstance is set but does not exist`() {
        assertThrows<ExperimentCreateException> {
            experimentService.createExperiment(
                mainPerson.id,
                dataProject.id,
                randomUUID(),
                "slug",
                "name",
                "source",
                "",
                listOf(),
                inputFiles = listOf(),
                processorInstance = processorInstance
            )
        }
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create many Experiments asynchronously`() {

        runBlocking(GlobalScope.coroutineContext) {

            val size = 1000
            val deferred = (1..size).map { n ->
                async(GlobalScope.coroutineContext) {
                    delay(1000)
                    val experiment = experimentService.createExperiment(
                        mainPerson.id,
                        dataProject.id,
                        pipelineInstance.id,
                        "slug-$n",
                        "name-$n",
                        "source",
                        "target-$n",
                        listOf(),
                        inputFiles = listOf(FileLocation.fromPath("folder")),
                        processorInstance = processorInstance
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
