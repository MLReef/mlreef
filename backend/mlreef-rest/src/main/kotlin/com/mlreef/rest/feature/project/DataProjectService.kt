package com.mlreef.rest.feature.project

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.GroupRepository
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
import com.mlreef.rest.marketplace.SearchableTag
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.UUID.randomUUID

interface DataProjectService : ManipulatingProjectService<DataProject>, RetrievingProjectService<DataProject>

@Service
class GitlabDataProjectService(
    private val dataProjectRepository: DataProjectRepository,
    accountRepository: AccountRepository,
    groupRepository: GroupRepository,
    publicProjectsCacheService: PublicProjectsCacheService,
    gitlabRestClient: GitlabRestClient
) : DataProjectService, AbstractGitlabProjectService<DataProject>(gitlabRestClient, accountRepository, groupRepository, dataProjectRepository, publicProjectsCacheService) {

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
            description = gitlabProject.description ?: "",
            gitlabPath = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabNamespace = group,
            gitlabId = gitlabProject.id,
            visibilityScope = gitlabProject.visibility.toVisibilityScope()
        )
    }

    override fun updateSaveProject(
        mlProject: DataProject,
        gitlabProject: GitlabProject,
        inputDataTypes: List<DataType>?,
        outputDataTypes: List<DataType>?,
        tags: List<SearchableTag>?
    ) = dataProjectRepository.save(
        mlProject.copy(
            name = gitlabProject.name,
            description = gitlabProject.description,
            gitlabPath = gitlabProject.path,
            visibilityScope = gitlabProject.visibility.toVisibilityScope(),
            inputDataTypes = inputDataTypes?.toSet() ?: mlProject.inputDataTypes,
            outputDataTypes = outputDataTypes?.toSet() ?: mlProject.outputDataTypes,
            tags = tags?.toSet() ?: mlProject.tags
        )
    )

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
                //Without this IF block Gitlab returns access level for user as a Maintainer even if he is the owner
                val gitlabAccessLevel = if (project.owner.id.equals(user.person.gitlabId))
                    GroupAccessLevel.OWNER
                else
                    gitlabRestClient.adminGetProjectMembers(project.id).first { gitlabUser -> gitlabUser.id == user.person.gitlabId }.accessLevel

                val projectInDb = dataProjectRepository.findByGitlabId(project.id)
                    ?: throw ProjectNotFoundException(gitlabId = project.id)
                projectInDb.toProjectOfUser(gitlabAccessLevel.toAccessLevel())
            } catch (ex: Exception) {
                null
            }
        }.filterNotNull()
    }
}
