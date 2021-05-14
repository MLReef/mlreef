package com.mlreef.rest.api.v1

import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Project
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.project.ProjectService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/v1/requests"])
class RequestsController(
    private val projectService: ProjectService<Project>,
    private val dataProjectService: ProjectService<DataProject>,
    private val codeProjectService: ProjectService<CodeProject>,
) {
    @GetMapping("/data-projects/create-requests")
    fun getCreateDataProjectRequests(
        profile: TokenDetails,
    ): List<ProjectCreateRequest> {
        val projects = dataProjectService.getOwnProjectsOfUser(profile)

        return projects.map {
            ProjectCreateRequest(
                it.id,
                it.slug,
                it.gitlabNamespace,
                it.name,
                it.description,
                false,
                it.inputDataTypes.map { it.name }.toList(),
                visibility = it.visibilityScope,
                tags = it.tags.toList(),
            )
        }
    }

    @GetMapping("/data-projects/update-requests")
    fun getUpdateDataProjectRequests(
        profile: TokenDetails,
    ): List<ProjectUpdateRequest> {
        val projects = dataProjectService.getOwnProjectsOfUser(profile)

        return projects.map {
            ProjectUpdateRequest(
                it.id,
                it.name,
                it.description,
                it.visibilityScope,
                it.inputDataTypes.map { it.name }.toList(),
                tags = it.tags.toList(),
            )
        }
    }

    @GetMapping("/code-projects/create-requests")
    fun getCreateCodeProjectRequests(
        profile: TokenDetails,
    ): List<ProjectCreateRequest> {
        val projects = codeProjectService.getOwnProjectsOfUser(profile)

        return projects.map {
            ProjectCreateRequest(
                it.id,
                it.slug,
                it.gitlabNamespace,
                it.name,
                it.description,
                false,
                it.inputDataTypes.map { it.name }.toList(),
                it.outputDataTypes.map { it.name }.toList(),
                it.visibilityScope,
                it.processorType.name,
                it.tags.toList(),
            )
        }
    }

    @GetMapping("/code-projects/update-requests")
    fun getUpdateCodeProjectRequests(
        profile: TokenDetails,
    ): List<ProjectUpdateRequest> {
        val projects = codeProjectService.getOwnProjectsOfUser(profile)

        return projects.map {
            ProjectUpdateRequest(
                it.id,
                it.name,
                it.description,
                it.visibilityScope,
                it.inputDataTypes.map { it.name }.toList(),
                it.outputDataTypes.map { it.name }.toList(),
                it.tags.toList(),
            )
        }
    }
}