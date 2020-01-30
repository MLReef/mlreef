package com.mlreef.rest.feature.project

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabProject
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.springframework.stereotype.Service
import java.util.*

interface DataProjectService : ProjectService<DataProject>

@Service
class GitlabDataProjectService(
    private val dataProjectRepository: DataProjectRepository,
    gitlabRestClient: GitlabRestClient
) : DataProjectService, AbstractGitlabProjectService<DataProject>(gitlabRestClient) {

    override fun saveNewProject(mlProject: DataProject): DataProject {
        return dataProjectRepository.save(mlProject)
    }

    override fun deleteExistingProject(mlProject: DataProject) {
        return dataProjectRepository.delete(mlProject)
    }

    override fun createNewProject(ownerId: UUID, gitLabProject: GitlabProject): DataProject {
        val id = UUID.randomUUID()
        return DataProject(
            id = id,
            slug = gitLabProject.path,
            ownerId = ownerId,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabGroup = "data-group-$id",
            gitlabId = gitLabProject.id.toInt()
        )
    }

    override fun assertFindExisting(ownerId: UUID, projectUUID: UUID) =
        dataProjectRepository.findOneByOwnerIdAndId(ownerId, projectUUID)
            ?: throw NotFoundException("Data project not found")

    override fun updateSaveProject(mlProject: DataProject, projectName: String?): DataProject {
        return dataProjectRepository.save(mlProject.copy(gitlabProject = projectName))
    }
}
