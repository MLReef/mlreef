package com.mlreef.rest.feature.project

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.MLProject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.annotations.RefreshUserInformation
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.exceptions.ProjectDeleteException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.exceptions.ProjectUpdateException
import com.mlreef.rest.exceptions.UnknownUserException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.helpers.ProjectOfUser
import com.mlreef.rest.helpers.UserInProject
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID

interface ProjectRequesterService<T : MLProject> {
    fun getAllProjectsForUser(personId: UUID): List<T>
    fun getProjectById(projectId: UUID): T?
    fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): T?
    fun getProjectsByNamespace(namespaceName: String): List<T>
    fun getProjectsBySlug(slug: String): List<T>
    fun getProjectsByNamespaceAndSlug(namespaceName: String, slug: String): T?
    fun getUserProjectsList(userId: UUID? = null): List<ProjectOfUser>
}

interface ProjectService<T : MLProject> {
    fun createProject(userToken: String, ownerId: UUID, projectSlug: String, projectName: String, projectNamespace: String, description: String, visibility: VisibilityScope = VisibilityScope.PUBLIC, initializeWithReadme: Boolean = false): T
    fun updateProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String, description: String): T
    fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID)

    fun getUsersInProject(projectUUID: UUID): List<Account>
    fun addUserToProject(projectUUID: UUID, userId: UUID): Account
    fun addUsersToProject(projectUUID: UUID, users: List<UserInProject>): List<Account>
    fun deleteUsersFromProject(projectUUID: UUID, users: List<UserInProject>): List<Account>
    fun deleteUserFromProject(projectUUID: UUID, userId: UUID): Account
    fun checkUserInProject(projectUUID: UUID, userId: UUID? = null, userName: String? = null, email: String? = null, userGitlabId: Long? = null): Boolean
    fun checkUsersInProject(projectUUID: UUID, users: List<UserInProject>): Map<UserInProject, Boolean>
}

