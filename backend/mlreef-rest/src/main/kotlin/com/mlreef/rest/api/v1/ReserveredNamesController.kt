package com.mlreef.rest.api.v1

import com.mlreef.rest.domain.Project
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.auth.AuthService
import com.mlreef.rest.feature.groups.GroupsService
import com.mlreef.rest.feature.project.ProjectService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping(value = ["/api/v1/project-names", "/api/v1/group-names", "/api/v1/user-names"])
class ReservedNamesController(
    private val projectService: ProjectService<Project>,
    private val groupService: GroupsService,
    private val authService: AuthService,
) {

    @GetMapping("/is-available")
    fun checkAvailability(
        @RequestParam(required = true) name: String = "",
        @RequestParam(required = false) namespace: String?,
        request: HttpServletRequest,
        token: TokenDetails,
    ): SlugDto {
        val slug: String = when {
            request.requestURL.contains("project-names") -> {
                projectService.checkAvailability(
                    userToken = token.accessToken,
                    creatorId = token.accountId,
                    projectName = name,
                    projectNamespace = namespace,
                )
            }
            request.requestURL.contains("group-names") -> {
                groupService.checkAvailability(
                    userToken = token.accessToken,
                    creatorId = token.accountId,
                    groupName = name,
                )
            }
            request.requestURL.contains("user-names") -> {
                authService.checkAvailability(name)
            }
            else -> {
                throw BadParametersException("You should request either /project-names or /group-names or /user-names endpoints")
            }
        }
        return SlugDto(slug)
    }
}

data class SlugDto(
    val slug: String
)