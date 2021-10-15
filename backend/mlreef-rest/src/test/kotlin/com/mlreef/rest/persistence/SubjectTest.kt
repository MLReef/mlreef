package com.mlreef.rest.persistence

import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.domain.Person
import com.mlreef.rest.domain.Subject
import com.mlreef.rest.domain.UserRole
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import java.time.Instant
import java.util.*
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Disabled("Will be deleted in the next commit")
class SubjectTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: SubjectRepository

    private fun createEntity(
        slug: String = "slug",
        name: String = "name",
        gitlabId: Long = 1L
    ): Pair<UUID, Subject> {
        val id = randomUUID()
        val entity = Person(id, slug, name, gitlabId, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = Instant.now())
        return Pair(id, entity)
    }

    @BeforeEach
    fun prepare() {
        truncateDbTables(listOf("subject", "account", "account_token"), cascade = true)
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
    fun `must not save duplicate slug`() {
        commitAndFail {
            repository.save(createEntity("slug1", "username1", 101).second)
            repository.save(createEntity("slug1", "username2", 102).second)
        }
    }

    @Transactional
    @Rollback
    @Test
    @Disabled("The constraint is not actual anymore")
    fun `must not save duplicate username`() {
        commitAndFail {
            repository.save(createEntity("slug1", "username1", 101).second)
            repository.save(createEntity("slug2", "username1", 102).second)
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate gitlabId`() {
        commitAndFail {
            repository.save(createEntity("slug1", "username1", 101).second)
            repository.save(createEntity("slug2", "username2", 101).second)
        }
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
