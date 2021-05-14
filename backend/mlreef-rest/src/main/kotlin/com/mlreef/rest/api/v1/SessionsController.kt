package com.mlreef.rest.api.v1

import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.api.v1.dto.toUserDto
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.auth.AuthService
import com.mlreef.rest.feature.auth.UserResolverService
import com.mlreef.rest.feature.system.SessionDto
import com.mlreef.rest.feature.system.SessionsService
import org.slf4j.LoggerFactory
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/sessions")
class SessionsController(
    val gitlabRestClient: GitlabRestClient,
    val sessionsService: SessionsService,
    val currentUserService: CurrentUserService,
    val authService: AuthService,
    val userResolverService: UserResolverService,
) {
    companion object {
        private val log = LoggerFactory.getLogger(SessionsController::class.java)
    }

    // FIXME: Coverage says: missing tests
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

    // FIXME: Coverage says: missing tests
    @DeleteMapping("/kill")
    @PreAuthorize("isGitlabAdmin() || isUserItself(#userName) || isUserItselfByToken(#token)")
    fun killSessions(
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

    // FIXME: Coverage says: missing tests
    @GetMapping("/find/user")
    @PreAuthorize("isGitlabAdmin() || isUserItself(#userId) || isUserItself(#gitlabId) || isUserItself(#userName)")
    fun findUser(
        @RequestParam(value = "user_name", required = false) userName: String?,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?
    ): UserDto? {
        log.debug("Find user by username=$userName and userId=$userId and gitlabId=$gitlabId")
        val user = userResolverService.resolveAccount(userName, userId, gitlabId)
        val gitlabUser =
            if (user != null && user.person.gitlabId != null) userResolverService.findGitlabUserViaGitlabId(user.person.gitlabId!!) else null
        return user?.toUserDto()
    }
}
