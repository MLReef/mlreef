package com.mlreef.rest.persistence

import com.mlreef.rest.Person
import com.mlreef.rest.Subject
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.findById2
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.util.*

class SubjectTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: SubjectRepository

    private fun createEntity(): Pair<UUID, Subject> {
        val id = UUID.randomUUID()
        val entity = Person(id, "slug", "name")
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

//    @Test
//    fun `update works`() {
//        val (id, entity) = createEntity()
//        val saved = repository.save(entity)
//        val newValue = "newname"
//        val copy = saved.copy(slug = newValue)
//        val updated = repository.save(copy)
//        Assertions.assertThat(updated).isNotNull
//    checkAfterUpdated(updated)
//        Assertions.assertThat(updated.slug).isEqualTo(newValue)
//    }

    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}
