package com.mlreef.rest.feature.project

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.Project
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.annotations.RefreshProject
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
import com.mlreef.rest.external_api.gitlab.toAccessLevel
import com.mlreef.rest.external_api.gitlab.toGitlabAccessLevel
import com.mlreef.rest.helpers.ProjectOfUser
import com.mlreef.rest.helpers.UserInProject
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

interface ProjectRequesterService<T : Project> {
    fun getAllPublicProjects(): List<T>
    fun getAllPublicProjects(pageable: Pageable): Page<T>
    fun getAllProjectsByIds(ids: Iterable<UUID>): List<T>
    fun getAllProjectsByIds(ids: Iterable<UUID>, pageable: Pageable): Page<T>
    fun getAllProjectsForUser(personId: UUID): List<T>
    fun getProjectById(projectId: UUID): T?
    fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): T?
    fun getProjectsByNamespace(namespaceName: String): List<T>
    fun getProjectsBySlug(slug: String): List<T>
    fun getProjectsByNamespaceAndSlug(namespaceName: String, slug: String): T?
    fun getUserProjectsList(userId: UUID? = null): List<ProjectOfUser>
}

interface ProjectAuthService<T : Project> {
    fun getUserProjectsList(userId: UUID? = null): List<ProjectOfUser>
}

interface ProjectService<T : Project> {
    fun createProject(userToken: String, ownerId: UUID, projectSlug: String, projectName: String, projectNamespace: String, description: String, visibility: VisibilityScope = VisibilityScope.PUBLIC, initializeWithReadme: Boolean = false): T
    fun updateProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String? = null, description: String? = null, visibility: VisibilityScope? = null): T
    fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID)

    fun getUsersInProject(projectUUID: UUID): List<UserInProject>

    fun addUserToProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null
    ): Account

    fun editUserInProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null
    ): Account

    fun deleteUsersFromProject(projectUUID: UUID, users: List<UserInProject>): List<Account>
    fun deleteUserFromProject(projectUUID: UUID, userId: UUID? = null, userGitlabId: Long? = null): Account
    fun checkUserInProject(projectUUID: UUID, userId: UUID? = null, userName: String? = null, email: String? = null, userGitlabId: Long? = null, level: AccessLevel? = null, minlevel: AccessLevel? = null): Boolean
    fun checkUsersInProject(projectUUID: UUID, users: List<UserInProject>): Map<UserInProject, Boolean>
}

