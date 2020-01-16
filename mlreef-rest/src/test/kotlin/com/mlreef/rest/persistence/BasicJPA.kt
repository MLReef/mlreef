package com.mlreef.rest.persistence

import com.mlreef.rest.ExperimentRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired

class BasicJPA : AbstractRepositoryTest() {

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
}
