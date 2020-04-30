package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineType
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import java.util.UUID.randomUUID

class PipelineConfigTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: PipelineConfigRepository

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    companion object {
        private var gitlabIdCount: Long = 0
    }


    private fun createEntity(): Pair<UUID, PipelineConfig> {
        val id = randomUUID()
        val owner = Person(randomUUID(), "slug", "name", ++gitlabIdCount)
        val dataProject = DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", owner.id, "group", "project", "group/project", ++gitlabIdCount)

        personRepository.save(owner)
        dataProjectRepository.save(dataProject)

        val entity = PipelineConfig(
            id = id, slug = "pipeline-1", name = "Pipeline 1",
            pipelineType = PipelineType.DATA,
            dataProjectId = dataProject.id,
            sourceBranch = "sourcebranch", targetBranchPattern = "")
        return Pair(id, entity)
    }

    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull()
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Test
    fun `update works`() {
        val (_, entity) = createEntity()
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
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull()
//        checkAfterUpdated(saved)
    }
}
