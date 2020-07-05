package com.mlreef.rest.api.v1

import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.ProjectNotFoundException
import com.mlreef.rest.feature.project.GenericProjectService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.logging.Logger

@RestController
@RequestMapping("/api/v1/projects")
class GenericProjectsController(
    private val projectService: GenericProjectService
) {
    private val log: Logger = Logger.getLogger(GenericProjectsController::class.simpleName)

    @GetMapping
    fun getAllProjects(person: Person): List<ProjectDto> {
        return projectService.getAllProjectsForUser(person.id).map { it.toDto() }
    }

    @GetMapping("/public")
    fun getPublicProjects(pageable: Pageable): Page<ProjectDto> {
        val list = projectService.getAllPublicProjects(pageable).map { it.toDto() }
        return PageImpl(list, pageable, list.size.toLong())
    }

    @GetMapping("/{id}")
    @PreAuthorize("canViewProject(#id)")
    fun getProjectById(@PathVariable id: UUID): ProjectDto {
        val project = projectService.getProjectById(id) ?: throw ProjectNotFoundException(projectId = id)
        return project.toDto()
    }

    @GetMapping("/namespace/{namespace}")
    @PostFilter("canViewProject()")
    fun getProjectsByNamespace(@PathVariable namespace: String): List<ProjectDto> {
        val projects = projectService.getProjectsByNamespace(namespace)
        return projects.map { it.toDto() }
    }

    @GetMapping("/slug/{slug}")
    @PostFilter("canViewProject()")
    fun getProjectBySlug(@PathVariable slug: String): List<ProjectDto> {
        val dataProjects = projectService.getProjectsBySlug(slug)
        return dataProjects.map { it.toDto() }
    }

    @GetMapping("/{namespace}/{slug}")
    @PostAuthorize("canViewProject()")
    fun getProjectsByNamespaceAndSlugInPath(@PathVariable namespace: String, @PathVariable slug: String): ProjectDto {
        val dataProject = projectService.getProjectsByNamespaceAndPath(namespace, slug)
            ?: throw ProjectNotFoundException(path = "$namespace/$slug")
        return dataProject.toDto()
    }

//    // FIXME: Coverage says: missing tests
//    @GetMapping("/{id}/users/check/myself")
//    fun checkCurrentUserInCodeProject(@PathVariable id: UUID, account: Account): Boolean {
//        return projectService.checkUserInProject(projectUUID = id, userId = account.id)
//    }
//
//    // FIXME: Coverage says: missing tests
//    @GetMapping("/{id}/users/check/{userId}")
//    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER') || isUserItself(#userId)")
//    fun checkUserInDataProjectById(@PathVariable id: UUID,
//                                   @PathVariable userId: UUID,
//                                   @RequestParam(required = false) level: String?,
//                                   @RequestParam(required = false, name = "min_level") minLevel: String?): Boolean {
//        val checkLevel = if (level != null) AccessLevel.parse(level) else null
//        val checkMinLevel = if (minLevel != null) AccessLevel.parse(minLevel) else null
//        return projectService.checkUserInProject(projectUUID = id, userId = userId, level = checkLevel, minlevel = checkMinLevel)
//    }
//
//    // FIXME: Coverage says: missing tests
//    @GetMapping("/{id}/users/check")
//    @PreAuthorize("hasAccessToProject(#id, 'DEVELOPER')")
//    fun checkUsersInDataProjectById(
//        @PathVariable id: UUID,
//        @RequestParam(value = "user_id", required = false) userId: UUID?,
//        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): Boolean {
//        return projectService.checkUserInProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
//    }
//
//    @PostMapping("/{id}/users")
//    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
//    fun addUsersToDataProjectById(
//        @PathVariable id: UUID,
//        @RequestBody(required = false) body: DataProjectUserMembershipRequest? = null,
//        @RequestParam(value = "user_id", required = false) userId: UUID?,
//        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
//        @RequestParam(value = "level", required = false) level: String?,
//        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?): List<UserInProjectDto> {
//
//        val accessLevelStr = body?.level ?: level
//        val accessLevel = if (accessLevelStr != null) AccessLevel.parse(accessLevelStr) else null
//        val currentUserId = body?.userId ?: userId
//        val currentGitlabId = body?.gitlabId ?: gitlabId
//        val currentExpiration = body?.expiresAt ?: expiresAt
//
//        projectService.addUserToProject(
//            projectUUID = id,
//            userId = currentUserId,
//            userGitlabId = currentGitlabId,
//            accessLevel = accessLevel,
//            accessTill = currentExpiration
//        )
//
//        return getUsersInDataProjectById(id)
//    }
//
//    @PostMapping("/{id}/groups")
//    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
//    fun addGroupsToDataProjectById(
//        @PathVariable id: UUID,
//        @RequestBody(required = false) body: DataProjectGroupMembershipRequest? = null,
//        @RequestParam(value = "group_id", required = false) groupId: UUID?,
//        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?,
//        @RequestParam(value = "level", required = false) level: String?,
//        @RequestParam(value = "expires_at", required = false) expiresAt: Instant?): List<UserInProjectDto> {
//
//        val accessLevelStr = body?.level ?: level
//        val accessLevel = if (accessLevelStr != null) AccessLevel.parse(accessLevelStr) else null
//        val currentGroupId = body?.groupId ?: groupId
//        val currentGitlabId = body?.gitlabId ?: gitlabId
//        val currentExpiration = body?.expiresAt ?: expiresAt
//
//        projectService.addGroupToProject(
//            projectUUID = id,
//            groupId = currentGroupId,
//            groupGitlabId = currentGitlabId,
//            accessLevel = accessLevel,
//            accessTill = currentExpiration
//        )
//
//        return getUsersInDataProjectById(id)
//    }
//
//    @PostMapping("/{id}/users/{userId}")
//    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
//    fun addUserToDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
//        projectService.addUserToProject(id, userId)
//        return getUsersInDataProjectById(id)
//    }
//
//    @DeleteMapping("/{id}/users")
//    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
//    fun deleteUsersFromDataProjectById(
//        @PathVariable id: UUID,
//        @RequestParam(value = "user_id", required = false) userId: UUID?,
//        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): List<UserInProjectDto> {
//        projectService.deleteUserFromProject(projectUUID = id, userId = userId, userGitlabId = gitlabId)
//        return getUsersInDataProjectById(id)
//    }
//
//    @DeleteMapping("/{id}/users/{userId}")
//    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER') || isUserItself(#userId)")
//    fun deleteUserFromDataProjectById(@PathVariable id: UUID, @PathVariable userId: UUID): List<UserInProjectDto> {
//        projectService.deleteUserFromProject(id, userId)
//        return getUsersInDataProjectById(id)
//    }
//
//    @DeleteMapping("/{id}/groups")
//    @PreAuthorize("hasAccessToProject(#id, 'MAINTAINER')")
//    fun deleteGroupFromDataProjectById(
//        @PathVariable id: UUID,
//        @RequestParam(value = "group_id", required = false) groupId: UUID?,
//        @RequestParam(value = "gitlab_id", required = false) gitlabId: Long?): List<UserInProjectDto> {
//        projectService.deleteGroupFromProject(projectUUID = id, groupId = groupId, groupGitlabId = gitlabId)
//        return getUsersInDataProjectById(id)
//    }
}
