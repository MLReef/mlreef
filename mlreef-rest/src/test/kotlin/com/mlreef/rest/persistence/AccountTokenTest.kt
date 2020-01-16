package com.mlreef.rest.persistence

import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.findById2
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.util.*

class AccountTokenTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: AccountTokenRepository

    private fun createEntity(): Pair<UUID, AccountToken> {
        val id = UUID.randomUUID()
        val entity = AccountToken(id, UUID.randomUUID(), "token")
        return Pair(id, entity)
    }

    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        assertThat(repository.findById2(id)).isNull()
        repository.save(entity)
        assertThat(repository.findById2(id)).isNotNull
    }

    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        assertThat(repository.findById2(id)).isNull()
        val saved = repository.save(entity)
        assertThat(saved).isNotNull
        checkAfterCreated(saved)
        assertThat(repository.findById2(id)).isNotNull
    }

    @Test
    fun `update works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(token = newValue)
        val updated = repository.save(copy)
        assertThat(updated).isNotNull
        checkAfterUpdated(updated)
        assertThat(updated.token).isEqualTo(newValue)
    }

    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}
