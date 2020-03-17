package com.mlreef.rest.feature.project

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
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

    override fun createNewProject(ownerId: UUID, gitlabProject: GitlabProject): DataProject {
        val id = UUID.randomUUID()
        val pathWithNamespace = gitlabProject.pathWithNamespace
        val group = pathWithNamespace.split("/")[0]
        return DataProject(
            id = id,
            slug = gitlabProject.path,
            ownerId = ownerId,
            url = gitlabProject.webUrl,
            name = gitlabProject.name,
            gitlabProject = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabGroup = group,
            gitlabId = gitlabProject.id.toInt()
        )
    }

    override fun assertFindExisting(ownerId: UUID, projectUUID: UUID) =
        dataProjectRepository.findOneByOwnerIdAndId(ownerId, projectUUID)
            ?: throw NotFoundException("Data project not found")

    override fun updateSaveProject(mlProject: DataProject, projectName: String?): DataProject {
        return dataProjectRepository.save(mlProject.copy(gitlabProject = projectName))
    }
}
