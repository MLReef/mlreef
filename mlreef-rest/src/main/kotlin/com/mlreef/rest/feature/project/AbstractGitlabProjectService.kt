package com.mlreef.rest.feature.project

import com.mlreef.rest.MLProject
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.ProjectCreationException
import com.mlreef.rest.exceptions.ProjectDeleteException
import com.mlreef.rest.exceptions.ProjectUpdateException
import com.mlreef.rest.external_api.gitlab.GitlabProject
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import java.util.*

interface ProjectService<T : MLProject> {
    fun createProject(userToken: String, ownerId: UUID, projectPath: String, projectName: String): T
    fun updateProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String): T
    fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID)
}

@Service
abstract class AbstractGitlabProjectService<T : MLProject>(
    private val gitlabRestClient: GitlabRestClient
) : ProjectService<T> {

    internal abstract fun saveNewProject(mlProject: T): T
    internal abstract fun deleteExistingProject(mlProject: T)
    internal abstract fun updateSaveProject(mlProject: T, projectName: String?): T
    internal abstract fun createNewProject(ownerId: UUID, gitLabProject: GitlabProject): T
    internal abstract fun assertFindExisting(ownerId: UUID, projectUUID: UUID): T

    /**
     * Creates the Project in gitlab and saves a new DataProject/CodeProject in mlreef context
     */
    override fun createProject(userToken: String, ownerId: UUID, projectPath: String, projectName: String): T {
        try {
            val gitLabProject = gitlabRestClient.createProject(token = userToken, name = projectName, path = projectPath)
            val codeProject = createNewProject(ownerId, gitLabProject)
            return saveNewProject(codeProject)
        } catch (e: HttpClientErrorException) {
            throw ProjectCreationException(ErrorCode.GitlabProjectCreationFailed, "Cannot create Project $projectPath: ${e.responseBodyAsString}")
        }
    }

    override fun updateProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String): T {
        val codeProject = assertFindExisting(ownerId, projectUUID)
        try {
            gitlabRestClient.updateProject(id = codeProject.gitlabId.toLong(), token = userToken, name = projectName)
            return updateSaveProject(codeProject, projectName = projectName)
        } catch (e: HttpClientErrorException) {
            throw ProjectUpdateException(ErrorCode.GitlabProjectCreationFailed, "Cannot update Project $projectUUID: ${e.responseBodyAsString}")
        }
    }

    override fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID) {
        try {
            val codeProject = assertFindExisting(ownerId, projectUUID)
            gitlabRestClient.deleteProject(id = codeProject.gitlabId.toLong(), token = userToken)
            deleteExistingProject(codeProject)
        } catch (e: HttpClientErrorException) {
            throw ProjectDeleteException(ErrorCode.GitlabProjectCreationFailed, "Cannot delete Project $projectUUID: ${e.responseBodyAsString}")
        }
    }
}
