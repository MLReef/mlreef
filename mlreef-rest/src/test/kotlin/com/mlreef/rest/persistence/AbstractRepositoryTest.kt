package com.mlreef.rest.persistence

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.AuditEntity
import com.mlreef.rest.testcommons.IntegrationTest
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import org.assertj.core.api.Assertions.assertThat
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import javax.sql.DataSource

@TestPropertySource("classpath:application-integration-test.yml")
@SpringBootTest
@ActiveProfiles(ApplicationProfiles.INTEGRATION_TEST)
@ContextConfiguration(initializers = [TestPostgresContainer.Initializer::class, TestRedisContainer.Initializer::class])
class AbstractRepositoryTest : IntegrationTest() {
    @Autowired
    val dataSource: DataSource? = null

    @Autowired
    val jdbcTemplate: JdbcTemplate? = null

    protected fun checkAfterCreated(saved: Any) {
        if (saved is AuditEntity) {
            assertThat(saved.version).isNotNull()
            assertThat(saved.createdAt).isNotNull()
            assertThat(saved.updatedAt).isNull()
            assertThat(saved.version).isEqualTo(0)
        }
    }

    protected fun checkAfterUpdated(saved: Any) {
        if (saved is AuditEntity) {
            assertThat(saved.version).isNotNull()
            assertThat(saved.createdAt).isNotNull()
            assertThat(saved.updatedAt).isNotNull()
            assertThat(saved.version).isGreaterThan(0)
        }
    }
}
