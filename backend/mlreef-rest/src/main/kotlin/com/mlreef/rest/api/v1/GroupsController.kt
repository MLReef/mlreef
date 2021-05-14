package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.GroupDto
import com.mlreef.rest.api.v1.dto.GroupOfUserDto
import com.mlreef.rest.api.v1.dto.UserInGroupDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.Person
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.helpers.GroupOfUser
import com.mlreef.rest.domain.helpers.UserInGroup
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.groups.GroupsService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
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
import java.util.UUID
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/groups")
class GroupsController(
    val groupsService: GroupsService
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    @GetMapping("/my")
    fun getAllUsersGroups(person: Person, token: TokenDetails): List<GroupOfUserDto> {
        return groupsService.getUserGroupsList(token.accessToken, person.id).map(GroupOfUser::toDto)
    }

    @PreAuthorize("canCreateGroup()")
    @GetMapping("/check-availability", produces = [MediaType.TEXT_PLAIN_VALUE])
    fun checkAvailability(
        @RequestParam(required = true) name: String = "",
        token: TokenDetails,
        person: Person
    ): String {
        return groupsService.checkAvailability(
            userToken = token.accessToken,
            creatingPersonId = person.id,
            groupName = name,
        )
    }

    @PostMapping
    @PreAuthorize("canCreateGroup()")
    fun createGroup(@Valid @RequestBody groupCreateRequest: GroupCreateRequest, token: TokenDetails): GroupDto {

        val group = groupsService.createGroup(
            ownerToken = token.accessToken,
            groupName = groupCreateRequest.name,
            path = groupCreateRequest.path,
            visibility = groupCreateRequest.visibility)

        return GroupDto(group.id, group.name, group.gitlabId)
    }

    // FIXME: Coverage says: missing tests
    @PutMapping("/{id}")
    @PreAuthorize("hasAccessToGroup(#id, 'MAINTAINER')")
    fun updateGroup(@PathVariable id: UUID, @Valid @RequestBody groupUpdateRequest: GroupUpdateRequest): GroupDto {
        val dataProject = groupsService.updateGroup(
            id,
            groupUpdateRequest.name,
            groupUpdateRequest.path)

        return dataProject.toDto()
    }

    // FIXME: Coverage says: missing tests
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isGroupOwner(#id)")
    fun deleteGroup(@PathVariable id: UUID) {
        groupsService.deleteGroup(id)
    }

    // FIXME: Coverage says: missing tests
    @GetMapping("/{groupId}/users")
    @PreAuthorize("hasAccessToGroup(#groupId, 'DEVELOPER')")
    fun getUsersInGroupById(@PathVariable groupId: UUID): List<UserInGroupDto> {
        return groupsService.getUsersInGroup(groupId).map(UserInGroup::toDto)
    }

    // FIXME: Coverage says: missing tests
    @PostMapping("/{groupId}/users/{userId}")
    @PreAuthorize("hasAccessToGroup(#groupId, 'MAINTAINER')")
    fun addUserToGroupById(@PathVariable groupId: UUID, @PathVariable userId: UUID, @RequestParam(value = "access_level", required = false) accessLevel: String?): List<UserInGroupDto> {
        val level = if (accessLevel == null) null else AccessLevel.valueOf(accessLevel.toUpperCase())
        groupsService.addUserToGroup(groupId, userId, level)
        return getUsersInGroupById(groupId)
    }

    // FIXME: Coverage says: missing tests
    @PutMapping("/{groupId}/users/{userId}")
    @PreAuthorize("hasAccessToGroup(#groupId, 'MAINTAINER')")
    fun editUserInGroupById(@PathVariable groupId: UUID, @PathVariable userId: UUID, @RequestParam(value = "access_level", required = true) accessLevel: String): List<UserInGroupDto> {
        val level = AccessLevel.valueOf(accessLevel.toUpperCase())
        groupsService.editUserInGroup(groupId, userId, level)
        return getUsersInGroupById(groupId)
    }

    // FIXME: Coverage says: missing tests
    @DeleteMapping("/{groupId}/users/{userId}")
    @PreAuthorize("hasAccessToGroup(#groupId, 'MAINTAINER') || isUserItself(#userId)")
    fun deleteUserFromGroupById(@PathVariable groupId: UUID, @PathVariable userId: UUID): List<UserInGroupDto> {
        groupsService.deleteUserFromGroup(groupId, userId)
        return getUsersInGroupById(groupId)
    }
}


class GroupCreateRequest(
    @NotEmpty val path: String,
    @Deprecated("unused?")
    @NotEmpty val namespace: String,
    @NotEmpty val name: String,
    val visibility: VisibilityScope = VisibilityScope.PRIVATE,
)

class GroupUpdateRequest(
    val name: String?,
    val path: String?
)