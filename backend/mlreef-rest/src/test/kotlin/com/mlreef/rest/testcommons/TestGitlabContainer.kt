package com.mlreef.rest.testcommons

import com.mlreef.rest.ApplicationProfiles
import org.slf4j.LoggerFactory
import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.BindMode
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.output.Slf4jLogConsumer
import org.testcontainers.containers.wait.strategy.LogMessageWaitStrategy
import java.time.Duration

@ActiveProfiles(ApplicationProfiles.TEST)
class TestGitlabContainer private constructor() : GenericContainer<TestGitlabContainer>("gitlab/gitlab-ce:12.7.0-ce.0") {
    companion object {
        val logger = LoggerFactory.getLogger(this::class.java)

        const val ROOT_PASSWORD = "password"

        private const val GITLAB_START_LOG_FRAGMENT = "database system is ready to accept connections"
        private const val GITLAB_START_LOG_REGEX = "^.*$GITLAB_START_LOG_FRAGMENT.*\$"

        private const val WAIT_FOR_COMPLETE_CONTAINER_UP_MS = 15000L

        val instance by lazy {
            val waitStrategyForLog = LogMessageWaitStrategy()
                .withRegEx(GITLAB_START_LOG_REGEX)
                .withTimes(1)
                .withStartupTimeout(Duration.ofSeconds(600))

            val container = TestGitlabContainer().apply {
                withExposedPorts(80)
                setWaitStrategy(waitStrategyForLog)
                withLogConsumer(Slf4jLogConsumer(logger))
                withEnv(createConfig())
                withClasspathResourceMapping("gitlab.rb", "/etc/gitlab/gitlab.rb", BindMode.READ_ONLY)
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
            Thread.sleep(WAIT_FOR_COMPLETE_CONTAINER_UP_MS)
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
