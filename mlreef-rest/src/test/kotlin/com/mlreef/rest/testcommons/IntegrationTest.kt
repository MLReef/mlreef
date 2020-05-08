package com.mlreef.rest.testcommons

import com.mlreef.rest.ApplicationProfiles
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.transaction.TestTransaction
import javax.persistence.EntityManager

@TestPropertySource("classpath:application-integration-test.yml")
@SpringBootTest
@ActiveProfiles(ApplicationProfiles.INTEGRATION_TEST)
@ContextConfiguration(initializers = [TestPostgresContainer.Initializer::class, TestRedisContainer.Initializer::class])
class IntegrationTest {

    @Autowired
    val entityManager: EntityManager? = null

    protected fun truncateDbTables(tables: List<String>, cascade: Boolean = true) {
        println("Truncating tables: $tables")
        val joinToString = tables.joinToString("\", \"", "\"", "\"")

        if (cascade) {
            entityManager!!.createNativeQuery("truncate table $joinToString CASCADE ").executeUpdate()
        } else {
            entityManager!!.createNativeQuery("truncate table $joinToString ").executeUpdate()
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
