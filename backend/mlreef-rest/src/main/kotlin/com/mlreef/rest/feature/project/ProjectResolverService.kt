package com.mlreef.rest.feature.project

import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Project
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID

interface ProjectResolverService {
    fun resolveProject(
        projectId: UUID? = null,
        projectGitlabId: Long? = null,
        namespace: String? = null,
        slug: String? = null,
        gitlabPath: String? = null,
    ): Project?

    fun resolveCodeProject(
        projectId: UUID? = null,
        projectGitlabId: Long? = null,
        namespace: String? = null,
        slug: String? = null,
        gitlabPath: String? = null,
    ): CodeProject?

    fun resolveDataProject(
        projectId: UUID? = null,
        projectGitlabId: Long? = null,
        namespace: String? = null,
        slug: String? = null,
        gitlabPath: String? = null,
    ): DataProject?
}

@Service
class ProjectResolverServiceImpl(
    private val dataProjectRepository: DataProjectRepository,
    private val codeProjectRepository: CodeProjectRepository,
) : ProjectResolverService {
    override fun resolveProject(
        projectId: UUID?,
        projectGitlabId: Long?,
        namespace: String?,
        slug: String?,
        gitlabPath: String?,
    ): Project? {
        return when {
            projectId != null -> dataProjectRepository.findByIdOrNull(projectId)
                ?: codeProjectRepository.findByIdOrNull(projectId)
            projectGitlabId != null -> dataProjectRepository.findByGitlabId(projectGitlabId)
                ?: codeProjectRepository.findByGitlabId(projectGitlabId)
            namespace != null && slug != null -> dataProjectRepository.findByNamespaceAndSlug(namespace, slug)
                ?: codeProjectRepository.findByNamespaceAndSlug(namespace, slug)
            namespace != null && gitlabPath != null ->
                dataProjectRepository.findByNamespaceAndPath(namespace, gitlabPath)
                    ?: codeProjectRepository.findByNamespaceAndPath(namespace, gitlabPath)
            else -> null
        }
    }

    override fun resolveCodeProject(
        projectId: UUID?,
        projectGitlabId: Long?,
        namespace: String?,
        slug: String?,
        gitlabPath: String?,
    ): CodeProject? {
        return when {
            projectId != null -> codeProjectRepository.findByIdOrNull(projectId)
            projectGitlabId != null -> codeProjectRepository.findByGitlabId(projectGitlabId)
            namespace != null && slug != null -> codeProjectRepository.findByNamespaceAndSlug(namespace, slug)
            namespace != null && gitlabPath != null ->
                codeProjectRepository.findByNamespaceAndPath(namespace, gitlabPath)
            else -> null
        }
    }

    override fun resolveDataProject(
        projectId: UUID?,
        projectGitlabId: Long?,
        namespace: String?,
        slug: String?,
        gitlabPath: String?
    ): DataProject? {
        return when {
            projectId != null -> dataProjectRepository.findByIdOrNull(projectId)
            projectGitlabId != null -> dataProjectRepository.findByGitlabId(projectGitlabId)
            namespace != null && slug != null -> dataProjectRepository.findByNamespaceAndSlug(namespace, slug)
            namespace != null && gitlabPath != null ->
                dataProjectRepository.findByNamespaceAndPath(namespace, gitlabPath)
            else -> null
        }
    }
}