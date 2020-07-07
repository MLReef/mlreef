package com.mlreef.rest.feature.project

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.Project
import com.mlreef.rest.ProjectBaseRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.annotations.RefreshGroupInformation
import com.mlreef.rest.annotations.RefreshProject
import com.mlreef.rest.annotations.RefreshUserInformation
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.exceptions.GitlabNoValidTokenException
import com.mlreef.rest.exceptions.GroupNotFoundException
import com.mlreef.rest.exceptions.ProjectDeleteException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.exceptions.ProjectUpdateException
import com.mlreef.rest.exceptions.UnknownGroupException
import com.mlreef.rest.exceptions.UnknownUserException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.toAccessLevel
import com.mlreef.rest.external_api.gitlab.toGitlabAccessLevel
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.helpers.ProjectOfUser
import com.mlreef.rest.helpers.UserInProject
import com.mlreef.rest.marketplace.SearchableTag
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

interface RetrievingProjectService<T : Project> {
    fun getAllPublicProjects(): List<T>
    fun getAllPublicProjects(pageable: Pageable): List<T>
    fun getAllProjectsByIds(ids: Iterable<UUID>): List<T>
    fun getAllProjectsByIds(ids: Iterable<UUID>, pageable: Pageable): Page<T>
    fun getAllProjectsForUser(personId: UUID): List<T>
    fun getProjectById(projectId: UUID): T?
    fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): T?
    fun getProjectsByNamespace(namespaceName: String): List<T>
    fun getProjectsBySlug(slug: String): List<T>
    fun getProjectsByNamespaceAndPath(namespaceName: String, slug: String): T?
}


interface ManipulatingProjectService<T : Project> : RetrievingProjectService<T> {
    fun createProject(userToken: String, ownerId: UUID, projectSlug: String, projectName: String, projectNamespace: String, description: String, visibility: VisibilityScope = VisibilityScope.PUBLIC, initializeWithReadme: Boolean = false): T

    fun updateProject(userToken: String,
                      ownerId: UUID,
                      projectUUID: UUID,
                      projectName: String? = null,
                      description: String? = null,
                      visibility: VisibilityScope? = null,
                      inputDataTypes: List<DataType>? = null,
                      outputDataTypes: List<DataType>? = null,
                      tags: List<SearchableTag>? = null
    ): T

    fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID)

    fun getUsersInProject(projectUUID: UUID): List<UserInProject>

    fun addUserToProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null
    ): Account

    fun addGroupToProject(
        projectUUID: UUID,
        groupId: UUID? = null,
        groupGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null
    ): Group

    fun editUserInProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null
    ): Account

    fun editGroupInProject(
        projectUUID: UUID,
        groupId: UUID? = null,
        groupGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null
    ): Group

    fun getUserProjectsList(userId: UUID? = null): List<ProjectOfUser>
    fun deleteUserFromProject(projectUUID: UUID, userId: UUID? = null, userGitlabId: Long? = null): Account
    fun deleteGroupFromProject(projectUUID: UUID, groupId: UUID? = null, groupGitlabId: Long? = null): Group

    fun checkUserInProject(projectUUID: UUID, userId: UUID? = null, userName: String? = null, email: String? = null, userGitlabId: Long? = null, level: AccessLevel? = null, minlevel: AccessLevel? = null): Boolean
    fun checkUsersInProject(projectUUID: UUID, users: List<UserInProject>): Map<UserInProject, Boolean>
}

