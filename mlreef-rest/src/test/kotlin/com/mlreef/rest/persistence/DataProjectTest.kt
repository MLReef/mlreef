package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.*

class DataProjectTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: DataProjectRepository

    private fun createEntity(): Pair<UUID, DataProject> {
        val id = UUID.randomUUID()
        val author = Person(UUID.randomUUID(), "slug", "name")
        val entity = DataProject(
            id = id, slug = "test-data-project", name = "CodeProject Augment", ownerId = author.id,
            url = "https://gitlab.com/mlreef/sign-language-classifier",
            gitlabProject = "sign-language-classifier", gitlabGroup = "mlreef", gitlabId = 1)

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
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(slug = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull
//        checkAfterUpdated(updated)
        Assertions.assertThat(updated.slug).isEqualTo(newValue)
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
