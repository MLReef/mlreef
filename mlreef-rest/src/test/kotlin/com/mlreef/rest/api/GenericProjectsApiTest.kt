package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.external_api.gitlab.dto.GitlabProjectSimplified
import com.mlreef.rest.feature.system.SessionsService
import com.mlreef.rest.testcommons.RestResponsePage
import io.mockk.every
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class GenericProjectsApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/projects"
    private lateinit var account2: Account
    private lateinit var subject: Person
    private lateinit var subject2: Person

    @Autowired private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait
    @Autowired private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var sessionService: SessionsService

    @BeforeEach
    @AfterEach
    fun setUp() {
        codeProjectRepository.deleteAll()
        dataProjectRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()

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
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Projects only`() {
        val ids = mockSomeProjects()
        val (id1, id2, _, id4, _) = ids

        val returnedResult: List<ProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("genericprojects-retrieve-all", responseFields(projectResponseFields("[].")))
            .returnsList(ProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id,
            returnedResult.get(2).id
        )

        val assertSlugs = listOf("project-1", "project-2", "project-4")
        val assertIds = listOf(id1, id2, id4)
        assertThat(setOfIds).containsExactlyInAnyOrder(*assertIds.toTypedArray())
        assertThat(returnedResult.get(0).id).isIn(assertIds)
        assertThat(returnedResult.get(0).gitlabPath).isIn(assertSlugs)
        assertThat(returnedResult.get(1).id).isIn(assertIds)
        assertThat(returnedResult.get(1).gitlabPath).isIn(assertSlugs)
        assertThat(returnedResult.get(2).id).isIn(assertIds)
        assertThat(returnedResult.get(2).gitlabPath).isIn(assertSlugs)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all public Projects `() {
        val ids = mockSomeProjects()
        val (id1, id2, id3, id4, _) = ids

        val returnedResult: RestResponsePage<ProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/public")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document(
                "genericprojects-retrieve-public",
                responseFields(
                    projectResponseFields("content[].").apply {
                        this.addAll(pageable())
                    }
                )
            )
            .returns()

        val content = returnedResult.content
        assertThat(content.size).isEqualTo(4)

        val setOfIds = setOf(
            content.get(0).id,
            content.get(1).id,
            content.get(2).id,
            content.get(3).id
        )

        val assertIds = listOf(id1, id2, id3, id4)
        assertThat(setOfIds).containsExactlyInAnyOrder(*assertIds.toTypedArray())
        assertThat(content.get(0).id).isIn(assertIds)
        assertThat(content.get(1).id).isIn(assertIds)
        assertThat(content.get(2).id).isIn(assertIds)
        assertThat(content.get(3).id).isIn(assertIds)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific Project by id`() {
        val ids = mockSomeProjects()
        val (id1, _, _, _, _) = ids

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("genericprojects-retrieve-one",
                responseFields(projectResponseFields()))
            .returns(DataProjectDto::class.java)


        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

//    @Transactional
//    @Rollback
//    @Test
//    @Tag(TestTags.RESTDOC)
//    fun `Can retrieve specific own CodeProject by id`() {
//        val ids = mockSomeProjects()
//        val (id1, _, _, _, _) = ids
//
//        val returnedResult: CodeProjectDto = this.mockMvc.perform(
//            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
//            .andExpect(MockMvcResultMatchers.status().isOk)
//            .andDo(MockMvcRestDocumentation.document(
//                "genericprojects-retrieve-one",
//                responseFields(projectResponseFields())))
//            .andReturn().let {
//                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
//            }
//
//        assertThat(returnedResult.id).isEqualTo(id1)
//        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
//    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Projects by slug`() {
        val ids = mockSomeProjects()
        val (id1, _, _, _, _) = ids

        val returnedResult: List<ProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/slug/project-1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("genericprojects-retrieve-by-slug", responseFields(projectResponseFields("[].")))
            .returnsList(ProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(1)
        assertThat(returnedResult.get(0).id).isEqualTo(id1)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Project by namespace`() {
        val ids = mockSomeProjects()
        val (id1, id2, _, id4, _) = ids

        val returnedResult: List<ProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/subject1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("genericprojects-retrieve-by-namespace", responseFields(projectResponseFields("[].")))
            .returnsList(ProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id,
            returnedResult.get(2).id
        )

        val assertSlugs = listOf("project-1", "project-2", "project-4")
        val assertIds = listOf(id1, id2, id4)
        assertThat(setOfIds).containsExactlyInAnyOrder(*assertIds.toTypedArray())
        assertThat(returnedResult.get(0).id).isIn(assertIds)
        assertThat(returnedResult.get(0).gitlabPath).isIn(assertSlugs)
        assertThat(returnedResult.get(1).id).isIn(assertIds)
        assertThat(returnedResult.get(1).gitlabPath).isIn(assertSlugs)
        assertThat(returnedResult.get(2).id).isIn(assertIds)
        assertThat(returnedResult.get(2).gitlabPath).isIn(assertSlugs)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Project by namespace and slug`() {
        val ids = mockSomeProjects()
        val (id1, _, _, _, _) = ids

        val returnedResult: ProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/subject1/project-1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("genericprojects-retrieve-by-namespace-slug", responseFields(projectResponseFields()))
            .returns(ProjectDto::class.java)

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve specific not own Project`() {
        val ids = mockSomeProjects()
        val (_, _, _, _, id5) = ids

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id5")))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    private fun mockSomeProjects(): List<UUID> {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val id3 = randomUUID()
        val id4 = randomUUID()
        val id5 = randomUUID()
        val id6 = randomUUID()

        val project1 = DataProject(id1, "project-1", "www.url.com", "Test Project 1", "description", subject.id, "subject1", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(id2, "project-2", "www.url.net", "Test Project 2", "description", subject.id, "subject1", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(id3, "project-1", "www.url.xyz", "Test Project 3", "description", subject2.id, "subject2", "project-1", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(id4, "project-4", "www.url.com", "Test Code Project 1", "description", subject.id, "subject1", "project-4", 4, VisibilityScope.PUBLIC)
        val project5 = CodeProject(id5, "project-2", "www.url.net", "Test Code Project 2", "description", subject2.id, "subject2", "project-2", 5)
        val project6 = CodeProject(id6, "project-3", "www.url.xyz", "Test Code Project 3", "description", subject2.id, "subject2", "project-3", 6)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id), account, AccessLevel.OWNER)
        mockGitlabPublicProjects(project1, project2, project3, project4)

        every {
            restClient.unauthenticatedGetAllPublicProjects()
        } returns listOf(project1, project2, project3, project4).map {
            GitlabProjectSimplified(
                id = it.gitlabId,
                name = it.name,
                nameWithNamespace = null,
                path = it.gitlabPath,
                pathWithNamespace = it.gitlabPathWithNamespace
            )
        }

        return listOf(id1, id2, id3, id4, id5, id6)
    }

}
