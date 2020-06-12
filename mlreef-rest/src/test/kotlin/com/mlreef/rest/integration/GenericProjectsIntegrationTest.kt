package com.mlreef.rest.integration

import com.fasterxml.jackson.core.type.TypeReference
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.MLProjectDto
import com.mlreef.rest.testcommons.RestResponsePage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.util.UUID
import javax.transaction.Transactional

class GenericProjectsIntegrationTest : IntegrationRestApiTest() {

    val rootUrl = "/api/v1/projects"

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @BeforeEach
    @AfterEach
    fun setUp() {
        this.publicProjectRepository.deleteAll()
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
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1)
        val (_, _) = gitlabHelper.createRealDataProject(account1)

        val returnedResult: MLProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${dataProject1.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, MLProjectDto::class.java)
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
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        val (_, _) = gitlabHelper.createRealDataProject(account1)
        val (_, _) = gitlabHelper.createRealDataProject(account1)

        val returnedResult: MLProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${codeProject1.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, MLProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(codeProject1.id)
        assertThat(returnedResult.gitlabProject).isEqualTo(codeProject1.slug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific own DataProjects and CodeProjects by slug`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1, slug = "slug-1", public = false)
        val (_, _) = gitlabHelper.createRealDataProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (codeProject21, _) = gitlabHelper.createRealCodeProject(account2, slug = "slug-1", public = false)
        val (_, _) = gitlabHelper.createRealDataProject(account2)

        val (account3, _, _) = gitlabHelper.createRealUser(index = -1)
        val (_, _) = gitlabHelper.createRealDataProject(account3, slug = "slug-1", public = false)
        val (_, _) = gitlabHelper.createRealCodeProject(account3)

        addRealUserToProject(codeProject21.gitlabId, account1.person.gitlabId!!)

        val returnedResult: List<MLProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/slug/${dataProject1.slug}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, MLProjectDto::class.java)
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

        val resultSetOfIds = returnedResult.map(MLProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*initialSetOfIds.toTypedArray())

        assertThat(returnedResult.get(0).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(0).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(1).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(1).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve not own but member DataProject by namespace`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (codeProject2, _) = gitlabHelper.createRealCodeProject(account1, public = false)
        val (dataProject3, _) = gitlabHelper.createRealDataProject(account1, public = false)

        addRealUserToProject(dataProject1.gitlabId, account2.person.gitlabId!!)

        val (dataProject21, _) = gitlabHelper.createRealDataProject(account2, namespace = dataProject1.gitlabGroup, public = false)
        val (codeProject22, _) = gitlabHelper.createRealCodeProject(account2, namespace = dataProject1.gitlabGroup, public = false)

        val returnedResult: List<MLProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/${dataProject1.gitlabGroup}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, MLProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(1)

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id
        )

        val initialSetOfSlug = setOf<String>(
            dataProject1.slug
        )

        val resultSetOfIds = returnedResult.map(MLProjectDto::id).toSet()

        assertThat(resultSetOfIds).containsExactlyInAnyOrder(*resultSetOfIds.toTypedArray())
        assertThat(returnedResult.get(0).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(0).gitlabProject).isIn(initialSetOfSlug)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve not own not member but public DataProject by namespace`() {
        val (account1, _, _) = gitlabHelper.createRealUser(index = -1)
        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)

        val (dataProject1, _) = gitlabHelper.createRealDataProject(account1, public = true)
        val (codeProject2, _) = gitlabHelper.createRealCodeProject(account1, public = true)
        val (dataProject3, _) = gitlabHelper.createRealDataProject(account1, public = false)
        val (dataProject4, _) = gitlabHelper.createRealDataProject(account1, public = true)
        val (codeProject5, _) = gitlabHelper.createRealCodeProject(account1, public = false)

        val (_, _) = gitlabHelper.createRealDataProject(account2, namespace = dataProject1.gitlabGroup, public = false) //Pay attention that the namespace is not being taken. It's inaccessible to another user
        val (_, _) = gitlabHelper.createRealCodeProject(account2, namespace = dataProject1.gitlabGroup, public = false)

        val returnedResult: List<MLProjectDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/namespace/${dataProject1.gitlabGroup}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, MLProjectDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        assertThat(returnedResult.size).isEqualTo(3)

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id,
            codeProject2.id,
            dataProject4.id
        )

        val notReturnedSetOfIds = setOf<UUID>(
            dataProject3.id,
            codeProject5.id
        )

        val initialSetOfSlug = setOf<String>(
            dataProject1.slug,
            codeProject2.slug,
            dataProject4.slug
        )

        val resultSetOfIds = returnedResult.map(MLProjectDto::id).toSet()

        assertThat(resultSetOfIds).isEqualTo(resultSetOfIds)
        assertThat(resultSetOfIds).doesNotContain(*notReturnedSetOfIds.toTypedArray())
        assertThat(returnedResult.get(0).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(0).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(1).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(1).gitlabProject).isIn(initialSetOfSlug)
        assertThat(returnedResult.get(2).id).isIn(initialSetOfIds)
        assertThat(returnedResult.get(2).gitlabProject).isIn(initialSetOfSlug)
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

        val (project21, _) = gitlabHelper.createRealDataProject(account2, slug = "slug-1", namespace = project1.gitlabGroup)
        val (project22, _) = gitlabHelper.createRealDataProject(account2)

        val returnedResult: MLProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project1.gitlabGroup}/${project1.slug}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, MLProjectDto::class.java)
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
        val (_, _) = gitlabHelper.createRealCodeProject(account1)
        val (_, _) = gitlabHelper.createRealCodeProject(account1)

        addRealUserToProject(project1.gitlabId, account2.person.gitlabId!!)

        val (_, _) = gitlabHelper.createRealCodeProject(account2, slug = "slug-1", namespace = project1.gitlabGroup)
        val (_, _) = gitlabHelper.createRealCodeProject(account2)

        val returnedResult: MLProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project1.gitlabGroup}/${project1.slug}"), account2))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, MLProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(project1.id)
        assertThat(returnedResult.gitlabProject).isEqualTo(project1.slug) //FIXME: Why is slug? Is it correct?
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve specific not own Project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2, public = false)

        this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve specific not own but public Project`() {
        val (account1, _, _) = gitlabHelper.createRealUser()

        val (account2, _, _) = gitlabHelper.createRealUser(index = -1)
        val (project21, _) = gitlabHelper.createRealCodeProject(account2, public = true)

        val returnedResult: MLProjectDto = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get("$rootUrl/${project21.id}"), account1))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                objectMapper.readValue(it.response.contentAsByteArray, MLProjectDto::class.java)
            }

        assertThat(returnedResult.id).isEqualTo(project21.id)
    }


    @Transactional
    @Rollback
    @Test fun `Can retrieve all public projects as Visitor`() {
        val (account, _, _) = gitlabHelper.createRealUser(index = -1)
        val (dataProject1, _) = gitlabHelper.createRealDataProject(account, slug = "slug1")
        val (dataProject2, _) = gitlabHelper.createRealDataProject(account, slug = "slug2", public = false)
        val (dataProject3, _) = gitlabHelper.createRealDataProject(account, slug = "slug3")
        val (dataProject4, _) = gitlabHelper.createRealDataProject(account, slug = "slug4", public = false)
        val (dataProject5, _) = gitlabHelper.createRealDataProject(account, slug = "slug5")

        val returnedResult = this.performGet("$rootUrl/public?size=1000", anonymously = true)
            .checkStatus(HttpStatus.OK)
            .returns(object : TypeReference<RestResponsePage<MLProjectDto>>() {})

        val initialSetOfIds = setOf<UUID>(
            dataProject1.id,
            dataProject3.id,
            dataProject5.id
        )

        val resultSetOfIds = returnedResult.content.map(MLProjectDto::id).toSet()

        assertThat(returnedResult.numberOfElements).isEqualTo(3)
        assertThat(resultSetOfIds).isEqualTo(initialSetOfIds)
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve user's private project as Visitor`() {
        val (account, _, _) = gitlabHelper.createRealUser(index = -1)
        val (dataProject1, _) = gitlabHelper.createRealDataProject(account, slug = "slug1", public = false)

        this.performGet("$rootUrl/${dataProject1.id}", anonymously = true)
            .checkStatus(HttpStatus.FORBIDDEN)
    }
}
