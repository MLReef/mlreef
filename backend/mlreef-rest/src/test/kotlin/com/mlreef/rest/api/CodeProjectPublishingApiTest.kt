package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.CodeProject
import com.mlreef.rest.Person
import com.mlreef.rest.PublishingMachineType
import com.mlreef.rest.api.v1.CreateEnvironmentRequest
import com.mlreef.rest.api.v1.PublishingRequest
import com.mlreef.rest.api.v1.dto.BaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingDto
import com.mlreef.rest.api.v1.dto.CommitDto
import com.mlreef.rest.feature.MLREEF_NAME
import io.mockk.MockKAnnotations
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import javax.transaction.Transactional

class CodeProjectPublishingApiTest : AbstractRestApiTest() {

    private lateinit var subject: Person
    private lateinit var codeProject: CodeProject
    val rootUrl = "/api/v1/code-projects"

    @Autowired
    private lateinit var pipelineTestPreparationTrait: PipelineTestPreparationTrait

    @BeforeEach
    @Transactional
    fun prepareRepo() {
        MockKAnnotations.init(this, relaxUnitFun = true, relaxed = true)
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        token = pipelineTestPreparationTrait.token
        subject = pipelineTestPreparationTrait.subject
        codeProject = pipelineTestPreparationTrait.codeProject

        mockGitlabPipelineWithBranch("targetBranch")
        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)
    }

    @AfterEach
    @Transactional
    fun clearRepo() {
        pipelineTestPreparationTrait.deleteAll()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get Environments list`() {
        val url = "$rootUrl/environments"
        val returnedResult = this.performGet(url, token)
            .andExpect(status().isOk)
            .document("publish-environments-list",
                responseFields(environmentsFields("[]."))
            )
            .returnsList(BaseEnvironmentsDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can create Environment`() {
        val request = CreateEnvironmentRequest(
            title = "New environmet",
            dockerImage = "docker:cocker",
            description = "Some portion of the text that never being read by anybody",
            requirements = "superlib=1.1.1 \n anotherlib=0.0.0.0.0.1",
            machineType = PublishingMachineType.CPU,
            sdkVersion = "3.7"
        )

        mockSecurityContextHolder(generateAdminTokenDetails())

        val url = "$rootUrl/environments"
        val returnedResult = this.performPost(url, token, request)
            .andExpect(status().isOk)
            .document("create-publish-environment",
                requestFields(createEnvironmetRequestFields()),
                responseFields(environmentsFields())
            )
            .returns(BaseEnvironmentsDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can delete Environment`() {
        val envToDelete = createEnvironment()

        mockSecurityContextHolder(generateAdminTokenDetails())

        val url = "$rootUrl/environments/${envToDelete.id}"
        val returnedResult = this.performDelete(url, token)
            .andExpect(status().isNoContent)
            .document("delete-publish-environment")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get published info for Repository`() {
        this.mockFilesInBranch(MLREEF_NAME)
        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)
        this.createVersionForDataProcessor(
            this.createDataProcessor(codeProject = codeProject), published = true
        )

        val url = "$rootUrl/${codeProject.id}/publish"
        val result = this.performGet(url, token)
            .andExpect(status().isOk)
            .document("code-projects-publish-info",
                responseFields(publishingProcessFields())
            )
            .returns(CodeProjectPublishingDto::class.java)

        Assertions.assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Publish existing Repository`() {
        val request = PublishingRequest(
            path = "main.py",
            environment = pipelineTestPreparationTrait.baseEnv1.id
        )

        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${codeProject.id}/publish"
        val returnedResult = this.performPost(url, token, request)
            .andExpect(status().isOk)
            .document("code-projects-publish-success",
                requestFields(projectPublishRequestFields()),
                responseFields(publishingProcessFields(""))
            )
            .returns(CodeProjectPublishingDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Unpublish existing Repository`() {
        this.mockFilesInBranch(MLREEF_NAME)
        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)
        this.createVersionForDataProcessor(
            this.createDataProcessor(codeProject = codeProject), published = true
        )

        val url = "$rootUrl/${codeProject.id}/unpublish"
        val returnedResult = this.performPost(url, token)
            .andExpect(status().isOk)
            .document("code-projects-unpublish-success",
                responseFields(commitFields())
            )
            .returns(CommitDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Republish existing Repository`() {
        val request = PublishingRequest(
            path = "main.py",
            environment = pipelineTestPreparationTrait.baseEnv2.id
        )

        this.mockFilesInBranchOnlyOnce(MLREEF_NAME, "main.py")
        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)
        this.createVersionForDataProcessor(
            this.createDataProcessor(codeProject = codeProject), published = true
        )

        val url = "$rootUrl/${codeProject.id}/republish"
        val returnedResult = this.performPost(url, token, request)
            .andExpect(status().isOk)
            .document("code-projects-republish-success",
                requestFields(projectPublishRequestFields()),
                responseFields(publishingProcessFields(""))
            )
            .returns(CodeProjectPublishingDto::class.java)
    }

    fun projectPublishRequestFields(): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath("path").type(JsonFieldType.STRING).optional().description("Path to main script"),
            PayloadDocumentation.fieldWithPath("environment").type(JsonFieldType.STRING).description("Environment id"),
            PayloadDocumentation.fieldWithPath("model_type").type(JsonFieldType.STRING).optional().description("Model type"),
            PayloadDocumentation.fieldWithPath("ml_category").type(JsonFieldType.STRING).optional().description("ML Category"),
            PayloadDocumentation.fieldWithPath("accepted_publishing_terms").type(JsonFieldType.STRING).optional().description("Date of terms accepted"),
        )
    }

    fun createEnvironmetRequestFields(): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath("title").type(JsonFieldType.STRING).description("Environment title"),
            PayloadDocumentation.fieldWithPath("docker_image").type(JsonFieldType.STRING).description("Docker image based on"),
            PayloadDocumentation.fieldWithPath("description").type(JsonFieldType.STRING).optional().description("Description"),
            PayloadDocumentation.fieldWithPath("requirements").type(JsonFieldType.STRING).optional().description("Library requirements"),
            PayloadDocumentation.fieldWithPath("machine_type").type(JsonFieldType.STRING).optional().description("Machine type"),
            PayloadDocumentation.fieldWithPath("sdk_version").type(JsonFieldType.STRING).optional().description("SDK/environment version"),
        )
    }
}
