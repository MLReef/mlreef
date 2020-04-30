package com.mlreef.rest.api.v1

import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.dto.MLProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.feature.project.GenericProjectService
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.logging.Logger

@RestController
@RequestMapping("/api/v1/projects")
class GenericProjectsController(
    private val projectService: GenericProjectService
) {
    private val log: Logger = Logger.getLogger(GenericProjectsController::class.simpleName)

    @GetMapping
    fun getAllDataProjects(person: Person): List<MLProjectDto> {
        return projectService.getAllProjectsForUser(person.id).map { it.toDto() }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isCurrentUserInProject(#id)")
    fun getDataProjectById(@PathVariable id: UUID): MLProjectDto {
        val project = projectService.getProjectById(id) ?: throw ProjectNotFoundException(projectId = id)
        return project.toDto()
    }

    @GetMapping("/namespace/{namespace}")
    @PostFilter("filterProjectByUserInProject()")
    fun getCodeProjectsByNamespace(@PathVariable namespace: String): List<MLProjectDto> {
        val projects = projectService.getProjectsByNamespace(namespace)
        return projects.map { it.toDto() }
    }

    @GetMapping("/slug/{slug}")
    @PostFilter("filterProjectByUserInProject()")
    fun getCodeProjectBySlug(@PathVariable slug: String): List<MLProjectDto> {
        val dataProjects = projectService.getProjectsBySlug(slug)
        return dataProjects.map { it.toDto() }
    }

    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("isCurrentUserInResultProject()")
    fun getCodeProjectsByNamespaceAndSlugInPath(@PathVariable namespace: String, @PathVariable slug: String): MLProjectDto {
        val dataProject = projectService.getProjectsByNamespaceAndSlug(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return dataProject.toDto()
    }
}
