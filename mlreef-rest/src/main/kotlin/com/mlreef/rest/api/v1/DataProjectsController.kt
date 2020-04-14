package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.GroupOfUserDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.api.v1.dto.toDomain
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.helpers.GroupOfUser
import com.mlreef.rest.feature.project.DataProjectService
import org.springframework.http.HttpStatus
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
@RequestMapping("/api/v1/data-projects")
class DataProjectsController(
    val dataProjectRepository: DataProjectRepository,
    val dataProjectService: DataProjectService,
    val currentUserService: CurrentUserService
) {
    private val log: Logger = Logger.getLogger(DataProjectsController::class.simpleName)

    fun assertFindExisting(projectUUID: UUID) =
        dataProjectRepository.findOneByOwnerIdAndId(currentUserService.person().id, projectUUID)
            ?: throw NotFoundException("Data project not found")

    @GetMapping
    fun getAllDataProjects(): List<DataProjectDto> {
        val userId = currentUserService.person().id
        val findAllByOwnerId = dataProjectRepository.findAllByOwnerId(userId)
        return findAllByOwnerId.map(DataProject::toDto)
    }

    @GetMapping("/{id}")
    @PreAuthorize("isCurrentUserInProject(#id)")
    fun getDataProjectById(@PathVariable id: UUID): DataProjectDto {
        val dataProject = assertFindExisting(id)
        return dataProject.toDto()
    }

    @PostMapping
    @PreAuthorize("canCreateProject()")
    fun createDataProject(@Valid @RequestBody dataProjectCreateRequest: DataProjectCreateRequest): DataProjectDto {
        val userToken = currentUserService.permanentToken()
        val ownerId = currentUserService.person().id
        val dataProject = dataProjectService.createProject(
            userToken = userToken,
            ownerId = ownerId,
            projectSlug = dataProjectCreateRequest.slug,
            projectNamespace = dataProjectCreateRequest.namespace,
            projectName = dataProjectCreateRequest.name)

        return dataProject.toDto()
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun updateDataProject(@PathVariable id: UUID, @Valid @RequestBody dataProjectUpdateRequest: DataProjectUpdateRequest): DataProjectDto {
        val userToken = currentUserService.permanentToken()
        val ownerId = currentUserService.person().id
        assertFindExisting(id)
        val dataProject = dataProjectService.updateProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id,
            projectName = dataProjectUpdateRequest.name)

        return dataProject.toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isProjectOwner(#id)")
    fun deleteDataProject(@PathVariable id: UUID) {
        val userToken = currentUserService.permanentToken()
        val ownerId = currentUserService.person().id
        dataProjectService.deleteProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id)
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun getUsersInDataProjectById(@PathVariable id: UUID): List<UserInProjectDto> {
        val usersInProject = dataProjectService.getUsersInProject(id)
        return usersInProject.map { UserInProjectDto(it.id, it.username, it.email, it.gitlabId) }
    }

    @GetMapping("/{id}/users/check/{userId}")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER') || isUserItself(#userId)")
    fun checkUserInDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): Boolean {
        val requesterId = currentUserService.person().id
        return dataProjectService.checkUserInProject(requesterId, id)
    }

    @PostMapping("/{id}/users/check")
    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
    fun checkUsersInDataProjectById(@PathVariable id: UUID, @RequestBody request: UsersProjectRequest): Map<String?, Boolean> {
        return dataProjectService
            .checkUsersInProject(id, request.users.map(UserInProjectDto::toDomain))
            .map { Pair(it.key.userName ?: it.key.email ?: it.key.gitlabId.toString(), it.value) }
            .toMap()
    }

    @PostMapping("/{id}/users")
    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
    fun addUsersToDataProjectById(@PathVariable id: UUID, @RequestBody request: UsersProjectRequest): List<UserInProjectDto> {
        dataProjectService.addUsersToProject(id, request.users.map(UserInProjectDto::toDomain))
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
    fun deleteUsersFromDataProjectById(@PathVariable id: UUID, @RequestBody request: UsersProjectRequest): List<UserInProjectDto> {
        val usersInProject = dataProjectService.deleteUsersFromProject(id, request.users.map(UserInProjectDto::toDomain))
        return usersInProject.map { UserInProjectDto(it.id, it.username, it.email, it.gitlabId) }
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
    @NotEmpty val name: String
)

class DataProjectUpdateRequest(
    @NotEmpty val name: String
)

class UsersProjectRequest(
    @NotEmpty val users: List<UserInProjectDto>
)

