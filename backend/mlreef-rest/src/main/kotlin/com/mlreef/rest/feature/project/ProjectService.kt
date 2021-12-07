package com.mlreef.rest.feature.project

import com.mlreef.rest.*
import com.mlreef.rest.annotations.RefreshGroupInformation
import com.mlreef.rest.annotations.RefreshProject
import com.mlreef.rest.annotations.RefreshUserInformation
import com.mlreef.rest.annotations.SaveRecentProject
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.*
import com.mlreef.rest.domain.ProjectType.DATA_PROJECT
import com.mlreef.rest.domain.helpers.ProjectOfUser
import com.mlreef.rest.domain.helpers.UserInProject
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.repositories.DataTypesRepository
import com.mlreef.rest.domain.repositories.ProcessorTypeRepository
import com.mlreef.rest.exceptions.*
import com.mlreef.rest.external_api.gitlab.*
import com.mlreef.rest.external_api.gitlab.dto.GitlabNamespace
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.feature.auth.UserResolverService
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.system.FilesManagementService
import com.mlreef.rest.feature.system.ReservedNamesService
import com.mlreef.rest.utils.Slugs
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.multipart.MultipartFile
import java.time.*
import java.time.ZonedDateTime.now
import java.time.ZonedDateTime.of
import java.util.*
import java.util.UUID.randomUUID
import javax.servlet.http.HttpServletRequest
import javax.transaction.Transactional

interface ProjectService<T : Project> {
    fun getAllPublicProjects(pageable: Pageable? = null): List<T>

    fun getAllPublicProjectsOnly(pageable: Pageable?): Page<T>
    fun getAllProjectsAccessibleByUser(token: TokenDetails, pageable: Pageable? = null, isDataProjectRequest: Boolean): Page<T>
    fun getAllProjectsStarredByUser(token: TokenDetails, pageable: Pageable? = null): Page<T>
    fun getOwnProjectsOfUserPaged(token: TokenDetails, pageable: Pageable? = null): Page<T>
    fun getOwnProjectsOfUser(token: TokenDetails): List<T>
    fun getAllProjectsUserMemberIn(token: TokenDetails, pageable: Pageable? = null): Page<T>
    fun getProjectsByNamespace(namespaceName: String, pageable: Pageable? = null): Page<T>
    fun getProjectsBySlug(slug: String, pageable: Pageable? = null): Page<T>
    fun getProjectsByNamespaceAndSlug(namespace: String, slug: String): T?
    fun getProjectById(projectId: UUID): T?
    fun getProjectByName(projectName: String): T?
    fun getProjectByGitlabId(projectId: Long): T?
    fun getProjectsByNamespaceAndPath(namespaceName: String, path: String): T?
    fun getUsersInProject(projectUUID: UUID): List<UserInProject>
    fun getNamespaces(userToken: String): List<GitlabNamespace>

    fun <T : Project> isProjectForkedByUser(project: T?, accountId: UUID?, projectId: UUID? = null): Boolean

    fun starProject(projectId: UUID? = null, projectGitlabId: Long? = null, account: Account, userToken: String): T
    fun unstarProject(projectId: UUID? = null, projectGitlabId: Long? = null, account: Account, userToken: String): T

    fun createProject(
        userToken: String,
        ownerId: UUID,
        projectSlug: String,
        projectName: String,
        projectNamespace: String,
        description: String,
        visibility: VisibilityScope = VisibilityScope.PUBLIC,
        initializeWithReadme: Boolean = false,
        inputDataTypes: List<String>? = null,
        outputDataTypes: List<String>? = null,
        processorType: String? = null,
        id: UUID? = null,
    ): T

    fun forkProject(userToken: String, originalId: UUID, creator: Account, name: String? = null, path: String? = null, namespaceIdOrName: String? = null): T

    fun saveProject(project: T): T

    fun updateProject(
        userToken: String,
        ownerId: UUID,
        projectUUID: UUID,
        projectName: String? = null,
        description: String? = null,
        visibility: VisibilityScope? = null,
        inputDataTypes: List<String>? = null,
        outputDataTypes: List<String>? = null,
        tags: List<SearchableTag>? = null,
    ): T

    fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID? = null, projectName: String? = null)

    fun getUserProjectsList(userToken: String, userId: UUID? = null): List<ProjectOfUser>

    fun checkUserInProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userName: String? = null,
        email: String? = null,
        userGitlabId: Long? = null,
        level: AccessLevel? = null,
        minlevel: AccessLevel? = null,
    ): Boolean

    fun addUserToProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userGitlabId: Long? = null,
        userName: String? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null,
    ): Account

    fun addGroupToProject(
        projectUUID: UUID,
        groupId: UUID? = null,
        groupGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null,
    ): Group

    fun editUserInProject(
        projectUUID: UUID,
        userId: UUID? = null,
        userGitlabId: Long? = null,
        userName: String? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null,
    ): Account

    fun editGroupInProject(
        projectUUID: UUID,
        groupId: UUID? = null,
        groupGitlabId: Long? = null,
        accessLevel: AccessLevel? = null,
        accessTill: Instant? = null,
    ): Group

    fun deleteUserFromProject(projectUUID: UUID, userId: UUID? = null, userGitlabId: Long? = null, userName: String? = null): Account
    fun deleteGroupFromProject(projectUUID: UUID, groupId: UUID? = null, groupGitlabId: Long? = null): Group

    fun updateUserNameInProjects(oldUserName: String, newUserName: String, tokenDetails: TokenDetails)
    fun checkAvailability(
        userToken: String,
        creatorId: UUID,
        projectName: String,
        projectNamespace: String?,
    ): String

    fun createProjectCover(file: MultipartFile, owner: Account? = null, ownerId: UUID? = null, project: T? = null, projectId: UUID? = null, request: HttpServletRequest? = null): MlreefFile
    fun updateProjectCover(file: MultipartFile, owner: Account? = null, ownerId: UUID? = null, project: T? = null, projectId: UUID? = null, request: HttpServletRequest? = null): MlreefFile
    fun deleteProjectCover(owner: Account? = null, ownerId: UUID? = null, project: T? = null, projectId: UUID? = null)
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
    private val processorTypeRepository: ProcessorTypeRepository,
    private val dataTypesRepository: DataTypesRepository,
    private val userResolverService: UserResolverService,
    private val projectsConfiguration: ProjectsConfiguration,
    private val filesManagementService: FilesManagementService,
) {

    @Bean
    fun dataProjectService(): ProjectService<DataProject> {
        return ProjectServiceImpl(
            DataProject::class.java,
            dataProjectRepository,
            publicProjectsCacheService,
            gitlabRestClient,
            reservedNamesService,
            accountRepository,
            groupRepository,
            processorTypeRepository,
            dataTypesRepository,
            userResolverService,
            projectsConfiguration,
            filesManagementService,
        )
    }

    @Bean
    fun codeProjectService(): ProjectService<CodeProject> {
        return ProjectServiceImpl(
            CodeProject::class.java,
            codeProjectRepository,
            publicProjectsCacheService,
            gitlabRestClient,
            reservedNamesService,
            accountRepository,
            groupRepository,
            processorTypeRepository,
            dataTypesRepository,
            userResolverService,
            projectsConfiguration,
            filesManagementService,
        )
    }

    @Bean
    fun projectService(): ProjectService<Project> {
        return ProjectServiceImpl(
            Project::class.java,
            projectRepository,
            publicProjectsCacheService,
            gitlabRestClient,
            reservedNamesService,
            accountRepository,
            groupRepository,
            processorTypeRepository,
            dataTypesRepository,
            userResolverService,
            projectsConfiguration,
            filesManagementService,
        )
    }
}

