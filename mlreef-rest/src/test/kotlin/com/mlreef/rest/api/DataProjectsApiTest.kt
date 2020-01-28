package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ParameterInstanceRepository
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.feature.project.DataProjectService
import com.mlreef.rest.findById2
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
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
import java.util.*
import javax.transaction.Transactional

class DataProjectsApiTest : RestApiTest() {
    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired
    private lateinit var dataProjectService: DataProjectService

    @Autowired private lateinit var experimentRepository: ExperimentRepository
    @Autowired private lateinit var codeProjectRepository: CodeProjectRepository
    @Autowired private lateinit var dataProcessorInstanceRepository: DataProcessorInstanceRepository
    @Autowired private lateinit var parameterInstanceRepository: ParameterInstanceRepository
    @Autowired private lateinit var processorParameterRepository: ProcessorParameterRepository
    @Autowired private lateinit var dataProcessorRepository: DataProcessorRepository

    private lateinit var subject: Person
    private lateinit var account2: Account

    val rootUrl = "/api/v1/data-projects"

    @BeforeEach
    @AfterEach
    fun setUp() {
        parameterInstanceRepository.deleteAll()
        dataProcessorInstanceRepository.deleteAll()
        experimentRepository.deleteAll()
        processorParameterRepository.deleteAll()
        dataProcessorRepository.deleteAll()
        codeProjectRepository.deleteAll()

        dataProjectRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()

        account = createMockUser()
        account2 = createMockUser(userOverrideSuffix = "0002")
    }

    @Transactional
    @Rollback
    @Test fun `Can create dataproject`() {
        val request = ProjectCreateRequest("test-project", "Test project")
        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-create",
                responseFields(dataProjectCreateRequestFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all own data-projects only`() {
        val project1 = DataProject(UUID.randomUUID(), "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", 1, listOf())
        val project2 = DataProject(UUID.randomUUID(), "slug-2", "www.url.net", "Test Project 2", account.person.id, "group2", "project-2", 2, listOf())
        val project3 = DataProject(UUID.randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", account2.person.id, "group3", "project-3", 3, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-retrieve-all",
                responseFields(dataProjectCreateRequestFields("[]."))))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own data-project`() {
        val id1 = UUID.randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", 1, listOf())
        val project2 = DataProject(UUID.randomUUID(), "slug-2", "www.url.net", "Test Project 2", account.person.id, "group2", "project-2", 2, listOf())
        val project3 = DataProject(UUID.randomUUID(), "slug-3", "www.url.xyz", "Test Project 3", account2.person.id, "group3", "project-3", 3, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-retrieve-one",
                responseFields(dataProjectCreateRequestFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabProject).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve specific not own data-project`() {
        val id1 = UUID.randomUUID()
        val project1 = DataProject(UUID.randomUUID(), "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", 1, listOf())
        val project2 = DataProject(UUID.randomUUID(), "slug-2", "www.url.net", "Test Project 2", account.person.id, "group2", "project-2", 2, listOf())
        val project3 = DataProject(id1, "slug-3", "www.url.xyz", "Test Project 3", account2.person.id, "group3", "project-3", 3, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isNotFound)
    }

    @Transactional
    @Rollback
    @Test fun `Can update own data-project`() {
        val id1 = UUID.randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", 1, listOf())
        dataProjectRepository.save(project1)

        val request = ProjectCreateRequest("test-project", "New Test project")

        val returnedResult = this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/$id1"))
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-update",
                responseFields(dataProjectCreateRequestFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult.gitlabProject).isEqualTo("New Test project")
    }

    @Transactional
    @Rollback
    @Test fun `Can delete own data-project`() {
        val id1 = UUID.randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", account.person.id, "group1", "project-1", 1, listOf())
        dataProjectRepository.save(project1)

        assertThat(dataProjectRepository.findById2(id1)).isNotNull

        // TODO document delete "dataprojects-delete"
        this.mockMvc.perform(
            this.defaultAcceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/$id1")))
            .andExpect(MockMvcResultMatchers.status().isNoContent)

        assertThat(dataProjectRepository.findById2(id1)).isNull()
    }


    private fun dataProjectCreateRequestFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Data project id"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Data project slug"),
            fieldWithPath(prefix + "url").type(JsonFieldType.STRING).description("URL in Gitlab domain"),
            fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("Onwer id of the data project"),
            fieldWithPath(prefix + "gitlab_group").type(JsonFieldType.STRING).description("The group where the project is in"),
            fieldWithPath(prefix + "gitlab_project").type(JsonFieldType.STRING).description("Project name"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab"),
            fieldWithPath(prefix + "experiments").type(JsonFieldType.ARRAY).optional().description("List of experiments inside the project (empty on creation)")
        )
    }
}
