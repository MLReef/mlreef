package com.mlreef.rest.api.v1

import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.slf4j.LoggerFactory
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/info") //, produces = ["application/json"], consumes = ["application/json"])
class SystemController(
    val gitlabRestClient: GitlabRestClient,
    val currentUserService: CurrentUserService
) {

    companion object {
        private val log = LoggerFactory.getLogger(SystemController::class.java)
    }

    @GetMapping("/status")
    fun status(): StatusDto {
        return StatusDto("Hello.")
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/health")
    fun health(): StatusDto {
        return try {
            val returnString = gitlabRestClient.assertConnection()

            return if (returnString == null) {
                StatusDto("Gitlab seems to be reachable: ${gitlabRestClient.gitlabServiceRootUrl}")
            } else {
                StatusDto(returnString)
            }
        } catch (e: Exception) {
            StatusDto("FATAL: ${gitlabRestClient.gitlabServiceRootUrl}", e)
        }
    }

    // FIXME: Coverage says: missing tests
    @RequestMapping(method = [RequestMethod.GET], value = ["/ping"])
    fun ping(): String {
        log.info("Ping service: Ok!")
        return "pong"
    }

    // FIXME: Coverage says: missing tests
    @RequestMapping(value = ["/ping/protected"], method = [RequestMethod.GET])
    @PreAuthorize("isAuthenticated()")
    fun pingProtected(): String {
        log.info("Protected Ping service: Ok!")
        return "pong protected"
    }

    data class StatusDto(val info: String, val error: Exception? = null)
}
