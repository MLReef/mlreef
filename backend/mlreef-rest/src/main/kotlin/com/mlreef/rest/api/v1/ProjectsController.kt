package com.mlreef.rest.api.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.api.v1.dto.*
import com.mlreef.rest.config.DEFAULT_PAGE_SIZE
import com.mlreef.rest.config.MAX_PAGE_SIZE
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.*
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.exceptions.*
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.DEFAULT_BRANCH
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.feature.processors.RepositoryService
import com.mlreef.rest.feature.project.ExternalDrivesService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.feature.project.RecentProjectService
import com.mlreef.rest.feature.system.FilesManagementService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.time.Instant
import java.util.*
import javax.servlet.http.HttpServletRequest
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping(value = ["/api/v1/projects", "/api/v1/data-projects", "/api/v1/code-projects"])
class ProjectsController(
    private val projectService: ProjectService<Project>,
    private val dataProjectService: ProjectService<DataProject>,
    private val codeProjectService: ProjectService<CodeProject>,
    private val processorsService: ProcessorsService,
    private val projectResolverService: ProjectResolverService,
    private val marketplaceService: MarketplaceService,
    private val recentProjectService: RecentProjectService,
    private val filesManagementService: FilesManagementService,
    private val repositoryService: RepositoryService,
    private val externalDrivesService: ExternalDrivesService,
) {
    @GetMapping
    fun getAllAccessibleProjects(
        profile: TokenDetails,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
        request: HttpServletRequest,
    ): Iterable<ProjectDto> {
        val isDataProjectRequest = request.requestURI.contains("data-projects")
        val isCodeProjectRequest = request.requestURI.contains("code-projects")

        val projectsPage = getAccessibleProjectsPage(profile, pageable, isDataProjectRequest, isCodeProjectRequest)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        } else {
            projectsPage.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        }
    }

    @GetMapping("/short")
    fun getAllAccessibleProjectsShort(
        profile: TokenDetails,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
        request: HttpServletRequest,
    ): Iterable<ProjectShortDto> {
        val isDataProjectRequest = request.requestURI.contains("data-projects")
        val isCodeProjectRequest = request.requestURI.contains("code-projects")

        val projectsPage = getAccessibleProjectsPage(profile, pageable, isDataProjectRequest, isCodeProjectRequest)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map { it.toShortDto(profile.accountId, filesManagementService.getDownloadLinkForFile(it.cover, request = request)) }
        } else {
            projectsPage.map { it.toShortDto(profile.accountId, filesManagementService.getDownloadLinkForFile(it.cover, request = request)) }
        }
    }

    @GetMapping("/recent")
    fun getRecentProjects(
        profile: TokenDetails,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
        request: HttpServletRequest,
    ): Iterable<ProjectDto> {
        val isDataProjectRequest = request.requestURI.contains("data-projects")
        val isCodeProjectRequest = request.requestURI.contains("code-projects")

        val type = if (isDataProjectRequest) {
            ProjectType.DATA_PROJECT
        } else if (isCodeProjectRequest) {
            ProjectType.CODE_PROJECT
        } else null

        val projectsPage = recentProjectService.getRecentProjectsForUser(profile.accountId, pageable, type)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map {
                it.project.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it.project, accountId = profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.project.cover, request = request),
                )
            }
        } else {
            projectsPage.map {
                it.project.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it.project, accountId = profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.project.cover, request = request),
                )
            }
        }
    }

    private fun getAccessibleProjectsPage(profile: TokenDetails, pageable: Pageable, isDataProject: Boolean, isCodeProject: Boolean): Page<out Project> {
        val filter = SearchRequest(
            projectType = if (isDataProject) ProjectType.DATA_PROJECT else if (isCodeProject) ProjectType.CODE_PROJECT else null
        )

        return marketplaceService.searchProjects(filter, pageable, profile)
    }

    @GetMapping("/starred")
    fun getAllAccessibleStarredProjects(
        profile: TokenDetails,
        request: HttpServletRequest,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
    ): Iterable<ProjectDto> {
        val projectsPage = projectService.getAllProjectsStarredByUser(profile, pageable)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        } else {
            projectsPage.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        }
    }

    @GetMapping("/own")
    fun getOwnProjects(
        profile: TokenDetails,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
        request: HttpServletRequest,
    ): Iterable<ProjectDto> {
        val isDataProject = request.requestURI.contains("data-projects")
        val isCodeProject = request.requestURI.contains("code-projects")

        val filter = SearchRequest(
            own = true,
            projectType = if (isDataProject) ProjectType.DATA_PROJECT else if (isCodeProject) ProjectType.CODE_PROJECT else null
        )

        val projectsPage = marketplaceService.searchProjects(filter, pageable, profile)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        } else {
            projectsPage.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        }
    }

    @GetMapping("/my")
    fun getMyProjects(
        profile: TokenDetails,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
        request: HttpServletRequest,
    ): Iterable<ProjectDto> {
        val isDataProject = request.requestURI.contains("data-projects")
        val isCodeProject = request.requestURI.contains("code-projects")

        val filter = SearchRequest(
            own = true,
            participate = true,
            projectType = if (isDataProject) ProjectType.DATA_PROJECT else if (isCodeProject) ProjectType.CODE_PROJECT else null
        )

        val projectsPage = marketplaceService.searchProjects(filter, pageable, profile)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        } else {
            projectsPage.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        }
    }

    @GetMapping("/public")
    fun getPublicProjectsPaged(
        profile: TokenDetails,
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
        request: HttpServletRequest,
    ): Iterable<ProjectDto> {
        val isDataProject = request.requestURI.contains("data-projects")
        val isCodeProject = request.requestURI.contains("code-projects")

        val filter = SearchRequest(
            visibility = VisibilityScope.PUBLIC,
            projectType = if (isDataProject) ProjectType.DATA_PROJECT else if (isCodeProject) ProjectType.CODE_PROJECT else null
        )

        val projectsPage = marketplaceService.searchProjects(filter, pageable, profile)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        } else {
            projectsPage.map {
                it.toDto(
                    forkedByUser = projectService.isProjectForkedByUser(it, profile.accountId),
                    coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
                )
            }
        }
    }

    @Deprecated("To be deleted, /public endpoints is doing the same")
    @GetMapping("/public/all")
    fun getPublicProjectsUnpaged(): List<ProjectDto> {
        throw RestException(ErrorCode.AccessDenied, "Use /public endpoint to request public projects")
    }

    @GetMapping("/namespaces")
    fun getNamespaces(token: TokenDetails): List<NamespaceDto> {
        return projectService.getNamespaces(token.accessToken).map {
            NamespaceDto(
                it.id,
                it.name,
                it.fullPath,
                it.path,
            )
        }
    }

    @GetMapping("/{id}")
    @PostAuthorize("postCanViewProject()")
    fun getProjectById(
        @PathVariable id: String,
        request: HttpServletRequest,
        token: TokenDetails,
    ): ProjectDto {
        val uuid = id.tryToUUID()
        val gitlabId = if (uuid == null) id.toLongOrNull() else null
        val projectName = if (uuid == null && gitlabId == null) id else null

        val project = when {
            uuid != null -> projectService.getProjectById(uuid)
            gitlabId != null -> projectService.getProjectByGitlabId(gitlabId)
            projectName != null -> projectService.getProjectByName(id)
                ?: if (!token.isVisitor) projectService.getProjectsByNamespaceAndSlug(token.username, id) else null
            else -> throw BadRequestException("No id $id was provided")
        } ?: throw ProjectNotFoundException(projectId = uuid, projectName = projectName, gitlabId = gitlabId)

        return project.let {
            it.toDto(
                forkedByUser = projectService.isProjectForkedByUser(it, token.accountId),
                coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
            )
        }
    }


    @PostMapping("/{id}/star")
    @PreAuthorize("canViewProject(#id)")
    fun starProjectById(
        @PathVariable id: UUID,
        request: HttpServletRequest,
        account: Account,
        token: TokenDetails,
    ): ProjectDto {
        val project = projectService.starProject(id, account = account, userToken = token.accessToken)
        return project.toDto(
            forkedByUser = projectService.isProjectForkedByUser(project, token.accountId),
            coverUrl = filesManagementService.getDownloadLinkForFile(project.cover, request = request),
        )
    }

    @DeleteMapping("/{id}/star")
    @PreAuthorize("canViewProject(#id)")
    fun unstarProjectById(
        @PathVariable id: UUID,
        request: HttpServletRequest,
        account: Account,
        token: TokenDetails,
    ): ProjectDto {
        val project = projectService.unstarProject(id, account = account, userToken = token.accessToken)
        return project.toDto(
            forkedByUser = projectService.isProjectForkedByUser(project, token.accountId),
            coverUrl = filesManagementService.getDownloadLinkForFile(project.cover, request = request),
        )
    }

    @PostMapping
    @PreAuthorize("canCreateProject()")
    @Suppress("UNCHECKED_CAST")
    fun <T : ProjectDto> createProject(
        @Valid @RequestBody projectCreateRequest: ProjectCreateRequest,
        request: HttpServletRequest,
        token: TokenDetails,
    ): T {
        return if (request.requestURL.contains("data-project")) {
            this.createDataProject(
                dataProjectCreateRequest = projectCreateRequest,
                token = token,
                request = request,
            ) as T
        } else if (request.requestURL.contains("code-project")) {
            this.createCodeProject(
                createRequest = projectCreateRequest,
                token = token,
                request = request,
            ) as T
        } else {
            throw BadParametersException("You should request either /data or /code endpoints")
        }
    }

    @PostMapping("/fork/{id}")
    @PreAuthorize("canCreateProject()")
    @Suppress("UNCHECKED_CAST")
    fun <T : ProjectDto> forkProject(
        @PathVariable id: UUID,
        @Valid @RequestBody projectForkRequest: ProjectForkRequest,
        request: HttpServletRequest,
        token: TokenDetails,
        account: Account,
    ): T {
        val forkedProject = this.projectService.forkProject(
            userToken = token.accessToken,
            originalId = id,
            creator = account,
            name = projectForkRequest.targetName,
            path = projectForkRequest.targetPath,
            namespaceIdOrName = projectForkRequest.targetNamespace,
        )

        return forkedProject.toDto(
            forkedByUser = projectService.isProjectForkedByUser(forkedProject, token.accountId),
            coverUrl = filesManagementService.getDownloadLinkForFile(forkedProject.cover, request = request),
        ) as T
    }

    @PostMapping("/data")
    @PreAuthorize("canCreateProject()")
    fun createDataProject(
        @Valid @RequestBody dataProjectCreateRequest: ProjectCreateRequest,
        token: TokenDetails,
        request: HttpServletRequest? = null,
    ): DataProjectDto {
//        if ((request?.requestURL?.contains("data-project") == true)
//            || (request?.requestURL?.contains("code-project")) == true
//        ) {
//            throw RestException(ErrorCode.NotFound)
//        }

        val dataProject = dataProjectService.createProject(
            userToken = token.accessToken,
            ownerId = token.accountId,
            projectSlug = dataProjectCreateRequest.slug,
            projectNamespace = dataProjectCreateRequest.namespace,
            projectName = dataProjectCreateRequest.name,
            description = dataProjectCreateRequest.description,
            initializeWithReadme = dataProjectCreateRequest.initializeWithReadme,
            visibility = dataProjectCreateRequest.visibility,
            inputDataTypes = dataProjectCreateRequest.inputDataTypes,
        )

        return dataProject.let {
            it.toDto(
                forkedByUser = projectService.isProjectForkedByUser(dataProject, token.accountId),
                coverUrl = filesManagementService.getDownloadLinkForFile(it.cover, request = request),
            )
        }
    }

    @PostMapping("/code")
    @PreAuthorize("canCreateProject()")
    fun createCodeProject(
        @Valid @RequestBody createRequest: ProjectCreateRequest,
        request: HttpServletRequest,
        token: TokenDetails,
    ): CodeProjectDto {
        if (createRequest.inputDataTypes.isEmpty())
            throw IllegalArgumentException("A code project needs an InputDataType. request.inputDataType=${createRequest.inputDataTypes}")

        val codeProject = codeProjectService.createProject(
            userToken = token.accessToken,
            ownerId = token.accountId,
            projectSlug = createRequest.slug,
            projectName = createRequest.name,
            projectNamespace = createRequest.namespace,
            description = createRequest.description,
            visibility = createRequest.visibility,
            initializeWithReadme = createRequest.initializeWithReadme,
            inputDataTypes = createRequest.inputDataTypes,
            outputDataTypes = createRequest.outputDataTypes,
            processorType = createRequest.dataProcessorType
        )

        return codeProject.toDto(
            forkedByUser = projectService.isProjectForkedByUser(codeProject, token.accountId),
            coverUrl = filesManagementService.getDownloadLinkForFile(codeProject.cover, request = request),
        )
    }

    @PutMapping("/{id}")
    @PreAuthorize("isProjectOwner(#id)")
    fun updateProject(
        @PathVariable id: UUID,
        @Valid @RequestBody projectUpdateRequest: ProjectUpdateRequest,
        request: HttpServletRequest,
        token: TokenDetails,
    ): ProjectDto {
        val project = projectService.updateProject(
            userToken = token.accessToken,
            ownerId = token.accountId,
            projectUUID = id,
            projectName = projectUpdateRequest.name,
            description = projectUpdateRequest.description,
            visibility = projectUpdateRequest.visibility,
            inputDataTypes = projectUpdateRequest.inputDataTypes,
            outputDataTypes = projectUpdateRequest.outputDataTypes,
            tags = projectUpdateRequest.tags
        )

        return project.toDto(
            forkedByUser = projectService.isProjectForkedByUser(project, token.accountId),
            coverUrl = filesManagementService.getDownloadLinkForFile(project.cover, request = request),
        )
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isProjectOwner(#id)")
    fun deleteProject(
        @PathVariable id: UUID,
        token: TokenDetails,
    ) {
        projectService.deleteProject(
            userToken = token.accessToken,
            ownerId = token.accountId,
            projectUUID = id
        )
    }

    //-------------- Users in project
    @GetMapping("/{id}/users")
    @PreAuthorize("canViewProject(#id)")
    fun getUsersInDataProjectById(
        @PathVariable id: UUID,
    ): List<UserInProjectDto> {
        val usersInProject = projectService.getUsersInProject(id)
        return usersInProject.map { it.toDto() }
    }

    @PostMapping("/{projectId}/users/{userPathId}")
    @PreAuthorize("hasAccessToProject(#projectId, 'MAINTAINER')")
    fun addUsersToProjectById(
        @PathVariable projectId: UUID,
        @PathVariable(required = false) userPathId: String?,
        @RequestParam(value = "level", required = false) level: String?,
        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?,
    ): List<UserInProjectDto> {
        val userId = userPathId.tryToUUID()
        val userGitlabId = if (userId == null) userPathId?.toLongOrNull() else null
        val username = if (userId == null && userGitlabId == null) userPathId else null

        userId ?: userGitlabId ?: username ?: throw BadRequestException("No user identification to add is defined")

        projectService.addUserToProject(
            projectUUID = projectId,
            userId = userId,
            userGitlabId = userGitlabId,
            userName = username,
            accessLevel = level?.let { AccessLevel.parse(it) },
            accessTill = expiresAt
        )

        return getUsersInDataProjectById(projectId)
    }

    @PostMapping("/{projectId}/users")
    @PreAuthorize("hasAccessToProject(#projectId, 'MAINTAINER')")
    fun addUsersToProjectByParamsOrBody(
        @PathVariable projectId: UUID,
        @RequestBody(required = false) body: ProjectUserMembershipRequest? = null,
        @RequestParam(value = "user_id", required = false) userParamId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) userParamGitlabId: Long?,
        @RequestParam(value = "username", required = false) userParamName: String?,
        @RequestParam(value = "level", required = false) level: String?,
        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?,
    ): List<UserInProjectDto> {
        val userId = body?.userId ?: userParamId
        val userGitlabId = if (userId == null) body?.gitlabId ?: userParamGitlabId else null
        val username = if (userId == null && userGitlabId == null) body?.username ?: userParamName else null

        userId ?: userGitlabId ?: username ?: throw BadRequestException("No user identification to add is defined")

        val accessLevel = (body?.level ?: level)?.let { AccessLevel.parse(it) }
        val currentExpiration = body?.expiresAt ?: expiresAt

        projectService.addUserToProject(
            projectUUID = projectId,
            userId = userId,
            userGitlabId = userGitlabId,
            userName = username,
            accessLevel = accessLevel,
            accessTill = currentExpiration
        )

        return getUsersInDataProjectById(projectId)
    }

    @PostMapping("/{id}/groups")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addGroupsToDataProjectById(
        @PathVariable id: UUID,
        @RequestBody(required = false) body: ProjectGroupMembershipRequest? = null,
        @RequestParam(value = "group_id", required = false) groupId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
        @RequestParam(value = "level", required = false) level: String?,
        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?,
    ): List<UserInProjectDto> {

        val accessLevelStr = body?.level ?: level
        val accessLevel = if (accessLevelStr != null) AccessLevel.parse(accessLevelStr) else null
        val currentGroupId = body?.groupId ?: groupId
        val currentGitlabId = body?.gitlabId ?: gitlabId
        val currentExpiration = body?.expiresAt ?: expiresAt

        projectService.addGroupToProject(
            projectUUID = id,
            groupId = currentGroupId,
            groupGitlabId = currentGitlabId,
            accessLevel = accessLevel,
            accessTill = currentExpiration
        )

        return getUsersInDataProjectById(id)
    }

    @DeleteMapping("/{projectId}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#projectId, 'MAINTAINER') || isUserItself(#userId)")
    fun deleteUsersFromDataProjectById(
        @PathVariable projectId: UUID,
        @PathVariable userId: String,
    ): List<UserInProjectDto> {
        val finalUserId = userId.tryToUUID()
        val finalUserGitlabId = if (finalUserId == null) userId.toLongOrNull() else null
        val username = if (finalUserId == null && finalUserGitlabId == null) userId else null

        projectService.deleteUserFromProject(
            projectUUID = projectId,
            userId = finalUserId,
            userName = username,
            userGitlabId = finalUserGitlabId
        )

        return getUsersInDataProjectById(projectId)
    }

    @DeleteMapping("/{projectId}/users")
    @PreAuthorize("hasAccessToProject(#projectId, 'MAINTAINER') || isUserItself(#userId, #userName, #userGitlabId)")
    fun deleteUsersFromDataProjectByParams(
        @PathVariable projectId: UUID,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) userGitlabId: Long?,
        @RequestParam(value = "username", required = false) userName: String?,
        token: TokenDetails,
    ): List<UserInProjectDto> {
        userId ?: userGitlabId ?: userName ?: throw BadRequestException("No user identification to delete is defined")

        projectService.deleteUserFromProject(
            projectUUID = projectId,
            userId = userId,
            userName = userName,
            userGitlabId = userGitlabId
        )

        return getUsersInDataProjectById(projectId)
    }

    @DeleteMapping("/{id}/groups")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun deleteGroupFromDataProjectById(
        @PathVariable id: UUID,
        @RequestParam(value = "group_id", required = false) groupId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
    ): List<UserInProjectDto> {
        projectService.deleteGroupFromProject(projectUUID = id, groupId = groupId, groupGitlabId = gitlabId)
        return getUsersInDataProjectById(id)
    }

    //-------------------- Processors

    @RequestMapping(value = ["/{codeProjectId}/data-processor", "/{codeProjectId}/processor", "/{codeProjectId}/processors"], method = [RequestMethod.GET])
    @GetMapping("")
    @PreAuthorize("canViewProject(#codeProjectId)")
    fun getByCodeProjects(
        @PathVariable codeProjectId: UUID,
        @PageableDefault(size = MAX_PAGE_SIZE) pageable: Pageable,
        profile: TokenDetails? = null,
    ): Page<ProcessorDto> {
        return processorsService.searchProcessor(
            SearchProcessorRequest(
                projectIdsOr = listOf(codeProjectId)
            ),
            pageable,
            profile
        ).map { it.toDto() }
    }

    //-------------------- Other

    //TODO: possible need to add an unique index to database for gitlab_namespace + slug. Currently it is not present
    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("postCanViewProject()")
    fun getProjectByNamespaceAndSlug(
        @PathVariable namespace: String,
        @PathVariable slug: String,
        request: HttpServletRequest,
        token: TokenDetails,
    ): ProjectDto {
        val project = projectService.getProjectsByNamespaceAndSlug(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return project.toDto(
            forkedByUser = projectService.isProjectForkedByUser(project, token.accountId),
            coverUrl = filesManagementService.getDownloadLinkForFile(project.cover, request = request),
        )
    }

    @Deprecated("maybe unused, frontend unclear")
    @GetMapping("/{namespace}/{slug}/processor")
    @PreAuthorize("canViewProject(#namespace, #slug)")
    fun getProcessorsByNamespaceAndSlug(
        @PathVariable namespace: String,
        @PathVariable slug: String,
        @PageableDefault(size = MAX_PAGE_SIZE) pageable: Pageable,
        token: TokenDetails,
    ): Page<ProcessorDto> {
        val project = projectResolverService.resolveCodeProject(namespace = namespace, slug = slug)
            ?: throw NotFoundException("Project was not found for $namespace/$slug")

        val dataProcessors = processorsService.searchProcessor(
            SearchProcessorRequest(
                projectIdsOr = listOf(project.id)
            ),
            pageable,
            token,
        )

        return dataProcessors.map { it.toDto() }
    }

    // Git Repository

    @RequestMapping(value = ["/{projectId}/commit/{action}"], method = [RequestMethod.POST])
    @PreAuthorize("hasAccessToProject(#projectId, 'MAINTAINER')")
    fun commitFiles(
        @PathVariable projectId: String,
        @PathVariable action: String,
        @RequestParam("files", required = false) files: Array<MultipartFile>?,
        @RequestParam("names", required = false) fileNames: List<String>?,
        @RequestParam("name", required = false) fileName: String?,
        @RequestParam("path", required = false) path: String?,
        @RequestParam("new_path", required = false) newPath: String?,
        @RequestParam("new_name", required = false) newName: String?,
        @RequestParam("message", required = false) commitMessage: String?,
        @RequestParam("branch", required = true) branch: String,
        token: TokenDetails,
    ): CommitDto {
        val finalProjectId = projectId.tryToUUID()
        val finalProjectGitlabId = if (finalProjectId == null) projectId.toLongOrNull() else null

        val project = projectResolverService.resolveProject(finalProjectId, finalProjectGitlabId)
            ?: throw NotFoundException("Project $projectId not found")

        val finalAction = CommitOperations.values().find { it.name.equals(action.trim(), true) }
            ?: throw BadRequestException("Action $action is not allowed")

        val finalFiles = files?.takeIf { it.isNotEmpty() }?.toList()
            ?: fileNames?.map { DummyMultipartFile(it) }
            ?: fileName?.let { listOf(DummyMultipartFile(it)) }
            ?: throw BadRequestException("Either files ('files' parameter with multipart content) or file names ('names' parameter) must be provided")

        return repositoryService.commitFilesToGitlab(
            project,
            token.accessToken,
            token.accountId,
            branch,
            finalAction,
            finalFiles,
            commitMessage,
            path,
            newPath,
            newName,
            fileName ?: fileNames?.firstOrNull(),
        ).toCommitDto()
    }

    // Files list
    @RequestMapping(value = ["/{projectId}/content"], method = [RequestMethod.GET])
    @PreAuthorize("canViewProject(#projectId)")
    fun getProjectContent(
        @PathVariable projectId: String,
        @RequestParam("path", required = false) path: String?,
        @RequestParam("branch", required = false) branch: String?,
        @RequestParam("alias", required = false) alias: String?,
        token: TokenDetails,
    ): List<RepositoryTreeDto> {
        val finalProjectId = projectId.tryToUUID()
        val finalProjectGitlabId = if (finalProjectId == null) projectId.toLongOrNull() else null

        val project = projectResolverService.resolveProject(finalProjectId, finalProjectGitlabId)
            ?: throw NotFoundException("Project $projectId not found")

        val elements = repositoryService.getElementsListInRepository(project.gitlabId, branch ?: DEFAULT_BRANCH, path) +
                externalDrivesService.getElementsListInExternalDrive(project, path, 0)

        return elements.map { it.toDto() }
    }


//----------------------------------------------------------------------------------------------------------------------

    @GetMapping("/{id}/users/check/myself")
    fun checkCurrentUserInProject(@PathVariable id: UUID, account: Account): Boolean {
        return projectService.checkUserInProject(projectUUID = id, userId = account.id)
    }

    @GetMapping("/{id}/users/check/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER') || isUserItself(#userId)")
    fun checkUserInDataProjectById(
        @PathVariable id: UUID,
        @PathVariable userId: UUID,
        @RequestParam(required = false) level: String?,
        @RequestParam(required = false, name = "min_level") minLevel: String?,
    ): Boolean {
        val checkLevel = if (level != null) AccessLevel.parse(level) else null
        val checkMinLevel = if (minLevel != null) AccessLevel.parse(minLevel) else null
        return projectService.checkUserInProject(projectUUID = id, userId = userId, level = checkLevel, minlevel = checkMinLevel)
    }

    @GetMapping("/{id}/users/check")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun checkUsersInDataProjectById(
        @PathVariable id: UUID,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
    ): Boolean {
        return projectService.checkUserInProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
    }

    private fun getProjectIdByNamespaceAndSlug(namespace: String, slug: String): UUID {
        return projectService.getProjectsByNamespaceAndPath(namespace, slug)?.id
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
    }

    //----------------------------------------------------------------------------------------------------------------

    @PostMapping("/{id}/cover/create")
    @PreAuthorize("isProjectOwner(#id)")
    fun createProjectCoverPictureFile(
        @PathVariable id: UUID,
        @RequestParam("file") file: MultipartFile,
        request: HttpServletRequest,
        token: TokenDetails,
    ): MlreefFileDto {
        return projectService.createProjectCover(
            file,
            ownerId = token.accountId,
            projectId = id,
            request = request,
        ).toDto()
    }

    @PostMapping("/{id}/cover/update")
    @PreAuthorize("isProjectOwner(#id)")
    fun updateProjectCoverPictureFile(
        @PathVariable id: UUID,
        @RequestParam("file") file: MultipartFile,
        request: HttpServletRequest,
        token: TokenDetails,
    ): MlreefFileDto {
        return projectService.updateProjectCover(
            file,
            ownerId = token.accountId,
            projectId = id,
            request = request,
        ).toDto()
    }

    @DeleteMapping("/{id}/cover/delete")
    @PreAuthorize("isProjectOwner(#id)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteProjectCoverPictureFile(
        @PathVariable id: UUID,
        token: TokenDetails,
    ) {
        projectService.deleteProjectCover(
            ownerId = token.accountId,
            projectId = id,
        )
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
class ProjectCreateRequest(
    val id: UUID? = null,
    @NotEmpty val slug: String,
    @NotEmpty val namespace: String,
    @NotEmpty val name: String,
    @NotEmpty val description: String,
    @NotEmpty val initializeWithReadme: Boolean,
    val inputDataTypes: List<String> = listOf(),
    val outputDataTypes: List<String>? = null,
    val visibility: VisibilityScope = VisibilityScope.PUBLIC,
    val dataProcessorType: String? = null,
    val tags: List<SearchableTag>? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
class ProjectForkRequest(
    val targetNamespaceGitlabId: Long? = null,
    val targetName: String? = null,
    val targetPath: String? = null,
    val targetNamespace: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
class ProjectUpdateRequest(
    val id: UUID? = null,
    @NotEmpty val name: String,
    @NotEmpty val description: String,
    val visibility: VisibilityScope? = null,
    val inputDataTypes: List<String>? = null,
    val outputDataTypes: List<String>? = null,
    val tags: List<SearchableTag>? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
class ProjectUserMembershipRequest(
    val userId: UUID? = null,
    val gitlabId: Long? = null,
    val username: String? = null,
    val level: String? = null,
    val expiresAt: Instant? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
class ProjectGroupMembershipRequest(
    val groupId: UUID? = null,
    val gitlabId: Long? = null,
    val level: String? = null,
    val expiresAt: Instant? = null,
)

// DEPRECATED

@Deprecated("Don't use. To be deleted. Processor must not be created directly")
class ProcessorCreateRequest(
    val slug: String? = null,
    val name: String,
    val branch: String,
    val version: String? = null,
    val description: String? = null,
    val mainScriptPath: String? = null,
)

@Deprecated("Don't use. To be deleted. Processor must not be created directly")
class DataProcessorCreateRequest(
    @NotEmpty val slug: String,
    @NotEmpty val name: String,
    @NotEmpty val inputDataType: OldDataType,
    @NotEmpty val outputDataType: OldDataType,
    @NotEmpty val type: DataProcessorType,
    @NotEmpty val visibilityScope: VisibilityScope,
    val description: String = "",
    @Valid val parameters: List<ParameterDto> = arrayListOf()
)

@Deprecated("Don't use. To be deleted. Processor must not be updated directly")
class DataProcessorUpdateRequest(
    @NotEmpty val name: String
)

internal class DummyMultipartFile(private val fileName: String) : MultipartFile {
    override fun getInputStream() = TODO("Incorrect usage")
    override fun getName() = fileName
    override fun getOriginalFilename() = fileName
    override fun getContentType() = null
    override fun isEmpty() = true
    override fun getSize() = 0L
    override fun getBytes() = null
    override fun transferTo(dest: File) = TODO("Incorrect usage")
}


