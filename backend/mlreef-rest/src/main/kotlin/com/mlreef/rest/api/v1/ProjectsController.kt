package com.mlreef.rest.api.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.NamespaceDto
import com.mlreef.rest.api.v1.dto.ParameterDto
import com.mlreef.rest.api.v1.dto.ProcessorDto
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.ProjectShortDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.api.v1.dto.toShortDto
import com.mlreef.rest.config.DEFAULT_PAGE_SIZE
import com.mlreef.rest.config.MAX_PAGE_SIZE
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProcessorType
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.OldDataType
import com.mlreef.rest.domain.Person
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.ProjectType
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.feature.project.RecentProjectService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.util.UUID
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
            projectsPage.content.map { it.toDto() }
        } else {
            projectsPage.map { it.toDto() }
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
            projectsPage.content.map { it.toShortDto(profile.personId) }
        } else {
            projectsPage.map { it.toShortDto(profile.personId) }
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

        val projectsPage = recentProjectService.getRecentProjectsForUser(profile.personId, pageable, type)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map { it.project.toDto() }
        } else {
            projectsPage.map { it.project.toDto() }
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
        @PageableDefault(size = DEFAULT_PAGE_SIZE) pageable: Pageable,
    ): Iterable<ProjectDto> {
        val projectsPage = projectService.getAllProjectsStarredByUser(profile, pageable)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map { it.toDto() }
        } else {
            projectsPage.map { it.toDto() }
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
            projectsPage.content.map { it.toDto() }
        } else {
            projectsPage.map { it.toDto() }
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

//        val projectsPage = getAccessibleProjectsPage(profile, pageable, isDataProject, isCodeProject)

        return if (pageable.pageSize == MAX_PAGE_SIZE) {
            projectsPage.content.map { it.toDto() }
        } else {
            projectsPage.map { it.toDto() }
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
            projectsPage.content.map { it.toDto() }
        } else {
            projectsPage.map { it.toDto() }
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

        return project.toDto()
    }


    @PostMapping("/{id}/star")
    @PreAuthorize("canViewProject(#id)")
    fun starProjectById(
        @PathVariable id: UUID,
        person: Person,
        token: TokenDetails,
    ): ProjectDto {
        val project = projectService.starProject(id, person = person, userToken = token.accessToken)
        return project.toDto()
    }

    @DeleteMapping("/{id}/star")
    @PreAuthorize("canViewProject(#id)")
    fun unstarProjectById(
        @PathVariable id: UUID,
        person: Person,
        token: TokenDetails,
    ): ProjectDto {
        val project = projectService.unstarProject(id, person = person, userToken = token.accessToken)
        return project.toDto()
    }

    @PostMapping
    @PreAuthorize("canCreateProject()")
    @Suppress("UNCHECKED_CAST")
    fun <T : ProjectDto> createProject(
        @Valid @RequestBody projectCreateRequest: ProjectCreateRequest,
        request: HttpServletRequest,
        token: TokenDetails,
        person: Person,
    ): T {
        return if (request.requestURL.contains("data-project")) {
            this.createDataProject(
                dataProjectCreateRequest = projectCreateRequest,
                token = token,
                person = person
            ) as T
        } else if (request.requestURL.contains("code-project")) {
            this.createCodeProject(
                request = projectCreateRequest,
                token = token,
                person = person
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
        token: TokenDetails,
        person: Person,
    ): T =
        this.projectService.forkProject(
            userToken = token.accessToken,
            originalId = id,
            creatorId = person.id,
            name = projectForkRequest.targetName,
            path = projectForkRequest.targetPath,
            namespaceIdOrName = projectForkRequest.targetNamespace,
        ).toDto() as T

    @PostMapping("/data")
    @PreAuthorize("canCreateProject()")
    fun createDataProject(
        @Valid @RequestBody dataProjectCreateRequest: ProjectCreateRequest,
        token: TokenDetails,
        request: HttpServletRequest? = null,
        person: Person,
    ): DataProjectDto {
        if ((request?.requestURL?.contains("data-project") == true)
            || (request?.requestURL?.contains("code-project")) == true
        ) {
            throw RestException(ErrorCode.NotFound)
        }

        val dataProject = dataProjectService.createProject(
            userToken = token.accessToken,
            ownerId = person.id,
            projectSlug = dataProjectCreateRequest.slug,
            projectNamespace = dataProjectCreateRequest.namespace,
            projectName = dataProjectCreateRequest.name,
            description = dataProjectCreateRequest.description,
            initializeWithReadme = dataProjectCreateRequest.initializeWithReadme,
            visibility = dataProjectCreateRequest.visibility,
            inputDataTypes = dataProjectCreateRequest.inputDataTypes,
        )

        return dataProject.toDto()
    }

    @PostMapping("/code")
    @PreAuthorize("canCreateProject()")
    fun createCodeProject(
        @Valid @RequestBody request: ProjectCreateRequest,
        token: TokenDetails,
        person: Person,
    ): CodeProjectDto {
        if (request.inputDataTypes.isEmpty())
            throw IllegalArgumentException("A code project needs an InputDataType. request.inputDataType=${request.inputDataTypes}")
        val codeProject = codeProjectService.createProject(
            userToken = token.accessToken,
            ownerId = person.id,
            projectSlug = request.slug,
            projectName = request.name,
            projectNamespace = request.namespace,
            description = request.description,
            visibility = request.visibility,
            initializeWithReadme = request.initializeWithReadme,
            inputDataTypes = request.inputDataTypes,
            outputDataTypes = request.outputDataTypes,
            processorType = request.dataProcessorType
        )

        return codeProject.toDto()
    }

    @PutMapping("/{id}")
    @PreAuthorize("isProjectOwner(#id)")
    fun updateProject(
        @PathVariable id: UUID,
        @Valid @RequestBody projectUpdateRequest: ProjectUpdateRequest,
        token: TokenDetails,
        person: Person,
    ): ProjectDto {
        val codeProject = projectService.updateProject(
            userToken = token.accessToken,
            ownerId = person.id,
            projectUUID = id,
            projectName = projectUpdateRequest.name,
            description = projectUpdateRequest.description,
            visibility = projectUpdateRequest.visibility,
            inputDataTypes = projectUpdateRequest.inputDataTypes,
            outputDataTypes = projectUpdateRequest.outputDataTypes,
            tags = projectUpdateRequest.tags
        )

        return codeProject.toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isProjectOwner(#id)")
    fun deleteProject(
        @PathVariable id: UUID,
        token: TokenDetails,
        person: Person,
    ) {
        projectService.deleteProject(
            userToken = token.accessToken,
            ownerId = person.id,
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

    @PostMapping("code-projects/{codeProjectId}/processor")
    @PreAuthorize("isProjectOwner(#codeProjectId)")
    @Deprecated("To be deleted")
    fun createDataProcessor(
        @PathVariable codeProjectId: UUID,
        @RequestBody request: ProcessorCreateRequest,
        owner: Person
    ): ProcessorDto {
        throw BadRequestException("Use publish for that")
    }

    //-------------------- Other

    //TODO: possible need to add an unique index to database for gitlab_namespace + slug. Currently it is not present
    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("postCanViewProject()")
    fun getProjectByNamespaceAndSlug(@PathVariable namespace: String, @PathVariable slug: String): ProjectDto {
        val project = projectService.getProjectsByNamespaceAndSlug(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return project.toDto()
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
