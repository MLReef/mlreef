package com.mlreef.rest.api.v1

import com.mlreef.rest.Person
import com.mlreef.rest.Project
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.groups.GroupsService
import com.mlreef.rest.feature.project.ProjectService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping(value = ["/api/v1/project-names", "/api/v1/group-names"])
class ReservedNamesController(
    private val projectService: ProjectService<Project>,
    private val groupService: GroupsService,
) {

    @GetMapping("/is-available")
    fun checkAvailability(
        @RequestParam(required = true) name: String = "",
        @RequestParam(required = false) namespace: String?,
        request: HttpServletRequest,
        token: TokenDetails,
        person: Person
    ): SlugDto {
        val slug: String = when {
            request.requestURL.contains("project-names") -> {
                projectService.checkAvailability(
                    userToken = token.accessToken,
                    creatingPersonId = person.id,
                    projectName = name,
                    projectNamespace = namespace,
                )
            }
            request.requestURL.contains("group-names") -> {
                groupService.checkAvailability(
                    userToken = token.accessToken,
                    creatingPersonId = person.id,
                    groupName = name,
                )
            }
            else -> {
                throw BadParametersException("You should request either /project-names or /group-names endpoints")
            }
        }
        return SlugDto(slug)
    }
}

data class SlugDto(
    val slug: String
)