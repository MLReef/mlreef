package com.mlreef.rest.persistence

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.BaseTest
import com.mlreef.rest.domain.Experiment
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.transaction.annotation.Transactional
import kotlin.math.absoluteValue
import kotlin.random.Random

@TestPropertySource("classpath:application-integration-test.yml")
@ActiveProfiles(ApplicationProfiles.INTEGRATION_TEST)
@ContextConfiguration(initializers = [TestPostgresContainer.Initializer::class, TestRedisContainer.Initializer::class])
class ProjectFullChainTest : BaseTest() {

    private val useIsolatedTransaction = false

    @Test
    @Transactional
    @Rollback
    fun `Can init`() {
        assertThat(this.mainPerson).isNotNull()
        assertThat(this.mainAccount).isNotNull()
        assertThat(this.codeProjectOperation).isNotNull()
        assertThat(this.codeProjectAlgorithm).isNotNull()
        assertThat(this.codeProjectVisualization).isNotNull()
        assertThat(this.processorOperation1).isNotNull()
        assertThat(this.processorOperation2).isNotNull()
        assertThat(this.processorAlgorithm).isNotNull()
        assertThat(this.processorVisualization).isNotNull()
    }


    @Test
    @Transactional
    @Rollback
    fun `Can create and save code project`() {
        val projectName = "Some test name ${Random.nextLong()}"
        val codeProject = createCodeProject(name = projectName, persist = false)

        assertThat(codeProjectRepository.findByNameIgnoreCase(projectName)).isNull()

        codeProjectRepository.save(codeProject)

        assertThat(codeProjectRepository.findByNameIgnoreCase(projectName)).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save data project`() {
        val projectName = "Some test name ${Random.nextLong()}"
        val dataProject = createDataProject(name = projectName, persist = false)

        assertThat(dataProjectRepository.findByNameIgnoreCase(projectName)).isNull()

        dataProjectRepository.save(dataProject)

        assertThat(dataProjectRepository.findByNameIgnoreCase(projectName)).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save Processor`() {
        val projectName = "Some test name ${Random.nextLong()}"
        val processorSlug = "slug-${Random.nextLong().absoluteValue}"
        val codeProject = createCodeProject(name = projectName)
        val processor = createProcessor(codeProject, slug = processorSlug, persist = false)

        assertThat(codeProjectRepository.findByNameIgnoreCase(projectName)).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndSlug(codeProject, processorSlug)).isNull()
        assertThat(codeProjectRepository.findByNameIgnoreCase(projectName)!!.processors.find { it.id == processor.id }).isNotNull()

        processorsRepository.save(processor)

        assertThat(processorsRepository.getByCodeProjectAndSlug(codeProject, processorSlug)).isNotNull()

        assertThat(codeProjectRepository.findByNameIgnoreCase(projectName)!!.processors.find { it.id == processor.id }).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save Processor Parameter`() {
        val projectName = "Some test name ${Random.nextLong()}"
        val processorSlug = "slug-${Random.nextLong().absoluteValue}"
        val parameterName = "Param${Random.nextLong().absoluteValue}"

        val codeProject = createCodeProject(name = projectName)
        val processor = createProcessor(codeProject, slug = processorSlug)
        val parameter = createParameter(processor, name = parameterName, persist = false)

        assertThat(codeProjectRepository.findByNameIgnoreCase(projectName)).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndSlug(codeProject, processorSlug)).isNotNull()
        assertThat(parametersRepository.findByProcessorAndName(processor, parameterName)).isNull()
        assertThat(
            processorsRepository.getByCodeProjectAndSlug(
                codeProject,
                processorSlug
            )!!.parameters.find { it.id == parameter.id }).isNotNull() //Only if @Transactional is enabled, if not then it is null

        parametersRepository.save(parameter)

        assertThat(parametersRepository.findByProcessorAndName(processor, parameterName)).isNotNull()
        assertThat(
            processorsRepository.getByCodeProjectAndSlug(
                codeProject,
                processorSlug
            )!!.parameters.find { it.id == parameter.id }).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save PipelineConfig`() {
        val projectName = "Some test name ${Random.nextLong()}"
        val configSlug = "slug-${Random.nextLong().absoluteValue}"

        val dataProject = createDataProject(name = projectName)
        val pipelineConfig = createPipelineConfiguration(dataProject, configSlug, persist = false)

        assertThat(dataProjectRepository.findByNameIgnoreCase(projectName)).isNotNull()
        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNull()
        assertThat(dataProjectRepository.findByNameIgnoreCase(projectName)!!.pipelineConfigurations.find { it.id == pipelineConfig.id }).isNotNull()

        pipelineConfigurationRepository.save(pipelineConfig)

        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNotNull()
        assertThat(dataProjectRepository.findByNameIgnoreCase(projectName)!!.pipelineConfigurations.find { it.id == pipelineConfig.id }).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save PipelineConfig with Processor Instance`() {
        val codeProjectName = "Some test name ${Random.nextLong()}"
        val dataProjectName = "Some test name ${Random.nextLong()}"
        val configSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorInstanceName = "Processor instance test name ${Random.nextLong()}"

        val codeProject = createCodeProject(name = codeProjectName)
        val dataProject = createDataProject(name = dataProjectName)
        val processor = createProcessor(codeProject, slug = processorSlug)
        val processorInstance = createProcessorInstance(processor, name = processorInstanceName)

        val pipelineConfig = createPipelineConfiguration(dataProject, configSlug, processorInstance = processorInstance, persist = false)

        assertThat(dataProjectRepository.findByNameIgnoreCase(dataProjectName)).isNotNull()
        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNull()
        assertThat(dataProjectRepository.findByNameIgnoreCase(dataProjectName)!!.pipelineConfigurations.find { it.id == pipelineConfig.id }).isNotNull() //Not null only if @Transactional is set

        pipelineConfigurationRepository.save(pipelineConfig)

        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNotNull()
        assertThat(dataProjectRepository.findByNameIgnoreCase(dataProjectName)!!.pipelineConfigurations.find { it.id == pipelineConfig.id }).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save Processor Instance`() {
        val codeProjectName = "Some test name ${Random.nextLong()}"
        val dataProjectName = "Some test name ${Random.nextLong()}"
        val configSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorInstanceName = "Processor instance test name ${Random.nextLong()}"

        val codeProject = createCodeProject(name = codeProjectName)
        val dataProject = createDataProject(name = dataProjectName)
        val pipelineConfig = createPipelineConfiguration(dataProject, configSlug)
        val processor = createProcessor(codeProject, slug = processorSlug)

        val processorInstance =
            createProcessorInstance(processor, pipelineConfig, name = processorInstanceName, persist = false)

        assertThat(dataProjectRepository.findByNameIgnoreCase(dataProjectName)).isNotNull()
        assertThat(codeProjectRepository.findByNameIgnoreCase(codeProjectName)).isNotNull()
        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndSlug(codeProject, processorSlug)).isNotNull()
        assertThat(processorInstancesRepository.findByName(processorInstanceName).firstOrNull()).isNull() //Not null - Only if @Transactional is enabled, if not then it is null
        assertThat(
            processorInstancesRepository.findByPipelineConfigurationAndProcessor(
                pipelineConfig,
                processor
            )
        ).isNull()//Only if @Transactional is enabled, if not then it is null
        assertThat(
            pipelineConfigurationRepository.findOneByDataProjectAndSlug(
                dataProject,
                configSlug
            )!!.processorInstances.find { it.id == processorInstance.id }).isNotNull() //Only if @Transactional is enabled, if not then it is null

        processorInstancesRepository.save(processorInstance)

        assertThat(processorInstancesRepository.findByName(processorInstanceName).firstOrNull()).isNotNull()
        assertThat(
            processorInstancesRepository.findByPipelineConfigurationAndProcessor(
                pipelineConfig,
                processor
            )
        ).isNotNull()
        assertThat(
            pipelineConfigurationRepository.findOneByDataProjectAndSlug(
                dataProject,
                configSlug
            )!!.processorInstances.find { it.id == processorInstance.id }).isNotNull()

    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save Pipeline`() {
        val codeProjectName = "Some test name ${Random.nextLong()}"
        val dataProjectName = "Some test name ${Random.nextLong()}"
        val configSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorInstanceName = "Processor instance test name ${Random.nextLong()}"
        val pipelineSlug = "slug-${Random.nextLong().absoluteValue}"

        val codeProject = createCodeProject(name = codeProjectName)
        val dataProject = createDataProject(name = dataProjectName)
        val pipelineConfig = createPipelineConfiguration(dataProject, configSlug)
        val processor = createProcessor(codeProject, slug = processorSlug)
        val processorInstance = createProcessorInstance(processor, pipelineConfig, name = processorInstanceName, persist = false) //Config make persist in cascade

        val pipeline = createPipeline(pipelineConfig, mainPerson, slug = pipelineSlug, persist = false)

        assertThat(dataProjectRepository.findByNameIgnoreCase(dataProjectName)).isNotNull()
        assertThat(codeProjectRepository.findByNameIgnoreCase(codeProjectName)).isNotNull()
        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndSlug(codeProject, processorSlug)).isNotNull()
        assertThat(processorInstancesRepository.findByName(processorInstanceName).firstOrNull()).isNull()
        assertThat(
            processorInstancesRepository.findByPipelineConfigurationAndProcessor(
                pipelineConfig,
                processor
            )
        ).isNull()
        assertThat(pipelineRepository.findOneByPipelineConfigurationAndSlug(pipelineConfig, pipelineSlug)).isNull()
        assertThat(
            pipelineConfigurationRepository.findOneByDataProjectAndSlug(
                dataProject,
                configSlug
            )!!.pipelines.find { it.id == pipeline.id }).isNotNull() //Only if @Transactional is enabled, if not then it is null

        pipelineRepository.save(pipeline)

        assertThat(pipelineRepository.findOneByPipelineConfigurationAndSlug(pipelineConfig, pipelineSlug)).isNotNull()
        assertThat(
            pipelineConfigurationRepository.findOneByDataProjectAndSlug(
                dataProject,
                configSlug
            )!!.pipelines.find { it.id == pipeline.id }).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save Parameter Instance`() {
        val codeProjectName = "Some test name ${Random.nextLong()}"
        val dataProjectName = "Some test name ${Random.nextLong()}"
        val configSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorInstanceName = "Processor instance test name ${Random.nextLong()}"
        val parameterName = "Param${Random.nextLong().absoluteValue}"

        val codeProject = createCodeProject(name = codeProjectName)
        val dataProject = createDataProject(name = dataProjectName)
        val pipelineConfig = createPipelineConfiguration(dataProject, configSlug)
        val processor = createProcessor(codeProject, slug = processorSlug)
        val processorInstance = createProcessorInstance(processor, pipelineConfig, name = processorInstanceName, persist = true)
        val parameter = createParameter(processor, name = parameterName, persist = true)

        val parameterInstance = createParameterInstance(parameter, processorInstance, persist = false)

        assertThat(dataProjectRepository.findByNameIgnoreCase(dataProjectName)).isNotNull()
        assertThat(codeProjectRepository.findByNameIgnoreCase(codeProjectName)).isNotNull()
        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndSlug(codeProject, processorSlug)).isNotNull()
        assertThat(processorInstancesRepository.findByName(processorInstanceName).firstOrNull()).isNotNull()
        assertThat(parametersRepository.findByProcessorAndName(processor, parameterName)).isNotNull()
        assertThat(
            processorInstancesRepository.findByPipelineConfigurationAndProcessor(
                pipelineConfig,
                processor
            )
        ).isNotNull()
        assertThat(
            parameterInstancesRepository.findByParameterAndProcessorInstance(
                parameter,
                processorInstance
            )
        ).isNotNull()
        assertThat(
            processorInstancesRepository.findByPipelineConfigurationAndProcessor(
                pipelineConfig,
                processor
            )?.parameterInstances?.find { it.id == parameterInstance.id }
        ).isNotNull() //Only if @Transactional is enabled, if not then it is null

        parameterInstancesRepository.save(parameterInstance)

        assertThat(
            parameterInstancesRepository.findByParameterAndProcessorInstance(
                parameter,
                processorInstance
            )
        ).isNotNull()
        assertThat(
            processorInstancesRepository.findByPipelineConfigurationAndProcessor(
                pipelineConfig,
                processor
            )!!.parameterInstances.find { it.id == parameterInstance.id }
        ).isNotNull()
    }

    @Test
    @Transactional
    @Rollback
    fun `Can create and save Experiment`() {
        val codeProjectName = "Some test name ${Random.nextLong()}"
        val dataProjectName = "Some test name ${Random.nextLong()}"
        val configSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorSlug = "slug-${Random.nextLong().absoluteValue}"
        val processorInstanceName = "Processor instance test name ${Random.nextLong()}"
        val pipelineSlug = "slug-${Random.nextLong().absoluteValue}"
        val experimentSlug = "slug-${Random.nextLong().absoluteValue}"

        val codeProject = createCodeProject(name = codeProjectName, inTransaction = useIsolatedTransaction)
        val dataProject = createDataProject(name = dataProjectName, inTransaction = useIsolatedTransaction)
        val pipelineConfig = createPipelineConfiguration(dataProject, configSlug, inTransaction = useIsolatedTransaction)
        val processor = createProcessor(codeProject, slug = processorSlug, inTransaction = useIsolatedTransaction)
        var processorInstance = createProcessorInstance(processor, pipelineConfig, name = processorInstanceName, persist = true, inTransaction = useIsolatedTransaction)
        val pipeline = createPipeline(pipelineConfig, mainPerson, slug = pipelineSlug, inTransaction = useIsolatedTransaction)
        val experiment = createExperiment(pipeline, slug = experimentSlug, persist = false)

        assertThat(dataProjectRepository.findByNameIgnoreCase(dataProjectName)).isNotNull()
        assertThat(codeProjectRepository.findByNameIgnoreCase(codeProjectName)).isNotNull()
        assertThat(pipelineConfigurationRepository.findOneByDataProjectAndSlug(dataProject, configSlug)).isNotNull()
        assertThat(processorsRepository.getByCodeProjectAndSlug(codeProject, processorSlug)).isNotNull()
        assertThat(processorInstancesRepository.findByName(processorInstanceName).firstOrNull()).isNotNull()
        assertThat(
            processorInstancesRepository.findByPipelineConfigurationAndProcessor(
                pipelineConfig,
                processor
            )
        ).isNotNull()
        assertThat(pipelineRepository.findOneByPipelineConfigurationAndSlug(pipelineConfig, pipelineSlug)).isNotNull()
        assertThat(experimentsRepository.findOneByDataProjectAndSlug(dataProject, experimentSlug)).isNull()
        assertThat(
            pipelineRepository.findOneByPipelineConfigurationAndSlug(
                pipelineConfig,
                pipelineSlug
            )!!.experiments.find { it.id == experiment.id }).isNotNull() //Not null only if @Transactional is enabled, if not then it is null

//        experimentsRepository.save(experiment)
        saveEntity<Experiment>(experiment, experiment.id, experimentsRepository, useIsolatedTransaction)

        assertThat(experimentsRepository.findOneByDataProjectAndSlug(dataProject, experimentSlug)).isNotNull()
        assertThat(
            pipelineRepository.findOneByPipelineConfigurationAndSlug(
                pipelineConfig,
                pipelineSlug
            )!!.experiments.find { it.id == experiment.id }).isNotNull()
    }
}