package com.mlreef.rest.testcommons

import com.mlreef.rest.ApplicationProfiles
import org.slf4j.LoggerFactory
import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.output.Slf4jLogConsumer
import org.testcontainers.containers.wait.strategy.HostPortWaitStrategy

@ActiveProfiles(ApplicationProfiles.TEST, ApplicationProfiles.INTEGRATION_TEST)
class TestPostgresContainer private constructor() : PostgreSQLContainer<TestPostgresContainer>("postgres:11-alpine") {

    val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        const val DBUSER = "mlreef"
        const val DBPASS = "dbpassword"
        const val DBNAME = "mlreef_backend_int_test"
        val instance by lazy {
            TestPostgresContainer().apply {
                withExposedPorts(5432)
                setWaitStrategy(HostPortWaitStrategy())
                withLogConsumer(Slf4jLogConsumer(logger))
                withUsername(DBUSER)
                withPassword(DBPASS)
                withDatabaseName(DBNAME)
                withEnv("DB_EXTENSION", "pg_trgm")
            }
        }
    }

    object Initializer : ApplicationContextInitializer<ConfigurableApplicationContext> {
        override fun initialize(applicationContext: ConfigurableApplicationContext) {
            val postgres = instance
            postgres.start()
            val jdbcUrl = postgres.jdbcUrl
            val username = postgres.username
            val password = postgres.password
            val databaseName = postgres.databaseName
            System.setProperty("DB_URL", jdbcUrl)
            System.setProperty("DB_USER", username)
            System.setProperty("DB_PASSWORD", password)
            System.setProperty("DB_NAME", databaseName)
            TestPropertyValues.of(
                "spring.datasource.url=$jdbcUrl",
                "spring.datasource.username=$username",
                "spring.datasource.password=$password"
            ).applyTo(applicationContext.environment)
        }
    }
}
