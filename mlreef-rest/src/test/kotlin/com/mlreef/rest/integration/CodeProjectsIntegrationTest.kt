package com.mlreef.rest.integration

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.CodeProjectCreateRequest
import com.mlreef.rest.api.v1.CodeProjectUpdateRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.MLProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.testcommons.ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.util.UUID
import javax.transaction.Transactional

class CodeProjectsIntegrationTest : AbstractIntegrationTest() {
    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    val rootUrl = "/api/v1/code-projects"

    @BeforeEach
    @AfterEach
    fun setUp() {
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create CodeProject`() {
        val (account, _, _) = testsHelper.createRealUser()

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
        val (account, _, _) = testsHelper.createRealUser()
        val (existingProjectInDb, _) = testsHelper.createRealCodeProject(account)

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
        val (account, _, _) = testsHelper.createRealUser()

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
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(account1)
        val (project2, _) = testsHelper.createRealCodeProject(account1)
        val (project3, _) = testsHelper.createRealCodeProject(account1)

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (_, _) = testsHelper.createRealCodeProject(account2)
        val (_, _) = testsHelper.createRealCodeProject(account2)

        val result = this.performGet(rootUrl, account1)
            .expectOk()
            .returnsList(CodeProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project2.id,
            project3.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project2.slug,
            project3.slug
        )

        val resultSetOfIds = result.map(CodeProjectDto::id).toSet()
        val resultSetOfSlugs = result.map(CodeProjectDto::slug).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(resultSetOfSlugs).isEqualTo(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own CodeProject by id`() {
        val (account1, _, _) = testsHelper.createRealUser()
        val (_, _) = testsHelper.createRealCodeProject(account1)
        val (project2, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)

        val (account2, _, _) = testsHelper.createRealUser(index = 1)
        val (_, _) = testsHelper.createRealCodeProject(account2)
        val (_, _) = testsHelper.createRealCodeProject(account2)

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
    fun `Can retrieve own and not own but member private CodeProject by slug`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(account1, slug = "slug-1", public = false)
        val (_, _) = testsHelper.createRealCodeProject(account1, public = false)
        val (_, _) = testsHelper.createRealCodeProject(account1, public = false)

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, _) = testsHelper.createRealCodeProject(account2, slug = "slug-1", public = false)
        val (_, _) = testsHelper.createRealCodeProject(account2, public = false)

        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        val (_, _) = testsHelper.createRealCodeProject(account3, slug = "slug-1", public = false)
        val (_, _) = testsHelper.createRealCodeProject(account3, public = false)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val url = "$rootUrl/slug/${project1.slug}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returnsList(CodeProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project21.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project21.slug
        )

