package com.mlreef.rest.persistence

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.AuditEntity
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.transaction.TestTransaction
import javax.persistence.EntityManager
import javax.sql.DataSource

@TestPropertySource("classpath:application-integration-test.yml")
@SpringBootTest
@ActiveProfiles(ApplicationProfiles.INTEGRATION_TEST)
@ContextConfiguration(initializers = [TestPostgresContainer.Initializer::class, TestRedisContainer.Initializer::class])
class AbstractRepositoryTest {
    @Autowired
    val dataSource: DataSource? = null

    @Autowired
    val jdbcTemplate: JdbcTemplate? = null

    @Autowired
    val entityManager: EntityManager? = null

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

    protected fun truncateDbTables(tables: List<String>, cascade: Boolean = true) {
        println("Truncating tables: $tables")
        val joinToString = tables.joinToString("\", \"", "\"", "\"")

        if (cascade) {
            entityManager!!.createNativeQuery("truncate table $joinToString CASCADE ").executeUpdate()
        } else {
            entityManager!!.createNativeQuery("truncate table $joinToString ").executeUpdate()
        }
    }

    fun commitAndFail(f: () -> Unit) {
        assertThrows<Exception> {
            withinTransaction {
                f.invoke()
            }
        }
    }

    fun <T> withinTransaction(commit: Boolean = true, func: () -> T): T {
        if (!TestTransaction.isActive()) TestTransaction.start()
        val result = func.invoke()
        if (commit) {
            TestTransaction.flagForCommit()
        } else {
            TestTransaction.flagForRollback()
        }
        try {
            TestTransaction.end()
        } catch (e: Exception) {
            throw e
        }
        return result
    }
}