@Service
abstract class AbstractGitlabProjectService<T : Project>(
    protected val gitlabRestClient: GitlabRestClient,
    protected val accountRepository: AccountRepository,
    protected val groupRepository: GroupRepository,
    protected val projectRepository: ProjectBaseRepository<T>,
    protected val publicProjectsCacheService: PublicProjectsCacheService
) : ManipulatingProjectService<T>, RetrievingProjectService<T> {

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    internal abstract fun saveNewProject(mlProject: T): T
    internal abstract fun deleteExistingProject(mlProject: T)
    internal abstract fun updateSaveProject(mlProject: T, gitlabProject: GitlabProject, inputDataTypes: List<DataType>?, outputDataTypes: List<DataType>?, tags: List<SearchableTag>?): T
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
        visibility: VisibilityScope?,
        inputDataTypes: List<DataType>?,
        outputDataTypes: List<DataType>?,
        tags: List<SearchableTag>?
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
            return updateSaveProject(project, gitlabProject, inputDataTypes, outputDataTypes, tags)
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
                val account = accountRepository.findAccountByGitlabId(it.id)
                if (account != null) {
                    val expiration = if (it.expiresAt != null) {
                        val localDate = LocalDate.from(gitlabRestClient.gitlabDateTimeFormatter.parse(it.expiresAt))
                        val zonedDateTime = ZonedDateTime.of(LocalDateTime.of(localDate, LocalTime.MIN), ZoneId.systemDefault())
                        Instant.from(zonedDateTime)
                    } else null
                    UserInProject(account.id, it.username, account.email, it.id, it.accessLevel.toAccessLevel(), expiration)
                } else null //possible it is a bot or admin
            }.filterNotNull()
    }

    @RefreshUserInformation(userId = "#userId", gitlabId = "#userGitlabId")
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
            else -> throw BadParametersException("Either userid or gitlab id must be presented")
        } ?: throw UserNotFoundException(userId = userId, gitlabId = userGitlabId)

        gitlabRestClient
            .adminAddUserToProject(
                projectId = codeProject.gitlabId,
                userId = account.person.gitlabId
                    ?: throw UnknownUserException("Person is not connected to Gitlab and has no valid gitlabId"),
                accessLevel = level.toGitlabAccessLevel()!!,
                expiresAt = accessTill
            )

        return account
    }

    @RefreshGroupInformation(groupId = "#groupId", gitlabId = "#groupGitlabId")
    override fun addGroupToProject(
        projectUUID: UUID,
        groupId: UUID?,
        groupGitlabId: Long?,
        accessLevel: AccessLevel?,
        accessTill: Instant?
    ): Group {
        val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        val level = accessLevel ?: AccessLevel.GUEST

        val group = when {
            groupId != null -> groupRepository.findByIdOrNull(groupId)
            groupGitlabId != null -> groupRepository.findByGitlabId(groupGitlabId)
            else -> throw BadParametersException("Either group id or gitlab id must be presented")
        } ?: throw GroupNotFoundException(groupId = groupId, gitlabId = groupGitlabId)

        gitlabRestClient.adminAddGroupToProject(
            projectId = project.gitlabId,
            groupId = group.gitlabId ?: throw UnknownGroupException("Group has not connected to Gitlab"),
            accessLevel = level.toGitlabAccessLevel()!!,
            expiresAt = accessTill
        )

        return group
    }

    @RefreshUserInformation(userId = "#userId", gitlabId = "#userGitlabId")
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

        val gitlabUserId = account.person.gitlabId
            ?: throw UnknownUserException("Person is not connected to Gitlab and has no valid gitlabId")

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

    @RefreshGroupInformation(groupId = "#groupId", gitlabId = "#groupGitlabId")
    override fun editGroupInProject(
        projectUUID: UUID,
        groupId: UUID?,
        groupGitlabId: Long?,
        accessLevel: AccessLevel?,
        accessTill: Instant?
    ): Group {
        this.deleteGroupFromProject(projectUUID, groupId, groupGitlabId)
        return this.addGroupToProject(projectUUID, groupId, groupGitlabId, accessLevel, accessTill)
    }

    @RefreshUserInformation(userId = "#userId", gitlabId = "#userGitlabId")
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

    @RefreshGroupInformation(groupId = "#groupId", gitlabId = "#groupGitlabId")
    override fun deleteGroupFromProject(projectUUID: UUID, groupId: UUID?, groupGitlabId: Long?): Group {
        val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val group = when {
            groupId != null -> groupRepository.findByIdOrNull(groupId)
            groupGitlabId != null -> groupRepository.findByGitlabId(groupGitlabId)
            else -> throw BadParametersException("Either group id or gitlab id must be presented")
        } ?: throw GroupNotFoundException(groupId = groupId, gitlabId = groupGitlabId)

        gitlabRestClient
            .adminDeleteGroupFromProject(projectId = project.gitlabId, groupId = group.gitlabId
                ?: throw UnknownUserException("Group is not connected to Gitlab"))

        return group
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

                val projectInDb = projectRepository.findByGitlabId(project.id)
                    ?: throw ProjectNotFoundException(gitlabId = project.id)
                projectInDb.toProjectOfUser(gitlabAccessLevel.toAccessLevel())
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

                return if (minlevel != null) {
                    userInProjectInGitlab.accessLevel.satisfies(level.toGitlabAccessLevel())
                } else if (level != null) {
                    userInProjectInGitlab.accessLevel == level.toGitlabAccessLevel()
                } else {
                    true
                }
            }
        } catch (ex: Exception) {
            log.error("Cannot check user in project: Exception: $ex")
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

    override fun getAllPublicProjects(): List<T> {
        val projectsIds = publicProjectsCacheService.getPublicProjectsIdsList()
        return projectRepository.findAllById(projectsIds).toList()
    }

    override fun getAllPublicProjects(pageable: Pageable): List<T> {
        val projectsIds = publicProjectsCacheService.getPublicProjectsIdsList(pageable)
        return projectRepository.findAllById(projectsIds).toList()
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>): List<T> {
        return projectRepository.findAllById(ids).toList()
    }

    override fun getAllProjectsByIds(ids: Iterable<UUID>, pageable: Pageable): Page<T> {
        return projectRepository.findAllByIdIn(ids, pageable)
    }

    override fun getProjectById(projectId: UUID): T? {
        return projectRepository.findByIdOrNull(projectId)
    }

    override fun getAllProjectsForUser(personId: UUID): List<T> {
        return projectRepository.findAllByOwnerId(personId)
    }

    override fun getProjectByIdAndPersonId(projectId: UUID, personId: UUID): T? {
        return projectRepository.findOneByOwnerIdAndId(personId, projectId)
    }

    override fun getProjectsByNamespace(namespaceName: String): List<T> {
        return projectRepository.findByNamespace("$namespaceName/")
    }

    override fun getProjectsBySlug(slug: String): List<T> {
        return projectRepository.findBySlug(slug)
    }

    override fun getProjectsByNamespaceAndPath(namespaceName: String, slug: String): T? {
        val findByNamespaceAndPath = projectRepository.findByNamespaceAndPath(namespaceName, slug)
        val findByNamespaceAndPath1 = projectRepository.findByNamespace(namespaceName)
        return findByNamespaceAndPath
    }
}
