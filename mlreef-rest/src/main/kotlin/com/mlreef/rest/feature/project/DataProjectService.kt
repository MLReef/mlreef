package com.mlreef.rest.feature.project

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
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

interface DataProjectService : ProjectService<DataProject>, ProjectRequesterService<DataProject>

@Service
class GitlabDataProjectService(
    private val dataProjectRepository: DataProjectRepository,
    private val accountRepository: AccountRepository,
    gitlabRestClient: GitlabRestClient
) : DataProjectService, AbstractGitlabProjectService<DataProject>(gitlabRestClient, accountRepository) {

    override fun getProjectById(projectId: UUID): DataProject? {
        return dataProjectRepository.findByIdOrNull(projectId)
    }

    override fun getAllProjectsForUser(personId: UUID): List<DataProject> {
        return dataProjectRepository.findAllByOwnerId(personId)
    }

    override fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): DataProject? {
        return dataProjectRepository.findOneByOwnerIdAndId(personId, projectId)
    }

    override fun getProjectsByNamespace(namespaceName: String): List<DataProject> {
        return dataProjectRepository.findByNamespace("$namespaceName/")
    }

    override fun getProjectsBySlug(slug: String): List<DataProject> {
        return dataProjectRepository.findBySlug(slug)
    }

    override fun getProjectsByNamespaceAndSlug(namespaceName: String, slug: String): DataProject? {
        return dataProjectRepository.findByGitlabPathWithNamespace("$namespaceName/$slug")
    }

    override fun saveNewProject(mlProject: DataProject): DataProject {
        return dataProjectRepository.save(mlProject)
    }

    override fun deleteExistingProject(mlProject: DataProject) {
        return dataProjectRepository.delete(mlProject)
    }

    override fun createNewProject(ownerId: UUID, gitlabProject: GitlabProject): DataProject {
        val id = randomUUID()
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
            gitlabId = gitlabProject.id
        )
    }

    override fun updateSaveProject(mlProject: DataProject, projectName: String?): DataProject {
        return dataProjectRepository.save(mlProject.copy(gitlabProject = projectName))
    }

    override fun getUserProjectsList(userId: UUID?): List<ProjectOfUser> {
        val user = resolveAccount(userId = userId)
            ?: throw UserNotFoundException(userId = userId)

        val userProjects = try {
            gitlabRestClient.adminGetUserProjects(user.person.gitlabId
                ?: throw UnknownUserException("Person is not connected to gitlab and has not valid gitlab id"))
        } catch (ex: Exception) {
            log.error("Cannot request projects from gitlab for user ${user.id}. Exception: $ex.")
            listOf<GitlabProject>()
        }

        return userProjects.map { project ->
            try {
                val gitlabAccessLevel = gitlabRestClient.adminGetProjectMembers(project.id).first { gitlabUser -> gitlabUser.id == user.person.gitlabId }.accessLevel
                val projectInDb = dataProjectRepository.findByGitlabId(project.id)
                    ?: throw ProjectNotFoundException(gitlabId = project.id)
                projectInDb.toProjectOfUser(gitlabAccessLevel.toAccessLevel())
            } catch (ex: Exception) {
                log.error("Unable to get user's project ${project.name} . Exception: $ex.")
                null
            }
        }.filterNotNull()
    }
}
