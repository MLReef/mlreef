package com.mlreef.rest.persistence

import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProcessorTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: DataProcessorRepository

    private fun createEntity(
        slug: String = "slug"
    ): Pair<UUID, DataProcessor> {
        val id = randomUUID()
        val codeProjectId = randomUUID()
        val author = Person(randomUUID(), slug, "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val entity = DataOperation(
            id = id, slug = "commons-augment", name = "Augment",
            inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)
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
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }

    @Transactional
    @Test
    fun `must not save duplicate slug`() {
        commitAndFail {
            repository.save(createEntity("slug1").second)
            repository.save(createEntity("slug2").second)
        }
    }
}
