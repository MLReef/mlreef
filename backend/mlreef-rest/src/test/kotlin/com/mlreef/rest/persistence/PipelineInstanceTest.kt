package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineType
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelineInstanceTest : AbstractRepositoryTest() {

    private lateinit var pipelineConfig: PipelineConfig

    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var repository: PipelineInstanceRepository

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    companion object {
        private var gitlabIdCount: Long = 0
    }

    private fun createEntity(
        dataProjectId: UUID = randomUUID(),
        configId: UUID = randomUUID(),
        slug: String = "pipeline-1",
        number: Int = 1
    ): Pair<UUID, PipelineInstance> {
        val entity = PipelineInstance(
            id = randomUUID(), slug = slug, name = "Pipeline 1",
            pipelineType = PipelineType.DATA,
            pipelineConfigId = configId,
            dataProjectId = dataProjectId,
            sourceBranch = "sourcebranch", targetBranch = "", number = number)
        return Pair(entity.id, entity)
    }

    @Transactional
    @BeforeEach
    fun prepare() {
//        truncateDbTables(listOf("account", "account_token", "mlreef_project"), cascade = true)
        val owner = Person(randomUUID(), "person$gitlabIdCount", "name$gitlabIdCount", ++gitlabIdCount)
        val dataProject = DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project$gitlabIdCount", ++gitlabIdCount)
        val config = PipelineConfig(
            id = randomUUID(), slug = "pipeline-1", name = "Pipeline 1",
            pipelineType = PipelineType.DATA,
            dataProjectId = dataProject.id,
            sourceBranch = "sourcebranch", targetBranchPattern = "")
        personRepository.save(owner)
        dataProjectRepository.save(dataProject)
        pipelineConfig = pipelineConfigRepository.save(config)
    }

    @Test
    fun `find works`() {
        val (id, entity) = createEntity(dataProjectId = pipelineConfig.dataProjectId, configId = pipelineConfig.id)

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Test
    fun `save works`() {
        val (id, entity) = createEntity(dataProjectId = pipelineConfig.dataProjectId, configId = pipelineConfig.id)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull()
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Test
    fun `update works`() {
        val (_, entity) = createEntity(dataProjectId = pipelineConfig.dataProjectId, configId = pipelineConfig.id)
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(slug = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull()
//        checkAfterUpdated(updated)
        Assertions.assertThat(updated.slug).isEqualTo(newValue)
    }

    @Test
    fun `delete works`() {
        val (_, entity) = createEntity(dataProjectId = pipelineConfig.dataProjectId, configId = pipelineConfig.id)
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull()
//        checkAfterUpdated(saved)
    }

    @Transactional
    @Test
    fun `must not save duplicate slug per PipelineConfig`() {
        commitAndFail {
            repository.save(createEntity(configId = pipelineConfig.id, dataProjectId = pipelineConfig.dataProjectId, slug = "slug1", number = 1).second)
            repository.save(createEntity(configId = pipelineConfig.id, dataProjectId = pipelineConfig.dataProjectId, slug = "slug1", number = 2).second)
        }
    }

    @Transactional
    @Test
    fun `can save duplicate slug for different PipelineConfig`() {

        val owner = Person(randomUUID(), "slug", "name", 1L)
        val dataProject1 = DataProject(randomUUID(), "slug1", "url,", "CodeProject Augment", "", owner.id, "group1", "project1", 201)
        val dataProject2 = DataProject(randomUUID(), "slug2", "url,", "CodeProject Augment", "", owner.id, "group2", "project2", 202)

        personRepository.save(owner)
        dataProjectRepository.save(dataProject1)
        dataProjectRepository.save(dataProject2)

        repository.save(createEntity(dataProjectId = dataProject1.id, slug = "slug1", number = 1).second)
        repository.save(createEntity(dataProjectId = dataProject2.id, slug = "slug1", number = 2).second)
    }

    @Transactional
    @Test
    fun `must not save duplicate number per PipelineConfig`() {
        commitAndFail {
            repository.save(createEntity(configId = pipelineConfig.id, dataProjectId = pipelineConfig.dataProjectId, slug = "slug1", number = 1).second)
            repository.save(createEntity(configId = pipelineConfig.id, dataProjectId = pipelineConfig.dataProjectId, slug = "slug2", number = 1).second)
        }
    }

    @Transactional
    @Test
    fun `can save duplicate number for different PipelineConfig`() {

        val owner = Person(randomUUID(), "slug", "name", 100)
        val dataProject1 = DataProject(randomUUID(), "slug1", "url,", "CodeProject Augment", "", owner.id, "group1", "project1", 201)
        val dataProject2 = DataProject(randomUUID(), "slug2", "url,", "CodeProject Augment", "", owner.id, "group2", "project2", 202)

        personRepository.save(owner)
        dataProjectRepository.save(dataProject1)
        dataProjectRepository.save(dataProject2)

        repository.save(createEntity(dataProjectId = dataProject1.id, slug = "slug1", number = 1).second)
        repository.save(createEntity(dataProjectId = dataProject2.id, slug = "slug2", number = 2).second)
    }
}
