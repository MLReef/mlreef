package com.mlreef.rest.feature.project

import com.mlreef.rest.DataProject
import com.mlreef.rest.MLProject
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.helpers.ProjectOfUser
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.util.UUID

interface GenericProjectService : ProjectRequesterService<MLProject>

@Service
class GitlabGenericProjectService(
    private val codeProjectService: CodeProjectService,
    private val dataProjectService: DataProjectService,
    private val publicProjectsCacheService: PublicProjectsCacheService

) : GenericProjectService {

    override fun getAllPublicProjects(): List<MLProject> {
        val result = mutableListOf<MLProject>()
        return result
            .also { it.addAll(codeProjectService.getAllPublicProjects()) }
            .also { it.addAll(dataProjectService.getAllPublicProjects()) }
    }

    override fun getAllPublicProjects(pageable: Pageable): Page<MLProject> {
        val publicProjectsList = publicProjectsCacheService.getPublicProjectsIdsList(pageable)
        val allProjectsForUser = getAllProjectsByIds(publicProjectsList)
        return PageImpl(allProjectsForUser, publicProjectsList.pageable, publicProjectsList.totalElements)
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>): List<MLProject> {
        val result = mutableListOf<MLProject>()
        return result
            .also { it.addAll(codeProjectService.getAllProjectsByIds(ids)) }
            .also { it.addAll(dataProjectService.getAllProjectsByIds(ids)) }
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>, pageable: Pageable): Page<MLProject> {

        val codeProjects = codeProjectService.getAllProjectsByIds(ids, pageable)

        val dataProjects = if (codeProjects.numberOfElements>=pageable.pageSize) {
            Page.empty<DataProject>()
        } else {
            val newPageable = PageRequest.of(pageable.pageNumber, pageable.pageSize - codeProjects.numberOfElements, pageable.sort)
            dataProjectService.getAllProjectsByIds(ids, newPageable)
        }

        val allProjectsList = mutableListOf<MLProject>()
            .apply {
                addAll(codeProjects)
                addAll(dataProjects)
            }

        return PageImpl(allProjectsList, pageable, codeProjects.totalElements + dataProjects.totalElements)
    }

    override fun getAllProjectsForUser(personId: UUID): List<MLProject> {
        val result = mutableListOf<MLProject>()
        return result
            .also { it.addAll(codeProjectService.getAllProjectsForUser(personId)) }
            .also { it.addAll(dataProjectService.getAllProjectsForUser(personId)) }
    }

    override fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): MLProject? {
        return codeProjectService.getProjectByIdAndPersonId(projectId, personId)
            ?: dataProjectService.getProjectByIdAndPersonId(projectId, personId)
    }

    override fun getProjectById(projectId: UUID): MLProject? {
        return codeProjectService.getProjectById(projectId) ?: dataProjectService.getProjectById(projectId)
    }

    override fun getProjectsByNamespace(namespaceName: String): List<MLProject> {
        val result = mutableListOf<MLProject>()
        return result
            .also { it.addAll(codeProjectService.getProjectsByNamespace(namespaceName)) }
            .also { it.addAll(dataProjectService.getProjectsByNamespace(namespaceName)) }
    }

    override fun getProjectsBySlug(slug: String): List<MLProject> {
        val result = mutableListOf<MLProject>()
        return result
            .also { it.addAll(codeProjectService.getProjectsBySlug(slug)) }
            .also { it.addAll(dataProjectService.getProjectsBySlug(slug)) }
    }

    override fun getProjectsByNamespaceAndSlug(namespaceName: String, slug: String): MLProject? {
        return codeProjectService.getProjectsByNamespaceAndSlug(namespaceName, slug)
            ?: dataProjectService.getProjectsByNamespaceAndSlug(namespaceName, slug)
    }

    override fun getUserProjectsList(userId: UUID?): List<ProjectOfUser> {
        val result = mutableListOf<ProjectOfUser>()
        return result
            .also { it.addAll(codeProjectService.getUserProjectsList(userId)) }
            .also { it.addAll(dataProjectService.getUserProjectsList(userId)) }
    }
}