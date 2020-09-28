package com.mlreef.rest.feature.project

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProject
import com.mlreef.rest.Project
import org.springframework.stereotype.Service
import java.util.*

interface ProjectResolverService {
    fun resolveProject(projectId: UUID? = null, projectGitlabId: Long? = null): Project?
}

@Service
class ProjectResolverServiceImpl(
    private val dataProjectService: ProjectService<DataProject>,
    private val codeProjectService: ProjectService<CodeProject>,
) : ProjectResolverService {
    override fun resolveProject(projectId: UUID?, projectGitlabId: Long?): Project? {
        return when {
            projectId != null -> dataProjectService.getProjectById(projectId)
                ?: codeProjectService.getProjectById(projectId)
            projectGitlabId != null -> dataProjectService.getProjectByGitlabId(projectGitlabId)
                ?: codeProjectService.getProjectByGitlabId(projectGitlabId)
            else -> null
        }
    }
}