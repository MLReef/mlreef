package com.mlreef.rest.feature.project

import com.mlreef.rest.Project
import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID

interface GenericProjectService : RetrievingProjectService<Project>

@Service
class GitlabGenericProjectService(
    private val projectRepository: ProjectRepository,
    private val publicProjectsCacheService: PublicProjectsCacheService
) : GenericProjectService {

    override fun getAllPublicProjects(): List<Project> {
        val projectsIds = publicProjectsCacheService.getPublicProjectsIdsList()
        return projectRepository.findAllById(projectsIds).toList()
    }

    override fun getAllPublicProjects(pageable: Pageable): List<Project> {
        val projectsIds = publicProjectsCacheService.getPublicProjectsIdsList(pageable)
        return projectRepository.findAllById(projectsIds).toList()
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>): List<Project> {
        return projectRepository.findAllById(ids).toList()
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>, pageable: Pageable): Page<Project> {
        return projectRepository.findAllByIdIn(ids, pageable)
    }

    override fun getAllProjectsForUser(personId: UUID): List<Project> {
        return projectRepository.findAllByOwnerId(personId)
    }

    override fun getProjectById(projectId: UUID): Project? {
        return projectRepository.findByIdOrNull(projectId)
    }

    override fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): Project? {
        return projectRepository.findOneByOwnerIdAndId(personId, projectId)
    }

    override fun getProjectsByNamespace(namespaceName: String): List<Project> {
        return projectRepository.findByNamespace("$namespaceName/")
    }

    override fun getProjectsBySlug(slug: String): List<Project> {
        return projectRepository.findBySlug(slug)
    }

    override fun getProjectsByNamespaceAndPath(namespaceName: String, slug: String): Project? {
        return projectRepository.findByNamespaceAndPath(namespaceName, slug)
    }

}