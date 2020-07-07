package com.mlreef.rest.testcommons

import com.mlreef.rest.ApplicationProfiles
import org.slf4j.LoggerFactory
import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.output.Slf4jLogConsumer
import org.testcontainers.containers.wait.strategy.HostPortWaitStrategy

@ActiveProfiles(ApplicationProfiles.TEST, ApplicationProfiles.INTEGRATION_TEST)
class TestRedisContainer private constructor() : GenericContainer<TestRedisContainer>("redis:5-alpine") {

    val logger = LoggerFactory.getLogger(this::class.java)

    companion object {
        val instance by lazy {
            TestRedisContainer().apply {
                withPrivilegedMode(true)
                withExposedPorts(6379)
                withCommand("--protected-mode no")
                setWaitStrategy(HostPortWaitStrategy())
                withLogConsumer(Slf4jLogConsumer(logger))
            }
        }
    }

    object Initializer : ApplicationContextInitializer<ConfigurableApplicationContext> {
        override fun initialize(applicationContext: ConfigurableApplicationContext) {
            val redis = instance
            redis.start()
            val port = redis.firstMappedPort
            val host = redis.containerIpAddress
            System.setProperty("REDIS_HOST", host)
            System.setProperty("REDIS_PORT", "$port")
            TestPropertyValues.of(
                "spring.redis.host=$host",
                "spring.redis.port=$port"
            ).applyTo(applicationContext.environment)
        }
    }
}
