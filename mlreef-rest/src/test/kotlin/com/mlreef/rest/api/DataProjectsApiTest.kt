package com.mlreef.rest.api

import com.fasterxml.jackson.core.type.TypeReference
import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.DataProjectCreateRequest
import com.mlreef.rest.api.v1.DataProjectUserMembershipRequest
import com.mlreef.rest.api.v1.ProjectUpdateRequest
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabBadRequestException
import com.mlreef.rest.feature.project.DataProjectService
import com.mlreef.rest.feature.system.SessionsService
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.testcommons.RestResponsePage
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
import org.springframework.restdocs.request.RequestDocumentation
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.Instant
import java.time.Period
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProjectsApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/data-projects"
    private lateinit var subject: Person
    private lateinit var subject2: Person
    private lateinit var account2: Account

    @Autowired
    private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var sessionService: SessionsService

    @Autowired
    private lateinit var searchableTagRepository: SearchableTagRepository

    @SpykBean
    private lateinit var dataProjectService: DataProjectService

    @BeforeEach
    @AfterEach
    fun setUp() {
        codeProjectRepository.deleteAll()
        dataProjectRepository.deleteAll()

        accountSubjectPreparationTrait.apply()
        account = accountSubjectPreparationTrait.account
        account2 = accountSubjectPreparationTrait.account2
        subject = accountSubjectPreparationTrait.subject
        subject2 = accountSubjectPreparationTrait.subject2

        // To update user permissions before each test
        sessionService.killAllSessions("username0000")

    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can create DataProject`() {
        val request = DataProjectCreateRequest("test-project", "mlreef", "Test project", "description", true, VisibilityScope.PUBLIC)

        this.mockGetUserProjectsList(account)

        val returnedResult = this
            .performPost(rootUrl, account, body = request)
            .checkStatus(HttpStatus.OK)
            .document("dataprojects-create",
                requestFields(dataProjectCreateRequestFields()),
                responseFields(dataProjectResponseFields()))
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create duplicate DataProject`() {
        every {
            restClient.createProject(any(), any(), any(), any(), any(), any(), any(), any(), any(), any())
        } answers {
            throw GitlabBadRequestException("", ErrorCode.Conflict, "")
        }

        this.mockGetUserProjectsList(account)

        val request = DataProjectCreateRequest("test-project", "mlreef", "Test project", "description", true, VisibilityScope.PUBLIC)
        this.performPost(rootUrl, account, body = request).andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create DataProject with invalid params`() {
        every {
            restClient.createProject(any(), any(), any(), any(), any(), any(), any(), any(), any(), any())
        } answers {
            throw GitlabBadRequestException("", ErrorCode.GitlabCommonError, "")
        }

        this.mockGetUserProjectsList(account)

        val request = DataProjectCreateRequest("", "", "", "description", true, VisibilityScope.PUBLIC)
        this.performPost(rootUrl, account, body = request)
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own DataProjects only`() {
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", subject.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", "description", randomUUID(), "mlreef", "project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project3.id), account, AccessLevel.OWNER)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-all",
                responseFields(dataProjectResponseFields("[]."))
            )
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all public DataProject `() {
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", subject.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", "description", randomUUID(), "mlreef", "project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id), account, AccessLevel.OWNER)
        mockGitlabPublicProjects(project1, project2, project3)

        val returnedResult: RestResponsePage<DataProjectDto> =
            this.performGet("$rootUrl/public", null)
                .expectOk()
                .document("dataprojects-retrieve-public",
                    responseFields(
                        dataProjectResponseFields("content[].").apply {
                            this.addAll(pageable())
                        }
                    )
                )
                .returns()
        assertThat(returnedResult.content.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProject by id`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", subject.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", "description", subject.id, "mlreef", "project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-one", responseFields(dataProjectResponseFields()))
            .returns(DataProjectDto::class.java)


        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProject by slug`() {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val id3 = randomUUID()
        val id4 = randomUUID()
        val id5 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(id2, "slug-2", "www.url.net", "Test Project 2", "description", subject.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(id3, "slug-3", "www.url.xyz", "Test Project 3", "description", subject2.id, "mlreef", "project-3", 3, VisibilityScope.PUBLIC, listOf())
        val project4 = DataProject(id4, "slug-1", "www.url.xyz", "Test Project 4", "description", subject2.id, "mlreef", "project-4", 4, VisibilityScope.PUBLIC, listOf())
        val project5 = DataProject(id5, "slug-1", "www.url.xyz", "Test Project 5", "description", subject2.id, "mlreef", "project-5", 5, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)
        dataProjectRepository.save(project4)
        dataProjectRepository.save(project5)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project5.id), account, AccessLevel.MAINTAINER)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/slug/slug-1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-all", responseFields(dataProjectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

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
    fun `Can retrieve specific own and guest DataProjects by namespace`() {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val id3 = randomUUID()
        val id4 = randomUUID()
        val id5 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(id2, "slug-2", "www.url.net", "Test Project 2", "description", subject.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(id3, "slug-3", "www.url.xyz", "Test Project 3", "description", subject2.id, "mlreef", "project-3", 3, VisibilityScope.PUBLIC, listOf())
        val project4 = DataProject(id4, "slug-4", "www.url.xyz", "Test Project 4", "description", subject2.id, "mlreef", "project-4", 4, VisibilityScope.PUBLIC, listOf())
        val project5 = DataProject(id5, "slug-5", "www.url.xyz", "Test Project 5", "description", subject2.id, "mlreef", "project-5", 5, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)
        dataProjectRepository.save(project4)
        dataProjectRepository.save(project5)

        this.mockGetUserProjectsList2(hashMapOf(
            project1.id to AccessLevel.OWNER,
            project2.id to AccessLevel.OWNER,
            project5.id to AccessLevel.GUEST
        ), account)

        val returnedResult: List<DataProjectDto> = this
            .performGet("$rootUrl/namespace/mlreef", account)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-all", responseFields(dataProjectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

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
    fun `Can retrieve specific own DataProject by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", subject.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", "description", subject2.id, "mlreef", "project-3", 3, VisibilityScope.PUBLIC, listOf())
        val project4 = DataProject(randomUUID(), "slug-1", "www.url.xyz", "Test Project 4", "description", subject2.id, "mlreef", "project-4", 4, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)
        dataProjectRepository.save(project4)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id), account, AccessLevel.OWNER)

        val returnedResult: DataProjectDto = this.performGet("$rootUrl/mlreef/project-1", account)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-one", responseFields(dataProjectResponseFields()))
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve specific not own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", "description", subject.id, "mlreef", "group2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(id1, "slug-3", "www.url.xyz", "Test Project 3", "description", randomUUID(), "mlreef", "group3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id), account, AccessLevel.OWNER)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        val tag = searchableTagRepository.save(SearchableTag(randomUUID(), "TAG"))

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)
        this.mockGitlabUpdateProject()

        val request = ProjectUpdateRequest(
            "New Test project",
            "new description",
            inputDataTypes = listOf(DataType.IMAGE, DataType.TIME_SERIES),
            outputDataTypes = listOf(DataType.MODEL),
            tags = listOf(tag))

        val returnedResult = this.performPut("$rootUrl/$id1", account, body = request)
            .expectOk().document("dataprojects-update",
                requestFields(projectUpdateRequestFields()),
                responseFields(dataProjectResponseFields()))
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult.name).isEqualTo("New Test project")
        assertThat(returnedResult.inputDataTypes).containsAll(listOf(DataType.IMAGE, DataType.TIME_SERIES))
        assertThat(returnedResult.outputDataTypes).containsAll(listOf(DataType.MODEL))
        assertThat(returnedResult.tags[0].name).isEqualTo("TAG")
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot update not-own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.NONE)
        this.mockGetUserProjectsList(account)

        val request = ProjectUpdateRequest("New Test project", "description")

        this.performPut("$rootUrl/$id1", account, body = request)
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", subject.id, "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNotNull()
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isNoContent)
            .document("dataprojects-delete")

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot delete not-own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "desc", randomUUID(), "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.MAINTAINER)

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNotNull()
        this.performDelete("$rootUrl/$id1", account)
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve users list in DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "100 tests", randomUUID(), "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        every { dataProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)
        this.mockGetUserProjectsList(listOf(project1.id), account2, AccessLevel.DEVELOPER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project1.id}/users")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-users-list", responseFields(usersInDataProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to DataProject by userId in path`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "100 tests", randomUUID(), "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        every { dataProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post("$rootUrl/${project1.id}/users/${account2.id}")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-add-user", responseFields(usersInDataProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to DataProject by gitlabId in param`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "100 tests", randomUUID(), "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        every { dataProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post("$rootUrl/${project1.id}/users?gitlab_id=${account2.person.gitlabId}")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-add-user-by-params",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    RequestDocumentation.parameterWithName("gitlab_id").optional().description("Gitlab user id - Number")
                ),
                responseFields(usersInDataProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to DataProject by gitlabId in body`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "", account2.person.id, "group1", "project-1", 1)
        dataProjectRepository.save(project1)

        every { dataProjectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val request = DataProjectUserMembershipRequest(userId = account2.id, gitlabId = 10, level = "REPORTER", expiresAt = Instant.now().plus(Period.ofDays(1)))

        val url = "$rootUrl/${project1.id}/users"

        val returnedResult: List<UserInProjectDto> = this.performPost(url, account, request)
            .expectOk()
            .document("dataprojects-add-user-by-body",
                requestFields(dataProjectAddEditUserRequestFields()),
                responseFields(usersInDataProjectResponseFields("[].")))
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete user from DataProject by userId in path`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "100 tests", randomUUID(), "mlreef", "group1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        every { dataProjectService.getUsersInProject(any()) } answers {
            listOf(account).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/${project1.id}/users/${account2.id}")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-delete-user", responseFields(usersInDataProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete user from DataProject by gitlabId in param`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "100 tests", randomUUID(), "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        every { dataProjectService.getUsersInProject(any()) } answers {
            listOf(account).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/${project1.id}/users?gitlab_id=${account2.person.gitlabId}")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-delete-user-by-params",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    RequestDocumentation.parameterWithName("gitlab_id").optional().description("Gitlab user id - Number")
                ),
                responseFields(usersInDataProjectResponseFields("[].")))
            .returns(object : TypeReference<List<UserInProjectDto>>() {})

        assertThat(returnedResult.size).isEqualTo(1)
    }

    private fun dataProjectResponseFields(prefix: String = ""): MutableList<FieldDescriptor> {
        return projectResponseFields(prefix).toMutableList().apply {
            this.add(fieldWithPath(prefix + "experiments").type(JsonFieldType.ARRAY)
                .optional().description("List of experiments inside the project (empty on creation)"))
        }
    }

    private fun dataProjectCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Valid slug of Project (matches Gitlab)"),
            fieldWithPath("namespace").type(JsonFieldType.STRING).description("Gitlab group or user namespace"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project"),
            fieldWithPath("description").type(JsonFieldType.STRING).description("Description of Project"),
            fieldWithPath("initialize_with_readme").type(JsonFieldType.BOOLEAN).description("Boolean flag, if that Project should have an automatic commit for a README"),
            fieldWithPath("visibility").type(JsonFieldType.STRING).description("Visibility, can be 'PUBLIC', 'INTERNAL', 'PRIVATE'")
        )
    }

    fun dataProjectAddEditUserRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("user_id").type(JsonFieldType.STRING).optional().description("User id"),
            fieldWithPath("gitlab_id").type(JsonFieldType.NUMBER).optional().description("Gitlab user id"),
            fieldWithPath("level").type(JsonFieldType.STRING).optional().description("Role/Level of user in project"),
            fieldWithPath("expires_at").type(JsonFieldType.STRING).optional().description("Expiration date")
        )
    }


    fun usersInDataProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Data project id"),
            fieldWithPath(prefix + "user_name").type(JsonFieldType.STRING).description("User name"),
            fieldWithPath(prefix + "email").type(JsonFieldType.STRING).description("User's email"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab"),
            fieldWithPath(prefix + "access_level").type(JsonFieldType.STRING).description("Role"),
            fieldWithPath(prefix + "expired_at").type(JsonFieldType.STRING).optional().description("Access expires at")
        )
    }
}