@Suppress("UNCHECKED_CAST")
open class ProjectServiceImpl<T : Project>(
    private val baseClass: Class<T>,
    val repository: ProjectBaseRepository<T>,
    val publicProjectsCacheService: PublicProjectsCacheService,
    val gitlabRestClient: GitlabRestClient,
    private val reservedNamesService: ReservedNamesService,
    private val accountRepository: AccountRepository,
    private val groupRepository: GroupRepository,
    private val processorTypeRepository: ProcessorTypeRepository,
    private val dataTypesRepository: DataTypesRepository,
    private val userResolverService: UserResolverService,
    private val projectsConfiguration: ProjectsConfiguration,
    private val filesManagementService: FilesManagementService,
) : ProjectService<T> {

    private val log = LoggerFactory.getLogger(this::class.java)

    private val gitlabMaxPageSizeRequest = 100

    companion object {
        private val DEFAULT_PROCESSOR_TYPE = "ALGORITHM"
        private val DEFAULT_CODE_PROJECT_INPUT_TYPE = "NONE"
        private val DEFAULT_CODE_PROJECT_OUTPUT_TYPE = "NONE"
        private val DEFAULT_DATA_PROJECT_INPUT_TYPE = "NONE"
    }

    @Deprecated("Use marketplace search")
    override fun getAllProjectsAccessibleByUser(token: TokenDetails, pageable: Pageable?, isDataProjectRequest: Boolean): Page<T> =
        if (token.isVisitor)
            if (isDataProjectRequest)
                repository.findAccessibleDataProjectsForVisitor(pageable)
            else
                repository.findAccessibleProjectsForVisitor(pageable)
        else
            if (isDataProjectRequest)
                repository.findAccessibleDataProjectsForOwner(token.accountId, token.projects.map { it.key }, pageable)
            else
                repository.findAccessibleProjectsForOwner(token.accountId, token.projects.map { it.key }, pageable)

    override fun getAllProjectsStarredByUser(token: TokenDetails, pageable: Pageable?): Page<T> =
        if (token.isVisitor)
            Page.empty(pageable ?: Pageable.unpaged())
        else
            repository.findAccessibleStarredProjectsForUser(token.accountId, token.projects.map { it.key }, pageable)

    override fun getOwnProjectsOfUserPaged(token: TokenDetails, pageable: Pageable?): Page<T> {
        if (token.isVisitor) {
            return Page.empty(pageable ?: Pageable.unpaged())
        } else {
            val type = getProjectType()
            return if (type != null) {
                repository.findAllByOwnerIdAndType(token.accountId, type = type, pageable)
            } else {
                repository.findAllByOwnerId(token.accountId, pageable)
            }
        }
    }

    override fun getOwnProjectsOfUser(token: TokenDetails): List<T> {
        if (token.isVisitor) {
            return listOf()
        } else {
            val type = getProjectType()
            return if (type != null) {
                repository.findAllByOwnerIdAndType(token.accountId, type = type)
            } else {
                repository.findAllByOwnerId(token.accountId)
            }
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

    override fun getProjectsByNamespaceAndSlug(namespace: String, slug: String): T? {
        return repository.findByNamespaceAndSlug(namespace, slug)
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

    override fun getProjectByName(projectName: String): T? {
        return repository.findByNameIgnoreCase(projectName)
    }

    override fun getProjectByGitlabId(projectId: Long): T? {
        return repository.findByGitlabId(projectId)
    }

    @Suppress("UNCHECKED_CAST")
    override fun starProject(projectId: UUID?, projectGitlabId: Long?, account: Account, userToken: String): T {
        val project = when {
            projectId != null -> repository.findByIdOrNull(projectId)
            projectGitlabId != null -> repository.findByGitlabId(projectGitlabId)
            else -> throw UnknownProjectException("Incorrect search project criteria")
        } ?: throw ProjectNotFoundException(projectId, gitlabId = projectGitlabId)
        gitlabRestClient.userStarProject(userToken, project.gitlabId)
        return repository.save(project.addStar(account) as T)
    }

    @Suppress("UNCHECKED_CAST")
    override fun unstarProject(projectId: UUID?, projectGitlabId: Long?, account: Account, userToken: String): T {
        val project = when {
            projectId != null -> repository.findByIdOrNull(projectId)
            projectGitlabId != null -> repository.findByGitlabId(projectGitlabId)
            else -> throw UnknownProjectException("Incorrect search project criteria")
        } ?: throw ProjectNotFoundException(projectId, gitlabId = projectGitlabId)
        gitlabRestClient.userUnstarProject(userToken, project.gitlabId)
        return repository.save(project.removeStar(account) as T)
    }

    override fun getProjectsByNamespaceAndPath(namespaceName: String, path: String): T? {
        return repository.findByNamespaceAndPath(namespaceName, path)
    }

    override fun checkAvailability(
        userToken: String,
        creatorId: UUID,
        projectName: String,
        projectNamespace: String?,
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
            accountRepository.findBySlug(findNamespace.path)?.id
                ?: throw ProjectCreationException(ErrorCode.ProjectNamespaceSubjectNotFound, "Gitlab Namespace ${findNamespace.id} not connected to persisted Account")
        } else {
            creatorId
        }

        reservedNamesService.assertProjectNameIsNotReserved(projectName)

        repository.findOneByOwnerIdAndSlug(ownerId, possibleSlug)?.let {
            throw ConflictException(ErrorCode.GitlabProjectAlreadyExists, "Project exists for owner $creatorId")
        }

        if (projectNamespace != null) {
            repository.findByNamespaceAndPath(projectNamespace, possibleSlug)?.let {
                throw ConflictException(ErrorCode.GitlabProjectAlreadyExists, "Project exists for owner $creatorId")
            }
        }

        return possibleSlug
    }

    override fun getNamespaces(userToken: String): List<GitlabNamespace> {
        return gitlabRestClient.getNamespaces(userToken)
    }

    override fun <T : Project> isProjectForkedByUser(project: T?, accountId: UUID?, projectId: UUID?): Boolean {
        return accountId?.let {
            repository.getProjectIdByOwnerAndForkedParent(
                accountId,
                project
                    ?: projectId?.let { repository.findByIdOrNull(it) }
                    ?: throw NotFoundException("Project $projectId was not found")
            ) != null
        } ?: false
    }

    @SaveRecentProject(projectId = "#result.id", userId = "#ownerId", operation = "createProject")
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
        initializeWithReadme: Boolean,
        inputDataTypes: List<String>?,
        outputDataTypes: List<String>?,
        processorType: String?,
        id: UUID?,
    ): T {
        log.debug("Creating the project $projectName")

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

        val creatorId = if (findNamespace != null) {
            userResolverService.resolveAccount(slug = findNamespace.path)?.id
                ?: userResolverService.resolveAccount(slug = Slugs.toSlug(findNamespace.path))?.id
                ?: userResolverService.resolveAccount(userName = findNamespace.path)?.id
                ?: throw ProjectCreationException(ErrorCode.ProjectNamespaceSubjectNotFound, "Gitlab Namespace ${findNamespace.id} is not connected to persisted Subject")
        } else {
            ownerId
        }

        val inputDataTypesEntities = (inputDataTypes ?: getDefaultInputTypes()).map {
            val parsedId = it.tryToUUID()
            (if (parsedId != null) {
                dataTypesRepository.findByIdOrNull(parsedId)
            } else {
                dataTypesRepository.findByNameIgnoreCase(it)
            }) ?: throw BadRequestException(ErrorCode.NotFound, "Data type $it not found")
        }.toMutableSet()

        val outputDataTypesEntities = (outputDataTypes ?: getDefaultOutputTypes()).map {
            val parsedId = it.tryToUUID()
            (if (parsedId != null) {
                dataTypesRepository.findByIdOrNull(parsedId)
            } else {
                dataTypesRepository.findByNameIgnoreCase(it)
            }) ?: throw BadRequestException(ErrorCode.NotFound, "Data type $it not found")
        }.toMutableSet()

        val processorTypeEntity = (processorType ?: DEFAULT_PROCESSOR_TYPE).let {
            val parsedId = it.tryToUUID()
            (if (parsedId != null) {
                processorTypeRepository.findByIdOrNull(parsedId)
            } else {
                processorTypeRepository.findByNameIgnoreCase(it)
            }) ?: throw BadRequestException(ErrorCode.NotFound, "Processor type $it not found")
        }

        val gitLabProject = gitlabRestClient.createProject(
            token = userToken,
            slug = projectSlug.toLowerCase(),
            name = projectName,
            defaultBranch = "master",
            nameSpaceId = findNamespace?.id,
            description = description,
            visibility = finalVisibility.toGitlabString(),
            initializeWithReadme = initializeWithReadme
        )

        var project = createConcreteProject(creatorId, gitLabProject, processorTypeEntity, id)

        project = if (project is CodeProject) {
            project.copy(
                inputDataTypes = inputDataTypesEntities,
                outputDataTypes = outputDataTypesEntities,
            ) as T
        } else {
            project.copy(
                inputDataTypes = inputDataTypesEntities,
            ) as T
        }

        return saveProject(project)
    }

    /**
     * For more information see
     * https://gitlab.com/mlreef/mlreef/-/blob/master/docs/content/99-development/1-Projects.md
     *
     */
    @SaveRecentProject(projectId = "#result.id", userId = "#creatorId", operation = "forkProject")
    @RefreshUserInformation(userId = "#creatorId")
    override fun forkProject(userToken: String, originalId: UUID, creator: Account, name: String?, path: String?, namespaceIdOrName: String?): T {
        val original = repository.findByIdOrNull(originalId)
            ?: throw ProjectNotFoundException(originalId)

        if (repository.findByOwnerIdAndForkParent(creator.id, original) != null)
            throw ConflictException("The user '${creator.username}' has already forked the project '${original.name}'")

        if (original.ownerId == creator.id)
            throw ConflictException("User cannot fork own project")

        val namespace = try {
            namespaceIdOrName?.toLongOrNull()?.let {
                gitlabRestClient.getNamespaceById(userToken, namespaceIdOrName.toLong())
            } ?: if (!namespaceIdOrName.isNullOrBlank()) {
                val findNamespaces = gitlabRestClient.findNamespace(userToken, namespaceIdOrName)
                findNamespaces.firstOrNull { it.path.toLowerCase().contains(namespaceIdOrName.toLowerCase()) }
            } else null
        } catch (e: Exception) {
            log.warn(e.message, e)
            log.warn("Namespace $namespaceIdOrName cannot be found, will use default one of user")
            null
        }

        val gitlabFork = try {
            gitlabRestClient.forkProject(
                token = userToken,
                sourceId = original.gitlabId,
                targetName = name,
                targetPath = path,
                namespaceId = namespace?.id,
                namespacePath = namespace?.path,
            )
        } catch (e: GitlabCommonException) {
            throw ConflictException(ErrorCode.GitlabProjectCreationFailed, "Cannot update Project $originalId: ${e.message}")
        }

        val fork: T = if (original is CodeProject) {
            createCodeProjectEntity(
                ownerId = creator.id,
                gitlabProject = gitlabFork,
                processorType = original.processorType,
                modelType = original.modelType,
                mlCategory = original.mlCategory,
                inputDataTypes = original.inputDataTypes,
                outputDataTypes = original.outputDataTypes,
            ) as T
        } else {
            createDataProjectEntity(ownerId = creator.id, gitlabFork) as T
        }

        val savedProject = this.saveProject(fork.copy(createdAt = now(), updatedAt = now(), forkParent = original))

        if (projectsConfiguration.syncFork) {
            val start = Instant.now()
            val limit = projectsConfiguration.waitGitlabForkSec.toLong()
            while (start.isAfter(Instant.now().minusSeconds(limit))) {
                val projectInGitlab = gitlabRestClient.adminGetProject(gitlabFork.id)
                if ((projectInGitlab.importStatus?.toLowerCase() ?: "none") in listOf("none", "finished")) break
                Thread.sleep(projectsConfiguration.pauseForkFinishedPollingSec * 1000L)
            }
        }

        return savedProject
    }

    override fun saveProject(project: T): T {
        return repository.save(project)
    }

    @SaveRecentProject(projectId = "#projectUUID", userId = "#ownerId", operation = "updateProject")
    @RefreshProject(projectId = "#projectUUID")
    override fun updateProject(
        userToken: String,
        ownerId: UUID,
        projectUUID: UUID,
        projectName: String?,
        description: String?,
        visibility: VisibilityScope?,
        inputDataTypes: List<String>?,
        outputDataTypes: List<String>?,
        tags: List<SearchableTag>?,
    ): T {
        var project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        reservedNamesService.assertProjectNameIsNotReserved(projectName ?: project.name)

        val inputDataTypesEntities = inputDataTypes?.map {
            val parsedId = it.tryToUUID()
            (if (parsedId != null) {
                dataTypesRepository.findByIdOrNull(parsedId)
            } else {
                dataTypesRepository.findByNameIgnoreCase(it)
            }) ?: throw BadRequestException(ErrorCode.NotFound, "Data type $it not found")
        }?.toMutableSet()

        val outputDataTypesEntities = outputDataTypes?.map {
            val parsedId = it.tryToUUID()
            (if (parsedId != null) {
                dataTypesRepository.findByIdOrNull(parsedId)
            } else {
                dataTypesRepository.findByNameIgnoreCase(it)
            }) ?: throw BadRequestException(ErrorCode.NotFound, "Data type $it not found")
        }?.toMutableSet()

        val gitlabProject = gitlabRestClient.userUpdateProject(
            id = project.gitlabId,
            token = userToken,
            name = projectName,
            description = description,
            visibility = visibility?.toGitlabString()
        )

        project = if (project is CodeProject) {
            project.copy(
                outputDataTypes = outputDataTypesEntities,
            ) as T
        } else project

        return saveProject(
            project.copy(
                name = gitlabProject.name,
                description = gitlabProject.description,
                gitlabPath = gitlabProject.path,
                visibilityScope = gitlabProject.visibility.toVisibilityScope(),
                inputDataTypes = inputDataTypesEntities ?: project.inputDataTypes,
                tags = tags?.toMutableSet() ?: project.tags
            )
        )
    }

    @RefreshProject(projectId = "#projectUUID", projectName = "#projectName")
    override fun deleteProject(userToken: String, ownerId: UUID, projectUUID: UUID?, projectName: String?) {
        try {
            val projectId = projectUUID
                ?: this.getProjectByName(
                    projectName ?: throw BadParametersException("Either id or name must be present to delete projects")
                )?.id ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectName not found")
            val project = this.getProjectById(projectId) ?: throw ProjectNotFoundException(projectUUID)
            gitlabRestClient.deleteProject(id = project.gitlabId, token = userToken)
            repository.delete(project)
        } catch (e: GitlabCommonException) {
            throw RestException(ErrorCode.GitlabProjectDeleteFailed, "Cannot delete Project $projectUUID: ${e.message}")
        }
    }

    @org.springframework.transaction.annotation.Transactional
    override fun getUsersInProject(projectUUID: UUID): List<UserInProject> {
        val project = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        return gitlabRestClient
            .adminGetProjectMembers(projectId = project.gitlabId)
            .mapNotNull {
                val account = accountRepository.findAccountByGitlabId(it.id)
                if (account != null) {
                    val expiration = if (it.expiresAt != null) {
                        val localDate = LocalDate.from(gitlabRestClient.gitlabDateTimeFormatter.parse(it.expiresAt))
                        val zonedDateTime = of(LocalDateTime.of(localDate, LocalTime.MIN), ZoneId.systemDefault())
                        Instant.from(zonedDateTime)
                    } else null
                    UserInProject(
                        account.id,
                        account.externalAccount?.let { it.username ?: "" } ?: it.username,
                        account.externalAccount?.let { it.email ?: "" } ?: account.email,
                        it.id,
                        it.accessLevel.toAccessLevel(),
                        expiration
                    )
                } else null //possible it is a bot or admin
            }
    }

    @org.springframework.transaction.annotation.Transactional
    override fun getUserProjectsList(userToken: String, userId: UUID?): List<ProjectOfUser> {
        val user = userResolverService.resolveAccount(userId = userId)
            ?: throw UserNotFoundException(userId = userId)

        val userProjects = try {
            gitlabRestClient.userGetUserAllProjects(userToken)
        } catch (ex: Exception) {
            log.error("Cannot request projects from gitlab for user ${user.id}. Exception: $ex.")
            listOf()
        }

        return userProjects.mapNotNull { project ->
            try {
                //Without this IF block Gitlab returns access level for user as a Maintainer
                val gitlabAccessLevel = if (project.owner?.id?.equals(user.gitlabId) == true)
                    GitlabAccessLevel.OWNER
                else
                    gitlabRestClient.adminGetProjectMembers(project.id).first { gitlabUser -> gitlabUser.id == user.gitlabId }.accessLevel

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
                ?: userResolverService.resolveAccount(userId = userId, userName = userName, email = email)?.gitlabId
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

    @RefreshUserInformation(userId = "#userId", gitlabId = "#userGitlabId", username = "#userName")
    override fun addUserToProject(
        projectUUID: UUID,
        userId: UUID?,
        userGitlabId: Long?,
        userName: String?,
        accessLevel: AccessLevel?,
        accessTill: Instant?,
    ): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)
        val level = accessLevel ?: AccessLevel.GUEST

        val account = userResolverService.resolveAccount(userName, userId, userGitlabId)
            ?: throw UserNotFoundException(userId = userId, userName = userName, gitlabId = userGitlabId)

        gitlabRestClient
            .adminAddUserToProject(
                projectId = codeProject.gitlabId,
                userId = account.gitlabId
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
        accessTill: Instant?,
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

    @RefreshUserInformation(userId = "#userId", gitlabId = "#userGitlabId", username = "#userName")
    override fun editUserInProject(
        projectUUID: UUID,
        userId: UUID?,
        userGitlabId: Long?,
        userName: String?,
        accessLevel: AccessLevel?,
        accessTill: Instant?,
    ): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val account = userResolverService.resolveAccount(userName, userId, userGitlabId)
            ?: throw UserNotFoundException(userId = userId, userName = userName, gitlabId = userGitlabId)

        val gitlabUserId = account.gitlabId
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
        accessTill: Instant?,
    ): Group {
        this.deleteGroupFromProject(projectUUID, groupId, groupGitlabId)
        return this.addGroupToProject(projectUUID, groupId, groupGitlabId, accessLevel, accessTill)
    }

    @RefreshUserInformation(userId = "#userId", gitlabId = "#userGitlabId", username = "#userName")
    override fun deleteUserFromProject(projectUUID: UUID, userId: UUID?, userGitlabId: Long?, userName: String?): Account {
        val codeProject = this.getProjectById(projectUUID) ?: throw ProjectNotFoundException(projectUUID)

        val account = userResolverService.resolveAccount(userName, userId, userGitlabId)
            ?: throw UserNotFoundException(userId = userId, userName = userName, gitlabId = userGitlabId)

        gitlabRestClient.adminDeleteUserFromProject(
            projectId = codeProject.gitlabId, userId = account.gitlabId
                ?: throw UnknownUserException("Person is not connected to Gitlab and has no valid gitlabId")
        )

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

    @Suppress("UNCHECKED_CAST")
    private fun createConcreteProject(ownerId: UUID, gitlabProject: GitlabProject, processorType: ProcessorType? = null, id: UUID? = null): T =
        when (baseClass) {
            DataProject::class.java -> createDataProjectEntity(ownerId, gitlabProject, id) as T
            CodeProject::class.java -> createCodeProjectEntity(
                ownerId,
                gitlabProject,
                processorType ?: throw BadRequestException("No processor type was provided for new code project"),
                id
            ) as T
            else -> throw RuntimeException("You need to use concrete class")
        }

    private fun getDefaultInputTypes(): List<String> =
        when (baseClass) {
            DataProject::class.java -> listOf(DEFAULT_DATA_PROJECT_INPUT_TYPE)
            CodeProject::class.java -> listOf(DEFAULT_CODE_PROJECT_INPUT_TYPE)
            else -> throw RuntimeException("You need to use concrete class")
        }

    private fun getDefaultOutputTypes(): List<String> =
        when (baseClass) {
            DataProject::class.java -> listOf()
            CodeProject::class.java -> listOf(DEFAULT_CODE_PROJECT_OUTPUT_TYPE)
            else -> throw RuntimeException("You need to use concrete class")
        }

    private fun getProjectType(): ProjectType? {
        return when (baseClass) {
            DataProject::class.java -> DATA_PROJECT
            CodeProject::class.java -> ProjectType.CODE_PROJECT
            else -> null
        }
    }

    private fun createDataProjectEntity(ownerId: UUID, gitlabProject: GitlabProject, id: UUID? = null): DataProject =
        DataProject(
            id = id ?: randomUUID(),
            slug = gitlabProject.path,
            ownerId = ownerId,
            url = gitlabProject.webUrl,
            name = gitlabProject.name,
            description = gitlabProject.description ?: "",
            gitlabPath = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabNamespace = gitlabProject.pathWithNamespace.split("/")[0],
            gitlabId = gitlabProject.id,
            visibilityScope = gitlabProject.visibility.toVisibilityScope(),
            cover = null,
        )

    private fun createCodeProjectEntity(
        ownerId: UUID,
        gitlabProject: GitlabProject,
        processorType: ProcessorType,
        id: UUID? = null,
        modelType: String? = null,
        mlCategory: String? = null,
        inputDataTypes: MutableSet<DataType> = mutableSetOf(),
        outputDataTypes: MutableSet<DataType> = mutableSetOf(),
    ): CodeProject =
        CodeProject(
            id = id ?: randomUUID(),
            slug = gitlabProject.path,
            ownerId = ownerId,
            url = gitlabProject.webUrl,
            name = gitlabProject.name,
            description = gitlabProject.description ?: "",
            gitlabPath = gitlabProject.path,
            gitlabPathWithNamespace = gitlabProject.pathWithNamespace,
            gitlabNamespace = gitlabProject.pathWithNamespace.split("/")[0],
            gitlabId = gitlabProject.id,
            visibilityScope = gitlabProject.visibility.toVisibilityScope(),
            processorType = processorType,
            modelType = modelType,
            mlCategory = mlCategory,
            inputDataTypes = mutableSetOf(*inputDataTypes.map { it.copy() }.toTypedArray()),
            outputDataTypes = mutableSetOf(*outputDataTypes.map { it.copy() }.toTypedArray()),
            cover = null,
        )

    @Transactional
    override fun updateUserNameInProjects(oldUserName: String, newUserName: String, tokenDetails: TokenDetails) {
        userResolverService.resolveAccount(userName = oldUserName)
            ?: userResolverService.resolveAccount(userName = newUserName)
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

    override fun createProjectCover(file: MultipartFile, owner: Account?, ownerId: UUID?, project: T?, projectId: UUID?, request: HttpServletRequest?): MlreefFile {
        val account = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        val projectInDb = project
            ?: projectId?.let {
                this.getProjectById(it) ?: throw ProjectNotFoundException(it)
            } ?: throw BadRequestException("No project id provided")

        if (projectInDb.cover != null) {
            throw ConflictException("Project already has a cover")
        }

        projectInDb.cover = filesManagementService.saveFile(
            file = file,
            owner = account,
            purposeId = FilesManagementService.PROJECT_COVER_PURPOSE_ID,
            description = null,
            request = request,
        )

        repository.save(projectInDb)

        return projectInDb.cover ?: throw InternalException("Project cover was not saved")
    }

    @Transactional
    override fun updateProjectCover(file: MultipartFile, owner: Account?, ownerId: UUID?, project: T?, projectId: UUID?, request: HttpServletRequest?): MlreefFile {
        val account = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        val projectInDb = project
            ?: projectId?.let {
                this.getProjectById(it) ?: throw ProjectNotFoundException(it)
            } ?: throw BadRequestException("No project id provided")

        val coverToDelete = projectInDb.cover ?: throw NotFoundException("Project has no a cover")

        projectInDb.cover = filesManagementService.saveFile(
            file = file,
            owner = account,
            purposeId = FilesManagementService.PROJECT_COVER_PURPOSE_ID,
            description = null,
            request = request,
        )

        repository.save(projectInDb)

        filesManagementService.deleteFile(coverToDelete, owner = account)

        return projectInDb.cover ?: throw InternalException("Project cover was not saved")
    }

    @Transactional
    override fun deleteProjectCover(owner: Account?, ownerId: UUID?, project: T?, projectId: UUID?) {
        val account = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        val projectInDb = project
            ?: projectId?.let {
                this.getProjectById(it) ?: throw ProjectNotFoundException(it)
            } ?: throw BadRequestException("No project id provided")

        val coverToDelete = projectInDb.cover ?: throw NotFoundException("Project has no a cover")

        projectInDb.cover = null

        repository.save(projectInDb)

        filesManagementService.deleteFile(coverToDelete, owner = account)
    }
}
