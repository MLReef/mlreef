package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.ParameterInstanceRepository
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.Project
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.dto.ExperimentDto
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.UserInProjectDto
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.feature.system.SessionsService
import com.ninjasquad.springmockk.SpykBean
import io.mockk.every
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
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
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var sessionService: SessionsService

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var parameterInstanceRepository: ParameterInstanceRepository

    @SpykBean
    private lateinit var projectService: ProjectService<Project>

    @BeforeEach
    @AfterEach
    @Transactional
    fun setUp() {
        pipelineTestPreparationTrait.deleteAll()
        parameterInstanceRepository.deleteAll()
        processorParameterRepository.deleteAll()
        processorVersionRepository.deleteAll()
        experimentRepository.deleteAll()
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

        pipelineTestPreparationTrait.apply()
        dataOp1 = pipelineTestPreparationTrait.dataOp1
        dataProject = pipelineTestPreparationTrait.dataProject

        mockGitlabPipelineWithBranch("sourceBranch", "targetBranch")
        this.mockGetUserProjectsList(listOf(dataProject.id), account, AccessLevel.OWNER)

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

        val returnedResult: ProjectDto = this.performGet("$rootUrl/mlreef/project-1", account)
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
    fun `Can retrieve users list in Project by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(account, account2).map { accountToUserInProject(it) }
        }

        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)
        this.mockGetUserProjectsList(listOf(project1.id), account2, AccessLevel.DEVELOPER)

        val returnedResult: List<UserInProjectDto> = this.performGet("$rootUrl/mlreef/project-1/users", account)
            .expectOk()
            .document("project-retrieve-users-list-by-namespace-slug", responseFields(usersInProjectResponseFields("[].")))
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own Experiments by namespace and slug`() {
        val id1 = randomUUID()
        val dataProject1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(dataProject1)

        this.mockGetUserProjectsList(listOf(dataProject1.id), account, AccessLevel.OWNER)

        createExperiment(dataProject1.id, dataOp1, "experiment-1-slug")
        createExperiment(dataProject1.id, dataOp1, "experiment-2-slug")

        val returnedResult: List<ExperimentDto> = performGet("$rootUrl/${dataProject1.gitlabNamespace}/${dataProject1.gitlabPath}/experiments", account)
            .expectOk()
            .document("experiments-retrieve-all-by-namespace-slug",
                responseFields(experimentDtoResponseFields("[]."))
                    .and(pipelineInfoDtoResponseFields("[].pipeline_job_info."))
                    .and(dataProcessorInstanceFields("[].post_processing[]."))
                    .and(fileLocationsFields("[].input_files[]."))
                    .and(dataProcessorInstanceFields("[].processing.")))
            .returnsList(ExperimentDto::class.java)
        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own Experiment by namespace and slug`() {
        val id1 = randomUUID()
        val dataProject1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(dataProject1)

        this.mockGetUserProjectsList(listOf(dataProject1.id), account, AccessLevel.OWNER)

        val experiment1 = createExperiment(dataProject1.id, dataOp1)

        performGet("$rootUrl/${dataProject1.gitlabNamespace}/${dataProject1.gitlabPath}/experiments/${experiment1.id}", account)
            .expectOk()
            .document("experiments-retrieve-one-by-namespace-slug",
                responseFields(experimentDtoResponseFields())
                    .and(pipelineInfoDtoResponseFields("pipeline_job_info."))
                    .and(dataProcessorInstanceFields("post_processing[]."))
                    .and(fileLocationsFields("input_files[]."))
                    .and(dataProcessorInstanceFields("processing.")))

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all own pipelines  by namespace and slug`() {
        val id1 = randomUUID()
        val dataProject1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(dataProject1)

        this.mockGetUserProjectsList(listOf(dataProject1.id), account, AccessLevel.OWNER)

        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        createPipelineConfig(dataProcessorInstance, dataProject1.id, "slug1")
        createPipelineConfig(dataProcessorInstance, dataProject1.id, "slug2")

        val returnedResult: List<PipelineConfigDto> = this
            .performGet("$rootUrl/${dataProject1.gitlabNamespace}/${dataProject1.gitlabPath}/pipelines", account)
            .expectOk()
            .document("project-pipelineconfig-retrieve-all-by-namespace-slug",
                responseFields(pipelineConfigDtoResponseFields("[]."))
                    .and(dataProcessorInstanceFields("[].data_operations[].")))
            .returnsList(PipelineConfigDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific PipelineConfig of own DataProject  by namespace and slug`() {
        val id1 = randomUUID()
        val dataProject1 = DataProject(id1, "slug-1", "www.url.com", "Test Data Project 1", "description", subject.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(dataProject1)

        val dataProcessorInstance = createDataProcessorInstance(dataOp1)
        val entity = createPipelineConfig(dataProcessorInstance, dataProject1.id, "slug")

        this.mockGetUserProjectsList(listOf(dataProject1.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${dataProject1.gitlabNamespace}/${dataProject1.gitlabPath}/pipelines/${entity.id}"

        performGet(url, account)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("project-pipelineconfig-retrieve-one-by-namespace-slug",
                responseFields(pipelineConfigDtoResponseFields())
                    .and(dataProcessorInstanceFields("data_operations[].")))

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve specific own DataProcessor`() {
        val project = CodeProject(randomUUID(), "slug-4", "www.url.com", "Test Code Project 4", "description", subject.id, "group4", "project-4", 4)
        codeProjectRepository.save(project)

        createDataProcessor(DataProcessorType.OPERATION, project.id)

        mockGetUserProjectsList(listOf(project.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${project.gitlabNamespace}/${project.gitlabPath}/processor"

        this.performGet(url, account)
            .andExpect(MockMvcResultMatchers.status().isOk)
            .document("data-processors-codeproject-retrieve-one-by-namespace-slug",
                responseFields(dataProcessorFields()))
    }

    fun usersInProjectResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Data project id"),
            PayloadDocumentation.fieldWithPath(prefix + "user_name").type(JsonFieldType.STRING).description("User name"),
            PayloadDocumentation.fieldWithPath(prefix + "email").type(JsonFieldType.STRING).description("User's email"),
            PayloadDocumentation.fieldWithPath(prefix + "gitlab_id").type(JsonFieldType.NUMBER).description("Id in gitlab"),
            PayloadDocumentation.fieldWithPath(prefix + "access_level").type(JsonFieldType.STRING).description("Role"),
            PayloadDocumentation.fieldWithPath(prefix + "expired_at").type(JsonFieldType.STRING).optional().description("Access expires at")
        )
    }


}
