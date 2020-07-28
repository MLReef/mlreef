package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.api.v1.GroupCreateRequest
import com.mlreef.rest.api.v1.GroupUpdateRequest
import com.mlreef.rest.api.v1.dto.GroupDto
import com.mlreef.rest.api.v1.dto.GroupOfUserDto
import com.mlreef.rest.api.v1.dto.UserInGroupDto
import com.mlreef.rest.external_api.gitlab.dto.GitlabGroup
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserInGroup
import com.mlreef.rest.feature.system.SessionsService
import io.mockk.every
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class GroupsApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/groups"

    private lateinit var account2: Account

    @Autowired
    private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var sessionService: SessionsService

    @Autowired
    private lateinit var groupsRepository: GroupRepository

    @BeforeEach
    fun setUp() {
        accountSubjectPreparationTrait.apply()

        account = accountSubjectPreparationTrait.account
        account2 = accountSubjectPreparationTrait.account2

        sessionService.killAllSessions("username0000")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get all current user Groups`() {
        val group1 = Group(id = randomUUID(), slug = "slug", name = "group-name-1", gitlabId = 101L)
        val group2 = Group(id = randomUUID(), slug = "slug", name = "group-name-2", gitlabId = 102L)
        val group3 = Group(id = randomUUID(), slug = "slug", name = "group-name-3", gitlabId = 103L)
        groupsRepository.save(group1)
        groupsRepository.save(group2)
        groupsRepository.save(group3)

        val gitlabGroup1 = GitlabGroup(101L,"url","group-name-1","path-1")
        val gitlabGroup2 = GitlabGroup(102L,"url","group-name-1","path-1")
        val gitlabGroup3 = GitlabGroup(103L,"url","group-name-1","path-1")

        val gitlabUserInGroup = GitlabUserInGroup(1L, "url", "test-user", "username")

        every { restClient.userGetUserGroups(any()) } answers {
            listOf(gitlabGroup1, gitlabGroup2, gitlabGroup3)
        }

        every { restClient.adminGetGroupMembers(any()) } answers {
            listOf(gitlabUserInGroup)
        }

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(
            group1.id to AccessLevel.OWNER,
            group2.id to AccessLevel.OWNER,
            group3.id to AccessLevel.OWNER)
        )

        val url = "$rootUrl/my"

        val result = this.performGet(url, token)
            .expectOk()
            .document("user-groups-list",
                responseFields(groupsOfUserResponseFields("[].")))
            .returnsList(GroupOfUserDto::class.java)

        assertThat(result.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create Group`() {
        this.mockUserAuthentication()

        val request = GroupCreateRequest("path", "namespace", "name")

        val result = this.performPost(rootUrl, token, body = request)
            .expectOk()
            .document("group-create",
                PayloadDocumentation.requestFields(groupCreateRequestFields()),
                PayloadDocumentation.responseFields(groupResponseFields()))
            .returns(GroupDto::class.java)

        Assertions.assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update Group`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        val request = GroupUpdateRequest("new-name", "newpath")

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val url = "$rootUrl/${group.id}"

        val result = this.performPut(url, token, body = request)
            .expectOk()
            .document("group-update",
                PayloadDocumentation.requestFields(groupUpdateRequestFields()),
                PayloadDocumentation.responseFields(groupResponseFields()))
            .returns(GroupDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete Group`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val url = "$rootUrl/${group.id}"

        this.performDelete(url, token)
            .expectNoContent()
            .document("group-delete")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve users in Group`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val gitlabUserInGroup1 = GitlabUserInGroup(1L, "url", "user1", "username")
        val gitlabUserInGroup2 = GitlabUserInGroup(2L, "url", "user1", "username")

        every { restClient.adminGetGroupMembers(any()) } answers {
            listOf(gitlabUserInGroup1, gitlabUserInGroup2)
        }

        val url = "$rootUrl/${group.id}/users"

        val result = this.performGet(url, token)
            .expectOk()
            .document("group-retrieve-users",
                responseFields(usersInGroupResponseFields("[]."))
            )
            .returnsList(UserInGroupDto::class.java)

        assertThat(result.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can add user by userId in path to Group`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val gitlabUserInGroup1 = GitlabUserInGroup(1L, "url", "user1", "username")
        val gitlabUserInGroup2 = GitlabUserInGroup(2L, "url", "user1", "username")

        every { restClient.adminGetGroupMembers(any()) } answers {
            listOf(gitlabUserInGroup1, gitlabUserInGroup2)
        }

        val url = "$rootUrl/${group.id}/users/${account2.id}?access_level=DEVELOPER"

        val result = this.performPost(url, token)
            .expectOk()
            .document("group-add-user",
                responseFields(usersInGroupResponseFields("[]."))
            )
            .returnsList(UserInGroupDto::class.java)

        assertThat(result.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can edit user by userId in path in Group`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val gitlabUserInGroup1 = GitlabUserInGroup(1L, "url", "user1", "username")
        val gitlabUserInGroup2 = GitlabUserInGroup(2L, "url", "user1", "username")

        every { restClient.adminGetGroupMembers(any()) } answers {
            listOf(gitlabUserInGroup1, gitlabUserInGroup2)
        }

        val url = "$rootUrl/${group.id}/users/${account2.id}?access_level=DEVELOPER"

        val result = this.performPut(url, token)
            .expectOk()
            .document("group-edit-user",
                requestParameters(
                    parameterWithName("access_level").optional().description("Access level for the user")
                ),
                responseFields(usersInGroupResponseFields("[]."))
            )
            .returnsList(UserInGroupDto::class.java)

        assertThat(result.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete user by userId in path from Group`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val gitlabUserInGroup1 = GitlabUserInGroup(1L, "url", "user1", "username")

        every { restClient.adminGetGroupMembers(any()) } answers {
            listOf(gitlabUserInGroup1)
        }

        val url = "$rootUrl/${group.id}/users/${account2.id}"

        val result = this.performDelete(url, token)
            .expectOk()
            .document("group-delete-user",
                PayloadDocumentation.responseFields(usersInGroupResponseFields("[]."))
            )
            .returnsList(UserInGroupDto::class.java)

        assertThat(result.size).isEqualTo(1)
    }

    fun groupCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath("path").type(JsonFieldType.STRING).description("Path of group"),
            PayloadDocumentation.fieldWithPath("namespace").type(JsonFieldType.STRING).description("Namespace of group"),
            PayloadDocumentation.fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Group")
        )
    }

    fun groupUpdateRequestFields(): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath("path").type(JsonFieldType.STRING).description("Path of group"),
            PayloadDocumentation.fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Group")
        )
    }

    fun groupResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Group id"),
            PayloadDocumentation.fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Gitlab group id"),
            PayloadDocumentation.fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Group name")
        )
    }

    private fun groupsOfUserResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Group id"),
            PayloadDocumentation.fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Gitlab group id"),
            PayloadDocumentation.fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Group name"),
            PayloadDocumentation.fieldWithPath(prefix + "access_level").type(JsonFieldType.STRING).description("Access level")
        )
    }

    fun usersInGroupResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("User id"),
            PayloadDocumentation.fieldWithPath(prefix + "user_name").type(JsonFieldType.STRING).description("User name"),
            PayloadDocumentation.fieldWithPath(prefix + "email").type(JsonFieldType.STRING).description("User's email"),
            PayloadDocumentation.fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab"),
            PayloadDocumentation.fieldWithPath(prefix + "access_level").type(JsonFieldType.STRING).description("Access level")
        )
    }
}