package com.mlreef.rest.integration

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.api.v1.GroupCreateRequest
import com.mlreef.rest.api.v1.GroupUpdateRequest
import com.mlreef.rest.api.v1.dto.GroupDto
import com.mlreef.rest.api.v1.dto.GroupOfUserDto
import com.mlreef.rest.api.v1.dto.UserInGroupDto
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GroupsIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/groups"

    @Test
    fun `Can retrieve all own groups`() {
        //given
        val (_, token, _) = testsHelper.createRealUser(index = -1)

        val (group1, _) = testsHelper.createRealGroup(token)
        val (group2, _) = testsHelper.createRealGroup(token)
        val (group3, _) = testsHelper.createRealGroup(token)

        //when
        val url = "$rootUrl/my"

        val result = this.performGet(url, token)
            .expectOk()
            .returnsList(GroupOfUserDto::class.java)

        //then
        assertThat(result.size).isEqualTo(3)
        assertThat(result.map(GroupOfUserDto::id).toSortedSet()).isEqualTo(listOf(group1.id, group2.id, group3.id).toSortedSet())
    }

    @Test
    fun `Can create a group as authorized user`() {
        //given
        val (account, token, _) = testsHelper.createRealUser(index = -1)

        val request = GroupCreateRequest("absolutenewtestpath", "test-namespace", "test-name")

        //when
        val result = this.performPost(rootUrl, token, request)
            .expectOk()
            .returns(GroupDto::class.java)

        //then
        assertThat(result).isNotNull
        assertThat(result.name).isEqualTo("test-name")
    }

    @Test
    fun `Cannot create a group as visitor`() {
        //given
        val request = GroupCreateRequest("testpath", "testnamespace", "testname")

        //when
        this.performPost(rootUrl, null, body = request)
            .expectForbidden()
    }

    @Test
    fun `Can create a duplicate name of group`() {
        //given
        val (account, token, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token)

        val request = GroupCreateRequest("therealnewtestpath", "testnamespace", group1.name)

        //when
        this.performPost(rootUrl, token, body = request)
            .expectOk()
    }

    @Test
    fun `Cannot create a duplicate path of group`() {
        //given
        val (account, token, _) = testsHelper.createRealUser(index = -1)
        val (group1, gitlabGroup1) = testsHelper.createRealGroup(token)

        val request = GroupCreateRequest(gitlabGroup1.path, "testnamespace", "therealnewname")

        //when
        this.performPost(rootUrl, token, body = request)
            .expectBadRequest()
    }

    @Test
    fun `Cannot create a group with invalid parameters`() {
        //given
        val (account, token, _) = testsHelper.createRealUser(index = -1)

        val request = GroupCreateRequest("", "", "")

        //when
        this.performPost(rootUrl, token, body = request)
            .expectBadRequest()
    }

    @Test
    fun `Can update own group`() {
        //given
        val (account, token, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token)

        val request = GroupUpdateRequest("new-test-name", null)

        //when
        val url = "$rootUrl/${group1.id}"

        val result = this.performPut(url, token, request)
            .expectOk()
            .returns(GroupDto::class.java)

        //then
        assertThat(result).isNotNull
        assertThat(result.name).isEqualTo("new-test-name")
    }

    @Test
    fun `Cannot update not own group`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)

        val request = GroupUpdateRequest("new-test-name", null)

        //when
        val url = "$rootUrl/${group1.id}"

        this.performPut(url, token2, body = request)
            .expectForbidden()
    }

    @Test
    fun `Can delete own group`() {
        //given
        val (account, token, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token)

        //when
        val url = "$rootUrl/${group1.id}"

        this.performDelete(url, token)
            .expectNoContent()
    }

    @Test
    fun `Cannot delete not own group`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)

        //when
        val url = "$rootUrl/${group1.id}"

        this.performDelete(url, token2)
            .expectForbidden()
    }

    @Test
    fun `Can get users in group as owner`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.GUEST)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.MAINTAINER)

        //when
        val url = "$rootUrl/${group1.id}/users"

        val result = this.performGet(url, token1)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(3)

        val initialSetIds = setOf(
            account.id,
            account2.id,
            account3.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.GUEST)
        assertThat(resultMapOfIds[account3.id]!!.accessLevel).isEqualTo(AccessLevel.MAINTAINER)
    }

    @Test
    fun `Can get users in group as developer`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        //when
        val url = "$rootUrl/${group1.id}/users"

        val result = this.performGet(url, token2)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(3)

        val initialSetIds = setOf(
            account.id,
            account2.id,
            account3.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.DEVELOPER)
        assertThat(resultMapOfIds[account3.id]!!.accessLevel).isEqualTo(AccessLevel.GUEST)
    }

    @Test
    fun `Cannot get users in group as guest`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, token3, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        //when
        val url = "$rootUrl/${group1.id}/users"

        this.performGet(url, token3)
            .expectForbidden()
    }

    @Test
    fun `Cannot get users in group as visitor`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        //when
        val url = "$rootUrl/${group1.id}/users"

        this.performGet(url)
            .expectForbidden()
    }

    @Test
    fun `Can add user to group as owner`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        //when
        val url = "$rootUrl/${group1.id}/users/${account2.id}"

        val result = this.performPost(url, token1)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(2)

        val initialSetIds = setOf(
            account.id,
            account2.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.GUEST)
    }

    @Test
    fun `Can add user to group as maintainer`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account3.id}"

        val result = this.performPost(url, token2)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(3)

        val initialSetIds = setOf(
            account.id,
            account2.id,
            account3.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.MAINTAINER)
        assertThat(resultMapOfIds[account3.id]!!.accessLevel).isEqualTo(AccessLevel.GUEST)
    }

    @Test
    fun `Cannot add user to group as developer`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account3.id}"

        this.performPost(url, token2)
            .expectForbidden()
    }

    @Test
    fun `Cannot add user to group as visitor`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        //when
        val url = "$rootUrl/${group1.id}/users/${account2.id}"

        this.performPost(url)
            .expectForbidden()
    }

    @Test
    fun `Can edit user in group as owner`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account2.id}?access_level=MAINTAINER"

        val result = this.performPut(url, token1)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(2)

        val initialSetIds = setOf(
            account.id,
            account2.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.MAINTAINER)
    }

    @Test
    fun `Can edit user in group as maintainer`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account3.id}?access_level=MAINTAINER"

        val result = this.performPut(url, token2)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(3)

        val initialSetIds = setOf(
            account.id,
            account2.id,
            account3.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.MAINTAINER)
        assertThat(resultMapOfIds[account3.id]!!.accessLevel).isEqualTo(AccessLevel.MAINTAINER)
    }

    @Test
    fun `Cannot edit user in group as developer`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, token3, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account2.id}?access_level=DEVELOPER"

        this.performPut(url, token3)
            .expectForbidden()
    }

    @Test
    fun `Cannot edit user in group as visitor`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account2.id}?access_level=DEVELOPER"

        this.performPut(url)
            .expectForbidden()
    }

    @Test
    fun `Can delete user from group as owner`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account3.id}"

        val result = this.performDelete(url, token1)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(2)

        val initialSetIds = setOf(
            account.id,
            account2.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.MAINTAINER)
        assertThat(resultMapOfIds[account3.id]).isNull()
    }

    @Test
    fun `Can delete user from group as maintainer`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, token2, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account3.id}"

        val result = this.performDelete(url, token2)
            .expectOk()
            .returnsList(UserInGroupDto::class.java)

        //then
        assertThat(result.size).isEqualTo(2)

        val initialSetIds = setOf(
            account.id,
            account2.id
        )

        val resultMapOfIds = result.map{it.id to it}.toMap()

        assertThat(initialSetIds).isEqualTo(resultMapOfIds.keys)
        assertThat(resultMapOfIds[account.id]!!.accessLevel).isEqualTo(AccessLevel.OWNER)
        assertThat(resultMapOfIds[account2.id]!!.accessLevel).isEqualTo(AccessLevel.MAINTAINER)
        assertThat(resultMapOfIds[account3.id]).isNull()
    }

    @Test
    fun `Cannot delete user from group as developer`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, token3, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)
        testsHelper.addRealUserToGroup(group1.gitlabId!!, account3.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account2.id}"

        this.performDelete(url, token3)
            .expectForbidden()
    }

    @Test
    fun `Cannot delete user from group as visitor`() {
        //given
        val (account, token1, _) = testsHelper.createRealUser(index = -1)
        val (group1, _) = testsHelper.createRealGroup(token1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        testsHelper.addRealUserToGroup(group1.gitlabId!!, account2.person.gitlabId!!, GroupAccessLevel.MAINTAINER)

        //when
        val url = "$rootUrl/${group1.id}/users/${account2.id}"

        this.performDelete(url)
            .expectForbidden()
    }
}