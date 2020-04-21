package com.mlreef.rest.feature.project

import com.mlreef.rest.MLProject
import com.mlreef.rest.helpers.ProjectOfUser
import org.springframework.stereotype.Service
import java.util.UUID

interface GenericProjectService : ProjectRequesterService<MLProject>

@Service
class GitlabGenericProjectService(
    private val codeProjectService: CodeProjectService,
    private val dataProjectService: DataProjectService
) : GenericProjectService {
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