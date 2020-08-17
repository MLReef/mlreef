package com.mlreef.rest

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

object ApplicationProfiles {
    const val TEST = "test"
    const val SPRING_CONTEXT_TEST = "spring-context-test"
    const val INTEGRATION_TEST = "integration-test"
    const val SYSTEM_TEST = "system-test"
    const val DEV = "dev"
    const val DOCKER = "docker"
    const val PROD = "prod"
}

@SpringBootApplication(scanBasePackages = [
    "com.mlreef",
    "com.mlreef.rest",
    "com.mlreef.rest.marketplace"
])
@EnableConfigurationProperties(
    ApplicationConfiguration::class,
    EpfConfiguration::class,
    GitlabConfiguration::class,
    SystemTestConfiguration::class
)
class RestApplication

fun main(args: Array<String>) {
    runApplication<RestApplication>(*args)
}

@Component
@Profile(ApplicationProfiles.DEV, ApplicationProfiles.PROD, ApplicationProfiles.DOCKER)
internal class AssertGitlabAppStartupRunner(private val restClient: GitlabRestClient) : CommandLineRunner {

    val log = LoggerFactory.getLogger(GitlabRestClient::class.java) as Logger

    @Throws(Exception::class)
    override fun run(vararg args: String) {
        try {
            restClient.assertConnection()
        } catch (e: Exception) {
            log.error("####################################################################################################")
            log.error("# Could not run AssertGitlabAppStartupRunner: Gitlab connection will never work with this config   #")
            log.error("####################################################################################################", e)
            throw e
        }
    }
}


@ConfigurationProperties(prefix = "mlreef")
class ApplicationConfiguration(
    val epf: EpfConfiguration,
    val gitlab: GitlabConfiguration
)

@ConfigurationProperties(prefix = "mlreef.gitlab")
class GitlabConfiguration {
    lateinit var rootUrl: String
    lateinit var adminUsername: String
    lateinit var adminPassword: String
    lateinit var adminUserToken: String
}

@ConfigurationProperties(prefix = "mlreef.epf")
class EpfConfiguration {
    lateinit var imageTag: String
    lateinit var gitlabUrl: String
    lateinit var backendUrl: String
}

@ConfigurationProperties(prefix = "systemtest")
@Profile(ApplicationProfiles.SYSTEM_TEST)
class SystemTestConfiguration {
    lateinit var backendUrl: String
//    lateinit var gitlabUrl: String
//    lateinit var adminUsername: String
//    lateinit var adminPassword: String
//    lateinit var adminUserToken: String
}