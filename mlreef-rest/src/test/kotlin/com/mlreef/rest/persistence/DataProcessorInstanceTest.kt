package com.mlreef.rest.persistence

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProcessorInstanceTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: DataProcessorInstanceRepository


    private fun createEntity(): Pair<UUID, DataProcessorInstance> {
        val codeProjectId = randomUUID()
        val id = randomUUID()
        val author = Person(randomUUID(), "slug", "name", 1L)
        CodeProject(id = codeProjectId, slug = "code-project-augment", name = "CodeProject Augment", ownerId = author.id, url = "url",
            gitlabGroup = "", gitlabId = 0, gitlabProject = "")
        val dataOp1 = DataOperation(
            id = randomUUID(), slug = "commons-augment", name = "Augment",
            command = "augment", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)
        val entity = DataProcessorInstance(id = id, dataProcessor = dataOp1)
        return Pair(id, entity)
    }

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
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(slug = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull()
        checkAfterUpdated(updated)
        Assertions.assertThat(updated.slug).isEqualTo(newValue)
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
