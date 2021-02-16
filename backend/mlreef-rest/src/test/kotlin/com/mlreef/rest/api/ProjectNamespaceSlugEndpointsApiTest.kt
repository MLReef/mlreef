package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.feature.system.SessionsService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
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
    private lateinit var account2: Account
    private lateinit var subject: Person
    private lateinit var subject2: Person
    private lateinit var dataOp1: ProcessorVersion
    private lateinit var dataProject: DataProject

    @Autowired
    private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var sessionService: SessionsService

    @BeforeEach
    @Transactional
    fun setUp() {
        pipelineTestPreparationTrait.apply()

        account = pipelineTestPreparationTrait.account
        account2 = pipelineTestPreparationTrait.account2

        token = pipelineTestPreparationTrait.token

        subject = pipelineTestPreparationTrait.subject
        subject2 = pipelineTestPreparationTrait.subject2

        dataOp1 = pipelineTestPreparationTrait.procVersion1!!
        dataProject = pipelineTestPreparationTrait.dataProject

        mockGitlabPipelineWithBranch("targetBranch")
        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

        // To update user permissions before each test
        sessionService.killAllSessions("username0000")
    }

    @AfterEach
    fun cleanUp() {
        pipelineTestPreparationTrait.deleteAll()
        experimentRepository.deleteAll()
        codeProjectRepository.deleteAll()
        dataProjectRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()

        truncateAllTables()

        pipelineTestPreparationTrait.deleteAll()

        // To update user permissions before each test
        sessionService.killAllSessions("username0000")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own Projects by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", "description", subject.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, listOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", "description", subject2.id, "mlreef", "project-3", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", "description", subject.id, "group4", "project-4", 4)
        val project5 = CodeProject(randomUUID(), "slug-5", "www.url.net", "Test Code Project 5", "description", subject.id, "group5", "project-5", 5)
        val project6 = CodeProject(randomUUID(), "slug-6", "www.url.xyz", "Test Code Project 6", "description", subject2.id, "group6", "project-6", 6)
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockGetUserProjectsList(listOf(project1.id, project2.id, project4.id, project5.id), account, AccessLevel.OWNER)

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
        val project = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", "description", subject.id, "group4", "project-4", 4)
        codeProjectRepository.save(project)

        createDataProcessor(DataProcessorType.OPERATION, project)

        mockGetUserProjectsList(listOf(project.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${project.gitlabNamespace}/${project.gitlabPath}/processor"

        this.performGet(url, token)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("data-processors-codeproject-retrieve-one-by-namespace-slug",
                responseFields(dataProcessorFields()))
    }


}
