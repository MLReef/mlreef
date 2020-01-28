package com.mlreef.rest.feature.project

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.exceptions.Error
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.ProjectCreationException
import com.mlreef.rest.exceptions.ProjectDeleteException
import com.mlreef.rest.exceptions.ProjectUpdateException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.findById2
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import java.util.*

interface DataProjectService {
    fun createDataProject(userToken: String, ownerId: UUID, projectPath: String, projectName: String): DataProject
    fun updateDataProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String): DataProject
    fun deleteDataProject(userToken: String, ownerId: UUID, projectUUID: UUID)
}

@Service
class GitlabDataProjectService(
    private val dataProjectRepository: DataProjectRepository,
    private val gitlabRestClient: GitlabRestClient
) : DataProjectService {

    override fun createDataProject(userToken: String, ownerId: UUID, projectPath: String, projectName: String): DataProject {
        try {
            val gitLabProject = gitlabRestClient.createProject(token = userToken, name = projectName, path = projectPath)

            val id = UUID.randomUUID()

            val dataProject = DataProject(
                id = id,
                slug = gitLabProject.path,
                ownerId = ownerId,
                url = gitLabProject.webUrl,
                name = gitLabProject.name,
                gitlabProject = gitLabProject.path,
                gitlabGroup = "data-group-$id",
                gitlabId = gitLabProject.id.toInt()
            )

            return dataProjectRepository.save(dataProject)
        } catch (e: HttpClientErrorException) {
            // TODO maybe encapsulate better errors?
            throw ProjectCreationException(Error.GitlabProjectCreationFailed, "Cannot create Project $projectPath: ${e.responseBodyAsString}")
        }
    }

    override fun updateDataProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String): DataProject {
        val dataProject = dataProjectRepository.findById2(projectUUID)
            ?: throw NotFoundException("Data project not found")

        if (dataProject.ownerId != ownerId) {
            throw NotFoundException("Data project not found")
        }
        try {
            gitlabRestClient.updateProject(id = dataProject.gitlabId.toLong(), token = userToken, name = projectName)
            return dataProjectRepository.save(dataProject.copy(gitlabProject = projectName))
        } catch (e: HttpClientErrorException) {
            // TODO maybe encapsulate better errors?
            throw ProjectUpdateException(Error.GitlabProjectCreationFailed, "Cannot update Project $projectUUID: ${e.responseBodyAsString}")
        }
    }

    override fun deleteDataProject(userToken: String, ownerId: UUID, projectUUID: UUID) {
        try {
            val dataProject = dataProjectRepository.findById2(projectUUID)
                ?: throw NotFoundException("Data project not found")

            if (dataProject.ownerId != ownerId) {
                throw NotFoundException("Data project not found")
            }
            gitlabRestClient.deleteProject(id = dataProject.gitlabId.toLong(), token = userToken)

            dataProjectRepository.delete(dataProject)
        } catch (e: HttpClientErrorException) {
            // TODO maybe encapsulate better errors?
            throw ProjectDeleteException(Error.GitlabProjectCreationFailed, "Cannot delete Project $projectUUID: ${e.responseBodyAsString}")
        }
    }
}
