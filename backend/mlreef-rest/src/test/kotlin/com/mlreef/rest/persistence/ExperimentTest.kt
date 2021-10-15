package com.mlreef.rest.persistence

import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Experiment
import com.mlreef.rest.domain.ExperimentStatus
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import org.springframework.transaction.annotation.Transactional
import java.util.UUID.randomUUID

class ExperimentTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: ExperimentRepository

    private lateinit var dataProject1: DataProject
    private lateinit var dataProject2: DataProject

    private fun createEntity(
        dataProject: DataProject? = null,
        slug: String = "slug"
    ): Experiment {
        val entity = Experiment(
            randomUUID(),
            dataProject ?: dataProject1,
            null,
            slug,
            "name",
            1,
            "source",
            "target"
        )

        return entity
    }

    @Transactional
    @Rollback
    @BeforeEach
    fun prepare() {
//        truncateDbTables(listOf("account", "account_token"), cascade = true)

        dataProject1 = createDataProject(
            slug = "slug1",
            name = "Experiment test project 1",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project",
            gitlabId = 1L
        )

        dataProject2 = createDataProject(
            slug = "slug2",
            name = "Experiment test project 2",
            ownerId = mainAccount.id,
            namespace = "group2",
            path = "project",
            gitlabId = 2L
        )
    }

    @Transactional
    @Rollback
    @Test
    fun `find works`() {
        val entity = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `save works`() {
        val entity = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `update works`() {
        val entity = createEntity()

        val saved = repository.save(entity)
        val updated = repository.save(saved.copy(status = ExperimentStatus.SUCCESS))
        assertThat(updated).isNotNull
        checkAfterUpdated(updated)
    }

    @Transactional
    @Rollback
    @Test
    fun `delete works`() {
        val entity = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate slug per DataProject`() {
        commitAndFail {
            repository.save(createEntity(slug = "slug1"))
            repository.save(createEntity(slug = "slug1"))
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `can save duplicate slug for different DataProject`() {
        repository.save(createEntity(dataProject = dataProject1, slug = "slug1"))
        repository.save(createEntity(dataProject = dataProject2, slug = "slug1"))
        repository.findAll() //To initiate flush by stupid hibernate
    }
}


