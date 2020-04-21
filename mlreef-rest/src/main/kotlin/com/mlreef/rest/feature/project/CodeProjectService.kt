package com.mlreef.rest.feature.project

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.exceptions.UnknownUserException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.toAccessLevel
import com.mlreef.rest.helpers.ProjectOfUser
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.UUID.randomUUID

interface CodeProjectService : ProjectService<CodeProject>, ProjectRequesterService<CodeProject>

@Service
class GitlabCodeProjectService(
    private val codeProjectRepository: CodeProjectRepository,
    private val accountRepository: AccountRepository,
    gitlabRestClient: GitlabRestClient
) : CodeProjectService, AbstractGitlabProjectService<CodeProject>(gitlabRestClient, accountRepository) {

    override fun getAllProjectsForUser(personId: UUID): List<CodeProject> {
        return codeProjectRepository.findAllByOwnerId(personId)
    }

    override fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): CodeProject? {
        return codeProjectRepository.findOneByOwnerIdAndId(personId, projectId)
    }

    override fun getProjectById(projectId: UUID): CodeProject? {
        return codeProjectRepository.findByIdOrNull(projectId)
    }

    override fun getProjectsByNamespace(namespaceName: String): List<CodeProject> {
        return codeProjectRepository.findByNamespace("$namespaceName/")
    }

    override fun getProjectsBySlug(slug: String): List<CodeProject> {
        return codeProjectRepository.findBySlug(slug)
    }

    override fun getProjectsByNamespaceAndSlug(namespaceName: String, slug: String): CodeProject? {
        return codeProjectRepository.findByGitlabPathWithNamespace("$namespaceName/$slug")
    }

    override fun saveNewProject(mlProject: CodeProject): CodeProject {
        return codeProjectRepository.save(mlProject)
    }

    override fun deleteExistingProject(mlProject: CodeProject) {
        return codeProjectRepository.delete(mlProject)
    }

    override fun createNewProject(ownerId: UUID, gitlabProject: GitlabProject): CodeProject {
        val id = randomUUID()
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
            gitlabId = gitlabProject.id
        )
    }

    override fun updateSaveProject(mlProject: CodeProject, projectName: String?): CodeProject {
        return codeProjectRepository.save(mlProject.copy(gitlabProject = projectName))
    }

    override fun getUserProjectsList(userId: UUID?): List<ProjectOfUser> {
        val user = resolveAccount(userId = userId)
            ?: throw UserNotFoundException(userId = userId)

        val userProjects = try {
            gitlabRestClient
                .adminGetUserProjects(user.person.gitlabId
                    ?: throw UnknownUserException("Person ${user.person.id} is not connected to gitlab"))
        } catch (ex: Exception) {
            log.error("Cannot request projects from gitlab for user ${user.id}. Exception: $ex.")
            listOf<GitlabProject>()
        }

        return userProjects.map { project ->
            try {
                val gitlabAccessLevel = gitlabRestClient.adminGetProjectMembers(project.id).first { gitlabUser -> gitlabUser.id == user.person.gitlabId }.accessLevel
                val projectInDb = codeProjectRepository.findByGitlabId(project.id)
                    ?: throw ProjectNotFoundException(gitlabId = project.id)
                projectInDb.toProjectOfUser(gitlabAccessLevel.toAccessLevel())
            } catch (ex: Exception) {
                log.error("Unable to get user's project ${project.name}. Exception: $ex.")
                null
            }
        }.filterNotNull()
    }
}

