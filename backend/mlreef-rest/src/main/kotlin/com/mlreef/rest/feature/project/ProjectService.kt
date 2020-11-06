package com.mlreef.rest.feature.project

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.Person
import com.mlreef.rest.Project
import com.mlreef.rest.ProjectBaseRepository
import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.annotations.RefreshGroupInformation
import com.mlreef.rest.annotations.RefreshProject
import com.mlreef.rest.annotations.RefreshUserInformation
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabCommonException
import com.mlreef.rest.exceptions.GroupNotFoundException
import com.mlreef.rest.exceptions.ProjectCreationException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.exceptions.UnknownGroupException
import com.mlreef.rest.exceptions.UnknownProjectException
import com.mlreef.rest.exceptions.UnknownUserException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.NamespaceKind
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.toAccessLevel
import com.mlreef.rest.external_api.gitlab.toGitlabAccessLevel
import com.mlreef.rest.external_api.gitlab.toVisibilityScope
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.system.ReservedNamesService
import com.mlreef.rest.helpers.ProjectOfUser
import com.mlreef.rest.helpers.UserInProject
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.utils.Slugs
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

interface ProjectService<T : Project> {
    fun getAllPublicProjects(pageable: Pageable? = null): List<T>

    fun getAllPublicProjectsOnly(pageable: Pageable?): Page<T>
    fun getAllProjectsAccessibleByUser(token: TokenDetails, pageable: Pageable? = null, isDataProjectRequest: Boolean): Page<T>
    fun getAllProjectsStarredByUser(token: TokenDetails, pageable: Pageable? = null): Page<T>
    fun getOwnProjectsOfUser(token: TokenDetails, pageable: Pageable? = null): Page<T>
    fun getAllProjectsUserMemberIn(token: TokenDetails, pageable: Pageable? = null): Page<T>
    fun getProjectsByNamespace(namespaceName: String, pageable: Pageable? = null): Page<T>
    fun getProjectsBySlug(slug: String, pageable: Pageable? = null): Page<T>

    fun getProjectById(projectId: UUID): T?
    fun getProjectByGitlabId(projectId: Long): T?
    fun getProjectsByNamespaceAndPath(namespaceName: String, slug: String): T?
    fun getUsersInProject(projectUUID: UUID): List<UserInProject>

    fun starProject(projectId: UUID? = null, projectGitlabId: Long? = null, person: Person, userToken: String): T
    fun unstarProject(projectId: UUID? = null, projectGitlabId: Long? = null, person: Person, userToken: String): T

    fun createProject(
        userToken: String,
        ownerId: UUID,
        projectSlug: String,
        projectName: String,
        projectNamespace: String,
        description: String,
        visibility: VisibilityScope = VisibilityScope.PUBLIC,
        initializeWithReadme: Boolean = false,
        inputDataTypes: List<DataType>?
    ): T

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

    fun getUserProjectsList(userToken: String, userId: UUID? = null): List<ProjectOfUser>

    fun checkUserInProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userName: String? = null,
        email: String? = null,
        userGitlabId: Long? = null,
        level: AccessLevel? = null,
        minlevel: AccessLevel? = null
    ): Boolean

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

    fun deleteUserFromProject(projectUUID: UUID, userId: UUID? = null, userGitlabId: Long? = null): Account
    fun deleteGroupFromProject(projectUUID: UUID, groupId: UUID? = null, groupGitlabId: Long? = null): Group

    fun updateUserNameInProjects(oldUserName: String, newUserName: String, tokenDetails: TokenDetails)
    fun checkAvailability(userToken: String,
                          creatingPersonId: UUID,
                          projectName: String,
                          projectNamespace: String?): String
}

@Configuration
class ProjectTypesConfiguration(
    val projectRepository: ProjectRepository,
    val dataProjectRepository: DataProjectRepository,
    val codeProjectRepository: CodeProjectRepository,
    val publicProjectsCacheService: PublicProjectsCacheService,
    val gitlabRestClient: GitlabRestClient,
    private val reservedNamesService: ReservedNamesService,
    private val accountRepository: AccountRepository,
    private val groupRepository: GroupRepository,
    private val subjectRepository: SubjectRepository

) {
    @Bean
    fun dataProjectService(): ProjectService<DataProject> {
        return ProjectServiceImpl(DataProject::class.java, dataProjectRepository, publicProjectsCacheService, gitlabRestClient, reservedNamesService, accountRepository, groupRepository, subjectRepository)
    }

    @Bean
    fun codeProjectService(): ProjectService<CodeProject> {
        return ProjectServiceImpl(CodeProject::class.java, codeProjectRepository, publicProjectsCacheService, gitlabRestClient, reservedNamesService, accountRepository, groupRepository, subjectRepository)
    }

    @Bean
    fun projectService(): ProjectService<Project> {
        return ProjectServiceImpl(Project::class.java, projectRepository, publicProjectsCacheService, gitlabRestClient, reservedNamesService, accountRepository, groupRepository, subjectRepository)
    }
}

