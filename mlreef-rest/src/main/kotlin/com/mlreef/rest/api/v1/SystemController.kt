package com.mlreef.rest.api.v1

import com.mlreef.rest.Account
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.UserDto
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/info", produces = ["application/json"], consumes = ["application/json"])
class SystemController(
    val gitlabRestClient: GitlabRestClient,
    val currentUserService: CurrentUserService
) {

    @GetMapping("/status")
    fun status(): StatusDto {
        return StatusDto("Hello.")
    }

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

    @GetMapping("/whoami")
    fun whoami(): UserDto {
        val account = currentUserService.account()
        return buildUserDtoWithToken(account)
    }

    private fun buildUserDtoWithToken(newAccount: Account): UserDto {
        return UserDto(newAccount.id, newAccount.username, newAccount.email, "censored")
    }

    data class StatusDto(val info: String, val error: Exception? = null)
}
