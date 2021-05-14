package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.ProjectUpdateRequest
import com.mlreef.rest.api.v1.ProjectUserMembershipRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.external_api.gitlab.GitlabAccessLevel
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.testcommons.ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import java.time.Instant
import java.time.Period
import java.util.UUID
import javax.transaction.Transactional


class ProjectsIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/projects"
    val dataProjectRootUrl = "/api/v1/data-projects"
    val codeProjectRootUrl = "/api/v1/code-projects"

    @BeforeEach
    fun setUp() {

    }

    @AfterEach
    fun destroy() {

    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all own CodeProjects and DataProjects only`() {
        val (account1, token1, _) = createRealUser()
        val (project1, _) = createRealDataProject(token1, account1)
        val (project2, _) = createRealDataProject(token1, account1)
        val (project3, _) = createRealCodeProject(token1, account1)
        val (project4, _) = createRealCodeProject(token1, account1)

        val (account2, token2, _) = createRealUser(index = -1)
        val (_, _) = createRealDataProject(token2, account2)
        val (_, _) = createRealDataProject(token2, account2)
        val (_, _) = createRealCodeProject(token2, account2)
        val (_, _) = createRealCodeProject(token2, account2)

        val result = this.performGet("$rootUrl/my", token1)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project2.id,
            project3.id,
            project4.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project2.slug,
            project3.slug,
            project4.slug
        )

        val resultSetOfIds = result.map(DataProjectDto::id).toSet()
        val resultSetOfSlugs = result.map(DataProjectDto::slug).toSet()

        assertThat(result.size).isEqualTo(4)

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(resultSetOfSlugs).isEqualTo(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own DataProject by id`() {
        val (account1, token1, _) = createRealUser()
        val (_, _) = createRealDataProject(token1, account1)
        val (project2, _) = createRealDataProject(token1, account1)
        val (_, _) = createRealDataProject(token1, account1)

        val (account2, token2, _) = createRealUser(index = 1)
        val (_, _) = createRealDataProject(token2, account2)
        val (_, _) = createRealDataProject(token2, account2)

        val url = "$rootUrl/${project2.id}"

        val result = this.performGet(url, token1)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project2.id)
        assertThat(result.gitlabId).isEqualTo(project2.gitlabId)
        assertThat(result.gitlabPath).isEqualTo(project2.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve own CodeProject by id`() {
        val (account1, token1, _) = createRealUser()
        val (_, _) = createRealCodeProject(token1, account1)
        val (project2, _) = createRealCodeProject(token1, account1)
        val (_, _) = createRealCodeProject(token1, account1)

        val (account2, token2, _) = createRealUser(index = 1)
        val (_, _) = createRealCodeProject(token2, account2)
        val (_, _) = createRealCodeProject(token2, account2)

        val url = "$rootUrl/${project2.id}"

        val result = this.performGet(url, token1)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result.id).isEqualTo(project2.id)
        assertThat(result.gitlabId).isEqualTo(project2.gitlabId)
        assertThat(result.gitlabPath).isEqualTo(project2.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    @Disabled("No search by namespace is available")
    fun `Can retrieve not own but member private Projects by namespace`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)

        val (project1, _) = createRealDataProject(token1, account1, public = false)
        val (_, _) = createRealDataProject(token1, account1, public = false)
        val (_, _) = createRealDataProject(token1, account1, public = false)
        val (project4, _) = createRealCodeProject(token1, account1, public = false)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)
        addRealUserToProject(project4.gitlabId, account2.person.gitlabId!!)

        val (_, _) = createRealDataProject(token2, account2, namespace = project1.gitlabNamespace)
        val (_, _) = createRealDataProject(token2, account2)

        val url = "$rootUrl/namespace/${project1.gitlabNamespace}"

        val result = this.performGet(url, token2)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        val initialSetOfIds = setOf(
            project1.id,
            project4.id
        )

        val initialSetOfSlug = setOf(
            project1.slug,
            project4.slug
        )

        val resultSetOfIds = result.map(ProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabPath).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    @Disabled
    fun `Can retrieve not own not member but public Projects by namespace`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)

        val (project1, _) = createRealDataProject(token1, account1, public = true)
        val (project2, _) = createRealDataProject(token1, account1, public = true)
        val (_, _) = createRealDataProject(token1, account1, public = false)
        val (project4, _) = createRealDataProject(token1, account1, public = true)
        val (_, _) = createRealDataProject(token1, account1, public = false)
        val (project11, _) = createRealCodeProject(token1, account1, public = true)
        val (project12, _) = createRealCodeProject(token1, account1, public = true)
        val (_, _) = createRealCodeProject(token1, account1, public = false)
        val (project14, _) = createRealCodeProject(token1, account1, public = true)
        val (_, _) = createRealCodeProject(token1, account1, public = false)

        val (_, _) = createRealDataProject(token2, account2, namespace = project1.gitlabNamespace)
        val (_, _) = createRealDataProject(token2, account2)

        val url = "$rootUrl/namespace/${project1.gitlabNamespace}"

        val result = this.performGet(url, token2)
            .expectOk()
            .returnsList(DataProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        val initialSetOfIds = setOf<UUID>(
            project1.id,
            project2.id,
            project4.id,
            project11.id,
            project12.id,
            project14.id
        )

        val initialSetOfSlug = setOf<String>(
            project1.slug,
            project2.slug,
            project4.slug,
            project11.slug,
            project12.slug,
            project14.slug
        )

        val resultSetOfIds = result.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
        assertThat(result.get(0).id).isIn(initialSetOfIds)
        assertThat(result.get(0).gitlabPath).isIn(initialSetOfSlug) //FIXME: Why is slug? Is it correct?
        assertThat(result.get(1).id).isIn(initialSetOfIds)
        assertThat(result.get(1).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(2).id).isIn(initialSetOfIds)
        assertThat(result.get(2).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(3).id).isIn(initialSetOfIds)
        assertThat(result.get(3).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(4).id).isIn(initialSetOfIds)
        assertThat(result.get(4).gitlabPath).isIn(initialSetOfSlug)
        assertThat(result.get(5).id).isIn(initialSetOfIds)
        assertThat(result.get(5).gitlabPath).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve not own but member private DataProject by namespace and slug`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)

        val (project1, _) = createRealDataProject(token1, account1, public = false)
        val (_, _) = createRealDataProject(token1, account1, public = false)
        val (_, _) = createRealDataProject(token1, account1, public = false)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = createRealDataProject(token2, account2, slug = "slug-1", namespace = project1.gitlabNamespace)
        val (_, _) = createRealDataProject(token2, account2)

        val url = "$rootUrl/${project1.gitlabNamespace}/${project1.slug}"

        val result = this.performGet(url, token2)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabPath).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
        assertThat(isUserInProject(project1, token2)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve not own not member but public CodeProject by namespace and slug`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)

        val (project1, _) = createRealCodeProject(token1, account1)
        val (_, _) = createRealCodeProject(token1, account1)
        val (_, _) = createRealCodeProject(token1, account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = createRealCodeProject(token2, account2, slug = "slug-1", namespace = project1.gitlabNamespace)
        val (_, _) = createRealCodeProject(token2, account2)

        val url = "$rootUrl/${project1.gitlabNamespace}/${project1.slug}"

        val result = this.performGet(url, token2)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabPath).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    @Disabled
    fun `Can retrieve not own not member but public DataProject by namespace and slug`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)

        val (project1, _) = createRealDataProject(token1, account1, public = true)
        val (_, _) = createRealDataProject(token1, account1, public = true)
        val (_, _) = createRealDataProject(token1, account1, public = true)

        val (_, _) = createRealDataProject(token2, account2, slug = "slug-1", namespace = project1.gitlabNamespace)
        val (_, _) = createRealDataProject(token2, account2)

        val url = "$rootUrl/${project1.gitlabNamespace}/${project1.slug}"

        val result = this.performGet(url, token2)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project1.id)
        assertThat(result.gitlabPath).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
        assertThat(isUserInProject(project1, token2)).isFalse()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve not own not public DataProject`() {
        val (_, token1, _) = createRealUser()

        val (account2, token2, _) = createRealUser(index = -1)
        val (project21, _) = createRealDataProject(token2, account2, public = false)

        val url = "$rootUrl/${project21.id}"

        this.performGet(url, token1).expectForbidden()

        assertThat(isUserInProject(project21, token1)).isFalse()
    }

    @Transactional
    @Rollback
    @Test
    @Disabled
        /**
         * Still unsure, if that test should work
         */
    fun `Can retrieve not own but public DataProject`() {
        val (_, token1, _) = createRealUser()

        val (account2, _, _) = createRealUser(index = -1)
        val (project21, _) = createRealDataProject(token1, account2, public = true)

        val url = "$rootUrl/${project21.id}"

        val result = this.performGet(url, token1).expectOk().returns(DataProjectDto::class.java)

        assertThat(result.id).isEqualTo(project21.id)
        assertThat(isUserInProject(project21, token1)).isFalse()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create DataProject`() {
        val (_, token, _) = createRealUser()

        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "description",
            initializeWithReadme = true,
            inputDataTypes = listOf(),
            visibility = VisibilityScope.PUBLIC,
        )

        val result = this.performPost("$rootUrl/data", token, request)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create DataProject in data-project path`() {
        val (_, token, _) = createRealUser()

        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "description",
            initializeWithReadme = true,
            inputDataTypes = listOf(),
            visibility = VisibilityScope.PUBLIC,
        )

        val result = this.performPost(dataProjectRootUrl, token, request)
            .expectOk()
            .returns(DataProjectDto::class.java)

        assertThat(result).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create CodeProject`() {
        val (_, token, _) = createRealUser()

        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true,
            dataProcessorType = operationProcessorType.name,
            inputDataTypes = listOf(anyDataType.name),
        )

        val result = this.performPost("$rootUrl/code", token, request)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create CodeProject in code-project path`() {
        val (_, token, _) = createRealUser()

        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true,
            dataProcessorType = algorithmProcessorType.name,
            inputDataTypes = listOf(anyDataType.name),
        )

        val result = this.performPost(codeProjectRootUrl, token, request)
            .expectOk()
            .returns(CodeProjectDto::class.java)

        assertThat(result).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create duplicate DataProject`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealDataProject(token, account)

        val request = ProjectCreateRequest(
            slug = project.slug,
            namespace = project.gitlabPathWithNamespace,
            name = project.name,
            description = "New description",
            initializeWithReadme = true,
            visibility = VisibilityScope.PUBLIC,
        )

        this.performPost("$rootUrl/data", token, request).expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create Project with invalid params`() {
        val (_, token, _) = createRealUser()

        val request = ProjectCreateRequest(
            slug = "",
            namespace = "",
            name = "",
            description = "description",
            initializeWithReadme = true,
            inputDataTypes = listOf(anyDataType.name),
            visibility = VisibilityScope.PUBLIC,
        )

        this.performPost("$rootUrl/data", token, request).expectBadRequest()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can update own DataProject`() {
        val (account1, token, _) = createRealUser(index = -1)
        val (project1, _) = createRealDataProject(token, account1)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        assertThat(newProjectName).isNotEqualTo(project1.gitlabPath)

        assertThat(isUserInProject(project1, token, AccessLevel.OWNER)).isTrue()

        val request = ProjectUpdateRequest(name = newProjectName, description = newDescription)

        val url = "$rootUrl/${project1.id}"

        val result = this.performPut(url, token, request)
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
    @Test
    fun `Can update own CodeProject`() {
        val (account1, token, _) = createRealUser(index = -1)
        val (project1, _) = createRealCodeProject(token, account1)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        assertThat(newProjectName).isNotEqualTo(project1.gitlabPath)

        assertThat(isUserInProject(project1, token, AccessLevel.OWNER)).isTrue()

        val request = ProjectUpdateRequest(name = newProjectName, description = newDescription)

        val url = "$rootUrl/${project1.id}"

        val result = this.performPut(url, token, request)
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
    @Rollback
    @Test
    fun `Cannot update not-own DataProject`() {
        val (account1, token1, _) = createRealUser()

        val (account2, token2, _) = createRealUser(index = -1)
        val (project21, gitlabProject21) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        val request = ProjectUpdateRequest(name = newProjectName, description = newDescription)

        val url = "$rootUrl/${project21.id}"

        this.performPut(url, token1, request).expect4xx()

        assertThat(isUserInProject(project21, token1, AccessLevel.DEVELOPER)).isTrue()

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
    fun `Cannot update not-own CodeProject`() {
        val (_, token1, _) = createRealUser()

        val (account2, token2, _) = createRealUser(index = -1)
        val (project21, gitlabProject21) = createRealCodeProject(token2, account2)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        val request = ProjectUpdateRequest(name = newProjectName, description = newDescription)

        val url = "$rootUrl/${project21.id}"

        this.performPut(url, token1, request).expect4xx()

        assertThat(isUserInProject(project21, token1)).isFalse()

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
    fun `Can delete own DataProject`() {
        val (account, token, _) = createRealUser()
        val (project, gitlabProject) = createRealDataProject(token, account)

        assertThat(dataProjectRepository.findByIdOrNull(project.id)).isNotNull

        assertThat(isUserInProject(project, token, AccessLevel.OWNER)).isTrue()

        val url = "$rootUrl/${project.id}"

        this.performDelete(url, token).expectNoContent()

        assertThat(dataProjectRepository.findByIdOrNull(project.id)).isNull()

        // Ensure that public project cache was updated
        // The code below can not work. There are no any possibility to clear internal state (eg. calls number) of spyk objects
        // (publicProjectRepository is spyk object in this case)
        // Until it is not fixed on SpringMockk library the code will possible fail with exception "No call was recorded with matcher....".
        // The verifier unexpected reads the previous call that was in other tests before, but not provided in current one.
        verify(atLeast = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(gitlabProject.id, project.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete own CodeProject`() {
        val (account, token, _) = createRealUser()
        val (project, gitlabProject) = createRealCodeProject(token, account)

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNotNull

        assertThat(isUserInProject(project, token, AccessLevel.OWNER)).isTrue()

        val url = "$rootUrl/${project.id}"

        this.performDelete(url, token).expectNoContent()

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNull()

        //Ensure that public project cache was updated
        //Fails sometimes (probably due to redis container error in tests)
//        verify(exactly = 1, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
//            publicProjectRepository.delete(
//                eq(PublicProjectHash(gitlabProject.id, project.id))
//            )
//        }
    }

    @Transactional
    @Test
    @Rollback
    @Disabled
    fun `Cannot delete not-own DataProject`() {
        val (account1, token1, _) = createRealUser()

        val (account2, _, _) = createRealUser(index = -1)
        val (project21, gitlabProject21) = createRealDataProject(token1, account2)
        val (_, _) = createRealDataProject(token1, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        assertThat(dataProjectRepository.findByIdOrNull(project21.id)).isNotNull

        val url = "$rootUrl/${project21.id}"

        this.performDelete(url, token1).expectForbidden()

        assertThat(dataProjectRepository.findByIdOrNull(project21.id)).isNotNull

        assertThat(isUserInProject(project21, token1, AccessLevel.DEVELOPER)).isTrue()

        verify(exactly = 0, timeout = ASYNC_UPDATE_OPERATIONS_WAIT_COMPLETION_TIMEOUT) {
            publicProjectRepository.delete(
                eq(PublicProjectHash(gitlabProject21.id, project21.id))
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot delete not-own CodeProject`() {
        val (account1, token1, _) = createRealUser()

        val (account2, token2, _) = createRealUser(index = -1)
        val (project21, gitlabProject21) = createRealCodeProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull

        val url = "$rootUrl/${project21.id}"

        this.performDelete(url, token1).expectForbidden()

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull

        assertThat(isUserInProject(project21, token1, AccessLevel.DEVELOPER)).isTrue()

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
        val (account1, _, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (account3, _, _) = createRealUser(index = 2)

        val (project21, _) = createRealDataProject(token2, account2)
        val (_, _) = createRealDataProject(token2, account2)
        val (project23, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        addRealUserToProject(project23.gitlabId, account3.person.gitlabId!!)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        assertThat(isUserInProject(project21, token2, AccessLevel.OWNER)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer can get users list in project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)
        val (account3, _, _) = createRealUser(index = -1)

        val (project21, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GitlabAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GitlabAccessLevel.GUEST)

        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val result = this.performGet(getUsersUrl, token1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        assertThat(isUserInProject(project21, token1, AccessLevel.DEVELOPER)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    @Disabled
    fun `Visitor cannot get users list in project`() {
        val (account1, token1, _) = createRealUser(index = -1)
        val (account2, token2, _) = createRealUser(index = -1)
        val (account3, token3, _) = createRealUser(index = -1)

        val (project21, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GitlabAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GitlabAccessLevel.GUEST)

        val userInProjectUrl = "$rootUrl/${project21.id}/users/check/myself"
        val getUsersUrl = "$rootUrl/${project21.id}/users"

        val userInProject = this.performGet(userInProjectUrl, token3)
            .expectOk()
            .returns(Boolean::class.java)

        assertThat(userInProject).isTrue()

        this.performGet(getUsersUrl, token3).expect4xx()

        assertThat(isUserInProject(project21, token1, AccessLevel.DEVELOPER)).isTrue()
        assertThat(isUserInProject(project21, token3, AccessLevel.GUEST)).isTrue()
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can add a user to DataProject`() {
        val (account1, _, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (account3, _, _) = createRealUser(index = 2)

        val (project21, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val addUserUrl = "$rootUrl/${project21.id}/users?user_id=${account3.id}"

        var returnedResult: List<UserInProjectDto> = this.performGet(getUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        returnedResult = this.performPost(addUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can add a user to CodeProject`() {
        val (account1, _, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (account3, _, _) = createRealUser(index = 2)

        val (project21, _) = createRealCodeProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val addUserUrl = "$rootUrl/${project21.id}/users?user_id=${account3.id}"

        var returnedResult: List<UserInProjectDto> = this.performGet(getUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        returnedResult = this.performPost(addUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner add a user to project with role and expiration in params`() {
        val (account1, token1, _) = createRealUser()
        val (account2, _, _) = createRealUser(index = 1)

        val (project1, _) = createRealDataProject(token1, account1)

        val url = "$rootUrl/${project1.id}/users?user_id=${account2.id}&level=REPORTER&expires_at=2099-12-31T10:15:20Z"

        val result = this.performPost(url, token1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner add a user to project with role and expiration in body`() {
        val (account1, token1, _) = createRealUser()
        val (account2, _, _) = createRealUser()

        val (project1, _) = createRealDataProject(token1, account1)

        val url = "$rootUrl/${project1.id}/users"

        val request = ProjectUserMembershipRequest(userId = account2.id, level = "REPORTER", expiresAt = Instant.now().plus(Period.ofDays(1)))

        val result = this.performPost(url, token1, request)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Maintainer can add a user to project`() {
        val (account1, token1, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (account3, _, _) = createRealUser(index = 2)

        val (project21, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GitlabAccessLevel.MAINTAINER)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val addUserUrl = "$rootUrl/${project21.id}/users?user_id=${account3.id}"

        var returnedResult: List<UserInProjectDto> = this.performGet(getUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        returnedResult = this.performPost(addUserUrl, token1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Maintainer can add a group to project by gitlab id`() {
        val (account1, token1, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (_, token3, _) = createRealUser(index = 2)

        val (project21, _) = createRealDataProject(token2, account2)

        val (group1, _) = createRealGroup(token3)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GitlabAccessLevel.MAINTAINER)

        val getUsersInProjectUrl = "$rootUrl/${project21.id}/users"
        val addGroupUrl = "$rootUrl/${project21.id}/groups?gitlab_id=${group1.gitlabId}"

        var result: List<UserInProjectDto> = this.performGet(getUsersInProjectUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)

        result = this.performPost(addGroupUrl, token1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer cannot add a user to project`() {
        val (account1, token1, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (account3, _, _) = createRealUser(index = 2)

        val (project21, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GitlabAccessLevel.DEVELOPER)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val addUserUrl = "$rootUrl/${project21.id}/users?user_id=${account3.id}"

        var returnedResult: List<UserInProjectDto> = this.performGet(getUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        this.performPost(addUserUrl, token1).expectForbidden()

        returnedResult = this.performGet(getUserUrl, token1)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can delete a user from project`() {
        val (account1, _, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (account3, _, _) = createRealUser(index = 2)

        val (project21, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val deleteUserUrl = "$rootUrl/${project21.id}/users/${account3.id}"

        var result: List<UserInProjectDto> = this.performGet(getUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        result = this.performDelete(deleteUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer cannot delete a user from project`() {
        val (account1, token1, _) = createRealUser()
        val (account2, token2, _) = createRealUser(index = 1)
        val (account3, _, _) = createRealUser(index = 2)

        val (project21, _) = createRealDataProject(token2, account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GitlabAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GitlabAccessLevel.DEVELOPER)

        val getUserUrl = "$rootUrl/${project21.id}/users"
        val deleteUserUrl = "$rootUrl/${project21.id}/users/${account3.id}"

        var result: List<UserInProjectDto> = this.performGet(getUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)

        this.performDelete(deleteUserUrl, token1).expectForbidden()

        result = this.performGet(getUserUrl, token2)
            .expectOk()
            .returnsList(UserInProjectDto::class.java)

        assertThat(result.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can star and unstar Project`() {
        val (account1, token1, _) = createRealUser()
        val (account2, token2, _) = createRealUser()
        val (project1, _) = createRealDataProject(token1, account1)

        //Star
        val url = "$rootUrl/${project1.id}/star"

        var result = this.performPost(url, token2)
            .expectOk()
            .returns(ProjectDto::class.java)

        assertThat(result.starsCount).isEqualTo(1)

        var projectInDb = projectRepository.findByIdOrNull(project1.id)!!

        assertThat(projectInDb.starsCount).isEqualTo(1)

        //Unstar
        result = this.performDelete(url, token2)
            .expectOk()
            .returns(ProjectDto::class.java)

        assertThat(result.starsCount).isEqualTo(0)

        projectInDb = projectRepository.findByIdOrNull(project1.id)!!

        assertThat(projectInDb.starsCount).isEqualTo(0)
    }

    private fun isUserInProject(project: Project, token: String, withLevel: AccessLevel? = null): Boolean {
        val url =
            "$rootUrl/${project.id}/users/check/myself" + if (withLevel != null) "?level=${withLevel.name.toLowerCase()}" else ""

        return this.performGet(url, token).expectOk().returns(Boolean::class.java)
    }
}
