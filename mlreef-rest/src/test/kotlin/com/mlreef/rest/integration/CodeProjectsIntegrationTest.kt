package com.mlreef.rest.integration

import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.CodeProjectCreateRequest
import com.mlreef.rest.api.v1.CodeProjectUpdateRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import java.util.UUID
import javax.transaction.Transactional

class CodeProjectsIntegrationTest : IntegrationRestApiTest() {
    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    val rootUrl = "/api/v1/code-projects"

    @BeforeEach
    @AfterEach
    fun setUp() {
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create CodeProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()

        val request = CodeProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )

        val result = this.performPost(rootUrl, account, request)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create duplicate CodeProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (existingProjectInDb, _) = gitlabHelper.createRealCodeProject(account)

        val request = CodeProjectCreateRequest(
            slug = existingProjectInDb.slug,
            namespace = existingProjectInDb.gitlabPathWithNamespace,
            name = existingProjectInDb.name,
            description = "New description",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )

        this.performPost(rootUrl, account, request).expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create CodeProject with invalid params`() {
        val (account, _, _) = gitlabHelper.createRealUser()

        val request = CodeProjectCreateRequest(
            slug = "",
            namespace = "",
            name = "",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )

        this.performPost(rootUrl, account, request).expectBadRequest()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all own CodeProjects only`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealCodeProject(account1)
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (project3, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (_, _) = gitlabHelper.createRealCodeProject(account2)
        val (_, _) = gitlabHelper.createRealCodeProject(account2)

        val result = this.performGet(rootUrl, account1)
            .expectOk()
            .returnsList(CodeProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)
        assertThat(result.map(CodeProjectDto::id).toSortedSet()).isEqualTo(listOf(project1.id, project2.id, project3.id).toSortedSet())
        assertThat(result.map(CodeProjectDto::gitlabProject).toSortedSet()).isEqualTo(listOf(project1.slug, project2.slug, project3.slug).toSortedSet()) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by id`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (_, _) = gitlabHelper.createRealCodeProject(account2)
        val (_, _) = gitlabHelper.createRealCodeProject(account2)

        val url = "$rootUrl/${project2.id}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result.id).isEqualTo(project2.id)
        assertThat(result.gitlabId).isEqualTo(project2.gitlabId)
        assertThat(result.gitlabProject).isEqualTo(project2.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealCodeProject(account1, slug = "slug-1")
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2, slug = "slug-1")
        val (_, _) = gitlabHelper.createRealCodeProject(account2)

        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)
        val (_, _) = gitlabHelper.createRealCodeProject(account3, slug = "slug-1")
        val (_, _) = gitlabHelper.createRealCodeProject(account3)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val url = "$rootUrl/slug/${project1.slug}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returnsList(CodeProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        val setOfIds = setOf<UUID>(
            result.get(0).id,
            result.get(1).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(project1.id, project21.id)
        assertThat(result.get(0).id).isIn(project1.id, project21.id)
        assertThat(result.get(0).gitlabProject).isIn(project1.slug, project21.slug) //FIXME: Why is slug? Is it correct?
        assertThat(result.get(1).id).isIn(project1.id, project21.id)
        assertThat(result.get(1).gitlabProject).isIn(project1.slug, project21.slug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by namespace`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = gitlabHelper.createRealCodeProject(account2, namespace = project1.gitlabGroup)
        val (_, _) = gitlabHelper.createRealCodeProject(account2)

        val url = "$rootUrl/namespace/${project1.gitlabGroup}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returnsList(CodeProjectDto::class.java)

        assertThat(result.size).isEqualTo(1) //FIXME: Should be 2?

        val setOfIds = setOf<UUID>(
            result.get(0).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(project1.id)
        assertThat(result.get(0).id).isIn(project1.id)
        assertThat(result.get(0).gitlabProject).isIn(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by namespace and slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = gitlabHelper.createRealCodeProject(account2, slug = "slug-1", namespace = project1.gitlabGroup)
        val (_, _) = gitlabHelper.createRealCodeProject(account2)

        val url = "$rootUrl/${project1.gitlabGroup}/${project1.slug}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabProject).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve specific not own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        val url = "$rootUrl/${project21.id}"

        this.performGet(url, account1).expectForbidden()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can update own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealCodeProject(account1)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        assertThat(newProjectName).isNotEqualTo(project1.gitlabProject)

        val request = CodeProjectUpdateRequest(newProjectName, newDescription)

        val url = "$rootUrl/${project1.id}"

        val result = this.performPut(url, account1, request)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result.gitlabProject).isEqualTo(newProjectName)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot update not-own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        val request = CodeProjectUpdateRequest(newProjectName, newDescription)

        val url = "$rootUrl/${project21.id}"

        this.performPut(url, account1, request).expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete own CodeProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealCodeProject(account)

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNotNull()

        val url = "$rootUrl/${project.id}"

        this.performDelete(url, account).expectNoContent()

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot delete not-own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull()

        val url = "$rootUrl/${project21.id}"

        this.performDelete(url, account1).expectForbidden()

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer can get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, account1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Guest cannot get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val userInProjectUrl = "$rootUrl/${project21.id}/users/check"
        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val userInProject = this.performGet(userInProjectUrl, account3)
            .expectOk()
            .returns(Boolean::class.java)

        assertThat(userInProject).isTrue()

        this.performGet(getUsersUrl, account3).expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can add a user to project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val addUserUrl = "$rootUrl/${project21.id}/users/${account3.id}"

        var returnedResult: List<UserInProjectDto> = this.performGet(getUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        returnedResult = this.performPost(addUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Maintainer can add a user to project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.MAINTAINER)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val addUserUrl = "$rootUrl/${project21.id}/users/${account3.id}"

        var returnedResult: List<UserInProjectDto> = this.performGet(getUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        returnedResult = this.performPost(addUserUrl, account1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer cannot add a user to project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val addUserUrl = "$rootUrl/${project21.id}/users/${account3.id}"

        var returnedResult: List<UserInProjectDto> = this.performGet(getUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        this.performPost(addUserUrl, account1).expectForbidden()

        returnedResult = this.performGet(getUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can delete a user from project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val deleteUserUrl = "$rootUrl/${project21.id}/users/${account3.id}"

        var result: List<UserInProjectDto> = this.performGet(getUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        result = this.performDelete(deleteUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer cannot delete a user from project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val deleteUserUrl = "$rootUrl/${project21.id}/users/${account3.id}"

        var result: List<UserInProjectDto> = this.performGet(getUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        this.performDelete(deleteUserUrl, account1).expectForbidden()

        result = this.performGet(getUserUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)
    }
}