@Service
abstract class AbstractGitlabProjectService<T : Project>(
    protected val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository
) : ProjectService<T>, ProjectRequesterService<T> {

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    internal abstract fun saveNewProject(mlProject: T): T
    internal abstract fun deleteExistingProject(mlProject: T)
    internal abstract fun updateSaveProject(mlProject: T, gitlabProject: GitlabProject): T
    internal abstract fun createNewProject(ownerId: UUID, gitlabProject: GitlabProject): T

    private val gitlabDateTimeFormatter = DateTimeFormatter.ISO_DATE_TIME

    /**
     * Creates the Project in gitlab and saves a new DataProject/CodeProject in mlreef context
     */
    @RefreshUserInformation(userId = "#ownerId")
    @RefreshProject
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

        val gitLabProject = gitlabRestClient.createProject(
            token = userToken,
            slug = projectSlug,
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id,
            description = description,
            visibility = visibility.toGitlabString(),
            initializeWithReadme = initializeWithReadme)
        val codeProject = createNewProject(ownerId, gitLabProject)
        return saveNewProject(codeProject)

    }

    @RefreshProject(projectId = "#projectUUID")
    override fun updateProject(
        userToken: String,
        ownerId: UUID,
        projectUUID: UUID,
        projectName: String?,
        description: String?,
        visibility: VisibilityScope?
    ): T {
        val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        try {
            val gitlabProject = gitlabRestClient.userUpdateProject(
                id = project.gitlabId,
                token = userToken,
                name = projectName,
                description = description,
                visibility = visibility?.toGitlabString()
            )
            return updateSaveProject(project, gitlabProject)
        } catch (e: GitlabCommonException) {
            throw ProjectUpdateException(ErrorCode.GitlabProjectCreationFailed, "Cannot update Project $projectUUID: ${e.responseBodyAsString}")
        }
    }

    @RefreshProject(projectId = "#projectUUID")
    override fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID) {
        try {
            val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
            gitlabRestClient.deleteProject(id = project.gitlabId, token = userToken)
            deleteExistingProject(project)
        } catch (e: GitlabCommonException) {
            throw ProjectDeleteException(ErrorCode.GitlabProjectCreationFailed, "Cannot delete Project $projectUUID: ${e.responseBodyAsString}")
        }
    }

    override fun getUsersInProject(projectUUID: UUID): List<UserInProject> {
        val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        return gitlabRestClient
            .adminGetProjectMembers(projectId = project.gitlabId)
            .map {
                val account = accountRepository.findAccountByGitlabId(it.id) ?: throw UserNotFoundException(gitlabId = it.id)
                val expiration = if (it.expiresAt!=null) {
                    val localDate = LocalDate.from(gitlabRestClient.gitlabDateTimeFormatter.parse(it.expiresAt))
                    val zonedDateTime = ZonedDateTime.of(LocalDateTime.of(localDate, LocalTime.MIN), ZoneId.systemDefault())
                    Instant.from(zonedDateTime)
                } else null
                UserInProject(account.id, it.username, account.email, it.id, it.accessLevel.toAccessLevel(), expiration)
            }
    }

    @RefreshUserInformation(userId = "#userId")
    override fun addUserToProject(
        projectUUID: UUID,
        userId: UUID?,
        userGitlabId: Long?,
        accessLevel: AccessLevel?,
        accessTill: Instant?
    ): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        val level = accessLevel ?: AccessLevel.GUEST

        val account = when {
            userId != null -> accountRepository.findByIdOrNull(userId)
            userGitlabId != null -> accountRepository.findAccountByGitlabId(userGitlabId)
            else -> throw BadParametersException("Either userid or gitlab id should be presented")
        } ?: throw UserNotFoundException(userId = userId, gitlabId = userGitlabId)

        gitlabRestClient
            .adminAddUserToProject(
                projectId = codeProject.gitlabId,
                userId = account.person.gitlabId ?: throw UnknownUserException("Person is not connected to Gitlab and has no valid gitlabId"),
                accessLevel = level.toGitlabAccessLevel()!!,
                expiresAt = accessTill
            )

        return account
    }

    @RefreshUserInformation(userId = "#userId")
    override fun editUserInProject(
        projectUUID: UUID,
        userId: UUID?,
        userGitlabId: Long?,
        accessLevel: AccessLevel?,
        accessTill: Instant?
    ): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val account = when {
            userId != null -> accountRepository.findByIdOrNull(userId)
            userGitlabId != null -> accountRepository.findAccountByGitlabId(userGitlabId)
            else -> throw BadParametersException("Either userid or gitlab id should be presented")
        } ?: throw UserNotFoundException(userId = userId, gitlabId = userGitlabId)

        val gitlabUserId = account.person.gitlabId ?: throw UnknownUserException("Person is not connected to Gitlab and has no valid gitlabId")

        val gitlabUserInProject = gitlabRestClient.adminGetUserInProject(codeProject.gitlabId, gitlabUserId)

        gitlabRestClient
            .adminAddUserToProject(
                projectId = codeProject.gitlabId,
                userId = gitlabUserId,
                accessLevel = accessLevel.toGitlabAccessLevel() ?: gitlabUserInProject.accessLevel,
                expiresAt = accessTill
            )

        return account
    }

    @RefreshUserInformation(userId = "#userId")
    override fun deleteUserFromProject(projectUUID: UUID, userId: UUID?, userGitlabId: Long?): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val account = when {
            userId != null -> accountRepository.findByIdOrNull(userId)
            userGitlabId != null -> accountRepository.findAccountByGitlabId(userGitlabId)
            else -> throw BadParametersException("Either userid or gitlab id should be presented")
        } ?: throw UserNotFoundException(userId = userId, gitlabId = userGitlabId)

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

    override fun checkUserInProject(projectUUID: UUID, userId: UUID?, userName: String?, email: String?, userGitlabId: Long?, level: AccessLevel?, minlevel: AccessLevel?): Boolean {
        try {
            val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

            val gitlabId = userGitlabId
                ?: resolveAccount(userId = userId, userName = userName, email = email)?.person?.gitlabId
                ?: return false

            if ((level != null && level == AccessLevel.OWNER) || (minlevel != null && minlevel == AccessLevel.OWNER)) {
                val gitlabProject = gitlabRestClient.adminGetProject(project.gitlabId)
                return gitlabProject.owner.id == gitlabId
            } else {
                val userInProjectInGitlab = gitlabRestClient.adminGetUserInProject(
                    projectId = project.gitlabId,
                    userId = gitlabId
                )

                if (minlevel != null) {
                    return userInProjectInGitlab.accessLevel.satisfies(level.toGitlabAccessLevel())
                } else if (level != null) {
                    return userInProjectInGitlab.accessLevel == level.toGitlabAccessLevel()
                } else {
                    return true
                }
            }
        } catch (ex: Exception) {
            AbstractGitlabProjectService.log.error("Cannot check user in project: Exception: $ex")
            return false
        }
    }

    override fun checkUsersInProject(projectUUID: UUID, users: List<UserInProject>): Map<UserInProject, Boolean> {
        return users.map {
            Pair(it, checkUserInProject(projectUUID, it.id))
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
