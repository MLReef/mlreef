package com.mlreef.rest.persistence

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataAlgorithmRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.*

class DataProcessorAlgorithmTest : AbstractRepositoryTest() {
    private var lastSaved: DataAlgorithm? = null
    @Autowired
    private lateinit var repository: DataAlgorithmRepository

    private fun createEntity(): Pair<UUID, DataAlgorithm> {
        val id = UUID.randomUUID()
        val codeProjectId = UUID.randomUUID()
        val author = Person(UUID.randomUUID(), "slug", "name")
//        val codeProject = CodeProject(id = codeProjectId, slug = "code-project-augment", ownerId = author.id, url = "url")
        val entity = DataAlgorithm(
            id = id, slug = "commons-augment", name = "Augment",
            command = "augment", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)
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
