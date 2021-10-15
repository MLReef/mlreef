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
    const val DEV = "dev"
    const val DOCKER = "docker"
    const val PROD = "prod"
}

@SpringBootApplication(
    scanBasePackages = [
        "com.mlreef",
        "com.mlreef.rest",
        "com.mlreef.rest.marketplace"
    ]
)
@EnableConfigurationProperties(
    ApplicationConfiguration::class,
    EpfConfiguration::class,
    GitlabConfiguration::class,
    ProxyConfiguration::class,
    ProjectsConfiguration::class,
    FilesManagementConfiguration::class,
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
            log.error(
                "####################################################################################################",
                e
            )
            throw e
        }
    }
}

const val EPF_CONTROLLER_PATH = "/api/v1/epf"

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
    var epfImagePath: String? = null
    var experimentImagePath: String? = null
    var pipServer: String? = null
    var useDockerHost: Boolean = true
    var maxUpdatePublishStatus: Int = 10
    var retriesForPipeline: Int = 0

    //time after publish pipeline creation we consider it as failed if no success/finished status is gotten from gitlab
    var timeToConsiderPipelineFailedSec: Long = 60 * 60 * 3 //Default - 3 hours

    var mainPublishBranch: String = "master"
    var maxProcessorsForMainBranch: Int = 10
    var maxProcessorsForNonmainBranch: Int = 10

    var dvcWorkingDir: String = ""
    var awsDefaultRegion: String? = null
}

@ConfigurationProperties(prefix = "mlreef.proxy")
class ProxyConfiguration(
    var enabled: Boolean = false,
    var host: String? = null,
    var port: Int? = null,
)

@ConfigurationProperties(prefix = "mlreef.projects")
class ProjectsConfiguration(
    var syncFork: Boolean = true,
    var waitGitlabForkSec: Int = 30,
    var pauseForkFinishedPollingSec: Int = 2, //pause between project status requests
    var maxRecentProjectsHistorySize: Int = 10,
)

@ConfigurationProperties(prefix = "mlreef.files-management")
class FilesManagementConfiguration(
    var storagePlace: String? = null,
    var uploadDir: String? = null,
    var downloadDomain: String? = null,
    var downloadPath: String? = null,
)
