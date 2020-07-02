package com.mlreef.rest.api.v1

import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.feature.project.GenericProjectService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
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
    fun getAllProjects(person: Person): List<ProjectDto> {
        return projectService.getAllProjectsForUser(person.id).map { it.toDto() }
    }

    @GetMapping("/public")
    fun getPublicProjects(pageable: Pageable): Page<ProjectDto> {
        val list = projectService.getAllPublicProjects(pageable).map { it.toDto() }
        return PageImpl(list, pageable, list.size.toLong())
    }

    @GetMapping("/{id}")
    @PreAuthorize("canViewProject(#id)")
    fun getProjectById(@PathVariable id: UUID): ProjectDto {
        val project = projectService.getProjectById(id) ?: throw ProjectNotFoundException(projectId = id)
        return project.toDto()
    }

    @GetMapping("/namespace/{namespace}")
    @PostFilter("canViewProject()")
    fun getProjectsByNamespace(@PathVariable namespace: String): List<ProjectDto> {
        val projects = projectService.getProjectsByNamespace(namespace)
        return projects.map { it.toDto() }
    }

    @GetMapping("/slug/{slug}")
    @PostFilter("canViewProject()")
    fun getProjectBySlug(@PathVariable slug: String): List<ProjectDto> {
        val dataProjects = projectService.getProjectsBySlug(slug)
        return dataProjects.map { it.toDto() }
    }

    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("canViewProject()")
    fun getProjectsByNamespaceAndSlugInPath(@PathVariable namespace: String, @PathVariable slug: String): ProjectDto {
        val dataProject = projectService.getProjectsByNamespaceAndPath(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return dataProject.toDto()
    }
}
