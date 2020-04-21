package com.mlreef.rest.api.v1

import com.mlreef.rest.CodeProject
import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.api.v1.dto.toDomain
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabBadRequestException
import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.exceptions.ProjectCreationException
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.project.CodeProjectService
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
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
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

    @GetMapping("/{id}")
    @PreAuthorize("isCurrentUserInProject(#id)")
    fun getCodeProjectById(@PathVariable id: UUID): CodeProjectDto {
        val codeProject = codeProjectService.getProjectById(id) ?: throw ProjectNotFoundException(projectId = id)
        return codeProject.toDto()
    }

    @GetMapping("/namespace/{namespace}")
    @PostFilter("filterProjectByUserInProject()")
    fun getCodeProjectsByNamespace(@PathVariable namespace: String): List<CodeProjectDto> {
        val codeProjects = codeProjectService.getProjectsByNamespace(namespace)
        return codeProjects.map(CodeProject::toDto)
    }

    @GetMapping("/slug/{slug}")
    @PostFilter("filterProjectByUserInProject()")
    fun getCodeProjectBySlug(@PathVariable slug: String): List<CodeProjectDto> {
        val codeProjects = codeProjectService.getProjectsBySlug(slug) ?: throw ProjectNotFoundException(path = slug)
        return codeProjects.map(CodeProject::toDto)
    }

    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("isCurrentUserInResultProject()")
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
                projectName = codeProjectCreateRequest.name)
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
                          @Valid @RequestBody codeProjectCreateRequest: CodeProjectUpdateRequest,
                          token: TokenDetails,
                          person: Person): CodeProjectDto {
        val codeProject = codeProjectService.updateProject(
            userToken = token.permanentToken,
            ownerId = person.id,
            projectUUID = id,
            projectName = codeProjectCreateRequest.name)

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
    fun getUsersInDataProjectById(@PathVariable id: UUID): List<UserInProjectDto> {
        val usersInProject = codeProjectService.getUsersInProject(id)
        return usersInProject.map { UserInProjectDto(it.id, it.username, it.email, it.gitlabId) }
    }

    @GetMapping("/{id}/users/check/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER') || isUserItself(#userId)")
    fun checkUserInDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID, person: Person): Boolean {
        return codeProjectService.checkUserInProject(person.id, id)
    }

    @PostMapping("/{id}/users/check")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun checkUsersInDataProjectById(@PathVariable id: UUID, @RequestBody request: UsersProjectRequest): Map<String?, Boolean> {
        return codeProjectService
            .checkUsersInProject(id, request.users.map(UserInProjectDto::toDomain))
            .map { Pair(it.key.userName ?: it.key.email ?: it.key.gitlabId.toString(), it.value) }
            .toMap()
    }

    @PostMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUsersToDataProjectById(@PathVariable id: UUID, @RequestBody request: UsersProjectRequest): List<UserInProjectDto> {
        codeProjectService.addUsersToProject(id, request.users.map(UserInProjectDto::toDomain))
        return getUsersInDataProjectById(id)
    }

    @PostMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUserToDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
        codeProjectService.addUserToProject(id, userId)
        return getUsersInDataProjectById(id)
    }

    @DeleteMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun deleteUsersFromDataProjectById(@PathVariable id: UUID, @RequestBody request: UsersProjectRequest): List<UserInProjectDto> {
        val usersInProject = codeProjectService.deleteUsersFromProject(id, request.users.map(UserInProjectDto::toDomain))
        return usersInProject.map { UserInProjectDto(it.id, it.username, it.email, it.gitlabId) }
    }

    @DeleteMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER') || isUserItself(#userId)")
    fun deleteUserFromDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
        codeProjectService.deleteUserFromProject(id, userId)
        return getUsersInDataProjectById(id)
    }
}

class CodeProjectCreateRequest(
    @NotEmpty val slug: String,
    @NotEmpty val namespace: String,
    @NotEmpty val name: String
)

class CodeProjectUpdateRequest(
    @NotEmpty val name: String
)