@Service
abstract class AbstractGitlabProjectService<T : MLProject>(
    protected val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository
) : ProjectService<T>, ProjectRequesterService<T> {

    internal abstract fun saveNewProject(mlProject: T): T
    internal abstract fun deleteExistingProject(mlProject: T)
    internal abstract fun updateSaveProject(mlProject: T, projectName: String?): T
    internal abstract fun createNewProject(ownerId: UUID, gitlabProject: GitlabProject): T

    val log = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates the Project in gitlab and saves a new DataProject/CodeProject in mlreef context
     */
    @RefreshUserInformation(userId = "#ownerId")
    override fun createProject(
        userToken: String,
        ownerId: UUID,
        projectSlug: String,
        projectName: String,
        projectNamespace: String,
        description: String,
        visibility: VisibilityScope,
        initializeWithReadme: Boolean
    ): T {

        val findNamespace = try {
            gitlabRestClient.findNamespace(userToken, projectNamespace)
        } catch (e: Exception) {
            log.warn("Namespace cannot be found, will use default one of user")
            null
        }

        val visibilityString = visibility.toGitlabString()
        val gitLabProject = gitlabRestClient.createProject(
            token = userToken,
            slug = projectSlug,
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id,
            description = description,
            visibility = visibilityString,
            initializeWithReadme = initializeWithReadme)
        val codeProject = createNewProject(ownerId, gitLabProject)
        return saveNewProject(codeProject)

    }

    override fun updateProject(
        userToken: String,
        ownerId: UUID,
        projectUUID: UUID,
        projectName: String,
        description: String
    ): T {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        try {
            gitlabRestClient.userUpdateProject(
                id = codeProject.gitlabId,
                token = userToken,
                name = projectName,
                description = description
            )
            return updateSaveProject(codeProject, projectName = projectName)
        } catch (e: GitlabCommonException) {
            throw ProjectUpdateException(ErrorCode.GitlabProjectCreationFailed, "Cannot update Project $projectUUID: ${e.responseBodyAsString}")
        }
    }

    override fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID) {
        try {
            val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
            gitlabRestClient.deleteProject(id = codeProject.gitlabId, token = userToken)
            deleteExistingProject(codeProject)
        } catch (e: GitlabCommonException) {
            throw ProjectDeleteException(ErrorCode.GitlabProjectCreationFailed, "Cannot delete Project $projectUUID: ${e.responseBodyAsString}")
        }
    }

    override fun getUsersInProject(projectUUID: UUID): List<Account> {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        return gitlabRestClient
            .adminGetProjectMembers(projectId = codeProject.gitlabId)
            .map { accountRepository.findOneByUsername(it.username) }
            .filterNotNull()
    }

    @RefreshUserInformation(list = "#users")
    override fun addUsersToProject(projectUUID: UUID, users: List<UserInProject>): List<Account> {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val usersIds = users.map {

            try {
                it.gitlabId ?: resolveAccount(email = it.email, userName = it.userName)?.person?.gitlabId
            } catch (ex: Exception) {
                null
            }
        }.filterNotNull()

        return usersIds.map {
            try {
                val gitlabUserInProject = gitlabRestClient
                    .adminAddUserToProject(projectId = codeProject.gitlabId, userId = it)
                accountRepository.findAccountByGitlabId(gitlabUserInProject.id)
            } catch (ex: Exception) {
                log.error("Unable to add user to the project ${codeProject.name}. Exception: $ex.")
                null
            }
        }.filterNotNull()
    }

    @RefreshUserInformation(userId = "#userId")
    override fun addUserToProject(projectUUID: UUID, userId: UUID): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val account = accountRepository.findByIdOrNull(userId) ?: throw UserNotFoundException(userId = userId)

        gitlabRestClient
            .adminAddUserToProject(projectId = codeProject.gitlabId, userId = account.person.gitlabId
                ?: throw UnknownUserException("Person is not connected to Gitlab and has no valid gitlabId"))

        return account
    }

    @RefreshUserInformation(userId = "#userId")
    override fun deleteUserFromProject(projectUUID: UUID, userId: UUID): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val account = accountRepository.findByIdOrNull(userId) ?: throw UserNotFoundException(userId = userId)

        gitlabRestClient
            .adminDeleteUserFromProject(projectId = codeProject.gitlabId, userId = account.person.gitlabId
                ?: throw UnknownUserException("Person is not connected to Gitlab and has no valid gitlabId"))

        return account
    }

    @RefreshUserInformation(list = "#users")
    override fun deleteUsersFromProject(projectUUID: UUID, users: List<UserInProject>): List<Account> {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val usersIds = users.map {
            try {
                it.gitlabId ?: resolveAccount(email = it.email, userName = it.userName)?.person?.gitlabId
            } catch (ex: Exception) {
                null
            }
        }.filterNotNull()

        return usersIds.map {
            try {
                gitlabRestClient.adminDeleteUserFromProject(projectId = codeProject.gitlabId, userId = it)
                accountRepository.findAccountByGitlabId(it)
            } catch (ex: Exception) {
                null
            }
        }.filterNotNull()
    }

    override fun checkUserInProject(projectUUID: UUID, userId: UUID?, userName: String?, email: String?, userGitlabId: Long?): Boolean {
        try {
            val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

            val gitlabId = userGitlabId
                ?: resolveAccount(userId = userId, userName = userName, email = email)?.person?.gitlabId
                ?: return false

            gitlabRestClient.adminGetUserInProject(
                projectId = codeProject.gitlabId,
                userId = gitlabId
            )

            return true
        } catch (ex: Exception) {
            return false
        }
    }

    override fun checkUsersInProject(projectUUID: UUID, users: List<UserInProject>): Map<UserInProject, Boolean> {
        val codeProject = this.getProjectById(projectUUID)

        return users.map {
            try {
                if (codeProject == null)
                    Pair(it, false)

                val id = it.gitlabId
                    ?: resolveAccount(userName = it.userName, email = it.email)?.person?.gitlabId
                    ?: throw UserNotFoundException(userName = it.userName, email = it.email)

                gitlabRestClient.adminGetUserInProject(
                    projectId = codeProject!!.gitlabId,
                    userId = id
                )

                Pair(it, true)
            } catch (ex: Exception) {
                Pair(it, false)
            }
        }.toMap()
    }

    protected fun resolveAccount(userToken: String? = null, userId: UUID? = null, personId: UUID? = null, userName: String? = null, email: String? = null, gitlabId: Long? = null): Account? {
        return when {
            userToken != null -> {
                val gitlabUser = gitlabRestClient.getUser(userToken)
                accountRepository.findAccountByGitlabId(gitlabUser.id)
            }
            personId != null -> accountRepository.findAccountByPersonId(personId)
            userId != null -> accountRepository.findByIdOrNull(userId)
            email != null -> accountRepository.findOneByEmail(email)
            userName != null -> accountRepository.findOneByUsername(userName)
            gitlabId != null -> accountRepository.findAccountByGitlabId(gitlabId)
            else -> throw BadParametersException("At least one parameter must be provided")
        }
    }
}
