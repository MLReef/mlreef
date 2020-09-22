package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.CodeProject
import com.mlreef.rest.Person
import com.mlreef.rest.api.v1.dto.PublishingStatusDto
import io.mockk.MockKAnnotations
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.test.annotation.Rollback
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import javax.transaction.Transactional

class CodePublishingApiTest : AbstractRestApiTest() {

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
        val request = Any()

        this.mockGetUserProjectsList(listOf(codeProject.id), account, AccessLevel.OWNER)

        val url = "$rootUrl/${codeProject.id}/publish"
        val returnedResult = this.performPost(url, token)
            .andExpect(status().isOk)
//            .document("code-projects-publish-success",
//                //requestFields(),
//                //responseFields()
//            )
            .returns(PublishingStatusDto::class.java)

        assertThat(returnedResult.status).isEqualTo("success")
    }
}
