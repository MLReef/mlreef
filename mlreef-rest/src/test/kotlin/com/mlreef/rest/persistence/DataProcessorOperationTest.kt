package com.mlreef.rest.persistence

import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataOperationRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.findById2
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.util.*

class DataProcessorOperationTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: DataOperationRepository


    private fun createEntity(): Pair<UUID, DataOperation> {
        val id = UUID.randomUUID()
        val codeProjectId = UUID.randomUUID()
        val author = Person(UUID.randomUUID(), "slug", "name")
//        val codeProject = CodeProject(id = codeProjectId, slug = "code-project-augment", ownerId = author.id, url = "url")
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

        Assertions.assertThat(repository.findById2(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findById2(id)).isNotNull
    }

    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        Assertions.assertThat(repository.findById2(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findById2(id)).isNotNull
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
//        checkAfterUpdated(saved)
    }
}
