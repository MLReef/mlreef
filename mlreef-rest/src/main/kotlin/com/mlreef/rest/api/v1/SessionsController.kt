package com.mlreef.rest.api.v1

import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.system.SessionDto
import com.mlreef.rest.feature.system.SessionsService
import org.slf4j.LoggerFactory
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/sessions")
class SessionsController(
    val gitlabRestClient: GitlabRestClient,
    val sessionsService: SessionsService,
    val currentUserService: CurrentUserService
) {
    companion object {
        private val log = LoggerFactory.getLogger(SessionsController::class.java)
    }

    // CLOSE THE METHODS FOR ADMINS ONLY
    @GetMapping("/user")
    @PreAuthorize("isGitlabAdmin()")
    fun getSessionsListForUser(
        @RequestParam(value = "user_name", required = false) userName: String?,
        @RequestParam(value = "token", required = false) token: String?
    ): List<SessionDto> {
        var username: String? = null

        if (token == null) {
            username = userName ?: currentUserService.account().username
        }
        log.warn("Requested sessions list for user $username or for session $token")

        return sessionsService.getSessionsList(username, token)
    }

    @DeleteMapping("/kill")
    fun killSessionsByUsername(
        @RequestParam(value = "user_name", required = false) userName: String?,
        @RequestParam(value = "token", required = false) token: String?
    ): String {
        var username: String? = null

        if (token == null) {
            username = userName ?: currentUserService.account().username
        }
        log.warn("Requested sessions kill for user $userName or for session $token")

        val sessionKilled = sessionsService.killAllSessions(username, token)

        return "Sessions killed: $sessionKilled"
    }


}
