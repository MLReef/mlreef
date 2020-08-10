package com.mlreef.rest.persistence

import com.mlreef.rest.Person
import com.mlreef.rest.Subject
import com.mlreef.rest.SubjectRepository
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class SubjectTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: SubjectRepository

    private fun createEntity(
        slug: String = "slug",
        name: String = "name",
        gitlabId: Long = 1L
    ): Pair<UUID, Subject> {
        val id = randomUUID()
        val entity = Person(id, slug, name, gitlabId)
        return Pair(id, entity)
    }

    @BeforeEach
    fun prepare() {
        truncateDbTables(listOf("subject", "account", "account_token"), cascade = true)
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
    fun `must not save duplicate slug`() {
        commitAndFail {
            repository.save(createEntity("slug1", "username1", 101).second)
            repository.save(createEntity("slug1", "username2", 102).second)
        }
    }

    @Transactional
    @Test
    fun `must not save duplicate username`() {
        commitAndFail {
            repository.save(createEntity("slug1", "username1", 101).second)
            repository.save(createEntity("slug2", "username1", 102).second)
        }
    }

    @Transactional
    @Test
    fun `must not save duplicate gitlabId`() {
        commitAndFail {
            repository.save(createEntity("slug1", "username1", 101).second)
            repository.save(createEntity("slug2", "username2", 101).second)
        }
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
