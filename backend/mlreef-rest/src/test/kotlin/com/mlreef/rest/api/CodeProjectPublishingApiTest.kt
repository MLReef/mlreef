package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.CodeProject
import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.PublishingRequest
import com.mlreef.rest.api.v1.dto.CodeProjectPublishingPipelineDto
import io.mockk.MockKAnnotations
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
    @AfterEach
    @Transactional
    fun clearRepo() {
        MockKAnnotations.init(this, relaxUnitFun = true, relaxed = true)
        pipelineTestPreparationTrait.apply()
        account = pipelineTestPreparationTrait.account
        token = pipelineTestPreparationTrait.token
        subject = pipelineTestPreparationTrait.subject
        codeProject = pipelineTestPreparationTrait.codeProject

        mockGitlabPipelineWithBranch("targetBranch")
        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Publish existing Repository`() {
        val request = PublishingRequest(
            path = "main.py"
        )

        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${codeProject.id}/publish"
        val returnedResult = this.performPost(url, token, request)
            .andExpect(status().isOk)
            .document("code-projects-publish-success",
                requestFields(projectPublishRequestFields()),
                responseFields(commitFields("commit."))
            )
            .returns(CodeProjectPublishingPipelineDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Unpublish existing Repository`() {
        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${codeProject.id}/unpublish"
        val returnedResult = this.performPost(url, token)
            .andExpect(status().isOk)
            .document("code-projects-unpublish-success",
                responseFields(commitFields("commit."))
            )
            .returns(CodeProjectPublishingPipelineDto::class.java)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can Republish existing Repository`() {
        val request = PublishingRequest(
            path = "main.py"
        )

        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${codeProject.id}/republish"
        val returnedResult = this.performPost(url, token, request)
            .andExpect(status().isOk)
            .document("code-projects-republish-success",
                requestFields(projectPublishRequestFields()),
                responseFields(commitFields("commit."))
            )
            .returns(CodeProjectPublishingPipelineDto::class.java)
    }

    fun projectPublishRequestFields(): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath("path").type(JsonFieldType.STRING).description("Path to main script")
        )
    }
}
