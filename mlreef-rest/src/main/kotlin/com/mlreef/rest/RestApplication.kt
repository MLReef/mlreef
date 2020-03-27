package com.mlreef.rest

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

object ApplicationProfiles {
    const val TEST = "test"
    const val INTEGRATION_TEST = "integration-test"
    const val DEV = "dev"
    const val DOCKER = "docker"
    const val PROD = "prod"
}

@SpringBootApplication(scanBasePackages = ["com.mlreef", "com.mlreef.rest"])
class RestApplication

fun main(args: Array<String>) {
    runApplication<RestApplication>(*args)
}

@Profile(value = [ApplicationProfiles.DEV, ApplicationProfiles.PROD, ApplicationProfiles.DOCKER])
@Component
internal class AssertGitlabAppStartupRunner(private val restClient: GitlabRestClient) : CommandLineRunner {

    val log = LoggerFactory.getLogger(GitlabRestClient::class.java)

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

