package com.mlreef.rest.integration

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.DataProjectCreateRequest
import com.mlreef.rest.api.v1.DataProjectUpdateRequest
import com.mlreef.rest.api.v1.dto.DataProjectDto
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
import org.springframework.test.annotation.Rollback
import java.util.UUID
import javax.transaction.Transactional

class DataProjectsIntegrationTest : IntegrationRestApiTest() {

    val rootUrl = "/api/v1/data-projects"

    @Autowired private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @BeforeEach
    @AfterEach
    fun setUp() {
    }

    @Transactional
    @Rollback
    @Test fun `Can create DataProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()

        val request = DataProjectCreateRequest(
            "test-project",
            "mlreef",
            "Test project",
            "description",
            true,
            VisibilityScope.PUBLIC
        )

        val result = this.performPost(rootUrl, account, request)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Cannot create duplicate DataProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealDataProject(account)

        val request = DataProjectCreateRequest(
            slug = project.slug,
            namespace = project.gitlabPathWithNamespace,
            name = project.name,
            description = "New description",
            initializeWithReadme = true,
            visibility = VisibilityScope.PUBLIC
        )

        this.performPost(rootUrl, account, request).expect4xx()
    }

    @Transactional
    @Rollback
    @Test fun `Cannot create DataProject with invalid params`() {
        val (account, _, _) = gitlabHelper.createRealUser()

        val request = DataProjectCreateRequest(
            "",
            "",
            "",
            "description",
            true,
            VisibilityScope.PUBLIC)

        this.performPost(rootUrl, account, request).expectBadRequest()
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all own DataProjects only`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealDataProject(account1)
        val (project2, _) = gitlabHelper.createRealDataProject(account1)
        val (project3, _) = gitlabHelper.createRealDataProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealDataProject(account2)
        val (project22, _) = gitlabHelper.createRealDataProject(account2)

        val result = this.performGet(rootUrl, account1)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        assertThat(isUserInProject(project1, account1)).isTrue()
        assertThat(isUserInProject(project2, account1)).isTrue()
        assertThat(isUserInProject(project3, account1)).isTrue()
        assertThat(isUserInProject(project21, account1)).isFalse()
        assertThat(isUserInProject(project22, account1)).isFalse()

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

        val resultSetOfIds = result.map(DataProjectDto::id).toSet()
        val resultSetOfSlugs = result.map(DataProjectDto::slug).toSet()

