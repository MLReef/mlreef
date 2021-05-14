package com.mlreef.rest.api

import com.mlreef.rest.api.v1.SlugDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Group
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.feature.system.SessionsService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class NamesApiTest : AbstractRestApiTest() {

    val projectNamesRoot = "/api/v1/project-names"
    val groupNamesRoot = "/api/v1/group-names"

    @Autowired
    private lateinit var sessionService: SessionsService

    @BeforeEach
    fun setUp() {
        sessionService.killAllSessions("username0000")
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can request project check-availability slug for unused slug`() {
        this.mockUserAuthentication(forAccount = mainAccount)
        val returnedResult = this.performGet("$projectNamesRoot/is-available?name=Bla%asdf", mainToken)
            .expectOk()
            .document(
                "project-check-availability-success",
                requestParameters(
                    parameterWithName("name").description("Name to be checked for existence"),
                    parameterWithName("namespace").optional()
                        .description("namespace to check - if null, personal namespace of User will be used.")
                ),
                responseFields(slugDtoResponseFields())
            )
            .returns(SlugDto::class.java)

        assertThat(returnedResult).isNotNull
        assertThat(returnedResult.slug).isEqualTo("bla-asdf")
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `project check-availability returns 409 conflict if slug is already used`() {
        val project1 = DataProject(
            randomUUID(),
            "test-project",
            "www.url.xyz",
            "Test Data Project 3",
            "description",
            mainPerson.id,
            "mlreef",
            "test-project",
            3,
            VisibilityScope.PUBLIC,
            mutableSetOf()
        )
        dataProjectRepository.save(project1)
        this.mockUserAuthentication(listOf(project1.id), mainAccount, AccessLevel.OWNER)
        this.performGet("$projectNamesRoot/is-available?name=test-project", mainToken).isConflict()
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `project check-availability returns 451 forbidden if name is reserved word`() {
        this.mockUserAuthentication(forAccount = mainAccount)
        this.performGet("$projectNamesRoot/is-available?name=badges", mainToken).isUnavailableForLegalReasons()
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can request group check-availability slug for unused slug`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val returnedResult = this.performGet("$groupNamesRoot/is-available?name=New Group", mainToken)
            .expectOk()
            .document(
                "group-check-availability-success",
                requestParameters(
                    parameterWithName("name").description("Name to be checked for existence"),
                ),
                responseFields(slugDtoResponseFields())
            )
            .returns(SlugDto::class.java)

        assertThat(returnedResult).isNotNull
        assertThat(returnedResult.slug).isEqualTo("new-group")
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `group check-availability returns 451 forbidden if name is reserved word`() {
        this.mockUserAuthentication()

        this.performGet("$groupNamesRoot/is-available?name=abuse_reports", mainToken).isUnavailableForLegalReasons()
    }

    fun slugDtoResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Valid usable Slug"),
        )
    }

}