open class ProjectServiceImpl<T : Project>(
    private val baseClass: Class<T>,
    val repository: ProjectBaseRepository<T>,
    val publicProjectsCacheService: PublicProjectsCacheService,
    val gitlabRestClient: GitlabRestClient,
    private val reservedNamesService: ReservedNamesService,
    private val accountRepository: AccountRepository,
    private val groupRepository: GroupRepository,
    private val subjectRepository: SubjectRepository

) : ProjectService<T> {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    override fun getAllProjectsAccessibleByUser(token: TokenDetails, pageable: Pageable?, isDataProjectRequest: Boolean): Page<T> {
        return if (token.isVisitor)
            if(isDataProjectRequest)
                repository.findAccessibleDataProjectsForVisitor(pageable)
            else
                repository.findAccessibleProjectsForVisitor(pageable)
        else
            if(isDataProjectRequest)
                repository.findAccessibleDataProjectsForOwner(token.personId, token.projects.map { it.key }, pageable)
            else
                repository.findAccessibleProjectsForOwner(token.personId, token.projects.map { it.key }, pageable)
    }

    override fun getAllProjectsStarredByUser(token: TokenDetails, pageable: Pageable?): Page<T> {
        if (token.isVisitor) {
            return Page.empty(pageable ?: Pageable.unpaged())
        } else {
            return repository.findAccessibleStarredProjectsForUser(token.personId, token.projects.map { it.key }, pageable)
        }
    }

    override fun getOwnProjectsOfUser(token: TokenDetails, pageable: Pageable?): Page<T> {
        if (token.isVisitor) {
            return Page.empty(pageable ?: Pageable.unpaged())
        } else {
            return repository.findAllByOwnerId(token.personId, pageable)
        }
    }

    override fun getAllProjectsUserMemberIn(token: TokenDetails, pageable: Pageable?): Page<T> {
        if (token.isVisitor) {
            return Page.empty(pageable ?: Pageable.unpaged())
        } else {
            return repository.findAllByIdIn(token.projects.map { it.key }, pageable)
        }
    }

    override fun getAllPublicProjectsOnly(pageable: Pageable?): Page<T> {
        return repository.findAllByVisibilityScope(visibilityScope = VisibilityScope.PUBLIC, pageable = pageable)
    }

    override fun getProjectsByNamespace(namespaceName: String, pageable: Pageable?): Page<T> {
        return repository.findByNamespaceLike("$namespaceName/", pageable)
    }

    override fun getProjectsBySlug(slug: String, pageable: Pageable?): Page<T> {
        return repository.findBySlug(slug, pageable)
    }


    override fun getAllPublicProjects(pageable: Pageable?): List<T> {
        val projectsIds = if (pageable != null)
            publicProjectsCacheService.getPublicProjectsIdsList(pageable).content
        else
            publicProjectsCacheService.getPublicProjectsIdsList()

        return repository.findAllById(projectsIds).toList()
    }

    override fun getProjectById(projectId: UUID): T? {
        return repository.findByIdOrNull(projectId)
    }

    override fun getProjectByGitlabId(projectId: Long): T? {
        return repository.findByGitlabId(projectId)
    }

    @Suppress("UNCHECKED_CAST")
    override fun starProject(projectId: UUID?, projectGitlabId: Long?, person: Person, userToken: String): T {
        val project = when {
            projectId != null -> repository.findByIdOrNull(projectId)
            projectGitlabId != null -> repository.findByGitlabId(projectGitlabId)
            else -> throw UnknownProjectException("Incorrect search project criteria")
        } ?: throw ProjectNotFoundException(projectId, gitlabId = projectGitlabId)
        gitlabRestClient.userStarProject(userToken, project.gitlabId)
        return repository.save(project.addStar(person) as T)
    }

    @Suppress("UNCHECKED_CAST")
    override fun unstarProject(projectId: UUID?, projectGitlabId: Long?, person: Person, userToken: String): T {
        val project = when {
            projectId != null -> repository.findByIdOrNull(projectId)
            projectGitlabId != null -> repository.findByGitlabId(projectGitlabId)
            else -> throw UnknownProjectException("Incorrect search project criteria")
        } ?: throw ProjectNotFoundException(projectId, gitlabId = projectGitlabId)
        gitlabRestClient.userUnstarProject(userToken, project.gitlabId)
        return repository.save(project.removeStar(person) as T)
    }


    override fun getProjectsByNamespaceAndPath(namespaceName: String, slug: String): T? {
        return repository.findByNamespaceAndPath(namespaceName, slug)
    }

    override fun checkAvailability(
        userToken: String,
        creatingPersonId: UUID,
        projectName: String,
        projectNamespace: String?
    ): String {
        val possibleSlug = Slugs.toSlug(projectName)
        val findNamespace = if (projectNamespace != null && projectNamespace.isNotBlank()) try {
            gitlabRestClient
                .findNamespace(userToken, projectNamespace)
                .firstOrNull { it.path.toLowerCase().contains(projectNamespace.toLowerCase()) }
        } catch (e: Exception) {
            null
        } else null

        val ownerId = if (findNamespace != null) {
            val findByPath = subjectRepository.findBySlug(findNamespace.path)
            findByPath.firstOrNull()?.id
                ?: throw ProjectCreationException(ErrorCode.ProjectNamespaceSubjectNotFound, "Gitlab Namespace ${findNamespace.id} not connected to persisted Subject")
        } else {
            creatingPersonId
        }

        reservedNamesService.assertProjectNameIsNotReserved(projectName)

        repository.findOneByOwnerIdAndSlug(ownerId, possibleSlug)?.let {
            throw ConflictException(ErrorCode.GitlabProjectAlreadyExists, "Project exists for owner $creatingPersonId")
        }

        if (projectNamespace != null) {
            repository.findByNamespaceAndPath(projectNamespace, possibleSlug)?.let {
                throw ConflictException(ErrorCode.GitlabProjectAlreadyExists, "Project exists for owner $creatingPersonId")
            }
        }

        return possibleSlug
    }

    @RefreshUserInformation(userId = "#ownerId")
    @RefreshProject
    override fun createProject(
        userToken: String,
        creatingPersonId: UUID,
        projectSlug: String,
        projectName: String,
        projectNamespace: String,
        description: String,
        visibility: VisibilityScope,
        initializeWithReadme: Boolean,
        inputDataTypes: List<DataType>?
    ): T {
        reservedNamesService.assertProjectNameIsNotReserved(projectName)

        val findNamespace = if (projectNamespace.isNotBlank()) try {
            val findNamespaces = gitlabRestClient.findNamespace(userToken, projectNamespace)
            findNamespaces.firstOrNull { it.path.toLowerCase().contains(projectNamespace.toLowerCase()) }
        } catch (e: Exception) {
            log.warn(e.message, e)
            log.warn("Namespace cannot be found, will use default one of user")
            null
        } else null

        // if project is stored under a "private" group, it has to be private
        // https://gitlab.com/gitlab-org/gitlab/-/issues/14327
        val finalVisibility = if (findNamespace != null && findNamespace.kind == NamespaceKind.GROUP) {
            // TODO: append Visibility to Groups again, check visibility, if PRIVATE GROUP project has to be PRIVATE
            // FIXME
            VisibilityScope.PRIVATE
        } else {
            visibility
        }

        val ownerId = if (findNamespace != null) {
            val findByPath = subjectRepository.findBySlug(findNamespace.path)
            findByPath.firstOrNull()?.id
                ?: throw ProjectCreationException(ErrorCode.ProjectNamespaceSubjectNotFound, "Gitlab Namespace ${findNamespace.id} not connected to persisted Subject")
        } else {
            creatingPersonId
        }

        val gitLabProject = gitlabRestClient.createProject(
            token = userToken,
            slug = projectSlug,
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id,
            description = description,
            visibility = finalVisibility.toGitlabString(),
            initializeWithReadme = initializeWithReadme)
        val project = createConcreteProject(ownerId, gitLabProject)
        try {
            return if (inputDataTypes != null) {
                saveProject(project.copy(inputDataTypes = inputDataTypes.toSet()))
            } else {
                saveProject(project)
            }
        } catch (e: Exception) {
            throw ConflictException(ErrorCode.GitlabProjectIdAlreadyUsed, e.message
                ?: "GitlabId of new projects creates a conflict")
        }
    }

    private fun saveProject(project: T): T {
        return repository.save(project)
    }

    @RefreshProject(projectId = "#projectUUID")
    override fun updateProject(userToken: String, ownerId: UUID, projectUUID: UUID, projectName: String?, description: String?, visibility: VisibilityScope?, inputDataTypes: List<DataType>?, outputDataTypes: List<DataType>?, tags: List<SearchableTag>?): T {
        val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        reservedNamesService.assertProjectNameIsNotReserved(projectName ?: project.name)

        try {
            val gitlabProject = gitlabRestClient.userUpdateProject(
                id = project.gitlabId,
                token = userToken,
                name = projectName,
                description = description,
                visibility = visibility?.toGitlabString()
            )
            return saveProject(
                project.copy(
                    name = gitlabProject.name,
                    description = gitlabProject.description,
                    gitlabPath = gitlabProject.path,
                    visibilityScope = gitlabProject.visibility.toVisibilityScope(),
                    inputDataTypes = inputDataTypes?.toSet() ?: project.inputDataTypes,
                    outputDataTypes = outputDataTypes?.toSet() ?: project.outputDataTypes,
                    tags = tags?.toSet() ?: project.tags
                )
            )
        } catch (e: GitlabCommonException) {
            throw RestException(ErrorCode.GitlabProjectCreationFailed, "Cannot update Project $projectUUID: ${e.message}")
        }
    }

    @RefreshProject(projectId = "#projectUUID")
    override fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID) {
        try {
            val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
            gitlabRestClient.deleteProject(id = project.gitlabId, token = userToken)
            repository.delete(project)
        } catch (e: GitlabCommonException) {
            throw RestException(ErrorCode.GitlabProjectDeleteFailed, "Cannot delete Project $projectUUID: ${e.message}")
        }
    }

    override fun getUsersInProject(projectUUID: UUID): List<UserInProject> {
        val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        return gitlabRestClient
            .adminGetProjectMembers(projectId = project.gitlabId)
            .mapNotNull {
                val account = accountRepository.findAccountByGitlabId(it.id)
                if (account != null) {
                    val expiration = if (it.expiresAt != null) {
                        val localDate = LocalDate.from(gitlabRestClient.gitlabDateTimeFormatter.parse(it.expiresAt))
                        val zonedDateTime = ZonedDateTime.of(LocalDateTime.of(localDate, LocalTime.MIN), ZoneId.systemDefault())
                        Instant.from(zonedDateTime)
                    } else null
                    UserInProject(account.id, it.username, account.email, it.id, it.accessLevel.toAccessLevel(), expiration)
                } else null //possible it is a bot or admin
            }
    }

    override fun getUserProjectsList(userToken: String, userId: UUID?): List<ProjectOfUser> {
        val user = resolveAccount(userId = userId)
            ?: throw UserNotFoundException(userId = userId)

        val userProjects = try {
            gitlabRestClient.userGetUserAllProjects(userToken)
        } catch (ex: Exception) {
            log.error("Cannot request projects from gitlab for user ${user.id}. Exception: $ex.")
            listOf<GitlabProject>()
        }

        return userProjects.mapNotNull { project ->
            try {
                //Without this IF block Gitlab returns access level for user as a Maintainer
                val gitlabAccessLevel = if (project.owner?.id?.equals(user.person.gitlabId) == true)
                    GitlabAccessLevel.OWNER
                else
                    gitlabRestClient.adminGetProjectMembers(project.id).first { gitlabUser -> gitlabUser.id == user.person.gitlabId }.accessLevel

                val projectInDb = repository.findByGitlabId(project.id)
                    ?: throw ProjectNotFoundException(gitlabId = project.id)
                projectInDb.toProjectOfUser(gitlabAccessLevel.toAccessLevel())
            } catch (ex: Exception) {
                null
            }
        }
    }

    override fun checkUserInProject(projectUUID: UUID, userId: UUID?, userName: String?, email: String?, userGitlabId: Long?, level: AccessLevel?, minlevel: AccessLevel?): Boolean {
        try {
            val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

            val gitlabId = userGitlabId
                ?: resolveAccount(userId = userId, userName = userName, email = email)?.person?.gitlabId
                ?: return false

            if ((level != null && level == AccessLevel.OWNER) || (minlevel != null && minlevel == AccessLevel.OWNER)) {
                return gitlabRestClient.adminGetProject(project.gitlabId).owner?.id == gitlabId
            } else {
                val userInProjectInGitlab = gitlabRestClient.adminGetUserInProject(
                    projectId = project.gitlabId,
                    userId = gitlabId
                )

                return when {
                    minlevel != null -> userInProjectInGitlab.accessLevel.satisfies(level.toGitlabAccessLevel())
                    level != null -> userInProjectInGitlab.accessLevel == level.toGitlabAccessLevel()
                    else -> true
                }
            }
        } catch (ex: Exception) {
            log.error("Cannot check user in project: Exception: $ex")
            return false
        }
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

        gitlabRestClient.adminDeleteGroupFromProject(
            projectId = project.gitlabId,
            groupId = group.gitlabId ?: throw UnknownUserException("Group is not connected to Gitlab")
        )

        return group
    }

    //Fixme move to new service that will appear after Budget task is merged
    private fun resolveAccount(userToken: String? = null, userId: UUID? = null, personId: UUID? = null, userName: String? = null, email: String? = null, gitlabId: Long? = null): Account? =
        when {
            userToken != null -> gitlabRestClient.getUser(userToken)
                .let { accountRepository.findAccountByGitlabId(it.id) }
            personId != null -> accountRepository.findAccountByPersonId(personId)
            userId != null -> accountRepository.findByIdOrNull(userId)
            email != null -> accountRepository.findOneByEmail(email)
            userName != null -> accountRepository.findOneByUsername(userName)
            gitlabId != null -> accountRepository.findAccountByGitlabId(gitlabId)
            else -> throw BadParametersException("At least one parameter must be provided")
        }

    @Suppress("UNCHECKED_CAST")
    private fun createConcreteProject(ownerId: UUID, gitlabProject: GitlabProject): T =
        when (baseClass) {
            DataProject::class.java -> createDataProjectEntity(ownerId, gitlabProject) as T
            CodeProject::class.java -> createCodeProjectEntity(ownerId, gitlabProject) as T
            else -> throw RuntimeException("You need to use concrete class")
        }

    private fun createDataProjectEntity(ownerId: UUID, gitlabProject: GitlabProject): DataProject =
        DataProject(
            id = randomUUID(),
            slug = gitlabProject.path,
            ownerId = ownerId,
            url = gitlabProject.webUrl,
            name = gitlabProject.name,
            description = gitlabProject.description ?: "",
            gitlabPath = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabNamespace = gitlabProject.pathWithNamespace.split("/")[0],
            gitlabId = gitlabProject.id,
            visibilityScope = gitlabProject.visibility.toVisibilityScope()
        )

    private fun createCodeProjectEntity(ownerId: UUID, gitlabProject: GitlabProject): CodeProject =
        CodeProject(
            id = randomUUID(),
            slug = gitlabProject.path,
            ownerId = ownerId,
            url = gitlabProject.webUrl,
            name = gitlabProject.name,
            description = gitlabProject.description ?: "",
            gitlabPath = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabNamespace = gitlabProject.pathWithNamespace.split("/")[0],
            gitlabId = gitlabProject.id,
            visibilityScope = gitlabProject.visibility.toVisibilityScope()
        )

    @Transactional
    override fun updateUserNameInProjects(oldUserName: String, newUserName: String, tokenDetails: TokenDetails) {
        resolveAccount(userName = oldUserName)
            ?: resolveAccount(userName = newUserName)
            ?: throw UserNotFoundException(userName = oldUserName)

        getProjectsByNamespace(oldUserName).forEach {
            if (tokenDetails.projects[it.id] == AccessLevel.OWNER) {
                val updatedProject = it.copy<T>(
                    url = it.url.replace(oldUserName, newUserName, true),
                    gitlabNamespace = it.gitlabNamespace.replace(oldUserName, newUserName, true),
                    gitlabPathWithNamespace = it.gitlabPathWithNamespace.replace(oldUserName, newUserName, true)
                )
                saveProject(updatedProject)
            }
        }
    }
}
