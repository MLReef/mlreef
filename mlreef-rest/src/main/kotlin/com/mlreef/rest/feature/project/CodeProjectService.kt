package com.mlreef.rest.feature.project

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.exceptions.GitlabNoValidTokenException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.toAccessLevel
import com.mlreef.rest.external_api.gitlab.toVisibilityScope
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.helpers.ProjectOfUser
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.UUID.randomUUID

interface CodeProjectService : ProjectService<CodeProject>, ProjectRequesterService<CodeProject>

@Service
class GitlabCodeProjectService(
    private val codeProjectRepository: CodeProjectRepository,
    private val accountRepository: AccountRepository,
    private val publicProjectsCacheService: PublicProjectsCacheService,
    gitlabRestClient: GitlabRestClient
) : CodeProjectService, AbstractGitlabProjectService<CodeProject>(gitlabRestClient, accountRepository) {

    override fun getAllPublicProjects(): List<CodeProject> {
        val projectsIds = publicProjectsCacheService.getPublicProjectsIdsList()
        return codeProjectRepository.findAllById(projectsIds).toList()
    }

    override fun getAllPublicProjects(pageable: Pageable): Page<CodeProject> {
        val projectsIds = publicProjectsCacheService.getPublicProjectsIdsList(pageable)
        val projects = codeProjectRepository.findAllById(projectsIds)
        return PageImpl(projects.toList(), projectsIds.pageable, projectsIds.totalElements)
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>): List<CodeProject> {
        return codeProjectRepository.findAllById(ids).toList()
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>, pageable: Pageable): Page<CodeProject> {
        return codeProjectRepository.findAllByIdIn(ids, pageable)
    }

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
            description = gitlabProject.description ?: "",
            gitlabPath = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabNamespace = group,
            gitlabId = gitlabProject.id,
            visibilityScope = gitlabProject.visibility.toVisibilityScope()
        )
    }

    override fun updateSaveProject(mlProject: CodeProject, gitlabProject: GitlabProject): CodeProject {
        return codeProjectRepository.save(
            mlProject.copy(
                name = gitlabProject.name,
                gitlabPath = gitlabProject.path,
                visibilityScope = gitlabProject.visibility.toVisibilityScope()
            )
        )
    }

    override fun getUserProjectsList(userId: UUID?): List<ProjectOfUser> {
        val user = resolveAccount(userId = userId)
            ?: throw UserNotFoundException(userId = userId)

        val userProjects = try {
            gitlabRestClient.userGetUserAllProjects(user.bestToken?.token
                ?: throw GitlabNoValidTokenException("User ${user.id} has no valid token"))
        } catch (ex: Exception) {
            log.error("Cannot request projects from gitlab for user ${user.id}. Exception: $ex.")
            listOf<GitlabProject>()
        }

        return userProjects.map { project ->
            try {
                //Without this IF block Gitlab returns access level for user as a Maintainer
                val gitlabAccessLevel = if (project.owner.id.equals(user.person.gitlabId))
                    GroupAccessLevel.OWNER
                else
                    gitlabRestClient.adminGetProjectMembers(project.id).first { gitlabUser -> gitlabUser.id == user.person.gitlabId }.accessLevel

                val projectInDb = codeProjectRepository.findByGitlabId(project.id)
                    ?: throw ProjectNotFoundException(gitlabId = project.id)
                projectInDb.toProjectOfUser(gitlabAccessLevel.toAccessLevel())
            } catch (ex: Exception) {
                null
            }
        }.filterNotNull()
    }
}

