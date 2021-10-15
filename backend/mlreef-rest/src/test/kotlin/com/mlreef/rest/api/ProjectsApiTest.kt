package com.mlreef.rest.api

import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.ProjectForkRequest
import com.mlreef.rest.api.v1.ProjectUpdateRequest
import com.mlreef.rest.api.v1.ProjectUserMembershipRequest
import com.mlreef.rest.api.v1.dto.*
import com.mlreef.rest.domain.*
import com.mlreef.rest.domain.marketplace.Star
import com.mlreef.rest.external_api.gitlab.GitlabCommitOperations
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.feature.system.SessionsService
import com.mlreef.rest.testcommons.RestResponsePage
import com.ninjasquad.springmockk.SpykBean
import io.mockk.every
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.MediaType.TEXT_PLAIN_VALUE
import org.springframework.mock.web.MockMultipartFile
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType.*
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.Instant
import java.time.Period
import java.util.*
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ProjectsApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/projects"
    val codeProjectRootUrl = "/api/v1/code-projects"
    val dataProjectRootUrl = "/api/v1/data-projects"

    @Autowired
    private lateinit var sessionService: SessionsService

    @SpykBean
//    @Autowired
    private lateinit var projectService: ProjectService<Project>

    @BeforeEach
    @AfterEach
    fun setUp() {
        // To update user permissions before each test
        sessionService.killAllSessions("username0000")
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
        val project1 = DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "description", mainAccount3.id, "group1", "project-1", 1, VisibilityScope.PUBLIC, mutableSetOf())
        val project2 = DataProject(id2, "slug-2", "www.url.net", "Test Project 2", "description", mainAccount3.id, "group2", "project-2", 2, VisibilityScope.PUBLIC, mutableSetOf())
        val project3 = DataProject(id3, "slug-3", "www.url.xyz", "Test Project 3", "description", mainAccount2.id, "group3", "project-3", 3, VisibilityScope.PRIVATE, mutableSetOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(id4, "slug-4", "www.url.com", "Test Code Project 1", "description", mainAccount3.id, "group4", "project-4", 4, processorType = operationProcessorType, modelType = "Model Type", mlCategory = "ML Category")
        val projectCover5 = filesRepository.save(MlreefFile(randomUUID(), mainAccount2, purpose = projectCoverPurpose))
        val project5 = CodeProject(
            id5, "slug-5", "www.url.net", "Test Code Project 2",
            "description", mainAccount3.id, "group5", "project-5", 5,
            processorType = operationProcessorType, modelType = "Model Type", mlCategory = "ML Category",
            cover = projectCover5
        )
        val project6 = CodeProject(
            id6, "slug-6", "www.url.xyz", "Test Code Project 3",
            "description", mainAccount2.id, "group6", "project-6", 6,
            VisibilityScope.PRIVATE, processorType = operationProcessorType, modelType = "Model Type", mlCategory = "ML Category",
        )
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount3,
            AccessLevel.OWNER
        )

        val returnedResult: List<DataProjectDto> = this.performGet(rootUrl, mainToken3)
            .expectOk()
            .document("projects-retrieve-all", responseFields(projectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(4 + 4) //Plus 4 predefined projects

        val returnedIds = setOf(
            returnedResult[0].id,
            returnedResult[1].id,
            returnedResult[2].id,
            returnedResult[3].id,
            returnedResult[4].id,
            returnedResult[5].id,
            returnedResult[6].id,
            returnedResult[7].id,
        )

        val idsForCheck = setOf(
            id1,
            id2,
            id4,
            id5,
            codeProjectOperation.id,
            codeProjectVisualization.id,
            codeProjectAlgorithm.id,
            dataProjectImages.id
        )
        val pathsForCheck = setOf(
            "project-1",
            "project-2",
            "project-4",
            "project-5",
            codeProjectOperation.gitlabPath,
            codeProjectVisualization.gitlabPath,
            codeProjectAlgorithm.gitlabPath,
            dataProjectImages.gitlabPath
        )

        assertThat(returnedIds).isEqualTo(idsForCheck)
        assertThat(returnedResult[0].id).isIn(idsForCheck)
        assertThat(returnedResult[0].gitlabPath).isIn(pathsForCheck)
        assertThat(returnedResult[1].id).isIn(idsForCheck)
        assertThat(returnedResult[1].gitlabPath).isIn(pathsForCheck)
        assertThat(returnedResult[2].id).isIn(idsForCheck)
        assertThat(returnedResult[2].gitlabPath).isIn(pathsForCheck)
        assertThat(returnedResult[3].id).isIn(idsForCheck)
        assertThat(returnedResult[3].gitlabPath).isIn(pathsForCheck)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own DataProject by id`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Data Project 1",
            "description",
            mainAccount.id,
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
            mainAccount.id,
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
            mainAccount2.id,
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
            mainAccount.id,
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
            mainAccount.id,
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
            mainAccount2.id,
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
            mainAccount,
            AccessLevel.OWNER
        )
        val returnedResult: DataProjectDto = this.performGet("$rootUrl/$id1", token)
            .expectOk()
            .document("data-project-retrieve-one", responseFields(projectResponseFields()))
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-1")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own CodeProject by id`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            randomUUID(),
            "slug-1",
            "www.url.com",
            "Test Data Project 1",
            "description",
            mainAccount.id,
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
            mainAccount.id,
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
            mainAccount2.id,
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
            mainAccount.id,
            "group4",
            "project-4",
            4,
            processorType = operationProcessorType
        )
        val project5 = CodeProject(
            id1,
            "slug-5",
            "www.url.net",
            "Test Code Project 5",
            "description",
            mainAccount.id,
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
            mainAccount2.id,
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
            mainAccount,
            AccessLevel.OWNER
        )

        val returnedResult: ProjectDto = this.performGet("$rootUrl/$id1", token)
            .expectOk()
            .document("code-project-retrieve-one", responseFields(projectResponseFields()))
            .returns(ProjectDto::class.java)

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve own CodeProject by namespace and slug`() {
        val id1 = randomUUID()
        val project1 = DataProject(randomUUID(), "slug-1", "www.url.com", "Test Data Project 1", "description", mainAccount.id, "mlreef", "project-1", 1, VisibilityScope.PUBLIC, mutableSetOf())
        val project2 = DataProject(randomUUID(), "slug-2", "www.url.net", "Test Data Project 2", "description", mainAccount.id, "mlreef", "project-2", 2, VisibilityScope.PUBLIC, mutableSetOf())
        val project3 = DataProject(randomUUID(), "slug-3", "www.url.xyz", "Test Data Project 3", "description", mainAccount2.id, "mlreef", "project-3", 3, VisibilityScope.PUBLIC, mutableSetOf())
        dataProjectRepository.save(project1)
        dataProjectRepository.save(project2)
        dataProjectRepository.save(project3)

        val project4 = CodeProject(
            randomUUID(),
            "slug-4",
            "www.url.com",
            "Test Code Project 4",
            "description",
            mainAccount.id,
            "mlreef",
            "project-4",
            4,
            processorType = operationProcessorType
        )
        val project5 = CodeProject(
            id1,
            "slug-5",
            "www.url.net",
            "Test Code Project 5",
            "description",
            mainAccount.id,
            "mlreef",
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
            mainAccount2.id,
            "mlreef",
            "project-6",
            6,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount,
            AccessLevel.OWNER
        )

        val returnedResult: ProjectDto = this.performGet("$rootUrl/mlreef/slug-5", token)
            .expectOk()
            .document("code-project-retrieve-by-namespace-slug", responseFields(projectResponseFields()))
            .returns(ProjectDto::class.java)

        assertThat(returnedResult.id).isEqualTo(id1)
        assertThat(returnedResult.gitlabPath).isEqualTo("project-5")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Cannot retrieve not own Project`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            randomUUID(),
            "slug-1",
            "www.url.com",
            "Test Data Project 1",
            "description",
            mainAccount.id,
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
            mainAccount.id,
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
            mainAccount2.id,
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
            mainAccount.id,
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
            mainAccount.id,
            "group5",
            "project-5",
            5,
            processorType = operationProcessorType
        )
        val project6 = CodeProject(
            id1,
            "slug-6",
            "www.url.xyz",
            "Test Code Project 6",
            "description",
            mainAccount2.id,
            "group6",
            "project-6",
            6,
            processorType = operationProcessorType,
            visibilityScope = VisibilityScope.PRIVATE
        )
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount,
            AccessLevel.OWNER
        )

        this.performGet("$rootUrl/$id1")
            .expectForbidden()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create CodeProject`() {
        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true,
            inputDataTypes = listOf(audioDataType.name),
            dataProcessorType = operationProcessorType.name,
        )

        this.mockUserAuthentication(forAccount = mainAccount)

        val returnedResult = this.performPost(codeProjectRootUrl, token, body = request)
            .expectOk()
            .document(
                "code-project-create",
                requestFields(projectCreateRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(CodeProjectDto::class.java)

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Cannot create CodeProject with name on reserved names list`() {
        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "badges",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true,
            inputDataTypes = listOf(audioDataType.name),
            dataProcessorType = operationProcessorType.name,
        )
        this.mockUserAuthentication(forAccount = mainAccount)
        this.performPost(codeProjectRootUrl, token, body = request)
            .isUnavailableForLegalReasons()

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create CodeProject by code-project path`() {
        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "Description of Test Project",
            visibility = VisibilityScope.PUBLIC,
            initializeWithReadme = true,
            inputDataTypes = listOf(audioDataType.name),
            dataProcessorType = operationProcessorType.name,
        )

        this.mockUserAuthentication(forAccount = mainAccount)

        val returnedResult = this.performPost(codeProjectRootUrl, token, body = request)
            .expectOk()
            .document(
                "code-project-create-by-path",
                requestFields(projectCreateRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(CodeProjectDto::class.java)

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can create DataProject`() {
        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "description",
            initializeWithReadme = true,
            inputDataTypes = listOf(),
            visibility = VisibilityScope.PUBLIC,
        )

        this.mockUserAuthentication(forAccount = mainAccount)

        val returnedResult = this.performPost("$rootUrl/data", token, body = request)
            .expectOk()
            .document(
                "data-project-create",
                requestFields(projectCreateRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can create DataProject by data-project path`() {
        val request = ProjectCreateRequest(
            slug = "test-project",
            namespace = "mlreef",
            name = "Test project",
            description = "description",
            initializeWithReadme = true,
            inputDataTypes = listOf(),
            visibility = VisibilityScope.PUBLIC,
        )

        this.mockUserAuthentication(forAccount = mainAccount)

        val returnedResult = this.performPost(url = dataProjectRootUrl, token = token, body = request)
            .expectOk()
            .document(
                "data-project-create-by-path",
                requestFields(projectCreateRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can fork 3rd party data project`() {
        val original = codeProjectRepository.save(
            CodeProject(
                id = randomUUID(),
                slug = "slug-1",
                url = "www.url.com",
                name = "Test Project 1",
                description = "description",
                ownerId = mainAccount2.id,
                gitlabNamespace = "group1",
                gitlabPath = "project-1",
                gitlabId = 1,
                processorType = operationProcessorType,
            )
        )

        val request = ProjectForkRequest(
            targetName = "Fork Name",
            targetPath = "fork-name",
            targetNamespace = "group1",
        )

        this.mockUserAuthentication(forAccount = mainAccount)

        val returnedResult = this.performPost("$rootUrl/fork/${original.id}", token, body = request)
            .expectOk()
            .document(
                "fork-data-project",
                requestFields(projectForkRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can fork 3rd party code project`() {
        val original = codeProjectRepository.save(
            CodeProject(
                id = randomUUID(),
                slug = "slug-4",
                url = "www.url.com",
                name = "Test Code Project 1",
                description = "description",
                ownerId = mainAccount2.id,
                gitlabNamespace = "group4",
                gitlabPath = "project-4",
                gitlabId = 4,
                processorType = operationProcessorType,
            )
        )

        val request = ProjectForkRequest(
            targetName = "Fork Name",
            targetPath = "fork-name",
        )

        this.mockUserAuthentication(forAccount = mainAccount)

        val returnedResult = this.performPost("$rootUrl/fork/${original.id}", token, body = request)
            .expectOk()
            .document(
                "fork-code-project",
                requestFields(projectForkRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(DataProjectDto::class.java)

        assertThat(returnedResult).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "description",
            mainAccount.id,
            "group1",
            "project-1",
            1,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)
        mockGitlabUpdateProject()

        val request = ProjectUpdateRequest(name = "New Test project", description = "new description")

        val returnedResult = this.performPut("$rootUrl/$id1", token, body = request)
            .expectOk()
            .document(
                "code-project-update",
                requestFields(projectUpdateRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(ProjectDto::class.java)

        assertThat(returnedResult.name).isEqualTo("New Test project")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "description",
            mainAccount.id,
            "mlreef",
            "project-1",
            1,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        dataProjectRepository.save(project1)

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)
        this.mockGitlabUpdateProject()

        val request = ProjectUpdateRequest(name = "New Test project", description = "description")

        val returnedResult = this.performPut("$rootUrl/$id1", token, body = request)
            .expectOk()
            .document(
                "data-project-update",
                requestFields(projectUpdateRequestFields()),
                responseFields(projectResponseFields())
            )
            .returns(ProjectDto::class.java)

        assertThat(returnedResult.name).isEqualTo("New Test project")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete own DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "description",
            mainAccount.id,
            "mlreef",
            "group1",
            1,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        dataProjectRepository.save(project1)

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNotNull

        this.performDelete("$rootUrl/$id1", token)
            .expectNoContent()
            .document("data-project-delete")

        assertThat(dataProjectRepository.findByIdOrNull(id1)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete own CodeProject`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "description",
            mainAccount.id,
            "group1",
            "project-1",
            1,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNotNull

        this.performDelete("$rootUrl/$id1", token)
            .expectNoContent()
            .document("code-project-delete")

        assertThat(codeProjectRepository.findByIdOrNull(id1)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve users list in DataProject`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "100 tests",
            randomUUID(),
            "mlreef",
            "group1",
            1,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        dataProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount, mainAccount2).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)
        this.mockUserAuthentication(listOf(project1.id), mainAccount2, AccessLevel.DEVELOPER)

        val returnedResult: List<UserInProjectDto> = this.performGet("$rootUrl/${project1.id}/users", token)
            .expectOk()
            .document("project-retrieve-users-list", responseFields(usersInProjectResponseFields("[].")))
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can add user to CodeProject by gitlabId in params`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "",
            mainAccount2.id,
            "group1",
            "project-1",
            1,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount, mainAccount2).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val url =
            "$rootUrl/${project1.id}/users?gitlab_id=${mainAccount2.gitlabId}&level=DEVELOPER&expires_at=2099-12-31T10:15:20Z"

        val returnedResult: List<UserInProjectDto> = this.performPost(url, token)
            .expectOk()
            .document(
                "project-add-user-by-params",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    RequestDocumentation.parameterWithName("gitlab_id").optional()
                        .description("Gitlab user id - Number"),
                    RequestDocumentation.parameterWithName("level").optional()
                        .description("Level/role of user in project"),
                    RequestDocumentation.parameterWithName("expires_at").optional()
                        .description("Date of access expiration in ISO format (not passed value means unlimited access)")
                ),
                responseFields(usersInProjectResponseFields("[]."))
            )
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to DataProject by gitlabId in param`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "100 tests",
            randomUUID(),
            "mlreef",
            "group1",
            1,
            VisibilityScope.PUBLIC,
            mutableSetOf(),
        )
        dataProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount, mainAccount2).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val url =
            "$rootUrl/${project1.id}/users?gitlab_id=${mainAccount2.gitlabId}&level=DEVELOPER&expires_at=2099-12-31T10:15:20Z"

        val returnedResult: List<UserInProjectDto> = this.performPost(url, token)
            .expectOk()
            .document(
                "project-add-user-by-params",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    RequestDocumentation.parameterWithName("gitlab_id").optional()
                        .description("Gitlab user id - Number"),
                    RequestDocumentation.parameterWithName("level").optional()
                        .description("Level/role of user in project"),
                    RequestDocumentation.parameterWithName("expires_at").optional()
                        .description("Date of access expiration in ISO format (not passed value means unlimited access)")
                ),
                responseFields(usersInProjectResponseFields("[]."))
            )
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to DataProject by gitlabId in body`() {
        val id1 = randomUUID()
        val project1 =
            DataProject(id1, "slug-1", "www.url.com", "Test Project 1", "", mainAccount2.id, "group1", "project-1", 1)
        dataProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount, mainAccount2).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val request = ProjectUserMembershipRequest(
            userId = mainAccount2.id,
            gitlabId = 10,
            level = "REPORTER",
            expiresAt = Instant.now().plus(Period.ofDays(1))
        )

        val url = "$rootUrl/${project1.id}/users"

        val returnedResult: List<UserInProjectDto> = this.performPost(url, token, request)
            .expectOk()
            .document(
                "project-add-user-by-body",
                requestFields(projectAddEditUserRequestFields()),
                responseFields(usersInProjectResponseFields("[]."))
            )
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can add user to CodeProject by gitlabId in body`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "",
            mainAccount2.id,
            "group1",
            "project-1",
            1,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount, mainAccount2).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val request = ProjectUserMembershipRequest(
            userId = mainAccount2.id,
            gitlabId = 10,
            level = "REPORTER",
            expiresAt = Instant.now().plus(Period.ofDays(1))
        )

        val url = "$rootUrl/${project1.id}/users"

        val returnedResult: List<UserInProjectDto> = this.performPost(url, token, request)
            .expectOk()
            .document(
                "project-add-user-by-body",
                requestFields(projectAddEditUserRequestFields()),
                responseFields(usersInProjectResponseFields("[]."))
            )
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete user from DataProject by userId in path`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "100 tests",
            randomUUID(),
            "mlreef",
            "group1",
            1,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        dataProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> =
            this.performDelete("$rootUrl/${project1.id}/users/${mainAccount2.id}", token)
                .expectOk()
                .document("projects-delete-user", responseFields(usersInProjectResponseFields("[].")))
                .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete user from CodeProject by userId in path`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "",
            mainAccount2.id,
            "group1",
            "project-1",
            1,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val returnedResult: List<UserInProjectDto> =
            this.performDelete("$rootUrl/${project1.id}/users/${mainAccount2.id}", token)
                .expectOk()
                .document("project-delete-user", responseFields(usersInProjectResponseFields("[].")))
                .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete user from DataProject by gitlabId in param`() {
        val id1 = randomUUID()
        val project1 = DataProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "100 tests",
            randomUUID(),
            "mlreef",
            "group1",
            1,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        dataProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project1.id}/users?gitlab_id=${mainAccount2.gitlabId}"

        val returnedResult: List<UserInProjectDto> = this.performDelete(url, token)
            .expectOk()
            .document(
                "project-delete-user-by-params",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    RequestDocumentation.parameterWithName("gitlab_id").optional()
                        .description("Gitlab user id - Number")
                ),
                responseFields(usersInProjectResponseFields("[]."))
            )
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can delete user from CodeProject by gitlabId in param`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "",
            mainAccount2.id,
            "group1",
            "project-1",
            1,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project1.id}/users?gitlab_id=${mainAccount2.gitlabId}"

        val returnedResult: List<UserInProjectDto> = this.performDelete(url, token)
            .expectOk()
            .document(
                "project-delete-user-by-params",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("user_id").optional().description("Internal User id - UUID"),
                    RequestDocumentation.parameterWithName("gitlab_id").optional()
                        .description("Gitlab user id - Number")
                ),
                responseFields(usersInProjectResponseFields("[]."))
            )
            .returnsList(UserInProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can star a project`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "",
            mainAccount2.id,
            "group1",
            "project-1",
            1,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        var projectInDb = codeProjectRepository.findByIdOrNull(project1.id)!!

        assertThat(projectInDb.stars.size).isEqualTo(0)
        assertThat(projectInDb.starsCount).isEqualTo(0)

        val url = "$rootUrl/${project1.id}/star"

        val returnedResult = this.performPost(url, token)
            .expectOk()
            .document(
                "project-place-star",
                responseFields(projectResponseFields())
            )
            .returns(ProjectDto::class.java)

        projectInDb = codeProjectRepository.findByIdOrNull(project1.id)!!

        assertThat(projectInDb.id).isEqualTo(returnedResult.id)
        assertThat(projectInDb.stars.size).isEqualTo(1)
        assertThat(projectInDb.starsCount).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can unstar a project`() {
        val id1 = randomUUID()
        val project1 = CodeProject(
            id1,
            "slug-1",
            "www.url.com",
            "Test Project 1",
            "",
            mainAccount2.id,
            "group1",
            "project-1",
            1,
            stars = mutableSetOf(Star(id1, mainAccount.id)),
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project1)

        every { projectService.getUsersInProject(any()) } answers {
            listOf(mainAccount).map { accountToUserInProject(it) }
        }

        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)

        var projectInDb = codeProjectRepository.findByIdOrNull(project1.id)!!

        assertThat(projectInDb.stars.size).isEqualTo(1)
        assertThat(projectInDb.starsCount).isEqualTo(1)

        val url = "$rootUrl/${project1.id}/star"

        val returnedResult = this.performDelete(url, token)
            .expectOk()
            .document(
                "project-remove-star",
                responseFields(projectResponseFields())
            )
            .returns(ProjectDto::class.java)

        projectInDb = codeProjectRepository.findByIdOrNull(project1.id)!!

        assertThat(projectInDb.id).isEqualTo(returnedResult.id)
        assertThat(projectInDb.stars.size).isEqualTo(0)
        assertThat(projectInDb.starsCount).isEqualTo(0)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve accessible Projects`() {
        val project1 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-1",
                "www.url.com",
                "Test Project 1",
                "description",
                mainAccount3.id,
                "group1",
                "project-1",
                1,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project2 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-2",
                "www.url.net",
                "Test Project 2",
                "description",
                mainAccount3.id,
                "group2",
                "project-2",
                2,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-3",
                "www.url.xyz",
                "Test Project 3",
                "description",
                mainAccount2.id,
                "group3",
                "project-3",
                3,
                VisibilityScope.PRIVATE,
                mutableSetOf()
            )
        )
        val project4 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-4",
                "www.url.com",
                "Test Code Project 1",
                "description",
                mainAccount3.id,
                "group4",
                "project-4",
                4,
                VisibilityScope.PRIVATE,
                processorType = operationProcessorType
            )
        )
        val project5 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-5",
                "www.url.net",
                "Test Code Project 2",
                "description",
                mainAccount3.id,
                "group5",
                "project-5",
                5,
                VisibilityScope.PRIVATE,
                processorType = operationProcessorType
            )
        )
        codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-6",
                "www.url.xyz",
                "Test Code Project 3",
                "description",
                mainAccount2.id,
                "group6",
                "project-6",
                6,
                VisibilityScope.PRIVATE,
                processorType = operationProcessorType
            )
        )

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount3,
            AccessLevel.OWNER
        )

        val returnedResult: List<DataProjectDto> = this.performGet(rootUrl, token)
            .expectOk()
            .document("project-retrieve-accessible", responseFields(projectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(4 + 4) //Plus 4 predefined projects
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve owned Projects with - own`() {
        val project1 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-1",
                "www.url.com",
                "Test Project 1",
                "description",
                mainAccount3.id,
                "group1",
                "project-1",
                1,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project2 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-2",
                "www.url.net",
                "Test Project 2",
                "description",
                mainAccount3.id,
                "group2",
                "project-2",
                2,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-3",
                "www.url.xyz",
                "Test Project 3",
                "description",
                mainAccount2.id,
                "group3",
                "project-3",
                3,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project4 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-4",
                "www.url.com",
                "Test Code Project 1",
                "description",
                mainAccount3.id,
                "group4",
                "project-4",
                4,
                processorType = operationProcessorType
            )
        )
        val project5 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-5",
                "www.url.net",
                "Test Code Project 2",
                "description",
                mainAccount3.id,
                "group5",
                "project-5",
                5,
                processorType = operationProcessorType
            )
        )
        codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-6",
                "www.url.xyz",
                "Test Code Project 3",
                "description",
                mainAccount2.id,
                "group6",
                "project-6",
                6,
                processorType = operationProcessorType
            )
        )

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount3,
            AccessLevel.OWNER
        )

        val returnedResult: List<DataProjectDto> = this.performGet(rootUrl + "/own", mainToken3)
            .expectOk()
            .document("project-retrieve-own", responseFields(projectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(4)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve owned and shared Projects with my`() {
        val project1 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-1",
                "www.url.com",
                "Test Project 1",
                "description",
                mainAccount.id,
                "group1",
                "project-1",
                1,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project2 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-2",
                "www.url.net",
                "Test Project 2",
                "description",
                mainAccount.id,
                "group2",
                "project-2",
                2,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-3",
                "www.url.xyz",
                "Test Project 3",
                "description",
                mainAccount2.id,
                "group3",
                "project-3",
                3,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project4 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-4",
                "www.url.com",
                "Test Code Project 1",
                "description",
                mainAccount.id,
                "group4",
                "project-4",
                4,
                processorType = operationProcessorType
            )
        )
        val project5 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-5",
                "www.url.net",
                "Test Code Project 2",
                "description",
                mainAccount.id,
                "group5",
                "project-5",
                5,
                processorType = operationProcessorType
            )
        )
        codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-6",
                "www.url.xyz",
                "Test Code Project 3",
                "description",
                mainAccount2.id,
                "group6",
                "project-6",
                6,
                processorType = operationProcessorType
            )
        )

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount,
            AccessLevel.OWNER
        )

        val returnedResult: List<DataProjectDto> = this.performGet(rootUrl + "/my", mainToken3)
            .expectOk()
            .document("project-retrieve-my", responseFields(projectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(4)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve unpaged public Projects`() {
        val project1 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-1",
                "www.url.com",
                "Test Project 1",
                "description",
                mainAccount3.id,
                "group1",
                "project-1",
                1,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project2 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-2",
                "www.url.net",
                "Test Project 2",
                "description",
                mainAccount3.id,
                "group2",
                "project-2",
                2,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project3 = dataProjectRepository.save(
            DataProject(
                randomUUID(),
                "slug-3",
                "www.url.xyz",
                "Test Project 3",
                "description",
                mainAccount2.id,
                "group3",
                "project-3",
                3,
                VisibilityScope.PUBLIC,
                mutableSetOf()
            )
        )
        val project4 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-4",
                "www.url.com",
                "Test Code Project 1",
                "description",
                mainAccount3.id,
                "group4",
                "project-4",
                4,
                VisibilityScope.PRIVATE,
                processorType = operationProcessorType
            )
        )
        val project5 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-5",
                "www.url.net",
                "Test Code Project 2",
                "description",
                mainAccount3.id,
                "group5",
                "project-5",
                5,
                VisibilityScope.PRIVATE,
                processorType = operationProcessorType
            )
        )
        val project6 = codeProjectRepository.save(
            CodeProject(
                randomUUID(),
                "slug-6",
                "www.url.xyz",
                "Test Code Project 3",
                "description",
                mainAccount2.id,
                "group6",
                "project-6",
                6,
                VisibilityScope.PRIVATE,
                processorType = operationProcessorType
            )
        )

        mockGetPublicProjectsIdsList(listOf(project1.id, project2.id, project3.id))
        mockUserAuthentication(listOf(project1.id, project2.id, project4.id), mainAccount3, AccessLevel.OWNER)

        val returnedResult: List<DataProjectDto> = this.performGet("$rootUrl/public", mainToken3)
            .expectOk()
            .document("project-retrieve-public-all", responseFields(projectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3 + 4) //Plus 4 predefined projects
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve starred accessible Projects with starred`() {
        val project1 = createDataProject(
            slug = "slug-1",
            name = "Test Project 1",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
            stars = listOf(mainAccount),
            inTransaction = true,
        )

        val project2 = createDataProject(
            slug = "slug-2",
            name = "Test Project 2",
            ownerId = mainAccount.id,
            namespace = "group2",
            path = "project-2",
            gitlabId = 2,
            visibility = VisibilityScope.PUBLIC,
            stars = listOf(mainAccount),
            inTransaction = true,
        )

        val project3 = createDataProject(
            slug = "slug-3",
            name = "Test Project 3",
            ownerId = mainAccount2.id,
            namespace = "group3",
            path = "project-3",
            gitlabId = 3,
            visibility = VisibilityScope.PUBLIC,
            stars = listOf(mainAccount),
            inTransaction = true,
        )

        val project4 = createCodeProject(
            slug = "slug-4",
            name = "Test Code Project 4",
            ownerId = mainAccount.id,
            namespace = "group4",
            path = "project-4",
            gitlabId = 4,
            processorType = operationProcessorType,
            visibility = VisibilityScope.PUBLIC,
            inTransaction = true,
        )

        val project5 = createCodeProject(
            slug = "slug-5",
            name = "Test Code Project 5",
            ownerId = mainAccount.id,
            namespace = "group5",
            path = "project-5",
            gitlabId = 5,
            processorType = operationProcessorType,
            visibility = VisibilityScope.PUBLIC,
            inTransaction = true,
        )

        val project6 = createCodeProject(
            slug = "slug-6",
            name = "Test Code Project 6",
            ownerId = mainAccount2.id,
            namespace = "group6",
            path = "project-6",
            gitlabId = 6,
            processorType = operationProcessorType,
            visibility = VisibilityScope.PUBLIC,
            inTransaction = true,
        )

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project3.id, project4.id, project5.id),
            mainAccount,
            AccessLevel.DEVELOPER
        )

        val returnedResult: List<DataProjectDto> = this.performGet(rootUrl + "/starred", mainToken)
            .expectOk()
            .document("project-retrieve-starred", responseFields(projectResponseFields("[].")))
            .returnsList(DataProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
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
            mainAccount3.id,
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
            mainAccount3.id,
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
            mainAccount2.id,
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
            mainAccount3.id,
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
            mainAccount3.id,
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
            mainAccount2.id,
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

        val returnedResult: ProjectDto = this.performGet("$rootUrl/mlreef/slug-1", token)
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
            mainAccount3.id,
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

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve recent Projects`() {
        val project1 = DataProject(
            randomUUID(),
            "slug-1",
            "www.url.com",
            "Test Data Project 1",
            "description",
            mainAccount3.id,
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
            mainAccount3.id,
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
            mainAccount2.id,
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
            mainAccount3.id,
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
            mainAccount3.id,
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
            mainAccount2.id,
            "group6",
            "project-6",
            6,
            processorType = operationProcessorType
        )
        codeProjectRepository.save(project4)
        codeProjectRepository.save(project5)
        codeProjectRepository.save(project6)

        createRecentProject(project1, mainAccount3)
        createRecentProject(project2, mainAccount3)
        createRecentProject(project3, mainAccount3)
        createRecentProject(project4, mainAccount3)
        createRecentProject(project5, mainAccount3)

        this.mockUserAuthentication(
            listOf(project1.id, project2.id, project4.id, project5.id),
            mainAccount3,
            AccessLevel.OWNER
        )

        val returnedResult: RestResponsePage<ProjectDto> = this.performGet("$rootUrl/recent?size=20", mainToken3)
            .expectOk()
            .document(
                "project-retrieve-recent-projects",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("page").optional().description("The page to retrieve"),
                    RequestDocumentation.parameterWithName("size").optional().description("Number of results to retrieve"),
                    RequestDocumentation.parameterWithName("sort").optional().description("Sort per a named field"),
                    RequestDocumentation.parameterWithName("name.dir").optional().description("Example, sort \$field.dir with direction 'desc' or 'asc'")
                ),
                responseFields(
                    wrapToPage(
                        projectResponseFields()
                    )
                )
            )
            .returns()


        assertThat(returnedResult.content.size).isEqualTo(5)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can commit files to repo`() {
        val project = createDataProject(
            slug = "slug-1",
            name = "Test Data Project For Commit",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1-commit",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
        )

        every { restClient.commitFiles(token = any(), projectId = any(), targetBranch = any(), commitMessage = any(), fileContents = any(), action = any(), isBase64 = any()) } answers {
            Commit("branch")
        }

        val content1 = "Some content of file 1"
        val content2 = "Some content of file 2"
        val fis1 = content1.byteInputStream(Charsets.UTF_8)
        val fis2 = content2.byteInputStream(Charsets.UTF_8)
        val multipartFile1 = MockMultipartFile("files", "file1.txt", TEXT_PLAIN_VALUE, fis1)
        val multipartFile2 = MockMultipartFile("files", "file2.txt", TEXT_PLAIN_VALUE, fis2)

        this.mockUserAuthentication(listOf(project.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project.id}/commit/${CommitOperations.CREATE.name.toLowerCase()}"

        val returnedResult: CommitDto = this.performPostMultipart(
            url = url,
            files = listOf(multipartFile1, multipartFile2),
            accessToken = mainToken,
            params = mapOf("path" to "folder/to/save", "message" to "Commit message", "branch" to "master")
        ).expectOk()
            .document(
                "project-commit-files-add",
                RequestDocumentation.requestParts(
                    RequestDocumentation.partWithName("files").description("Files to be saved to repository"),
                ),
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("path").optional().description("Path in repository the files to be saved to. Root for not provided/empty path"),
                    RequestDocumentation.parameterWithName("message").optional().description("Commit message. There will be some default message if this value is not provided"),
                    RequestDocumentation.parameterWithName("branch").description("Branch name")
                ),
                responseFields(commitFields())
            )
            .returns()

        assertThat(returnedResult).isNotNull()

        verify(exactly = 1) {
            restClient.commitFiles(
                token = mainToken,
                projectId = project.gitlabId,
                targetBranch = "master",
                commitMessage = match { it.equals("Commit message") },
                fileContents = match {
                    it.size == 2
                            && it.containsKey("folder/to/save/${multipartFile1.originalFilename}")
                            && it.containsKey("folder/to/save/${multipartFile2.originalFilename}")
                            && it["folder/to/save/${multipartFile1.originalFilename}"]?.equals(Base64.getEncoder().encodeToString(content1.toByteArray())) ?: false
                            && it["folder/to/save/${multipartFile2.originalFilename}"]?.equals(Base64.getEncoder().encodeToString(content2.toByteArray())) ?: false
                },
                action = GitlabCommitOperations.CREATE,
                force = false,
                isBase64 = true,
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can move files to new path in repo`() {
        val project = createDataProject(
            slug = "slug-1",
            name = "Test Data Project For Commit",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1-commit",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
        )

        every { restClient.commitFiles(token = any(), projectId = any(), targetBranch = any(), commitMessage = any(), fileContents = any(), action = any(), isBase64 = any()) } answers {
            val commit = Commit("branch")
            commit
        }

        this.mockUserAuthentication(listOf(project.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project.id}/commit/${CommitOperations.MOVE.name.toLowerCase()}"

        val returnedResult: CommitDto = this.performPostMultipart(
            url = url,
            accessToken = mainToken,
            params = mapOf("names" to "folder/file1.txt, folder/file2.txt", "new_path" to "new_folder", "branch" to "master")
        ).expectOk()
            .document(
                "project-commit-files-move",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("path").optional().description("Path in repository the files to be taken from. Root for not provided/empty path or path can be set in 'names' param"),
                    RequestDocumentation.parameterWithName("new_path").description("New path the files are being moved to"),
                    RequestDocumentation.parameterWithName("names").description("The list of files to be moved. The separator is ,"),
                    RequestDocumentation.parameterWithName("message").optional().description("Commit message. There will be some default message if this value is not provided"),
                    RequestDocumentation.parameterWithName("branch").description("Branch name")
                ),
                responseFields(commitFields())
            )
            .returns()

        assertThat(returnedResult).isNotNull()

        verify(exactly = 1) {
            restClient.commitFiles(
                token = mainToken,
                projectId = project.gitlabId,
                targetBranch = "master",
                commitMessage = match { it.contains(CommitOperations.MOVE.name) },
                fileContents = match {
                    it.size == 2
                            && it.containsKey("new_folder/file1.txt")
                            && it.containsKey("new_folder/file2.txt")
                            && it["new_folder/file1.txt"] == "folder/file1.txt"
                            && it["new_folder/file2.txt"] == "folder/file2.txt"
                },
                action = GitlabCommitOperations.MOVE,
                force = false,
                isBase64 = true,
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can rename file in repo`() {
        val project = createDataProject(
            slug = "slug-1",
            name = "Test Data Project For Commit",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1-commit",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
        )

        every { restClient.commitFiles(token = any(), projectId = any(), targetBranch = any(), commitMessage = any(), fileContents = any(), action = any(), isBase64 = any()) } answers {
            val commit = Commit("branch")
            commit
        }

        this.mockUserAuthentication(listOf(project.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project.id}/commit/${CommitOperations.RENAME.name.toLowerCase()}"

        val returnedResult: CommitDto = this.performPostMultipart(
            url = url,
            accessToken = mainToken,
            params = mapOf("names" to "folder/file1.txt", "new_name" to "new_file_name.txt", "branch" to "master")
        ).expectOk()
            .document(
                "project-commit-files-rename",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("path").optional().description("Path in repository the files to be taken from. Root for not provided/empty path or path can be set in 'names' param"),
                    RequestDocumentation.parameterWithName("new_name").description("New name for specific file"),
                    RequestDocumentation.parameterWithName("names")
                        .description("The file name to be renamed. Must contain only one name or an exception will be called otherwise. Can contain full path to file or file name only alone with 'path' parameter"),
                    RequestDocumentation.parameterWithName("message").optional().description("Commit message. There will be some default message if this value is not provided"),
                    RequestDocumentation.parameterWithName("branch").description("Branch name")
                ),
                responseFields(commitFields())
            )
            .returns()

        assertThat(returnedResult).isNotNull()

        verify(exactly = 1) {
            restClient.commitFiles(
                token = mainToken,
                projectId = project.gitlabId,
                targetBranch = "master",
                commitMessage = match { it.contains(CommitOperations.RENAME.name) },
                fileContents = match {
                    it.size == 1
                            && it.containsKey("folder/new_file_name.txt")
                            && it["folder/new_file_name.txt"] == "folder/file1.txt"
                },
                action = GitlabCommitOperations.MOVE,
                force = false,
                isBase64 = true,
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete files in repo`() {
        val project = createDataProject(
            slug = "slug-1",
            name = "Test Data Project For Commit",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1-commit",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
        )

        every { restClient.commitFiles(token = any(), projectId = any(), targetBranch = any(), commitMessage = any(), fileContents = any(), action = any(), isBase64 = any()) } answers {
            val commit = Commit("branch")
            commit
        }

        this.mockUserAuthentication(listOf(project.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project.id}/commit/${CommitOperations.DELETE.name.toLowerCase()}"

        val returnedResult: CommitDto = this.performPostMultipart(
            url = url,
            accessToken = mainToken,
            params = mapOf("names" to "a_folder_777/file1.txt, a_folder_888/file2.txt, a_folder_999/file3.txt", "path" to "new_folder/folder", "branch" to "master")
        ).expectOk()
            .document(
                "project-commit-files-delete",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("path").optional().description("Path in repository the files to be deleted from. Root for not provided/empty path or the path can be set in 'names' param"),
                    RequestDocumentation.parameterWithName("names").description("The list of files to be moved. The separator is ,. The names can contain the full path to file, but 'path' param has priority if was provided"),
                    RequestDocumentation.parameterWithName("message").optional().description("Commit message. There will be some default message if this value is not provided"),
                    RequestDocumentation.parameterWithName("branch").description("Branch name")
                ),
                responseFields(commitFields())
            )
            .returns()

        assertThat(returnedResult).isNotNull()

        verify(exactly = 1) {
            restClient.commitFiles(
                token = mainToken,
                projectId = project.gitlabId,
                targetBranch = "master",
                commitMessage = match { it.contains(CommitOperations.DELETE.name) },
                fileContents = match {
                    it.size == 3
                            && it.containsKey("new_folder/folder/file1.txt")
                            && it.containsKey("new_folder/folder/file2.txt")
                            && it.containsKey("new_folder/folder/file3.txt")
                            && it["new_folder/folder/file1.txt"] == null
                            && it["new_folder/folder/file2.txt"] == null
                            && it["new_folder/folder/file3.txt"] == null
                },
                action = GitlabCommitOperations.DELETE,
                force = false,
                isBase64 = true,
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update a file in repo`() {
        val project = createDataProject(
            slug = "slug-1",
            name = "Test Data Project For Commit",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1-commit",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
        )

        every { restClient.commitFiles(token = any(), projectId = any(), targetBranch = any(), commitMessage = any(), fileContents = any(), action = any(), isBase64 = any()) } answers {
            Commit("branch")
        }

        val content1 = "Some new content of file 1"
        val fis1 = content1.byteInputStream(Charsets.UTF_8)
        val multipartFile1 = MockMultipartFile("files", "another_filename.txt", TEXT_PLAIN_VALUE, fis1)

        this.mockUserAuthentication(listOf(project.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project.id}/commit/${CommitOperations.UPDATE.name.toLowerCase()}"

        val returnedResult: CommitDto = this.performPostMultipart(
            url = url,
            files = listOf(multipartFile1),
            accessToken = mainToken,
            params = mapOf("path" to "folder/with/target/file", "names" to "target_file_name.txt", "branch" to "master")
        ).expectOk()
            .document(
                "project-commit-files-update",
                RequestDocumentation.requestParts(
                    RequestDocumentation.partWithName("files").description("Files to be updated in repository"),
                ),
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("path").optional().description("Path in repository the file to be updated in. Root for not provided/empty path or the path can be passed alone with 'names' param"),
                    RequestDocumentation.parameterWithName("names").optional().description("Commit message. There will be some default message if this value is not provided"),
                    RequestDocumentation.parameterWithName("message").optional().description("Commit message. There will be some default message if this value is not provided"),
                    RequestDocumentation.parameterWithName("branch").description("Branch name")
                ),
                responseFields(commitFields())
            )
            .returns()

        assertThat(returnedResult).isNotNull()

        verify(exactly = 1) {
            restClient.commitFiles(
                token = mainToken,
                projectId = project.gitlabId,
                targetBranch = "master",
                commitMessage = match { it.contains(CommitOperations.UPDATE.name) },
                fileContents = match {
                    it.size == 1
                            && it.containsKey("folder/with/target/file/target_file_name.txt")
                            && it["folder/with/target/file/target_file_name.txt"]?.equals(Base64.getEncoder().encodeToString(content1.toByteArray())) ?: false
                },
                action = GitlabCommitOperations.UPDATE,
                force = false,
                isBase64 = true,
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can rename folder in repo`() {
        val project = createDataProject(
            slug = "slug-1",
            name = "Test Data Project For Commit",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1-commit",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
        )

        every { restClient.commitFiles(token = any(), projectId = any(), targetBranch = any(), commitMessage = any(), fileContents = any(), action = any(), isBase64 = any()) } answers {
            Commit("branch")
        }

        mockFilesInBranchForCommit()

        this.mockUserAuthentication(listOf(project.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project.id}/commit/${CommitOperations.RENAME.name.toLowerCase()}"

        val returnedResult: CommitDto = this.performPostMultipart(
            url = url,
            accessToken = mainToken,
            params = mapOf("names" to "folder/folder_in_folder", "new_name" to "new_folder_in_folder", "branch" to "master")
        ).expectOk().returns()

        assertThat(returnedResult).isNotNull()

        verify(exactly = 1) {
            restClient.commitFiles(
                token = mainToken,
                projectId = project.gitlabId,
                targetBranch = "master",
                commitMessage = match { it.contains(CommitOperations.RENAME.name) },
                fileContents = match {
                    it.size == 3
                            && it.containsKey("folder/new_folder_in_folder/fileInFolder_1_1.txt")
                            && it.containsKey("folder/new_folder_in_folder/fileInFolder_2_1.txt")
                            && it.containsKey("folder/new_folder_in_folder/folder_in_folder_in_folder/fileInFolder_1_1_1.java")
                            && it["folder/new_folder_in_folder/fileInFolder_1_1.txt"] == "folder/folder_in_folder/fileInFolder_1_1.txt"
                            && it["folder/new_folder_in_folder/fileInFolder_2_1.txt"] == "folder/folder_in_folder/fileInFolder_2_1.txt"
                            && it["folder/new_folder_in_folder/folder_in_folder_in_folder/fileInFolder_1_1_1.java"] == "folder/folder_in_folder/folder_in_folder_in_folder/fileInFolder_1_1_1.java"
                },
                action = GitlabCommitOperations.MOVE,
                force = false,
                isBase64 = true,
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can move folder in repo`() {
        val project = createDataProject(
            slug = "slug-1",
            name = "Test Data Project For Commit",
            ownerId = mainAccount.id,
            namespace = "group1",
            path = "project-1-commit",
            gitlabId = 1,
            visibility = VisibilityScope.PUBLIC,
        )

        every { restClient.commitFiles(token = any(), projectId = any(), targetBranch = any(), commitMessage = any(), fileContents = any(), action = any(), isBase64 = any()) } answers {
            Commit("branch")
        }

        mockFilesInBranchForCommit()

        this.mockUserAuthentication(listOf(project.id), mainAccount, AccessLevel.OWNER)

        val url = "$rootUrl/${project.id}/commit/${CommitOperations.MOVE.name.toLowerCase()}"

        val returnedResult: CommitDto = this.performPostMultipart(
            url = url,
            accessToken = mainToken,
            params = mapOf("names" to "folder/folder_in_folder", "new_path" to "new_folder", "branch" to "master")
        ).expectOk().returns()

        assertThat(returnedResult).isNotNull()

        verify(exactly = 1) {
            restClient.commitFiles(
                token = mainToken,
                projectId = project.gitlabId,
                targetBranch = "master",
                commitMessage = match { it.contains(CommitOperations.MOVE.name) },
                fileContents = match {
                    it.size == 3
                            && it.containsKey("new_folder/folder_in_folder/fileInFolder_1_1.txt")
                            && it.containsKey("new_folder/folder_in_folder/fileInFolder_2_1.txt")
                            && it.containsKey("new_folder/folder_in_folder/folder_in_folder_in_folder/fileInFolder_1_1_1.java")
                            && it["new_folder/folder_in_folder/fileInFolder_1_1.txt"] == "folder/folder_in_folder/fileInFolder_1_1.txt"
                            && it["new_folder/folder_in_folder/fileInFolder_2_1.txt"] == "folder/folder_in_folder/fileInFolder_2_1.txt"
                            && it["new_folder/folder_in_folder/folder_in_folder_in_folder/fileInFolder_1_1_1.java"] == "folder/folder_in_folder/folder_in_folder_in_folder/fileInFolder_1_1_1.java"
                },
                action = GitlabCommitOperations.MOVE,
                force = false,
                isBase64 = true,
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create cover for Project`() {
        val project = createCodeProject(ownerId = mainAccount.id)

        this.mockUserAuthentication(
            listOf(project.id),
            mainAccount,
            AccessLevel.OWNER
        )

        val fis = "Some text data inside file".byteInputStream(Charsets.UTF_8)
        val multipartFile = MockMultipartFile("file", fis)

        val url = "$rootUrl/${project.id}/cover/create"

        val result = this.performPostMultipart(url, multipartFile, null, "jwt-access-token")
            .expectOk()
            .document("create-project-cover",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("desc").optional().description("Description")
                ),
                responseFields(uploadedFileFields())
            )
            .returns(MlreefFileDto::class.java)

        val projectInDb = projectRepository.findByIdOrNull(project.id)!!

        assertThat(result).isNotNull()
        assertThat(projectInDb.cover).isNotNull()
        assertThat(projectInDb.cover!!.id).isEqualTo(result.id)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can update cover for Project`() {
        val coverFile = createMlreefFile(mainAccount)
        val project = createCodeProject(ownerId = mainAccount.id, cover = coverFile)

        var projectInDb = projectRepository.findByIdOrNull(project.id)!!

        assertThat(projectInDb.cover).isNotNull()

        this.mockUserAuthentication(
            listOf(project.id),
            mainAccount,
            AccessLevel.OWNER
        )

        val fis = "Some text data inside file".byteInputStream(Charsets.UTF_8)
        val multipartFile = MockMultipartFile("file", fis)

        val url = "$rootUrl/${project.id}/cover/update"

        val result = this.performPostMultipart(url, multipartFile, null, "jwt-access-token")
            .expectOk()
            .document("update-project-cover",
                RequestDocumentation.requestParameters(
                    RequestDocumentation.parameterWithName("desc").optional().description("Description")
                ),
                responseFields(uploadedFileFields())
            )
            .returns(MlreefFileDto::class.java)

        projectInDb = projectRepository.findByIdOrNull(project.id)!!

        assertThat(result).isNotNull()
        assertThat(projectInDb.cover).isNotNull()
        assertThat(projectInDb.cover!!.id).isEqualTo(result.id)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete cover for Project`() {
        val coverFile = createMlreefFile(mainAccount)
        val project = createCodeProject(ownerId = mainAccount.id, cover = coverFile)

        var projectInDb = projectRepository.findByIdOrNull(project.id)!!

        assertThat(projectInDb.cover).isNotNull()

        this.mockUserAuthentication(
            listOf(project.id),
            mainAccount,
            AccessLevel.OWNER
        )

        val url = "$rootUrl/${project.id}/cover/delete"

        this.performDelete(url, "jwt-access-token")
            .expectNoContent()
            .document("delete-project-cover",)

        projectInDb = projectRepository.findByIdOrNull(project.id)!!

        assertThat(projectInDb.cover).isNull()
    }

}

private fun projectCreateRequestFields(): List<FieldDescriptor> = listOf(
    PayloadDocumentation.fieldWithPath("slug").type(STRING).description("Valid slug of Project (matches Gitlab)"),
    PayloadDocumentation.fieldWithPath("namespace").type(STRING).description("Gitlab group or user namespace"),
    PayloadDocumentation.fieldWithPath("name").type(STRING).description("Name of Project"),
    PayloadDocumentation.fieldWithPath("description").type(STRING).description("Description of Project"),
    PayloadDocumentation.fieldWithPath("initialize_with_readme").type(BOOLEAN)
        .description("Boolean flag, if that Project should have an automatic commit for a README"),
    PayloadDocumentation.fieldWithPath("visibility").type(STRING)
        .description("Visibility, can be 'PUBLIC', 'INTERNAL', 'PRIVATE'"),
    PayloadDocumentation.fieldWithPath("experiments").type(OBJECT).optional().description("Experiments arrays"),
    PayloadDocumentation.fieldWithPath("input_data_types").type(listOf(OBJECT)).optional()
        .description("Project datatypes array"),
    PayloadDocumentation.fieldWithPath("data_processor_type").type(STRING).optional()
        .description("Type of the code project's data processor"),
)

private fun projectForkRequestFields(): List<FieldDescriptor> = listOf(
    PayloadDocumentation.fieldWithPath("target_namespace_gitlab_id").type(NUMBER).optional()
        .description("DEPRECATED! Use target_namespace! The gitlabId (long) of the namespace you want to fork to."),
    PayloadDocumentation.fieldWithPath("target_name").type(STRING).optional()
        .description("The new name of the project. If omitted will default to the original project's value."),
    PayloadDocumentation.fieldWithPath("target_path").type(STRING).optional()
        .description("The new path (slug) of the project. If omitted will default to the original project's value."),
    PayloadDocumentation.fieldWithPath("target_namespace").type(STRING).optional()
        .description("The namespace name (String) or id (Number) the project to be forked to"),
)

fun usersInProjectResponseFields(prefix: String = ""): List<FieldDescriptor> = listOf(
    PayloadDocumentation.fieldWithPath(prefix + "id").type(STRING).description("Data project id"),
    PayloadDocumentation.fieldWithPath(prefix + "user_name").type(STRING).description("User name"),
    PayloadDocumentation.fieldWithPath(prefix + "email").type(STRING).description("User's email"),
    PayloadDocumentation.fieldWithPath(prefix + "gitlab_id").type(NUMBER).description("Id in gitlab"),
    PayloadDocumentation.fieldWithPath(prefix + "access_level").type(STRING).description("Role"),
    PayloadDocumentation.fieldWithPath(prefix + "expired_at").type(STRING).optional().description("Access expires at")
)

fun projectAddEditUserRequestFields(): List<FieldDescriptor> = listOf(
    PayloadDocumentation.fieldWithPath("user_id").type(STRING).optional().description("User id"),
    PayloadDocumentation.fieldWithPath("gitlab_id").type(NUMBER).optional().description("Gitlab user id"),
    PayloadDocumentation.fieldWithPath("username").type(NUMBER).optional().description("Username"),
    PayloadDocumentation.fieldWithPath("level").type(STRING).optional().description("Role/Level of user in project"),
    PayloadDocumentation.fieldWithPath("expires_at").type(STRING).optional().description("Expiration date")
)
