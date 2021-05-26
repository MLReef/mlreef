package com.mlreef.rest.api

import com.mlreef.rest.api.v1.CreateEnvironmentRequest
import com.mlreef.rest.api.v1.PublishingRequest
import com.mlreef.rest.api.v1.dto.BaseEnvironmentsDto
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.PublishingMachineType
import com.mlreef.rest.feature.MLREEF_NAME
import com.mlreef.rest.testcommons.RestResponsePage
import io.mockk.MockKAnnotations
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import javax.transaction.Transactional

class PublishingApiTest : AbstractRestApiTest() {
    private lateinit var codeProject1: CodeProject
    private lateinit var codeProject2: CodeProject
    private lateinit var processor1: Processor
    private lateinit var processor2: Processor
    private lateinit var processor3: Processor
    private lateinit var processor4: Processor
    private lateinit var processor5: Processor

    val rootUrl = "/api/v1/code-projects"

    @BeforeEach
    @Transactional
    fun prepareRepo() {
        MockKAnnotations.init(this, relaxUnitFun = true, relaxed = true)

        codeProject1 = createCodeProject(name = "Test project publishing", slug = "test-project-publishing")
            .let { codeProjectRepository.findByIdOrNull(it.id) }!!

        codeProject2 = createCodeProject(name = "Test project publishing 2", slug = "test-project-publishing-2")
            .let { codeProjectRepository.findByIdOrNull(it.id) }!!

        processor1 = createProcessor(codeProject1, name = "Processor 1", branch = "master", version = "0.1")
            .let { processorsRepository.findByIdOrNull(it.id) }!!

        processor2 = createProcessor(codeProject1, name = "Processor 2", branch = "master", version = "0.2")
            .let { processorsRepository.findByIdOrNull(it.id) }!!

        processor3 = createProcessor(codeProject1, name = "Processor 3", branch = "master", version = "0.3")
            .let { processorsRepository.findByIdOrNull(it.id) }!!

        processor4 = createProcessor(codeProject1, name = "Processor 4", branch = "branch", version = "0.1")
            .let { processorsRepository.findByIdOrNull(it.id) }!!

        processor5 = createProcessor(codeProject2, name = "Processor 5", branch = "master", version = "0.1")
            .let { processorsRepository.findByIdOrNull(it.id) }!!

        mockGitlabPipelineWithBranch("targetBranch")

        this.mockUserAuthentication(listOf(codeProject1.id), mainAccount3, forToken = mainToken3, level = AccessLevel.OWNER)
        this.mockUserAuthentication(listOf(codeProject2.id), mainAccount, forToken = mainToken, level = AccessLevel.OWNER)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get Environments list`() {
        val url = "$rootUrl/environments"
        val returnedResult = this.performGet(url, mainToken3)
            .andExpect(status().isOk)
            .document(
                "publish-environments-list",
                responseFields(environmentsFields("[]."))
            )
            .returnsList(BaseEnvironmentsDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    @Disabled("Currently we must no use it")
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
        val returnedResult = this.performPost(url, mainToken3, request)
            .andExpect(status().isOk)
            .document(
                "create-publish-environment",
                requestFields(createEnvironmetRequestFields()),
                responseFields(environmentsFields())
            )
            .returns(BaseEnvironmentsDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Disabled("Currently we must no use it")
    @Tag(TestTags.RESTDOC)
    fun `Can delete Environment`() {
        val envToDelete = createBaseEnvironment()

        mockSecurityContextHolder(generateAdminTokenDetails())

        val url = "$rootUrl/environments/${envToDelete.id}"

        this.performDelete(url, token)
            .andExpect(status().isNoContent)
            .document("delete-publish-environment")
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get published info for Repository`() {
        this.mockFilesInBranch(MLREEF_NAME)

        val url = "$rootUrl/${codeProject1.id}/publish"
        val result: RestResponsePage<CodeProjectPublishingDto> = this.performGet(url, mainToken3)
            .andExpect(status().isOk)
            .document(
                "code-projects-publish-info",
                requestParameters(
                    *pageableResourceParameters(),
                    parameterWithName("branch").optional().description("Filter by branch"),
                    parameterWithName("version").optional().description("Filter by version"),
                ),
                responseFields(
                    wrapToPage(
                        publishingProcessFields()
                    )
                )
            )
            .returns()

        assertThat(result).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get publish info by id`() {
        val url = "$rootUrl/${codeProject1.id}/publish/${processor1.id}"

        val returnedResult = this.performGet(url, mainToken3)
            .andExpect(status().isOk)
            .document(
                "code-projects-publish-info-by-id",
                responseFields(publishingProcessFields())
            )
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(returnedResult.id).isEqualTo(processor1.id)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get publish info by branch and version`() {
        val url = "$rootUrl/${codeProject1.id}/publish/${processor1.branch}/${processor1.version}"

        val returnedResult = this.performGet(url, mainToken3)
            .andExpect(status().isOk)
            .document(
                "code-projects-publish-info-by-branch-version",
                responseFields(publishingProcessFields())
            )
            .returns(CodeProjectPublishingDto::class.java)

        assertThat(returnedResult.id).isEqualTo(processor1.id)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can get latest publish info `() {
        val url = "$rootUrl/${codeProject1.id}/publish/latest"

        val returnedResult = this.performGet(url, mainToken3)
            .andExpect(status().isOk)
            .document(
                "code-projects-publish-info-latest",
                requestParameters(
                    parameterWithName("branch").optional().description("For branch"),
                    parameterWithName("version").optional().description("For version"),
                ),
                responseFields(publishingProcessFields())
            )
            .returns(CodeProjectPublishingDto::class.java)

        //sometimes processor 3 is being created after processor 4
        assertThat(returnedResult.name).isIn(processor3.name, processor4.name)
        assertThat(returnedResult.id).isIn(processor3.id, processor4.id)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Publish existing Repository`() {
        val request = PublishingRequest(
            path = "main.py",
            requirementsFile = "requirements.txt",
            environment = baseEnv1.id,
            branch = "master",
            version = "0.10"
        )

        this.mockFilesInBranch(request.path!!)

        val url = "$rootUrl/${codeProject1.id}/publish"
        val returnedResult = this.performPost(url, mainToken3, request)
            .andExpect(status().isOk)
            .document(
                "code-projects-publish-success",
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

        val url = "$rootUrl/${codeProject1.id}/master/0.1/unpublish"
        val returnedResult = this.performPost(url, mainToken3)
            .andExpect(status().isOk)
            .document(
                "code-projects-unpublish-success",
                responseFields(publishingProcessFields())
            )
            .returns(CodeProjectPublishingDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Republish existing Repository`() {
        val request = PublishingRequest(
            path = "main.py",
            environment = baseEnv2.id,
            branch = "master",
            version = "0.1",
        )

        this.mockFilesInBranch(request.path!!)

        val url = "$rootUrl/${codeProject1.id}/republish"
        val returnedResult = this.performPost(url, mainToken3, request)
            .andExpect(status().isOk)
            .document(
                "code-projects-republish-success",
                requestFields(projectPublishRequestFields()),
                responseFields(publishingProcessFields(""))
            )
            .returns(CodeProjectPublishingDto::class.java)
    }

    fun projectPublishRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).optional().description("Slug for processor"),
            fieldWithPath("path").type(JsonFieldType.STRING).optional().description("Path to main script"),
            fieldWithPath("requirements_file").type(JsonFieldType.STRING).optional().description("Path to requirements.txt file (null if default requirements.txt needs to be used)"),
            fieldWithPath("environment").type(JsonFieldType.STRING).description("Environment id"),
            fieldWithPath("branch").type(JsonFieldType.STRING).description("Branch for publishing"),
            fieldWithPath("version").optional().type(JsonFieldType.STRING).description("User's version"),
            fieldWithPath("model_type").type(JsonFieldType.STRING).optional().description("Model type"),
            fieldWithPath("ml_category").type(JsonFieldType.STRING).optional().description("ML Category"),
            fieldWithPath("accepted_publishing_terms").type(JsonFieldType.STRING).optional().description("Date of terms accepted"),
        )
    }

    fun createEnvironmetRequestFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("title").type(JsonFieldType.STRING).description("Environment title"),
            fieldWithPath("docker_image").type(JsonFieldType.STRING).description("Docker image based on"),
            fieldWithPath("description").type(JsonFieldType.STRING).optional().description("Description"),
            fieldWithPath("requirements").type(JsonFieldType.STRING).optional().description("Library requirements"),
            fieldWithPath("machine_type").type(JsonFieldType.STRING).optional().description("Machine type"),
            fieldWithPath("sdk_version").type(JsonFieldType.STRING).optional().description("SDK/environment version"),
        )
    }
}
