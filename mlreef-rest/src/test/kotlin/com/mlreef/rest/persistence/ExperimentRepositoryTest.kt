package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.Person
import com.mlreef.rest.findById2
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.util.UUID.randomUUID

class ExperimentRepositoryTest : AbstractRepositoryTest() {

    @Autowired
    private val experimentRepository: ExperimentRepository? = null

    @Test
    fun `JPA context exists`() {
        assertThat(dataSource).isNotNull
        assertThat(jdbcTemplate).isNotNull
        assertThat(entityManager).isNotNull
    }

    @Test
    fun `ExperimentRepository exists`() {
        assertThat(experimentRepository).isNotNull
    }

    @Test
    fun `find works`() {
        val owner = Person(randomUUID(), "slug", "name")
        val dataProject = DataProject(randomUUID(), "slug", "url,", owner)
        val id = randomUUID()
        val item = Experiment(id, dataProject)

        assertThat(experimentRepository?.findById2(id)).isNull()
        experimentRepository?.save(item)
        assertThat(experimentRepository?.findById2(id)).isNotNull
    }
}