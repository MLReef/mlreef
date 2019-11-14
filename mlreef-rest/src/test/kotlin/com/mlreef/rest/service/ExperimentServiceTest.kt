package com.mlreef.rest.service

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.Person
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.api.v1.dto.ExperimentCreateRequest
import com.mlreef.rest.feature.experiment.ExperimentService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import java.util.*
import java.util.UUID.randomUUID

class ExperimentServiceTest : AbstractServiceTest() {

    private lateinit var experimentService: ExperimentService

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var subjectRepository: SubjectRepository

    @Autowired
    private lateinit var experimentRepository: ExperimentRepository

    private var ownerId: UUID = randomUUID()
    private var dataRepositoryId: UUID = randomUUID()

    @BeforeEach
    fun prepare() {
        experimentService = ExperimentService(experimentRepository, subjectRepository, dataProjectRepository)

        val subject = Person(ownerId, "new-person", "person's name")
        val dataRepository = DataProject(dataRepositoryId, "new-repo", "url", subject, arrayListOf())

        subjectRepository.save(subject)
        dataProjectRepository.save(dataRepository)
    }

    @Test
    fun `Cannot create for missing Owner`() {
        val createExperimentRequest = ExperimentCreateRequest(randomUUID(), randomUUID(), "branch")
        assertThrows<IllegalArgumentException> {
            experimentService.createExperiment(createExperimentRequest)
        }
    }

    @Test
    fun `Cannot create for missing DataProject`() {
        val createExperimentRequest = ExperimentCreateRequest(ownerId, randomUUID(), "branch")
        assertThrows<IllegalArgumentException> {
            experimentService.createExperiment(createExperimentRequest)
        }
    }

    @Test
    fun `Cannot create for missing branch name`() {
        val createExperimentRequest = ExperimentCreateRequest(ownerId, dataRepositoryId, "")
        assertThrows<IllegalArgumentException> {
            experimentService.createExperiment(createExperimentRequest)
        }
    }

    @Test
    fun `Can create if Owner and DataProject exist`() {
        val createExperimentRequest = ExperimentCreateRequest(ownerId, dataRepositoryId, "master")
        val createExperiment = experimentService.createExperiment(createExperimentRequest)
        assertThat(createExperiment).isNotNull
    }
}