        val resultSetOfIds = result.map(MLProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own and not own not member but public CodeProject by slug`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(account1, slug = "slug-1", public = false)
        val (project2, _) = testsHelper.createRealCodeProject(account1)
        val (project3, _) = testsHelper.createRealCodeProject(account1)

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, _) = testsHelper.createRealCodeProject(account2, slug = "slug-1", public = true)
        val (project22, _) = testsHelper.createRealCodeProject(account2)

        val (account3, _, _) = testsHelper.createRealUser(index = -1)
        val (project31, _) = testsHelper.createRealCodeProject(account3, slug = "slug-1", public = false)
        val (project32, _) = testsHelper.createRealCodeProject(account3)

        val url = "$rootUrl/slug/${project1.slug}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returnsList(CodeProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        assertThat(isUserInProject(project1, account1)).isTrue()
        assertThat(isUserInProject(project2, account1)).isTrue()
        assertThat(isUserInProject(project3, account1)).isTrue()
        assertThat(isUserInProject(project21, account1)).isFalse()
        assertThat(isUserInProject(project22, account1)).isFalse()
        assertThat(isUserInProject(project31, account2)).isFalse()
        assertThat(isUserInProject(project32, account2)).isFalse()

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project21.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project21.slug
        )

        val resultSetOfIds = result.map(MLProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve not own but member private CodeProject by namespace`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        val (project1, _) = testsHelper.createRealCodeProject(account1, public = false)
        val (project2, _) = testsHelper.createRealCodeProject(account1, public = false)
        val (project3, _) = testsHelper.createRealCodeProject(account1, public = false)

        testsHelper.addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (project21, _) = testsHelper.createRealCodeProject(account2, namespace = project1.gitlabGroup) //Pay attention that the namespace is not being taken. It's inaccessible to another user
        val (project22, _) = testsHelper.createRealCodeProject(account2)

        val url = "$rootUrl/namespace/${project1.gitlabGroup}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returnsList(CodeProjectDto::class.java)

        assertThat(result.size).isEqualTo(1)

        assertThat(isUserInProject(project1, account2)).isTrue()
        assertThat(isUserInProject(project2, account2)).isFalse()
        assertThat(isUserInProject(project3, account2)).isFalse()
        assertThat(isUserInProject(project21, account2)).isTrue()
        assertThat(isUserInProject(project22, account2)).isTrue()

        val initialSetOfIds = setOf<UUID>(
            project1.id
        )

        val notReturnedSetOfIds = setOf<UUID>(
            project2.id,
            project3.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug
        )

        val resultSetOfIds = result.map(CodeProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(resultSetOfIds).doesNotContain(*notReturnedSetOfIds.toTypedArray())
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve not own not member but public CodeProject by namespace`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        val (project1, _) = testsHelper.createRealCodeProject(account1, public = true)
        val (project2, _) = testsHelper.createRealCodeProject(account1, public = true)
        val (project3, _) = testsHelper.createRealCodeProject(account1, public = false)
        val (project4, _) = testsHelper.createRealCodeProject(account1, public = true)
        val (project5, _) = testsHelper.createRealCodeProject(account1, public = false)

        val (project21, _) = testsHelper.createRealCodeProject(account2, namespace = project1.gitlabGroup) //Pay attention that the namespace is not being taken. It's inaccessible to another user
        val (project22, _) = testsHelper.createRealCodeProject(account2)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/${project1.gitlabGroup}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, CodeProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(isUserInProject(project1, account2)).isFalse()
        assertThat(isUserInProject(project2, account2)).isFalse()
        assertThat(isUserInProject(project3, account2)).isFalse()
        assertThat(isUserInProject(project4, account2)).isFalse()
        assertThat(isUserInProject(project5, account2)).isFalse()
        assertThat(isUserInProject(project21, account2)).isTrue()
        assertThat(isUserInProject(project22, account2)).isTrue()

        assertThat(returnedResult.size).isEqualTo(3)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project2.id,
            project4.id
        )

        val notReturnedSetOfIds = setOf<UUID>(
            project3.id,
            project5.id,
            project21.id,
            project22.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project2.slug,
            project4.slug
        )

        val resultSetOfIds = returnedResult.map(CodeProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(resultSetOfIds).doesNotContain(*notReturnedSetOfIds.toTypedArray())
        assertThat(returnedResult.get(0).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
        assertThat(returnedResult.get(1).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(1).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(2).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(2).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve not own not member but public CodeProject by namespace and slug`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)

        val (project1, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)
        val (_, _) = testsHelper.createRealCodeProject(account1)

        testsHelper.addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = testsHelper.createRealCodeProject(account2, slug = "slug-1", namespace = project1.gitlabGroup)
        val (_, _) = testsHelper.createRealCodeProject(account2)

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
    fun `Cannot retrieve not own not public CodeProject`() {
        val (account1, _, _) = testsHelper.createRealUser()

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, _) = testsHelper.createRealCodeProject(account2, public = false)

        val url = "$rootUrl/${project21.id}"

        this.performGet(url, account1).expectForbidden()

        assertThat(isUserInProject(project21, account1)).isFalse()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve not own but public CodeProject`() {
        val (account1, _, _) = testsHelper.createRealUser()

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, _) = testsHelper.createRealCodeProject(account2, public = true)

        val url = "$rootUrl/${project21.id}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result.id).isEqualTo(project21.id)
        assertThat(isUserInProject(project21, account1)).isFalse()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can update own CodeProject`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (project1, _) = testsHelper.createRealCodeProject(account1)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        assertThat(newProjectName).isNotEqualTo(project1.gitlabProject)

        assertThat(isUserInProject(project1, account1, AccessLevel.OWNER)).isTrue()

        val request = CodeProjectUpdateRequest(newProjectName, newDescription)

        val url = "$rootUrl/${project1.id}"

        val result = this.performPut(url, account1, request)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result.name).isEqualTo(newProjectName)

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }
    }

    @Transactional
