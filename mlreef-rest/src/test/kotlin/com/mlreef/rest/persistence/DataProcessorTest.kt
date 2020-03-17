package com.mlreef.rest.persistence

import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.*

class DataProcessorTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: DataProcessorRepository


    private fun createEntity(): Pair<UUID, DataProcessor> {
        val id = UUID.randomUUID()
        val codeProjectId = UUID.randomUUID()
        val author = Person(UUID.randomUUID(), "slug", "name")
        val entity = DataOperation(
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
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}
