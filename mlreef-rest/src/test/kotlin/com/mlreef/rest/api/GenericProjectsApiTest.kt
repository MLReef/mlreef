package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.feature.system.SessionsService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
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
//        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own DataProjects and CodeProjects only`() {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val id3 = randomUUID()
        val id4 = randomUUID()
        val id5 = randomUUID()
        val id6 = randomUUID()

        //FIXME hard to maintain
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", subject.id, "group1", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(id2, "slug-2", "www.url.net", "Test Project 2", subject.id, "group2", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(id3, "slug-3", "www.url.xyz", "Test Project 3", subject2.id, "group3", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(id4, "slug-4", "www.url.com", "Test Code Project 1", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(id5, "slug-5", "www.url.net", "Test Code Project 2", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(id6, "slug-6", "www.url.xyz", "Test Code Project 3", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("codeprojects-retrieve-all", responseFields(genericProjectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(4)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id,
            returnedResult.get(2).id,
            returnedResult.get(3).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(id1, id2, id4, id5)
        assertThat(returnedResult.get(0).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(0).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
        assertThat(returnedResult.get(1).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(1).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
        assertThat(returnedResult.get(2).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(2).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
        assertThat(returnedResult.get(3).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(3).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProject by id`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", subject.id, "mlreef", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", subject2.id, "mlreef", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(randomUUID(), "slug-5", "www.url.net", "Test Code Project 5", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(randomUUID(), "slug-6", "www.url.xyz", "Test Code Project 6", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

//        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(
//            restClient,
//            listOf(project1.gitlabId, project2.gitlabId, project4.gitlabId, project5.gitlabId),
//            subject.gitlabId!!,
//            listOf(GroupAccessLevel.OWNER, GroupAccessLevel.OWNER, GroupAccessLevel.OWNER, GroupAccessLevel.OWNER))
//
//        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(
//            restClient,
//            listOf(project3.gitlabId, project6.gitlabId),
//            subject2.gitlabId!!,
//            listOf(GroupAccessLevel.OWNER, GroupAccessLevel.OWNER))

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("genericprojects-retrieve-one",
                responseFields(genericProjectResponseFields()))
            .returns(DataProjectDto::class.java)


        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabProject).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own CodeProject by id`() {
        val id1 = randomUUID()
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Data Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", subject.id, "mlreef", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", subject2.id, "mlreef", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(id1, "slug-5", "www.url.net", "Test Code Project 5", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(randomUUID(), "slug-6", "www.url.xyz", "Test Code Project 6", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: CodeProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "genericprojects-retrieve-one",
                responseFields(genericProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabProject).isEqualTo("project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProjects and CodeProjects by slug`() {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", subject.id, "mlreef", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", subject2.id, "mlreef", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(randomUUID(), "slug-2", "www.url.com", "Test Code Project 4", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(id2, "slug-1", "www.url.net", "Test Code Project 5", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(randomUUID(), "slug-1", "www.url.xyz", "Test Code Project 6", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/slug/slug-1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-all", responseFields(genericProjectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)


        assertThat(returnedResult.size).isEqualTo(2)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(id1, id2)

        assertThat(returnedResult.get(0).id).isIn(id1, id2)
        assertThat(returnedResult.get(0).gitlabProject).isIn("project-1", "project-5")
        assertThat(returnedResult.get(1).id).isIn(id1, id2)
        assertThat(returnedResult.get(1).gitlabProject).isIn("project-1", "project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProject by namespace`() {
        val id1 = randomUUID()
        val id2 = randomUUID()
        val id3 = randomUUID()
        val id4 = randomUUID()
        val id5 = randomUUID()
        val id6 = randomUUID()

        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", subject.id, "group1", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(id2, "slug-2", "www.url.net", "Test Project 2", subject.id, "group2", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(id3, "slug-3", "www.url.xyz", "Test Project 3", subject2.id, "group3", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(id4, "slug-4", "www.url.com", "Test Code Project 1", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(id5, "slug-5", "www.url.net", "Test Code Project 2", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(id6, "slug-6", "www.url.xyz", "Test Code Project 3", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)


        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/mlreef")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("genericprojects-retrieve-all", responseFields(genericProjectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(4)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id,
            returnedResult.get(2).id,
            returnedResult.get(3).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(id1, id2, id4, id5)
        assertThat(returnedResult.get(0).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(0).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
        assertThat(returnedResult.get(1).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(1).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
        assertThat(returnedResult.get(2).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(2).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
        assertThat(returnedResult.get(3).id).isIn(id1, id2, id4, id5)
        assertThat(returnedResult.get(3).gitlabProject).isIn("project-1", "project-2", "project-4", "project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProject by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", subject.id, "mlreef", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", subject2.id, "mlreef", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(randomUUID(), "slug-5", "www.url.net", "Test Code Project 5", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(randomUUID(), "slug-6", "www.url.xyz", "Test Code Project 6", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/mlreef/project-1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-one", responseFields(genericProjectResponseFields()))
            .returns(DataProjectDto::class.java)


        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabProject).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own CodeProject by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Data Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", subject.id, "mlreef", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", subject2.id, "mlreef", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(id1, "slug-5", "www.url.net", "Test Code Project 5", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(randomUUID(), "slug-6", "www.url.xyz", "Test Code Project 6", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)


        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/mlreef/project5"), account))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("dataprojects-retrieve-one",
                responseFields(genericProjectResponseFields()))
            .returns(DataProjectDto::class.java)
        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabProject).isEqualTo("project-5")
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve specific not own Project`() {
        val id1 = randomUUID()
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Data Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", subject.id, "mlreef", "project-2", "mlreef/project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", subject2.id, "mlreef", "project-3", "mlreef/project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", subject.id, "group4", "project-4", "mlreef/project4", 1)
        val project5 = CodeProject(randomUUID(), "slug-5", "www.url.net", "Test Code Project 5", subject.id, "group5", "project-5", "mlreef/project5", 2)
        val project6 = CodeProject(id1, "slug-6", "www.url.xyz", "Test Code Project 6", subject2.id, "group6", "project-6", "mlreef/project6", 3)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    private fun genericProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Generic project id"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Generic project slug"),
            fieldWithPath(prefix + "url").type(JsonFieldType.STRING).description("URL in Gitlab domain"),
            fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("Owner id of the generic project"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Project name"),
            fieldWithPath(prefix + "gitlab_group").type(JsonFieldType.STRING).description("The group where the project is in"),
            fieldWithPath(prefix + "gitlab_project").type(JsonFieldType.STRING).description("Project path"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab")
        )
    }
}