        assertThat(result.size).isEqualTo(3)

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(resultSetOfSlugs).isEqualTo(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve own DataProject by id`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (_, _) = gitlabHelper.createRealDataProject(account1)
        val (project2, _) = gitlabHelper.createRealDataProject(account1)
        val (_, _) = gitlabHelper.createRealDataProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (_, _) = gitlabHelper.createRealDataProject(account2)
        val (_, _) = gitlabHelper.createRealDataProject(account2)

        val url = "$rootUrl/${project2.id}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project2.id)
        assertThat(result.gitlabId).isEqualTo(project2.gitlabId)
        assertThat(result.gitlabProject).isEqualTo(project2.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve own and not own but member private DataProject by slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealDataProject(account1, slug = "slug-1", public = false)
        val (_, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (_, _) = gitlabHelper.createRealDataProject(account1, public = false)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealDataProject(account2, slug = "slug-1", public = false)
        val (_, _) = gitlabHelper.createRealDataProject(account2, public = false)

        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)
        val (_, _) = gitlabHelper.createRealDataProject(account3, slug = "slug-1", public = false)
        val (_, _) = gitlabHelper.createRealDataProject(account3, public = false)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val url = "$rootUrl/slug/${project1.slug}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project21.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project21.slug
        )

        val resultSetOfIds = result.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve own and not own not member but public DataProject by slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealDataProject(account1, slug = "slug-1", public = false)
        val (_, _) = gitlabHelper.createRealDataProject(account1)
        val (_, _) = gitlabHelper.createRealDataProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealDataProject(account2, slug = "slug-1", public = true)
        val (project22, _) = gitlabHelper.createRealDataProject(account2)

        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project31, _) = gitlabHelper.createRealDataProject(account3, slug = "slug-1", public = false)
        val (project32, _) = gitlabHelper.createRealDataProject(account3)

        val url = "$rootUrl/slug/${project1.slug}"

        val result = this.performGet(url, account1)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        assertThat(isUserInProject(project1, account1)).isTrue()
        assertThat(isUserInProject(project21, account1)).isFalse()

        assertThat(result.size).isEqualTo(2)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project21.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project21.slug
        )

        val resultSetOfIds = result.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve not own but member private DataProjects by namespace`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (project2, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (project3, _) = gitlabHelper.createRealDataProject(account1, public = false)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (project21, _) = gitlabHelper.createRealDataProject(account2, namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealDataProject(account2)

        val url = "$rootUrl/namespace/${project1.gitlabGroup}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        assertThat(result.size).isEqualTo(1)

        assertThat(isUserInProject(project1, account2)).isTrue()
        assertThat(isUserInProject(project2, account2)).isFalse()
        assertThat(isUserInProject(project3, account2)).isFalse()
        assertThat(isUserInProject(project21, account2)).isTrue()
        assertThat(isUserInProject(project22, account2)).isTrue()

        val initialSetOfIds = setOf<UUID>(
            project1.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug
        )

        val resultSetOfIds = result.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve not own not member but public DataProjects by namespace`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealDataProject(account1, public = true)
        val (project2, _) = gitlabHelper.createRealDataProject(account1, public = true)
        val (project3, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (project4, _) = gitlabHelper.createRealDataProject(account1, public = true)
        val (project5, _) = gitlabHelper.createRealDataProject(account1, public = false)

        val (project21, _) = gitlabHelper.createRealDataProject(account2, namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealDataProject(account2)

        val url = "$rootUrl/namespace/${project1.gitlabGroup}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        assertThat(isUserInProject(project1, account2)).isFalse()
        assertThat(isUserInProject(project2, account2)).isFalse()
        assertThat(isUserInProject(project3, account2)).isFalse()
        assertThat(isUserInProject(project4, account2)).isFalse()
        assertThat(isUserInProject(project5, account2)).isFalse()
        assertThat(isUserInProject(project21, account2)).isTrue()
        assertThat(isUserInProject(project22, account2)).isTrue()

        assertThat(result.size).isEqualTo(3)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project2.id,
            project4.id
        )


        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project2.slug,
            project4.slug
        )

        val resultSetOfIds = result.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabProject).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabProject).isIn(initialSetOfSlug)
        assertThat(result.get(2).id).isIn(initialSetOfIds)
        assertThat(result.get(2).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve not own but member private DataProject by namespace and slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (project2, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (project3, _) = gitlabHelper.createRealDataProject(account1, public = false)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (project21, _) = gitlabHelper.createRealDataProject(account2, slug = "slug-1", namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealDataProject(account2)

        val url = "$rootUrl/${project1.gitlabGroup}/${project1.slug}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabProject).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
        assertThat(isUserInProject(project1, account2)).isTrue()
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve not own not member but public DataProject by namespace and slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealDataProject(account1, public = true)
        val (_, _) = gitlabHelper.createRealDataProject(account1, public = true)
        val (_, _) = gitlabHelper.createRealDataProject(account1, public = true)

        val (_, _) = gitlabHelper.createRealDataProject(account2, slug = "slug-1", namespace = project1.gitlabGroup)
        val (_, _) = gitlabHelper.createRealDataProject(account2)

        val url = "$rootUrl/${project1.gitlabGroup}/${project1.slug}"

        val result = this.performGet(url, account2)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabProject).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
        assertThat(isUserInProject(project1, account2)).isFalse()
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve not own not public DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealDataProject(account2, public = false)

        val url = "$rootUrl/${project21.id}"

        this.performGet(url, account1).expectForbidden()

        assertThat(isUserInProject(project21, account1)).isFalse()
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve not own but public DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealDataProject(account2, public = true)

        val url = "$rootUrl/${project21.id}"

        val result = this.performGet(url, account1).expectOk().returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project21.id)
        assertThat(isUserInProject(project21, account1)).isFalse()
    }

    @Transactional
    @Rollback
    @Test fun `Can update own DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealDataProject(account1)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        assertThat(newProjectName).isNotEqualTo(project1.gitlabProject)

        assertThat(isUserInProject(project1, account1, AccessLevel.OWNER)).isTrue()

        val request = DataProjectUpdateRequest(newProjectName, newDescription)

        val url = "$rootUrl/${project1.id}"

        val result = this.performPut(url, account1, request)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result.name).isEqualTo(newProjectName)

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(result.gitlabId, result.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test fun `Cannot update not-own DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, gitlabProject21) = gitlabHelper.createRealDataProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        val request = DataProjectUpdateRequest(newProjectName, newDescription)

        val url = "$rootUrl/${project21.id}"

        this.performPut(url, account1, request).expect4xx()

        assertThat(isUserInProject(project21, account1, AccessLevel.DEVELOPER)).isTrue()

        //One call during cache update. The correct case - no second call
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.save(
                eq(PublicProjectHash(gitlabProject21.id, project21.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test fun `Can delete own DataProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, gitlabProject) = gitlabHelper.createRealDataProject(account)

        assertThat(dataProjectRepository.findByIdOrNull(project.id)).isNotNull()

        assertThat(isUserInProject(project, account, AccessLevel.OWNER)).isTrue()

        val url = "$rootUrl/${project.id}"

        this.performDelete(url, account).expectNoContent()

        assertThat(dataProjectRepository.findByIdOrNull(project.id)).isNull()

        //Ensure that public project cache was updated
        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(gitlabProject.id, project.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test fun `Cannot delete not-own DataProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, gitlabProject21) = gitlabHelper.createRealDataProject(account2)
        val (_, _) = gitlabHelper.createRealDataProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        assertThat(dataProjectRepository.findByIdOrNull(project21.id)).isNotNull()

        val url = "$rootUrl/${project21.id}"

        this.performDelete(url, account1).expectForbidden()

        assertThat(dataProjectRepository.findByIdOrNull(project21.id)).isNotNull()

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
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealDataProject(account2)
        val (_, _) = gitlabHelper.createRealDataProject(account2)
        val (project23, _) = gitlabHelper.createRealDataProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        addRealUserToProject(project23.gitlabId, account3.person.gitlabId!!)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, account2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        assertThat(isUserInProject(project21, account2, AccessLevel.OWNER)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer can get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project21, _) = gitlabHelper.createRealDataProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, account1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        assertThat(isUserInProject(project21, account1, AccessLevel.DEVELOPER)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    fun `Visitor cannot get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project21, _) = gitlabHelper.createRealDataProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val userInProjectUrl = "$rootUrl/${project21.id}/users/check/myself"
        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val userInProject = this.performGet(userInProjectUrl, account3)
            .expectOk()
            .returns(Boolean::class.java)

        assertThat(userInProject).isTrue()

        this.performGet(getUsersUrl, account3).expect4xx()

        assertThat(isUserInProject(project21, account1, AccessLevel.DEVELOPER)).isTrue()
        assertThat(isUserInProject(project21, account3, AccessLevel.GUEST)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can add a user to project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealDataProject(account2)

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

        val (project21, _) = gitlabHelper.createRealDataProject(account2)

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

        val (project21, _) = gitlabHelper.createRealDataProject(account2)

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

        val (project21, _) = gitlabHelper.createRealDataProject(account2)

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

        val (project21, _) = gitlabHelper.createRealDataProject(account2)

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

    private fun isUserInProject(project: DataProject, account: Account, withLevel: AccessLevel? = null): Boolean {
        val url = "$rootUrl/${project.id}/users/check/myself" + if (withLevel != null) "?level=${withLevel.name.toLowerCase()}" else ""

        return this.performGet(url, account).expectOk().returns(Boolean::class.java)
    }
}
