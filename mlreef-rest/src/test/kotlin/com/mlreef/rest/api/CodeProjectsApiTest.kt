package com.mlreef.rest.api

import com.fasterxml.jackson.core.type.TypeReference
import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.CodeProjectCreateRequest
import com.mlreef.rest.api.v1.CodeProjectUpdateRequest
import com.mlreef.rest.api.v1.CodeProjectUserMembershipRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabBadRequestException
import com.mlreef.rest.feature.project.CodeProjectService
import com.mlreef.rest.feature.system.SessionsService
import com.ninjasquad.springmockk.SpykBean
import io.mockk.every
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.Instant
import java.time.Period
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class CodeProjectsApiTest : AbstractRestApiTest() {

    private lateinit var subject: Person
    private lateinit var account2: Account

    @Autowired
    private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var sessionService: SessionsService

    @SpykBean
    private lateinit var codeProjectService: CodeProjectService

    val rootUrl = "/api/v1/code-projects"

    @BeforeEach
    @AfterEach
    fun setUp() {
        codeProjectRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()

        accountSubjectPreparationTrait.apply()
        subject = accountSubjectPreparationTrait.subject

        account = accountSubjectPreparationTrait.account
        account2 = accountSubjectPreparationTrait.account2

        // To update user permissions before each test
        sessionService.killAllSessions("username0000")

        mockGetUserProjectsList(account)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create CodeProject`() {
        val request = CodeProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )
        val returnedResult = this.performPost(rootUrl, account, body = request)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-create",
                requestFields(codeProjectCreateRequestFields()),
                responseFields(projectResponseFields()))
            .returns(CodeProjectDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create duplicate CodeProject`() {
        every {
            restClient.createProject(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any()
            )
        } answers {
            throw GitlabBadRequestException("", ErrorCode.Conflict, "")
        }

        val request = CodeProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create CodeProject with invalid params`() {
        every {
            restClient.createProject(any(), any(), any(), any(), any(), any(), any(), any(), any(), any())
        } answers {
            throw GitlabBadRequestException("", ErrorCode.Conflict, "")
        }

        mockGetUserProjectsList(account)

        val request = CodeProjectCreateRequest(
            slug = "",
            namespace = "",
            name = "",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )
        this.performPost(rootUrl, account, body = request)
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own CodeProjects only`() {
        val project1 = CodeProject(randomUUID(), "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", "description", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id), account, AccessLevel.OWNER)
        // TODO: now we can add more tests for visibility :)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-retrieve-all", responseFields(projectResponseFields("[].")))
            .returnsList(CodeProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own CodeProject by id`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", "description", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id), account, AccessLevel.OWNER)

        val returnedResult: CodeProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-retrieve-one", responseFields(projectResponseFields()))
            .returns(CodeProjectDto::class.java)

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own CodeProject by slug`() {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val id3 = randomUUID()
        val id4 = randomUUID()
        val id5 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(id2, "slug-2", "www.url.net", "Test Project 2", "description", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(id3, "slug-3", "www.url.xyz", "Test Project 3", "description", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        val project4 = CodeProject(id4, "slug-1", "www.url.xyz", "Test Project 4", "description", account2.person.id, "group4", "project-4", "mlreef/project4", 4)
        val project5 = CodeProject(id5, "slug-1", "www.url.xyz", "Test Project 5", "description", account2.person.id, "group5", "project-5", "mlreef/project5", 5)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/slug/slug-1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-retrieve-all", responseFields(projectResponseFields("[].")))
            .returnsList(CodeProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(id1, id5)
        assertThat(returnedResult.get(0).id).isIn(id1, id5)
        assertThat(returnedResult.get(0).gitlabPath).isIn("project-1", "project-5")
        assertThat(returnedResult.get(1).id).isIn(id1, id5)
        assertThat(returnedResult.get(1).gitlabPath).isIn("project-1", "project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own CodeProject by namespace`() {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val id3 = randomUUID()
        val id4 = randomUUID()
        val id5 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(id2, "slug-2", "www.url.net", "Test Project 2", "description", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(id3, "slug-3", "www.url.xyz", "Test Project 3", "description", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        val project4 = CodeProject(id4, "slug-4", "www.url.abc", "Test Project 4", "description", account2.person.id, "group4", "project-4", "mlreef/project4", 4)
        val project5 = CodeProject(id5, "slug-5", "www.url.org", "Test Project 5", "description", account2.person.id, "group5", "project-5", "mlreef/project5", 5)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/mlreef")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-retrieve-all", responseFields(projectResponseFields("[].")))
            .returnsList(CodeProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id,
            returnedResult.get(2).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(id1, id2, id5)
        assertThat(returnedResult.get(0).id).isIn(id1, id2, id5)
        assertThat(returnedResult.get(0).gitlabPath).isIn("project-1", "project-2", "project-5")
        assertThat(returnedResult.get(1).id).isIn(id1, id2, id5)
        assertThat(returnedResult.get(1).gitlabPath).isIn("project-1", "project-2", "project-5")
        assertThat(returnedResult.get(2).id).isIn(id1, id2, id5)
        assertThat(returnedResult.get(2).gitlabPath).isIn("project-1", "project-2", "project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own CodeProject by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", "description", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        val project4 = CodeProject(randomUUID(), "slug-1", "www.url.xyz", "Test Project 4", "description", account2.person.id, "group4", "project-4", "mlreef/project4", 4)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)
        codeProjectRepository.save(project4)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id), account, AccessLevel.OWNER)

        val returnedResult: CodeProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/mlreef/project1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-retrieve-one", responseFields(projectResponseFields()))
            .returns(CodeProjectDto::class.java)


        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve specific not own CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(randomUUID(), "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(id1, "slug-3", "www.url.xyz", "Test Project 3", "description", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id), account, AccessLevel.OWNER)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project3", 1)
        codeProjectRepository.save(project1)

        mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)
        mockGitlabUpdateProject()

        val request = CodeProjectUpdateRequest("New Test project", "new description")

        val returnedResult = this.performPut("$rootUrl/$id1", account, body = request)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-update",
                requestFields(codeProjectUpdateRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(CodeProjectDto::class.java)

        assertThat(returnedResult.name).isEqualTo("New Test project")
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot update not-own CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        val request = CodeProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "New Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/$id1"))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete own CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNotNull()
        this.performDelete("$rootUrl/$id1", account)
            .checkStatus(HttpStatus.NO_CONTENT)
            .document("codeprojects-delete")

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot delete not-own CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.GUEST)

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNotNull()
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve users list in CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        every { codeProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)
        this.mockGetUserProjectsList(listOf(project1.id), account2, AccessLevel.DEVELOPER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project1.id}/users")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-retrieve-users-list", responseFields(usersInCodeProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to CodeProject by userId in path`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        every { codeProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post("$rootUrl/${project1.id}/users/${account2.id}")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-add-user", responseFields(usersInCodeProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to CodeProject by gitlabId in params`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        every { codeProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post("$rootUrl/${project1.id}/users?gitlab_id=${account2.person.gitlabId}&level=DEVELOPER&expires_at=2099-12-31T10:15:20Z")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-add-user-by-params",
                requestParameters(
                    parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    parameterWithName("gitlab_id").optional().description("Gitlab user id - Number"),
                    parameterWithName("level").optional().description("Level/role of user in project"),
                    parameterWithName("expires_at").optional().description("Date of access expiration in ISO format (not passed value means unlimited access)")
                ),
                responseFields(usersInCodeProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to CodeProject by gitlabId in body`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        every { codeProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val request = CodeProjectUserMembershipRequest(userId = account2.id, gitlabId = 10, level = "REPORTER", expiresAt = Instant.now().plus(Period.ofDays(1)))

        val url = "$rootUrl/${project1.id}/users"

        val returnedResult: List<UserInProjectDto> = this.performPost(url, account, request)
            .expectOk()
            .document("codeprojects-add-user-by-body",
                requestFields(codeProjectAddEditUserRequestFields()),
                responseFields(usersInCodeProjectResponseFields("[].")))
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }


    @Transactional
    @Rollback
    @Test
    fun `Can delete user from CodeProject by userId in path`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        every { codeProjectService.getUsersInProject(any()) } answers {
            listOf(account).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/${project1.id}/users/${account2.id}")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-delete-user",
                responseFields(usersInCodeProjectResponseFields("[].")))
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete user from CodeProject by gitlabId in param`() {
        val id1 = randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", "", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        every { codeProjectService.getUsersInProject(any()) } answers {
            listOf(account).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/${project1.id}/users?gitlab_id=${account2.person.gitlabId}")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-delete-user-by-params",
                requestParameters(
                    parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    parameterWithName("gitlab_id").optional().description("Gitlab user id - Number")
                ),
                responseFields(usersInCodeProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(1)
    }


    fun codeProjectCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Valid slug of Project (matches Gitlab)"),
            fieldWithPath("namespace").type(JsonFieldType.STRING).description("Gitlab group or user namespace"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project"),
            fieldWithPath("description").type(JsonFieldType.STRING).description("Description of Project"),
            fieldWithPath("initialize_with_readme").type(JsonFieldType.BOOLEAN).description("Boolean flag, if that Project should have an automatic commit for a README"),
            fieldWithPath("visibility").type(JsonFieldType.STRING).description("Visibility, can be 'PUBLIC', 'INTERNAL', 'PRIVATE'")
        )
    }

    fun codeProjectUpdateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("description").type(JsonFieldType.STRING).description("Description of Project"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project")
        )
    }

    fun codeProjectAddEditUserRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("user_id").type(JsonFieldType.STRING).optional().description("User id"),
            fieldWithPath("gitlab_id").type(JsonFieldType.NUMBER).optional().description("Gitlab user id"),
            fieldWithPath("level").type(JsonFieldType.STRING).optional().description("Role/Level of user in project"),
            fieldWithPath("expires_at").type(JsonFieldType.STRING).optional().description("Expiration date")
        )
    }

    fun usersInCodeProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Code project id"),
            fieldWithPath(prefix + "user_name").type(JsonFieldType.STRING).description("User name"),
            fieldWithPath(prefix + "email").type(JsonFieldType.STRING).description("User's email"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab"),
            fieldWithPath(prefix + "access_level").type(JsonFieldType.STRING).description("Role"),
            fieldWithPath(prefix + "expired_at").type(JsonFieldType.STRING).optional().description("Access expires at")
        )
    }
}
