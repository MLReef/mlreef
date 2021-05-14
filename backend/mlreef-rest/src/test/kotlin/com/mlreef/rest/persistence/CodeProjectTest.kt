package com.mlreef.rest.persistence

import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.Person
import com.mlreef.rest.domain.ProcessorType
import com.mlreef.rest.domain.UserRole
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID

class CodeProjectTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: CodeProjectRepository


    private fun createEntity(): Pair<UUID, CodeProject> {
        val id = randomUUID()
        val person = Person(randomUUID(), "slug", "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val entity = CodeProject(id = id, slug = "code-project-augment", name = "CodeProject Augment", ownerId = person.id, url = "url",
            gitlabNamespace = "", gitlabId = 0, gitlabPath = "", description = "", processorType = ProcessorType(
                randomUUID(), "Type"))
        return Pair(id, entity)
    }

    @Transactional
    @Rollback
    @BeforeEach
    fun prepare() {
        truncateDbTables(listOf("account", "account_token"), cascade = true)
    }

    @Transactional
    @Rollback
    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Rollback
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
    @Rollback
    @Test
    fun `update works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy<CodeProject>(slug = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull
//        checkAfterUpdated(updated)
        Assertions.assertThat(updated.slug).isEqualTo(newValue)
    }

    @Transactional
    @Rollback
    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}
