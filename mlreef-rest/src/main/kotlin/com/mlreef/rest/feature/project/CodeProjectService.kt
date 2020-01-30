package com.mlreef.rest.feature.project

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabProject
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.springframework.stereotype.Service
import java.util.*

interface CodeProjectService : ProjectService<CodeProject>

@Service
class GitlabCodeProjectService(
    private val codeProjectRepository: CodeProjectRepository,
    gitlabRestClient: GitlabRestClient
) : CodeProjectService, AbstractGitlabProjectService<CodeProject>(gitlabRestClient) {

    override fun saveNewProject(mlProject: CodeProject): CodeProject {
        return codeProjectRepository.save(mlProject)
    }

    override fun deleteExistingProject(mlProject: CodeProject) {
        return codeProjectRepository.delete(mlProject)
    }

    override fun createNewProject(ownerId: UUID, gitLabProject: GitlabProject): CodeProject {
        val id = UUID.randomUUID()
        return CodeProject(
            id = id,
            slug = gitLabProject.path,
            ownerId = ownerId,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabGroup = "code-group-$id",
            gitlabId = gitLabProject.id.toInt(),
            dataProcessor = null
        )
    }

    override fun assertFindExisting(ownerId: UUID, projectUUID: UUID) =
        codeProjectRepository.findOneByOwnerIdAndId(ownerId, projectUUID)
            ?: throw NotFoundException("Data project not found")

    override fun updateSaveProject(mlProject: CodeProject, projectName: String?): CodeProject {
        return codeProjectRepository.save(mlProject.copy(gitlabProject = projectName))
    }

}
