package com.mlreef.rest

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

object ApplicationProfiles {
    const val TEST = "test"
    const val DEV = "dev"
    const val PROD = "prod"
}

@SpringBootApplication(scanBasePackages = ["com.mlreef", "com.mlreef.rest"])
class RestApplication

fun main(args: Array<String>) {
    runApplication<RestApplication>(*args)
}

@Profile(ApplicationProfiles.DEV)
@Component
internal class AssertGitlabAppStartupRunner(private val restClient: GitlabRestClient) : CommandLineRunner {
    @Throws(Exception::class)
    override fun run(vararg args: String) {
        restClient.assertConnection()
    }
}

