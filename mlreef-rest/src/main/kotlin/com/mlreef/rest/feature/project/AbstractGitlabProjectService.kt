package com.mlreef.rest.feature.project

import com.mlreef.rest.MLProject
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.exceptions.ProjectDeleteException
import com.mlreef.rest.exceptions.ProjectUpdateException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.*

interface ProjectService<T : MLProject> {
    fun createProject(userToken: String, ownerId: UUID, projectSlug: String, projectName: String, projectNamespace: String): T
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

    val log = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates the Project in gitlab and saves a new DataProject/CodeProject in mlreef context
     */
    override fun createProject(userToken: String, ownerId: UUID, projectSlug: String, projectName: String, projectNamespace: String): T {

        val findNamespace = try {
            gitlabRestClient.findNamespace(userToken, projectNamespace)
        } catch (e: Exception) {
            log.warn("Namespace cannot be found, will use default one of user")
            null
        }
        val gitLabProject = gitlabRestClient.createProject(
            token = userToken,
            slug = projectSlug,
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id)
        val codeProject = createNewProject(ownerId, gitLabProject)
        return saveNewProject(codeProject)

    }

    override fun updateProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String): T {
        val codeProject = assertFindExisting(ownerId, projectUUID)
        try {
            gitlabRestClient.updateProject(id = codeProject.gitlabId.toLong(), token = userToken, name = projectName)
            return updateSaveProject(codeProject, projectName = projectName)
        } catch (e: GitlabCommonException) {
            throw ProjectUpdateException(ErrorCode.GitlabProjectCreationFailed, "Cannot update Project $projectUUID: ${e.responseBodyAsString}")
        }
    }

    override fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID) {
        try {
            val codeProject = assertFindExisting(ownerId, projectUUID)
            gitlabRestClient.deleteProject(id = codeProject.gitlabId.toLong(), token = userToken)
            deleteExistingProject(codeProject)
        } catch (e: GitlabCommonException) {
            throw ProjectDeleteException(ErrorCode.GitlabProjectCreationFailed, "Cannot delete Project $projectUUID: ${e.responseBodyAsString}")
        }
    }
}
