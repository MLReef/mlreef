package com.mlreef.rest.api.v1

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.DataProject
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.MLProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.project.DataProjectService
import org.springframework.data.domain.Page
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
import java.util.logging.Logger
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects")
class DataProjectsController(
    val dataProjectService: DataProjectService
) {
    private val log: Logger = Logger.getLogger(DataProjectsController::class.simpleName)

    @GetMapping
    fun getAllDataProjects(person: Person): List<DataProjectDto> {
        return dataProjectService.getAllProjectsForUser(person.id).map(DataProject::toDto)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/public")
    fun getPublicDataProjects(pageable: Pageable): Page<MLProjectDto> {
        return dataProjectService.getAllPublicProjects(pageable).map { it.toDto() }
    }

    @GetMapping("/{id}")
    @PreAuthorize("userInProject(#id) || projectIsPublic(#id)")
    fun getDataProjectById(@PathVariable id: UUID): DataProjectDto {
        val dataProject = dataProjectService.getProjectById(id) ?: throw ProjectNotFoundException(projectId = id)
        return dataProject.toDto()
    }

    @GetMapping("/namespace/{namespace}")
    @PostFilter("userInProject() || projectIsPublic()")
    fun getCodeProjectsByNamespace(@PathVariable namespace: String): List<DataProjectDto> {
        val dataProjects = dataProjectService.getProjectsByNamespace(namespace)
        return dataProjects.map(DataProject::toDto)
    }

    @GetMapping("/slug/{slug}")
    @PostFilter("userInProject() || projectIsPublic()")
    fun getCodeProjectBySlug(@PathVariable slug: String): List<DataProjectDto> {
        val dataProjects = dataProjectService.getProjectsBySlug(slug)
        return dataProjects.map(DataProject::toDto)
    }

    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("userInProject() || projectIsPublic()")
    fun getCodeProjectsByNamespaceAndSlugInPath(@PathVariable namespace: String, @PathVariable slug: String): DataProjectDto {
        val dataProject = dataProjectService.getProjectsByNamespaceAndSlug(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return dataProject.toDto()
    }

    @PostMapping
    @PreAuthorize("canCreateProject()")
    fun createDataProject(@Valid @RequestBody dataProjectCreateRequest: DataProjectCreateRequest,
                          token: TokenDetails,
                          person: Person): DataProjectDto {
        val dataProject = dataProjectService.createProject(
            userToken = token.permanentToken,
            ownerId = person.id,
            projectSlug = dataProjectCreateRequest.slug,
            projectNamespace = dataProjectCreateRequest.namespace,
            projectName = dataProjectCreateRequest.name,
            description = dataProjectCreateRequest.description,
            initializeWithReadme = dataProjectCreateRequest.initializeWithReadme,
            visibility = dataProjectCreateRequest.visibility
        )

        return dataProject.toDto()
    }

    @PutMapping("/{id}")
    @PreAuthorize("isProjectOwner(#id)")
    fun updateDataProject(@PathVariable id: UUID,
                          @Valid @RequestBody dataProjectUpdateRequest: DataProjectUpdateRequest,
                          token: TokenDetails,
                          person: Person): DataProjectDto {
        val dataProject = dataProjectService.updateProject(
            userToken = token.permanentToken,
            ownerId = person.id,
            projectUUID = id,
            projectName = dataProjectUpdateRequest.name,
            description = dataProjectUpdateRequest.description)

        return dataProject.toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isProjectOwner(#id)")
    fun deleteDataProject(@PathVariable id: UUID,
                          token: TokenDetails,
                          person: Person) {
        dataProjectService.deleteProject(
            userToken = token.permanentToken,
            ownerId = person.id,
            projectUUID = id)
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun getUsersInDataProjectById(@PathVariable id: UUID): List<UserInProjectDto> {
        val usersInProject = dataProjectService.getUsersInProject(id)
        return usersInProject.map { it.toDto() }
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/{id}/users/check/myself")
    fun checkCurrentUserInCodeProject(@PathVariable id: UUID, account: Account): Boolean {
        return dataProjectService.checkUserInProject(projectUUID = id, userId = account.id)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/{id}/users/check/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER') || isUserItself(#userId)")
    fun checkUserInDataProjectById(@PathVariable id: UUID,
                                   @PathVariable userId: UUID,
                                   @RequestParam(required = false) level: String?,
                                   @RequestParam(required = false, name = "min_level") minLevel: String?): Boolean {
        val checkLevel = if (level!=null) AccessLevel.parse(level) else null
        val checkMinLevel = if (minLevel!=null) AccessLevel.parse(minLevel) else null
        return dataProjectService.checkUserInProject(projectUUID = id, userId = userId, level = checkLevel, minlevel = checkMinLevel)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/{id}/users/check")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun checkUsersInDataProjectById(
        @PathVariable id: UUID,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): Boolean {
        return dataProjectService.checkUserInProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
    }

    @PostMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUsersToDataProjectById(
        @PathVariable id: UUID,
        @RequestBody(required = false) body: DataProjectUserMembershipRequest? = null,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
        @RequestParam(value = "level", required = false) level: String?,
        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?): List<UserInProjectDto> {

        val accessLevelStr = body?.level ?: level
        val accessLevel = if (accessLevelStr!=null) AccessLevel.parse(accessLevelStr) else null
        val currentUserId = body?.userId ?: userId
        val currentGitlabId = body?.gitlabId ?: gitlabId
        val currentExpiration = body?.expiresAt ?: expiresAt

        dataProjectService.addUserToProject(
            projectUUID = id,
            userId = currentUserId,
            userGitlabId = currentGitlabId,
            accessLevel = accessLevel,
            accessTill = currentExpiration
        )

        return getUsersInDataProjectById(id)
    }

    @PostMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUserToDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
        dataProjectService.addUserToProject(id, userId)
        return getUsersInDataProjectById(id)
    }

    @DeleteMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun deleteUsersFromDataProjectById(
        @PathVariable id: UUID,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): List<UserInProjectDto> {
        dataProjectService.deleteUserFromProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
        return getUsersInDataProjectById(id)
    }

    @DeleteMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER') || isUserItself(#userId)")
    fun deleteUserFromDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
        dataProjectService.deleteUserFromProject(id, userId)
        return getUsersInDataProjectById(id)
    }
}

class DataProjectCreateRequest(
    @NotEmpty val slug: String,
    @NotEmpty val namespace: String,
    @NotEmpty val name: String,
    @NotEmpty val description: String,
    @NotEmpty val initializeWithReadme: Boolean,
    val visibility: VisibilityScope = VisibilityScope.PUBLIC
)

class DataProjectUpdateRequest(
    @NotEmpty val name: String,
    @NotEmpty val description: String
)

class DataProjectUserMembershipRequest(
    val userId: UUID? = null,
    val gitlabId: Long? = null,
    val level: String? = null,
    val expiresAt: Instant? = null
)

