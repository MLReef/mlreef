package com.mlreef.rest.api.v1

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabBadRequestException
import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.exceptions.ProjectCreationException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.project.CodeProjectService
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
@RequestMapping("/api/v1/code-projects")
class CodeProjectsController(
    val codeProjectService: CodeProjectService
) {
    private val log: Logger = Logger.getLogger(CodeProjectsController::class.simpleName)

    @GetMapping
    fun getAllCodeProjects(person: Person): List<CodeProjectDto> {
        return codeProjectService.getAllProjectsForUser(person.id).map(CodeProject::toDto)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/public")
    fun getPublicDataProjects(pageable: Pageable): Page<ProjectDto> {
        return codeProjectService.getAllPublicProjects(pageable).map { it.toDto() }
    }

    @GetMapping("/{id}")
    @PreAuthorize("userInProject(#id) || projectIsPublic(#id)")
    fun getCodeProjectById(@PathVariable id: UUID): CodeProjectDto {
        val codeProject = codeProjectService.getProjectById(id) ?: throw ProjectNotFoundException(projectId = id)
        return codeProject.toDto()
    }

    @GetMapping("/namespace/{namespace}")
    @PostFilter("userInProject() || projectIsPublic()")
    fun getCodeProjectsByNamespace(@PathVariable namespace: String): List<CodeProjectDto> {
        val codeProjects = codeProjectService.getProjectsByNamespace(namespace)
        return codeProjects.map(CodeProject::toDto)
    }

    @GetMapping("/slug/{slug}")
    @PostFilter("userInProject() || projectIsPublic()")
    fun getCodeProjectBySlug(@PathVariable slug: String): List<CodeProjectDto> {
        val codeProjects = codeProjectService.getProjectsBySlug(slug)
        return codeProjects.map(CodeProject::toDto)
    }

    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("userInProject() || projectIsPublic()")
    fun getCodeProjectsByNamespaceAndSlugInPath(@PathVariable namespace: String, @PathVariable slug: String): CodeProjectDto {
        val codeProjects = codeProjectService.getProjectsByNamespaceAndSlug(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return codeProjects.toDto()
    }

    @PostMapping
    @PreAuthorize("canCreateProject()")
    fun createCodeProject(@Valid @RequestBody codeProjectCreateRequest: CodeProjectCreateRequest,
                          token: TokenDetails,
                          person: Person): CodeProjectDto {
        val projectSlug = codeProjectCreateRequest.slug
        try {
            val codeProject = codeProjectService.createProject(
                userToken = token.permanentToken,
                ownerId = person.id,
                projectSlug = projectSlug,
                projectNamespace = codeProjectCreateRequest.namespace,
                projectName = codeProjectCreateRequest.name,
                description = codeProjectCreateRequest.description,
                initializeWithReadme = codeProjectCreateRequest.initializeWithReadme,
                visibility = codeProjectCreateRequest.visibility
            )
            return codeProject.toDto()
        } catch (e: GitlabConflictException) {
            throw e
        } catch (e: GitlabBadRequestException) {
            throw ProjectCreationException(ErrorCode.GitlabProjectCreationFailed, "Cannot create Project $projectSlug: ${e.message}")
        } catch (e: Exception) {
            throw ProjectCreationException(ErrorCode.GitlabProjectCreationFailed, "Cannot create Project $projectSlug: ${e.message}")
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("isProjectOwner(#id)")
    fun updateCodeProject(@PathVariable id: UUID,
                          @Valid @RequestBody projectUpdateRequest: CodeProjectUpdateRequest,
                          token: TokenDetails,
                          person: Person): CodeProjectDto {
        val codeProject = codeProjectService.updateProject(
            userToken = token.permanentToken,
            ownerId = person.id,
            projectUUID = id,
            projectName = projectUpdateRequest.name,
            description = projectUpdateRequest.description)

        return codeProject.toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isProjectOwner(#id)")
    fun deleteCodeProject(@PathVariable id: UUID,
                          token: TokenDetails,
                          person: Person) {
        codeProjectService.deleteProject(
            userToken = token.permanentToken,
            ownerId = person.id,
            projectUUID = id)
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun getUsersInCodeProjectById(@PathVariable id: UUID): List<UserInProjectDto> {
        val usersInProject = codeProjectService.getUsersInProject(id)
        return usersInProject.map { it.toDto() }
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/{id}/users/check/myself")
    fun checkCurrentUserInCodeProject(@PathVariable id: UUID, account: Account): Boolean {
        return codeProjectService.checkUserInProject(projectUUID = id, userId = account.id)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/{id}/users/check/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER') || isUserItself(#userId)")
    fun checkUserInCodeProjectById(@PathVariable id: UUID,
                                   @PathVariable userId: UUID,
                                   @RequestParam(required = false) level: String?,
                                   @RequestParam(required = false, name = "min_level") minLevel: String?): Boolean {
        val checkLevel = if (level!=null) AccessLevel.parse(level) else null
        val checkMinLevel = if (minLevel!=null) AccessLevel.parse(minLevel) else null
        return codeProjectService.checkUserInProject(projectUUID = id, userId = userId, level = checkLevel, minlevel = checkMinLevel)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/{id}/users/check")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun checkUsersInCodeProjectById(
        @PathVariable id: UUID,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): Boolean {
        return codeProjectService.checkUserInProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
    }

    @PostMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUsersToCodeProjectById(
        @PathVariable id: UUID,
        @RequestBody(required = false) body: CodeProjectUserMembershipRequest? = null,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
        @RequestParam(value = "level", required = false) level: String?,
        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?): List<UserInProjectDto> {

        val accessLevelStr = body?.level ?: level
        val accessLevel = if (accessLevelStr!=null) AccessLevel.parse(accessLevelStr) else null
        val currentUserId = body?.userId ?: userId
        val currentGitlabId = body?.gitlabId ?: gitlabId
        val currentExpiration = body?.expiresAt ?: expiresAt

        codeProjectService.addUserToProject(
            projectUUID = id,
            userId = currentUserId,
            userGitlabId = currentGitlabId,
            accessLevel = accessLevel,
            accessTill = currentExpiration
        )

        return getUsersInCodeProjectById(id)
    }

    @PostMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUserToCodeProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
        codeProjectService.addUserToProject(id, userId)
        return getUsersInCodeProjectById(id)
    }

    @DeleteMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun deleteUsersFromDataProjectById(
        @PathVariable id: UUID,
        @RequestParam(value = "user_id", required = false) userId: UUID?,
        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): List<UserInProjectDto> {
        codeProjectService.deleteUserFromProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
        return getUsersInCodeProjectById(id)
    }

    @DeleteMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER') || isUserItself(#userId)")
    fun deleteUserFromCodeProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
        codeProjectService.deleteUserFromProject(id, userId)
        return getUsersInCodeProjectById(id)
    }
}

class CodeProjectCreateRequest(
    @NotEmpty val slug: String,
    @NotEmpty val namespace: String,
    @NotEmpty val name: String,
    @NotEmpty val description: String,
    @NotEmpty val initializeWithReadme: Boolean,
    val visibility: VisibilityScope = VisibilityScope.PUBLIC
)

class CodeProjectUpdateRequest(
    @NotEmpty val name: String,
    @NotEmpty val description: String
)

class CodeProjectUserMembershipRequest(
    val userId: UUID? = null,
    val gitlabId: Long? = null,
    val level: String? = null,
    val expiresAt: Instant? = null
)

