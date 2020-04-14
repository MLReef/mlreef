package com.mlreef.rest.persistence

import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class AccountTokenTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: AccountTokenRepository

    private fun createEntity(): Pair<UUID, AccountToken> {
        val id = randomUUID()
        val entity = AccountToken(id, randomUUID(), "token")
        return Pair(id, entity)
    }

    @Transactional
    @BeforeEach
    fun prepare() {
        truncateDbTables(listOf("account", "account_token"), cascade = true)
    }

    @Transactional
    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Transactional
    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        assertThat(saved).isNotNull()
        checkAfterCreated(saved)
        assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Transactional
    @Test
    fun `update works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(token = newValue)
        val updated = repository.save(copy)
        assertThat(updated).isNotNull()
        checkAfterUpdated(updated)
        assertThat(updated.token).isEqualTo(newValue)
    }

    @Transactional
    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        assertThat(saved).isNotNull()
        checkAfterCreated(saved)
    }
}
