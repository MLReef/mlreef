package com.mlreef.rest.persistence

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.BaseTest
import com.mlreef.rest.domain.AuditEntity
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
import org.springframework.transaction.annotation.Transactional
import javax.sql.DataSource

@TestPropertySource("classpath:application-integration-test.yml")
@SpringBootTest
@ActiveProfiles(ApplicationProfiles.INTEGRATION_TEST)
@ContextConfiguration(initializers = [TestPostgresContainer.Initializer::class, TestRedisContainer.Initializer::class])
class AbstractRepositoryTest: BaseTest() {
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

    protected fun truncateAllTables() {
        truncateDbTables(listOf(
            "account", "account_token",
            "data_processor", "data_processor_instance",
            "email", "experiment", "experiment_input_files",
            "file_location",
            "marketplace_star",
            "marketplace_tag",
            "membership",
            "mlreef_project",
            "output_file",
            "parameter_instance",
            "pipeline_config",
            "pipeline_config_input_files",
            "pipeline_instance",
            "pipeline_instance_input_files",
            "processor_parameter",
            "processor_version",
            "project_inputdatatypes",
            "project_outputdatatypes",
            "projects_tags",
            "subject",
            "processor_types",
            "data_types",
            "parameter_types",
            "metric_types",
        ), cascade = true)
    }

    @Transactional
    protected fun truncateDbTables(tables: List<String>, cascade: Boolean = true) {
        println("Truncating tables: $tables")
        val joinToString = tables.joinToString("\", \"", "\"", "\"")

        val createNativeQuery = if (cascade) {
            entityManager.createNativeQuery("truncate table $joinToString CASCADE ")

        } else {
            entityManager.createNativeQuery("truncate table $joinToString ")
        }
        entityManager.joinTransaction()
        createNativeQuery.executeUpdate()
    }

    fun commitAndFail(f: () -> Unit) {
        assertThrows<Exception> {
            withinTestTransaction {
                f.invoke()
            }
        }
    }

    fun <T> withinTestTransaction(commit: Boolean = true, func: () -> T): T {
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
