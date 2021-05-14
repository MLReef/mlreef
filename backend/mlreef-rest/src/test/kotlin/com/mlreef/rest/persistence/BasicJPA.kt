package com.mlreef.rest.persistence

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class BasicJPA : AbstractRepositoryTest() {
    @Test
    fun `JPA context exists`() {
        assertThat(dataSource).isNotNull()
        assertThat(jdbcTemplate).isNotNull()
        assertThat(entityManager).isNotNull()
    }
}
