package com.mlreef.rest.feature.project

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
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

    override fun createNewProject(ownerId: UUID, gitlabProject: GitlabProject): CodeProject {
        val id = UUID.randomUUID()
        val pathWithNamespace = gitlabProject.pathWithNamespace
        val group = pathWithNamespace.split("/")[0]
        return CodeProject(
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
        codeProjectRepository.findOneByOwnerIdAndId(ownerId, projectUUID)
            ?: throw NotFoundException("Data project not found")

    override fun updateSaveProject(mlProject: CodeProject, projectName: String?): CodeProject {
        return codeProjectRepository.save(mlProject.copy(gitlabProject = projectName))
    }
}
