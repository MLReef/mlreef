package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.CodeProjectCreateRequest
import com.mlreef.rest.api.v1.CodeProjectUpdateRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabBadRequestException
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
import org.springframework.restdocs.payload.PayloadDocumentation.*
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.util.*
import javax.transaction.Transactional

class CodeProjectsApiTest : RestApiTest() {

    private lateinit var subject: Person
    private lateinit var account: Account
    private lateinit var account2: Account

    @Autowired private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

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
    }

    @Transactional
    @Rollback
    @Test fun `Can create CodeProject`() {
        val request = CodeProjectCreateRequest("test-project", "mlreef", "Test project")
        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "codeprojects-create",
                requestFields(codeProjectCreateRequestFields()),
                responseFields(codeProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test fun `Cannot create duplicate CodeProject`() {
        Mockito.`when`(restClient.createProject(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), anyObject()
        )).then {
            throw GitlabBadRequestException("", ErrorCode.Conflict, "")
        }

        val request = CodeProjectCreateRequest("test-project", "mlreef", "Test project")
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    @Transactional
    @Rollback
    @Test fun `Cannot create CodeProject with invalid params`() {
        Mockito.`when`(restClient.createProject(
            Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), Mockito.anyString(), anyObject()
        )).then {
            throw GitlabBadRequestException("", ErrorCode.Conflict, "")
        }

        val request = CodeProjectCreateRequest("", "", "")
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all own CodeProjects only`() {
        val project1 = CodeProject(UUID.randomUUID(), "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(UUID.randomUUID(), "slug-2", "www.url.net", "Test Project 2", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(UUID.randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "codeprojects-retrieve-all",
                responseFields(codeProjectResponseFields("[]."))))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, CodeProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own CodeProject`() {
        val id1 = UUID.randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(UUID.randomUUID(), "slug-2", "www.url.net", "Test Project 2", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(UUID.randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)

        val returnedResult: CodeProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "codeprojects-retrieve-one",
                responseFields(codeProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabProject).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve specific not own CodeProject`() {
        val id1 = UUID.randomUUID()
        val project1 = CodeProject(UUID.randomUUID(), "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        val project2 = CodeProject(UUID.randomUUID(), "slug-2", "www.url.net", "Test Project 2", account.person.id, "group2", "project-2", "mlreef/project2", 2)
        val project3 = CodeProject(id1, "slug-3", "www.url.xyz", "Test Project 3", account2.person.id, "group3", "project-3", "mlreef/project3", 3)
        codeProjectRepository.save(project1)
        codeProjectRepository.save(project2)
        codeProjectRepository.save(project3)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isNotFound)
    }

    @Transactional
    @Rollback
    @Test fun `Can update own CodeProject`() {
        val id1 = UUID.randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", "mlreef/project3", 1)
        codeProjectRepository.save(project1)

        val request = CodeProjectUpdateRequest("New Test project")

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/$id1"))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "codeprojects-update",
                requestFields(codeProjectUpdateRequestFields()),
                responseFields(codeProjectResponseFields())
            ))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult.gitlabProject).isEqualTo("New Test project")
    }

    @Transactional
    @Rollback
    @Test fun `Cannot update not-own CodeProject`() {
        val id1 = UUID.randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        val request = CodeProjectCreateRequest("test-project", "mlreef", "New Test project")

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/$id1"))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    @Transactional
    @Rollback
    @Test fun `Can delete own CodeProject`() {
        val id1 = UUID.randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNotNull

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isNoContent)
            .andDo(MockMvcRestDocumentation.document(
                "codeprojects-delete"))

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNull()
    }

    @Transactional
    @Rollback
    @Test fun `Cannot delete not-own CodeProject`() {
        val id1 = UUID.randomUUID()
        val project1 = CodeProject(id1, "slug-1", "www.url.com", "Test Project 1", account2.person.id, "group1", "project-1", "mlreef/project1", 1)
        codeProjectRepository.save(project1)

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNotNull

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isNotFound)
    }

    private fun codeProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Data project id"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Data project slug"),
            fieldWithPath(prefix + "url").type(JsonFieldType.STRING).description("URL in Gitlab domain"),
            fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("Onwer id of the data project"),
            fieldWithPath(prefix + "gitlab_group").type(JsonFieldType.STRING).description("The group where the project is in"),
            fieldWithPath(prefix + "gitlab_project").type(JsonFieldType.STRING).description("Project name"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab")
        )
    }

    private fun codeProjectCreateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Valid slug of Project (matches Gitlab)"),
            fieldWithPath("namespace").type(JsonFieldType.STRING).description("Gitlab group or user namespace"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project")
        )
    }

    private fun codeProjectUpdateRequestFields(): List<FieldDescriptor> {
        return listOf(
//            fieldWithPath("slug").type(JsonFieldType.STRING).description("Valid slug of Project (matches Gitlab)"),
//            fieldWithPath("namespace").type(JsonFieldType.STRING).description("Gitlab group or user namespace"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project")
        )
    }
}
