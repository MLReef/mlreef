package com.mlreef.rest.testcommons

import com.mlreef.rest.ApplicationProfiles
import org.slf4j.LoggerFactory
import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.output.Slf4jLogConsumer
import org.testcontainers.containers.wait.strategy.HttpWaitStrategy
import java.time.Duration

@ActiveProfiles(ApplicationProfiles.TEST)
class TestGitlabContainer private constructor() : GenericContainer<TestGitlabContainer>("gitlab/gitlab-ce:12.7.0-ce.0") {
    companion object {
        val logger = LoggerFactory.getLogger(this::class.java)

        const val ROOT_PASSWORD = "password"
        const val ADMIN_TOKEN = "TEST-ADMIN-TOKEN"

        val instance by lazy {
            val waitStrategy = HttpWaitStrategy()
                .forPath("/")
                .forStatusCode(200)
                .withStartupTimeout(Duration.ofSeconds(600))

            val container = TestGitlabContainer().apply {
                withExposedPorts(80)
                setWaitStrategy(waitStrategy)
                withLogConsumer(Slf4jLogConsumer(logger))
                withEnv(createConfig())
            }

            container
        }

        fun createConfig(): Map<String, String> {
            val gitlabConfig = mapOf<String, String>(
                "GITLAB_ROOT_PASSWORD" to ROOT_PASSWORD,
                "GITLAB_ROOT_EMAIL" to "",
                "GITLAB_HTTPS" to "false",
                "TZ" to "Austria/Vienna",
                "GITLAB_TIMEZONE" to "Vienna",
                "SSL_SELF_SIGNED" to "false"
            )
            return gitlabConfig
        }
    }

    object Initializer : ApplicationContextInitializer<ConfigurableApplicationContext> {
        override fun initialize(applicationContext: ConfigurableApplicationContext) {
            val container = instance
            container.start()
            val port = container.firstMappedPort
            val host = container.containerIpAddress
            val gitlabRootUrl = "http://$host:$port"
            System.setProperty("GITLAB_ROOT_URL", gitlabRootUrl)
            System.setProperty("GITLAB_ADMIN_TOKEN", gitlabRootUrl)
            TestPropertyValues.of(
                "mlreef.gitlab.rootUrl=$gitlabRootUrl",
                "mlreef.gitlab.adminUsername=root",
                "mlreef.gitlab.adminPassword=$ROOT_PASSWORD",
                "mlreef.gitlab.adminUserToken="
            ).applyTo(applicationContext.environment)
        }
    }
}
