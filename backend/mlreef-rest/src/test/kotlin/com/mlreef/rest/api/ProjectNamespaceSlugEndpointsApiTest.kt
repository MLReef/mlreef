package com.mlreef.rest.api

import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.feature.system.SessionsService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ProjectNamespaceSlugEndpointsApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/projects"

    @Autowired
    private lateinit var sessionService: SessionsService

    @BeforeEach
    @Transactional
    @Rollback
    fun setUp() {
        mockGitlabPipelineWithBranch("targetBranch")

        // To update user permissions before each test
        sessionService.killAllSessions("username0000")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Projects by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Data Project 1",
            "description",
            mainPerson3.id,
            "mlreef",
            "project-1",
            1,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        val project2 = DataProject(
            randomUUID(),
            "slug-2",
            "www.url.net",
            "Test Data Project 2",
            "description",
            mainPerson3.id,
            "mlreef",
            "project-2",
            2,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        val project3 = DataProject(
            randomUUID(),
            "slug-3",
            "www.url.xyz",
            "Test Data Project 3",
            "description",
            mainPerson2.id,
            "mlreef",
            "project-3",
            3,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(
            randomUUID(),
            "slug-4",
            "www.url.com",
            "Test Code Project 4",
            "description",
            mainPerson3.id,
            "group4",
            "project-4",
            4,
            processorType = operationProcessorType
        )
        val project5 = CodeProject(
            randomUUID(),
            "slug-5",
            "www.url.net",
            "Test Code Project 5",
            "description",
            mainPerson3.id,
            "group5",
            "project-5",
            5,
            processorType = operationProcessorType
        )
        val project6 = CodeProject(
            randomUUID(),
            "slug-6",
            "www.url.xyz",
            "Test Code Project 6",
            "description",
            mainPerson2.id,
            "group6",
            "project-6",
            6,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount3,
            AccessLevel.OWNER
        )

        val returnedResult: ProjectDto = this.performGet("$rootUrl/mlreef/project-1", token)
            .expectOk()
            .document("project-retrieve-one-by-namespace-slug", responseFields(projectResponseFields()))
            .returns(ProjectDto::class.java)

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProcessor`() {
        val project = CodeProject(
            randomUUID(),
            "slug-4",
            "www.url.com",
            "Test Code Project 4",
            "description",
            mainPerson3.id,
            "group4",
            "project-4",
            4,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project)

        createProcessor(project, "Test processor", "test-processor")

        mockUserAuthentication(listOf(project.id), mainAccount3, AccessLevel.OWNER)

        val url = "$rootUrl/${project.gitlabNamespace}/${project.slug}/processor"

        this.performGet(url, token)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document(
                "data-processors-codeproject-retrieve-one-by-namespace-slug",
                responseFields(wrapToPage(dataProcessorFields()))
            )
    }


}