//    @Rollback
    @Test
    fun `Cannot update not-own CodeProject`() {
        val (account1, _, _) = testsHelper.createRealUser()

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, gitlabProject21) = testsHelper.createRealCodeProject(account2)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        val request = CodeProjectUpdateRequest(newProjectName, newDescription)

        val url = "$rootUrl/${project21.id}"

        this.performPut(url, account1, request).expect4xx()

        assertThat(isUserInProject(project21, account1)).isFalse()

        //One call during cache update. The correct case - no second call
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(gitlabProject21.id, project21.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete own CodeProject`() {
        val (account, _, _) = testsHelper.createRealUser()
        val (project, gitlabProject) = testsHelper.createRealCodeProject(account)

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNotNull()

        assertThat(isUserInProject(project, account, AccessLevel.OWNER)).isTrue()

        val url = "$rootUrl/${project.id}"

        this.performDelete(url, account).expectNoContent()

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNull()

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(gitlabProject.id, project.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot delete not-own CodeProject`() {
        val (account1, _, _) = testsHelper.createRealUser()

        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (project21, gitlabProject21) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull()

        val url = "$rootUrl/${project21.id}"

        this.performDelete(url, account1).expectForbidden()

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull()

        assertThat(isUserInProject(project21, account1, AccessLevel.DEVELOPER)).isTrue()

        verify(exactly = 0, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(gitlabProject21.id, project21.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can get users list in project`() {
        val (account1, _, _) = testsHelper.createRealUser()
        val (account2, _, _) = testsHelper.createRealUser(index = 1)
        val (account3, _, _) = testsHelper.createRealUser(index = 2)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        testsHelper.addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        assertThat(isUserInProject(project21, account2, AccessLevel.OWNER)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer can get users list in project`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        testsHelper.addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, account1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Visitor cannot get users list in project`() {
        val (account1, _, _) = testsHelper.createRealUser(index = -1)
        val (account2, _, _) = testsHelper.createRealUser(index = -1)
        val (account3, _, _) = testsHelper.createRealUser(index = -1)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        testsHelper.addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val userInProjectUrl = "$rootUrl/${project21.id}/users/check/myself"
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
        val (account1, _, _) = testsHelper.createRealUser()
        val (account2, _, _) = testsHelper.createRealUser(index = 1)
        val (account3, _, _) = testsHelper.createRealUser(index = 2)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

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
        val (account1, _, _) = testsHelper.createRealUser()
        val (account2, _, _) = testsHelper.createRealUser(index = 1)
        val (account3, _, _) = testsHelper.createRealUser(index = 2)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.MAINTAINER)

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
        val (account1, _, _) = testsHelper.createRealUser()
        val (account2, _, _) = testsHelper.createRealUser(index = 1)
        val (account3, _, _) = testsHelper.createRealUser(index = 2)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

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
        val (account1, _, _) = testsHelper.createRealUser()
        val (account2, _, _) = testsHelper.createRealUser(index = 1)
        val (account3, _, _) = testsHelper.createRealUser(index = 2)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        testsHelper.addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!)

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
        val (account1, _, _) = testsHelper.createRealUser()
        val (account2, _, _) = testsHelper.createRealUser(index = 1)
        val (account3, _, _) = testsHelper.createRealUser(index = 2)

        val (project21, _) = testsHelper.createRealCodeProject(account2)

        testsHelper.addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        testsHelper.addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.DEVELOPER)

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

    private fun isUserInProject(project: CodeProject, account: Account, withLevel: AccessLevel? = null): Boolean {
        val url = "$rootUrl/${project.id}/users/check/myself" + if (withLevel != null) "?level=${withLevel.name.toLowerCase()}" else ""

        return this.performGet(url, account).expectOk().returns(Boolean::class.java)
    }
}
