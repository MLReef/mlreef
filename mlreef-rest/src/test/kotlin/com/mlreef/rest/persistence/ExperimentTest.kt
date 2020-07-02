package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.Person
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ExperimentTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: ExperimentRepository

    private fun createEntity(): Pair<UUID, Experiment> {
        val id = randomUUID()
        val owner = Person(randomUUID(), "slug", "name", 1L)
        val dataProject = DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project", 0)
        val entity = Experiment(id, dataProject.id, null, "slug", "name", "source", "target")

        return Pair(id, entity)
    }

    @Transactional
    @BeforeEach
    fun prepare() {
        truncateDbTables(listOf("account", "account_token"), cascade = true)
    }

    @Transactional
    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Transactional
    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull()
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Transactional
    @Test
    fun `update works`() {
        val owner = Person(randomUUID(), "slug", "name", 1L)
        val dataProject = DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project", 0)
        val id = randomUUID()
        val item = Experiment(id, dataProject.id, null, "slug", "name", "source", "target")

        val saved = repository.save(item)
        saved.copy(status = ExperimentStatus.SUCCESS)
        val updated = repository.save(saved)
        Assertions.assertThat(updated).isNotNull()
        checkAfterUpdated(updated)
    }

    @Transactional
    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull()
        checkAfterCreated(saved)
    }
}


