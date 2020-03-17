package com.mlreef.rest.service

import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.experiment.ExperimentService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.springframework.beans.factory.annotation.Autowired
import java.util.*
import java.util.UUID.randomUUID

class ExperimentServiceTest : AbstractServiceTest() {

    private lateinit var experimentService: ExperimentService

    @Autowired private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired private lateinit var subjectRepository: SubjectRepository
    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository
    @Mock private lateinit var gitlabRestClient: GitlabRestClient

    private var ownerId: UUID = randomUUID()
    private var dataRepositoryId: UUID = randomUUID()

    @BeforeEach
    fun prepare() {
        experimentService = ExperimentService(
            experimentRepository = experimentRepository,
            subjectRepository = subjectRepository,
            dataProjectRepository = dataProjectRepository,
            dataProcessorRepository = dataProcessorRepository,
            processorParameterRepository = processorParameterRepository,
            gitlabRootUrl = "http://localhost:10080",
            gitlabRestClient = gitlabRestClient)

        val subject = Person(ownerId, "new-person", "person's name")
        val dataRepository = DataProject(dataRepositoryId, "new-repo", "url", "Test DataProject", subject.id, "mlreef", "project", "group/project", 0, arrayListOf())

        subjectRepository.save(subject)
        dataProjectRepository.save(dataRepository)
    }

    @Test
    fun `Cannot create for missing Owner`() {
        assertThrows<IllegalArgumentException> {
            experimentService.createExperiment(
                randomUUID(),
                dataRepositoryId,
                "source",
                "target")
        }
    }

    @Test
    fun `Cannot create for missing DataProject`() {
        assertThrows<IllegalArgumentException> {
            experimentService.createExperiment(
                ownerId,
                randomUUID(),
                "source",
                "target")
        }
    }

    @Test
    fun `Cannot create for missing branch name`() {
        assertThrows<IllegalArgumentException> {
            experimentService.createExperiment(
                ownerId,
                dataRepositoryId,
                "",
                "")
        }
    }

    @Test
    fun `Can create if Owner and DataProject exist`() {
        val createExperiment = experimentService.createExperiment(
            ownerId,
            dataRepositoryId,
            "source",
            "target")

        assertThat(createExperiment).isNotNull
    }
}
