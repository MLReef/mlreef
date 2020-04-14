package com.mlreef.rest.api

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.DataProjectCreateRequest
import com.mlreef.rest.api.v1.DataProjectUpdateRequest
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabBadRequestException
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.feature.system.SessionsService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProjectsApiTest : RestApiTest() {

    val rootUrl = "/api/v1/data-projects"
    private lateinit var subject: Person

    @Autowired private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait
    @Autowired private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var sessionService: SessionsService

    @BeforeEach
    @AfterEach
    fun setUp() {
        accountSubjectPreparationTrait.apply()
        subject = accountSubjectPreparationTrait.subject

        // To update user permissions before each test
        sessionService.killAllSessions("username0000")
    }

    @Transactional
    @Rollback
    @Test fun `Can create DataProject`() {
        val request = DataProjectCreateRequest("test-project", "mlreef", "Test project")
        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-create",
                requestFields(dataProjectCreateRequestFields()),
                responseFields(dataProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test fun `Cannot create duplicate DataProject`() {
        Mockito.`when`(restClient.createProject(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), anyObject()
        )).then {
            throw GitlabBadRequestException("", ErrorCode.Conflict, "")
        }

        val request = DataProjectCreateRequest("test-project", "mlreef", "Test project")
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test fun `Cannot create DataProject with invalid params`() {
        Mockito.`when`(restClient.createProject(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), anyObject()
        )).then {
            throw GitlabBadRequestException("", ErrorCode.GitlabCommonError, "")
        }

        val request = DataProjectCreateRequest("", "", "")
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all own DataProjects only`() {
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Project 1", subject.id, "mlreef", "group1", "mlreef/project-1", 1, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", subject.id, "mlreef", "group2", "mlreef/project-2", 2, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", randomUUID(), "mlreef", "group3", "mlreef/project-3", 3, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-retrieve-all",
                responseFields(dataProjectResponseFields("[]."))
            ))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", subject.id, "mlreef", "project-2", "mlreef/project-2", 2, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", subject.id, "mlreef", "project-3", "mlreef/project-3", 3, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(
            restClient,
            listOf(project1.gitlabId, project2.gitlabId, project3.gitlabId),
            subject.gitlabId!!,
            listOf(GroupAccessLevel.OWNER, GroupAccessLevel.OWNER, GroupAccessLevel.OWNER))

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-retrieve-one",
                responseFields(dataProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabProject).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve specific not own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Project 1", subject.id, "mlreef", "group1", "mlreef/project-1", 1, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Project 2", subject.id, "mlreef", "group2", "mlreef/project-2", 2, listOf())
        val project3 = DataProject(id1, "slug-3", "www.url.xyz", "Test Project 3", randomUUID(), "mlreef", "group3", "mlreef/project-3", 3, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(
            restClient,
            listOf(project1.gitlabId, project2.gitlabId),
            subject.gitlabId!!,
            listOf(GroupAccessLevel.OWNER, GroupAccessLevel.OWNER, GroupAccessLevel.OWNER))

        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(restClient, project3.gitlabId, 999L, GroupAccessLevel.OWNER)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test fun `Can update own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", subject.id, "mlreef", "project-1", "mlreef/project-1", 1, listOf())
        dataProjectRepository.save(project1)

        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(restClient, project1.gitlabId, subject.gitlabId!!, GroupAccessLevel.OWNER)

        val request = DataProjectUpdateRequest("New Test project")

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/$id1"))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-update",
                requestFields(dataProjectUpdateRequestFields()),
                responseFields(dataProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult.gitlabProject).isEqualTo("New Test project")
    }

    @Transactional
    @Rollback
    @Test fun `Cannot update not-own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", subject.id, "mlreef", "group1", "mlreef/project-1", 1, listOf())
        dataProjectRepository.save(project1)

        val request = DataProjectCreateRequest("test-project", "mlreef", "New Test project")

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/$id1"))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test fun `Can delete own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", subject.id, "mlreef", "group1", "mlreef/project-1", 1, listOf())
        dataProjectRepository.save(project1)

        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(restClient, project1.gitlabId, subject.gitlabId!!, GroupAccessLevel.OWNER)

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNotNull

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isNoContent)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-delete"))

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNull()
    }

    @Transactional
    @Rollback
    @Test fun `Cannot delete not-own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", randomUUID(), "mlreef", "group1", "mlreef/project-1", 1, listOf())
        dataProjectRepository.save(project1)

        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(restClient, project1.gitlabId, 456L, GroupAccessLevel.OWNER)
        accountSubjectPreparationTrait.mockGitlabProjectsWithLevel(restClient, project1.gitlabId, subject.gitlabId!!, GroupAccessLevel.MAINTAINER)

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNotNull

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }


    private fun dataProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Data project id"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Data project slug"),
            fieldWithPath(prefix + "url").type(JsonFieldType.STRING).description("URL in Gitlab domain"),
            fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("Owner id of the data project"),
            fieldWithPath(prefix + "gitlab_group").type(JsonFieldType.STRING).description("The group where the project is in"),
            fieldWithPath(prefix + "gitlab_project").type(JsonFieldType.STRING).description("Project name"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab"),
            fieldWithPath(prefix + "experiments").type(JsonFieldType.ARRAY).optional().description("List of experiments inside the project (empty on creation)")
        )
    }

    private fun dataProjectCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Valid slug of Project (matches Gitlab)"),
            fieldWithPath("namespace").type(JsonFieldType.STRING).description("Gitlab group or user namespace"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project")
        )
    }

    private fun dataProjectUpdateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project")
        )
    }
}
