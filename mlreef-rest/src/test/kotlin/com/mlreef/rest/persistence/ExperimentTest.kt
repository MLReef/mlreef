package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.Person
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.*

class ExperimentTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: ExperimentRepository

    private fun createEntity(): Pair<UUID, Experiment> {
        val id = UUID.randomUUID()
        val owner = Person(UUID.randomUUID(), "slug", "name")
        val dataProject = DataProject(UUID.randomUUID(), "slug", "url,", "CodeProject Augment", owner.id, "group", "project", "group/project", 0)
        val entity = Experiment(id, dataProject.id, "source", "target")

        return Pair(id, entity)
    }

    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Test
    fun `update works`() {
        val owner = Person(UUID.randomUUID(), "slug", "name")
        val dataProject = DataProject(UUID.randomUUID(), "slug", "url,", "CodeProject Augment", owner.id, "group", "project", "group/project", 0)
        val id = UUID.randomUUID()
        val item = Experiment(id, dataProject.id, "source", "target")

        val saved = repository.save(item)
        saved.copy(status = ExperimentStatus.SUCCESS)
        val updated = repository.save(saved)
        Assertions.assertThat(updated).isNotNull
        checkAfterUpdated(updated)
    }

    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}


