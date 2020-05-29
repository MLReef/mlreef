package com.mlreef.rest.integration

import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.CodeProjectCreateRequest
import com.mlreef.rest.api.v1.CodeProjectUpdateRequest
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.util.UUID
import javax.transaction.Transactional

class CodeProjectsIntegrationTest : IntegrationRestApiTest() {
    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    val rootUrl = "/api/v1/code-projects"

    @BeforeEach
    @AfterEach
    fun setUp() {
    }

    @Transactional
    @Rollback
    @Test
    fun `Can create CodeProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()

        val request = CodeProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )

        val returnedResult = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create duplicate CodeProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (existingProjectInDb, _) = gitlabHelper.createRealCodeProject(account)

        val request = CodeProjectCreateRequest(
            slug = existingProjectInDb.slug,
            namespace = existingProjectInDb.gitlabPathWithNamespace,
            name = existingProjectInDb.name,
            description = "New description",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )
        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot create CodeProject with invalid params`() {
        val (account, _, _) = gitlabHelper.createRealUser()

        val request = CodeProjectCreateRequest(
            slug = "",
            namespace = "",
            name = "",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true
        )
        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.post(rootUrl), account)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isBadRequest)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all own CodeProjects only`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealCodeProject(account1)
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (project3, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, CodeProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(3)
        assertThat(returnedResult.map(CodeProjectDto::id).toSortedSet()).isEqualTo(listOf(project1.id, project2.id, project3.id).toSortedSet())
        assertThat(returnedResult.map(CodeProjectDto::gitlabProject).toSortedSet()).isEqualTo(listOf(project1.slug, project2.slug, project3.slug).toSortedSet()) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by id`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (project1, _) = gitlabHelper.createRealCodeProject(account1)
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (project3, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        val returnedResult: CodeProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project2.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(project2.id)
        assertThat(returnedResult.gitlabId).isEqualTo(project2.gitlabId)
        assertThat(returnedResult.gitlabProject).isEqualTo(project2.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealCodeProject(account1, slug = "slug-1")
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (project3, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2, slug = "slug-1")
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project31, _) = gitlabHelper.createRealCodeProject(account3, slug = "slug-1")
        val (project32, _) = gitlabHelper.createRealCodeProject(account3)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/slug/${project1.slug}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, CodeProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(2)

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id,
            returnedResult.get(1).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(project1.id, project21.id)
        assertThat(returnedResult.get(0).id).isIn(project1.id, project21.id)
        assertThat(returnedResult.get(0).gitlabProject).isIn(project1.slug, project21.slug) //FIXME: Why is slug? Is it correct?
        assertThat(returnedResult.get(1).id).isIn(project1.id, project21.id)
        assertThat(returnedResult.get(1).gitlabProject).isIn(project1.slug, project21.slug)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by namespace`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, gitlabProject1) = gitlabHelper.createRealCodeProject(account1)
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (project3, _) = gitlabHelper.createRealCodeProject(account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2, namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        val returnedResult: List<CodeProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/${project1.gitlabGroup}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, CodeProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(1) //FIXME: Should be 2?

        val setOfIds = setOf<UUID>(
            returnedResult.get(0).id
        )

        assertThat(setOfIds).containsExactlyInAnyOrder(project1.id)
        assertThat(returnedResult.get(0).id).isIn(project1.id)
        assertThat(returnedResult.get(0).gitlabProject).isIn(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own CodeProject by namespace and slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project1, gitlabProject1) = gitlabHelper.createRealCodeProject(account1)
        val (project2, _) = gitlabHelper.createRealCodeProject(account1)
        val (project3, _) = gitlabHelper.createRealCodeProject(account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2, slug = "slug-1", namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        val returnedResult: CodeProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project1.gitlabGroup}/${project1.slug}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(project1.id)
        assertThat(returnedResult.gitlabProject).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve specific not own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can update own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project1, _) = gitlabHelper.createRealCodeProject(account1)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        assertThat(newProjectName).isNotEqualTo(project1.gitlabProject)

        val request = CodeProjectUpdateRequest(newProjectName, newDescription)

        val returnedResult = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/${project1.id}"), account1)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, CodeProjectDto::class.java)
            }

        assertThat(returnedResult.gitlabProject).isEqualTo(newProjectName)
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot update not-own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        val newProjectName = "New Test project"
        val newDescription = "new description"

        val request = CodeProjectUpdateRequest(newProjectName, newDescription)

        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.put("$rootUrl/${project21.id}"), account1)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete own CodeProject`() {
        val (account, _, _) = gitlabHelper.createRealUser()
        val (project, _) = gitlabHelper.createRealCodeProject(account)

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNotNull()

        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/${project.id}"), account))
            .andExpect(MockMvcResultMatchers.status().isNoContent)

        assertThat(codeProjectRepository.findByIdOrNull(project.id)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot delete not-own CodeProject`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull()

        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.delete("$rootUrl/${project21.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isForbidden)

        assertThat(codeProjectRepository.findByIdOrNull(project21.id)).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Owner can get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()
        val (account2, _, _) = gitlabHelper.createRealUser(index = 1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = 2)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)
        val (project23, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!)
        addRealUserToProject(project23.gitlabId, account3.person.gitlabId!!)

        val returnedResult1: List<UserInProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}/users"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, UserInProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult1.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Developer can get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)
        val (project23, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val returnedResult1: List<UserInProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}/users"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, UserInProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult1.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Guest cannot get users list in project`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)

        val (project21, _) = gitlabHelper.createRealCodeProject(account2)
        val (project22, _) = gitlabHelper.createRealCodeProject(account2)
        val (project23, _) = gitlabHelper.createRealCodeProject(account2)

        addRealUserToProject(project21.gitlabId, account1.person.gitlabId!!, GroupAccessLevel.DEVELOPER)
        addRealUserToProject(project21.gitlabId, account3.person.gitlabId!!, GroupAccessLevel.GUEST)

        val returnedResult: Boolean = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}/users/check"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, Boolean::class.java)
            }

        assertThat(returnedResult).isTrue()

        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}/users"), account3))
            .andExpect(MockMvcResultMatchers.status().is4xxClientError)
    }

    fun codeProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
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

    fun usersInCodeProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Code project id"),
            fieldWithPath(prefix + "user_name").type(JsonFieldType.STRING).description("User name"),
            fieldWithPath(prefix + "email").type(JsonFieldType.STRING).description("User's email"),
            fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab")
        )
    }

    fun codeProjectUpdateRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("description").type(JsonFieldType.STRING).description("Description of Project"),
            fieldWithPath("name").type(JsonFieldType.STRING).description("Name of Project")
        )
    }
}
