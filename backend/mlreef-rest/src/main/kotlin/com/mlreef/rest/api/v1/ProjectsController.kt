package com.mlreef.rest.api.v1

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.Project
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.DataProcessorDto
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.data_processors.DataProcessorService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.marketplace.SearchableTag
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
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
    private val dataProcessorService: DataProcessorService
) {

    @GetMapping
    fun getAllAccessibleProjects(person: Person, profile: TokenDetails?): List<ProjectDto> {
        val idMap = profile?.projects?.keys ?: listOf()
        // TODO: provide paging sometimes
        return projectService.getAllAccessibleProjectsByIds(Pageable.unpaged(), idMap).map { it.toDto() }
    }

    @GetMapping("/starred")
    fun getAllAccessibleStarredProjects(person: Person, profile: TokenDetails?): List<ProjectDto> {
        val idMap = profile?.projects?.keys ?: listOf()
        return projectService.getAllAccessibleStarredProjectsByIds(person.id, Pageable.unpaged(), idMap).map { it.toDto() }
    }

    @GetMapping("/own")
    fun getOwnProjects(person: Person): List<ProjectDto> {
        return projectService.getOwnProjectsOfUser(person.id).map { it.toDto() }
    }

    @GetMapping("/my")
    fun getMyProjects(person: Person, profile: TokenDetails?): List<ProjectDto> {
        val idMap = profile?.projects?.keys ?: listOf()
        return projectService.getProjectsSharedWithUser(person.id, idMap).map { it.toDto() }
    }

    @GetMapping("/public")
    fun getPublicProjectsPaged(pageable: Pageable): Page<ProjectDto> {
        val list = projectService.getAllPublicProjects(pageable).map { it.toDto() }
        return PageImpl(list, pageable, list.size.toLong())
    }

    @GetMapping("/public/all")
    fun getPublicProjectsUnpaged(): List<ProjectDto> {
        val allPublicProjects = projectService.getAllPublicProjects()
        return allPublicProjects.map { it.toDto() }
    }

    @GetMapping("/{id}")
    @PreAuthorize("canViewProject(#id)")
    fun getProjectById(@PathVariable id: UUID): ProjectDto {
        val project = projectService.getProjectById(id) ?: throw ProjectNotFoundException(projectId = id)
        return project.toDto()
    }

    @Deprecated("currently not used")
    @GetMapping("/namespace/{namespace}")
    @PostFilter("postCanViewProject()")
    fun getProjectsByNamespace(@PathVariable namespace: String): List<ProjectDto> {
        val projects = projectService.getProjectsByNamespace(namespace)
        return projects.map { it.toDto() }
    }

    @GetMapping("/slug/{slug}")
    @PostFilter("postCanViewProject()")
    fun getProjectBySlug(@PathVariable slug: String): List<ProjectDto> {
        val projects = projectService.getProjectsBySlug(slug)
        return projects.map { it.toDto() }
    }

    @PostMapping("/{id}/star")
    @PreAuthorize("canViewProject(#id)")
    fun starProjectById(
        @PathVariable id: UUID,
        person: Person,
        token: TokenDetails
    ): ProjectDto {
        val project = projectService.starProject(id, person = person, userToken = token.accessToken)
        return project.toDto()
    }

    @DeleteMapping("/{id}/star")
    @PreAuthorize("canViewProject(#id)")
    fun unstarProjectById(
        @PathVariable id: UUID,
        person: Person,
        token: TokenDetails
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
        person: Person): T {

        if (request.requestURL.contains("data-project")) {
            return this.createDataProject(projectCreateRequest, token, null, person) as T
        } else if (request.requestURL.contains("code-project")) {
            return this.createCodeProject(projectCreateRequest, token, null, person) as T
        } else {
            throw BadParametersException("You should request either /data or /code endpoints")
        }
    }

    @PostMapping("/data")
    @PreAuthorize("canCreateProject()")
    fun createDataProject(@Valid @RequestBody dataProjectCreateRequest: ProjectCreateRequest,
                          token: TokenDetails,
                          request: HttpServletRequest?,
                          person: Person): DataProjectDto {

        if ((request?.requestURL?.contains("data-project") == true)
            || (request?.requestURL?.contains("code-project")) == true) {
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
            inputDataTypes = dataProjectCreateRequest.inputDataTypes
        )

        return dataProject.toDto()
    }

    @PostMapping("/code")
    @PreAuthorize("canCreateProject()")
    fun createCodeProject(@Valid @RequestBody codeProjectCreateRequest: ProjectCreateRequest,
                          token: TokenDetails,
                          request: HttpServletRequest?,
                          person: Person): CodeProjectDto {

        if ((request?.requestURL?.contains("data-project") == true)
            || (request?.requestURL?.contains("code-project")) == true) {
            throw RestException(ErrorCode.NotFound)
        }

        val codeProject = codeProjectService.createProject(
            userToken = token.accessToken,
            ownerId = person.id,
            projectSlug = codeProjectCreateRequest.slug,
            projectName = codeProjectCreateRequest.name,
            projectNamespace = codeProjectCreateRequest.namespace,
            description = codeProjectCreateRequest.description,
            visibility = codeProjectCreateRequest.visibility,
            initializeWithReadme = codeProjectCreateRequest.initializeWithReadme,
            inputDataTypes = codeProjectCreateRequest.inputDataTypes
        )
        return codeProject.toDto()
    }

    @PutMapping("/{id}")
    @PreAuthorize("isProjectOwner(#id)")
    fun updateProject(@PathVariable id: UUID,
                      @Valid @RequestBody projectUpdateRequest: ProjectUpdateRequest,
                      token: TokenDetails,
                      person: Person): ProjectDto {
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
    fun deleteCodeProject(@PathVariable id: UUID,
                          token: TokenDetails,
                          person: Person) {
        projectService.deleteProject(
            userToken = token.accessToken,
            ownerId = person.id,
            projectUUID = id)
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("canViewProject(#id)")
    fun getUsersInDataProjectById(@PathVariable id: UUID): List<UserInProjectDto> {
        val usersInProject = projectService.getUsersInProject(id)
        return usersInProject.map { it.toDto() }
    }

    // FIXME: Something is strange here: 405 Method not allowed..
    @PostMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUsersToDataProjectById(
        @PathVariable id: UUID,
        @RequestBody(required = false) body: ProjectUserMembershipRequest? = null,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) userGitlabId: Long?,
        @RequestParam(value = "level", required = false) level: String?,
        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?): List<UserInProjectDto> {

        val accessLevelStr = body?.level ?: level
        val accessLevel = if (accessLevelStr != null) AccessLevel.parse(accessLevelStr) else null
        val currentUserId = body?.userId ?: userId
        val currentUserGitlabId = body?.gitlabId ?: userGitlabId
        val currentExpiration = body?.expiresAt ?: expiresAt

        projectService.addUserToProject(
            projectUUID = id,
            userId = currentUserId,
            userGitlabId = currentUserGitlabId,
            accessLevel = accessLevel,
            accessTill = currentExpiration
        )

        return getUsersInDataProjectById(id)
    }

    @PostMapping("/{id}/groups")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addGroupsToDataProjectById(
        @PathVariable id: UUID,
        @RequestBody(required = false) body: ProjectGroupMembershipRequest? = null,
        @RequestParam(value = "group_id", required = false) groupId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
        @RequestParam(value = "level", required = false) level: String?,
        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?): List<UserInProjectDto> {

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

    @Deprecated("Tips for API Design: DECIDE and be consistent ")
    @DeleteMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun deleteUsersFromDataProjectById(
            @PathVariable id: UUID,
            @RequestParam(value = "user_id", required = false) userId: UUID?,
            @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): List<UserInProjectDto> {
        projectService.deleteUserFromProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
        return getUsersInDataProjectById(id)
    }

    @Deprecated("Tips for API Design: DECIDE and be consistent ")
    @DeleteMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER') || isUserItself(#userId)")
    fun deleteUserFromDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
        projectService.deleteUserFromProject(id, userId)
        return getUsersInDataProjectById(id)
    }

    @DeleteMapping("/{id}/groups")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun deleteGroupFromDataProjectById(
        @PathVariable id: UUID,
        @RequestParam(value = "group_id", required = false) groupId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): List<UserInProjectDto> {
        projectService.deleteGroupFromProject(projectUUID = id, groupId = groupId, groupGitlabId = gitlabId)
        return getUsersInDataProjectById(id)
    }

//    ------------------------------------------------------------------------------------------------------------------

    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("postCanViewProject()")
    fun getProjectsByNamespaceAndSlugInPath(@PathVariable namespace: String, @PathVariable slug: String): ProjectDto {
        val project = projectService.getProjectsByNamespaceAndPath(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return project.toDto()
    }

    @Deprecated("maybe unused, frontend unclear")
    @GetMapping("/{namespace}/{slug}/processor")
    @PreAuthorize("canViewProject(#namespace, #slug)")
    fun getDataProcessorByNamespaceAndSlug(@PathVariable namespace: String,
                                           @PathVariable slug: String): DataProcessorDto {
        val projectId = getProjectIdByNamespaceAndSlug(namespace, slug)

        val dataProcessor = dataProcessorService.getProcessorByProjectId(projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "processor not found: $namespace/$slug")

        return dataProcessor.toDto()
    }

    private fun getProjectIdByNamespaceAndSlug(namespace: String, slug: String): UUID {
        return projectService.getProjectsByNamespaceAndPath(namespace, slug)?.id
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
    }
}

class ProjectCreateRequest(
    @NotEmpty val slug: String,
    @NotEmpty val namespace: String,
    @NotEmpty val name: String,
    @NotEmpty val description: String,
    @NotEmpty val initializeWithReadme: Boolean,
    val inputDataTypes: List<DataType> = listOf(),
    val visibility: VisibilityScope = VisibilityScope.PUBLIC
)

class ProjectUpdateRequest(
    @NotEmpty val name: String,
    @NotEmpty val description: String,
    val visibility: VisibilityScope? = null,
    val inputDataTypes: List<DataType>? = null,
    val outputDataTypes: List<DataType>? = null,
    val tags: List<SearchableTag>? = null
)

class ProjectUserMembershipRequest(
    val userId: UUID? = null,
    val gitlabId: Long? = null,
    val level: String? = null,
    val expiresAt: Instant? = null
)

class ProjectGroupMembershipRequest(
    val groupId: UUID? = null,
    val gitlabId: Long? = null,
    val level: String? = null,
    val expiresAt: Instant? = null
)
