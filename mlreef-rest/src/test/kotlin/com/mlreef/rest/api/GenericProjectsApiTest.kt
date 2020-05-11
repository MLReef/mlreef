package com.mlreef.rest.api

import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.DataProjectDto
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
import java.util.UUID
import javax.transaction.Transactional

class GenericProjectsApiTest : RestApiTest() {

    val rootUrl = "/api/v1/projects"

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @BeforeEach
    @AfterEach
    fun setUp() {
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all own DataProjects and CodeProjects only`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (codeProject1, _) = gitlabHelper.createRealCodeProject(account1)
        val (codeProject2, _) = gitlabHelper.createRealCodeProject(account1)
        val (codeProject3, _) = gitlabHelper.createRealCodeProject(account1)

        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1)
        val (dataProject2, _) = gitlabHelper.createRealDataProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser()
        val (codeProject21, _) = gitlabHelper.createRealCodeProject(account2)
        val (codeProject22, _) = gitlabHelper.createRealCodeProject(account2)

        val (dataProject21, _) = gitlabHelper.createRealDataProject(account2)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "codeprojects-retrieve-all",
                responseFields(genericProjectResponseFields("[]."))
            ))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(5)

        val initialSetOfIds = setOf<UUID>(
            codeProject1.id,
            codeProject2.id,
            codeProject3.id,
            dataProject1.id,
            dataProject2.id
        )

        val initialSetOfSlug = setOf<String>(
            codeProject1.slug,
            codeProject2.slug,
            codeProject3.slug,
            dataProject1.slug,
            dataProject2.slug
        )

        val resultSetOfIds = returnedResult.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*initialSetOfIds.toTypedArray())
        assertThat(returnedResult.get(0).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(0).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(1).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(1).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(2).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(2).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(3).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(3).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own DataProject by id`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (codeProject1, _) = gitlabHelper.createRealCodeProject(account1)
        val (codeProject2, _) = gitlabHelper.createRealCodeProject(account1)
        val (codeProject3, _) = gitlabHelper.createRealCodeProject(account1)

        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1)
        val (dataProject2, _) = gitlabHelper.createRealDataProject(account1)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${dataProject1.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "genericprojects-retrieve-one",
                responseFields(genericProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(dataProject1.id)
        assertThat(returnedResult.gitlabProject).isEqualTo(dataProject1.slug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by id`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (codeProject1, _) = gitlabHelper.createRealCodeProject(account1)
        val (codeProject2, _) = gitlabHelper.createRealCodeProject(account1)
        val (codeProject3, _) = gitlabHelper.createRealCodeProject(account1)

        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1)
        val (dataProject2, _) = gitlabHelper.createRealDataProject(account1)

        val returnedResult: CodeProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${codeProject1.id}"),account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "genericprojects-retrieve-one",
                responseFields(genericProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(codeProject1.id)
        assertThat(returnedResult.gitlabProject).isEqualTo(codeProject1.slug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own DataProjects and CodeProjects by slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1, slug = "slug-1")
        val (dataProject2, _) = gitlabHelper.createRealDataProject(account1)
        val (codeProject3, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (codeProject21, _) = gitlabHelper.createRealCodeProject(account2, slug = "slug-1")
        val (dataProject22, _) = gitlabHelper.createRealDataProject(account2)

        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)
        val (dataProject31, _) = gitlabHelper.createRealDataProject(account3, slug = "slug-1")
        val (codeProject32, _) = gitlabHelper.createRealCodeProject(account3)

        addRealUserToProject(codeProject21.gitlabId, account1.person.gitlabId!!)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/slug/${dataProject1.slug}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-retrieve-all",
                responseFields(genericProjectResponseFields("[]."))
            ))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id,
            codeProject21.id
        )

        val initialSetOfSlug = setOf<String>(
            dataProject1.slug,
            codeProject21.slug
        )

        val resultSetOfIds = returnedResult.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*initialSetOfIds.toTypedArray())

        assertThat(returnedResult.get(0).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(0).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(1).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(1).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own DataProject by namespace`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1)
        val (codeProject2, _) = gitlabHelper.createRealCodeProject(account1)
        val (dataProject3, _) = gitlabHelper.createRealDataProject(account1)

        addRealUserToProject(dataProject1.gitlabId, account2.person.gitlabId!!)

        val (dataProject21, _) = gitlabHelper.createRealDataProject(account2, namespace = dataProject1.gitlabGroup)
        val (codeProject22, _) = gitlabHelper.createRealCodeProject(account2, namespace = dataProject1.gitlabGroup)

        val returnedResult: List<DataProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/${dataProject1.gitlabGroup}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "genericprojects-retrieve-all",
                responseFields(genericProjectResponseFields("[]."))
            ))
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, DataProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(1)

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id
        )

        val initialSetOfSlug = setOf<String>(
            dataProject1.slug
        )

        val resultSetOfIds = returnedResult.map(DataProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*resultSetOfIds.toTypedArray())
        assertThat(returnedResult.get(0).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(0).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own DataProject by namespace and slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, _) = gitlabHelper.createRealDataProject(account1)
        val (project2, _) = gitlabHelper.createRealDataProject(account1)
        val (project3, _) = gitlabHelper.createRealDataProject(account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (project21, _) = gitlabHelper.createRealDataProject(account2, slug="slug-1", namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealDataProject(account2)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project1.gitlabGroup}/${project1.slug}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-retrieve-one",
                responseFields(genericProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(project1.id)
        assertThat(returnedResult.gitlabProject).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own CodeProject by namespace and slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, gitlabProject1) = gitlabHelper.createRealCodeProject(account1)
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (project3, _) = gitlabHelper.createRealCodeProject(account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2, slug="slug-1", namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        val returnedResult: DataProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project1.gitlabGroup}/${project1.slug}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andDo(MockMvcRestDocumentation.document(
                "dataprojects-retrieve-one",
                responseFields(genericProjectResponseFields())))
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, DataProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(project1.id)
        assertThat(returnedResult.gitlabProject).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve specific not own Project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    private fun genericProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Generic project id"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).description("Generic project slug"),
            fieldWithPath(prefix + "url").type(JsonFieldType.STRING).description("URL in Gitlab domain"),
            fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("Owner id of the generic project"),
            fieldWithPath(prefix + "gitlab_group").type(JsonFieldType.STRING).description("The group where the project is in"),
            fieldWithPath(prefix + "gitlab_project").type(JsonFieldType.STRING).description("Project name"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab")
        )
    }
}
