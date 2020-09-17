package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.Person
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.api.v1.SlugDto
import com.mlreef.rest.feature.system.SessionsService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
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
    private lateinit var subject: Person

    @Autowired
    private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var sessionService: SessionsService

    @Autowired
    private lateinit var groupsRepository: GroupRepository

    @BeforeEach
    @AfterEach
    fun setUp() {
        truncateAllTables()

        accountSubjectPreparationTrait.apply()

        account = accountSubjectPreparationTrait.account
        token = accountSubjectPreparationTrait.token
        subject = accountSubjectPreparationTrait.subject

        // To update user permissions before each test
        sessionService.killAllSessions("username0000")
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can request project check-availability slug for unused slug`() {
        this.mockGetUserProjectsList(account)
        val returnedResult = this.performGet("$projectNamesRoot/is-available?name=Bla%asdf", token)
            .expectOk()
            .document("project-check-availability-success",
                requestParameters(
                    parameterWithName("name").description("Name to be checked for existence"),
                    parameterWithName("namespace").optional().description("namespace to check - if null, personal namespace of User will be used.")
                ),
                responseFields(slugDtoResponseFields()))
            .returns(SlugDto::class.java)

        assertThat(returnedResult).isNotNull
        assertThat(returnedResult.slug).isEqualTo("bla-asdf")
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `project check-availability returns 409 conflict if slug is already used`() {
        val project1 = DataProject(randomUUID(), "test-project", "www.url.xyz", "Test Data Project 3", "description", subject.id, "mlreef", "test-project", 3, VisibilityScope.PUBLIC, listOf())
        dataProjectRepository.save(project1)
        this.mockGetUserProjectsList(listOf(project1.id), account, AccessLevel.OWNER)
        this.performGet("$projectNamesRoot/is-available?name=test-project", token).isConflict()
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `project check-availability returns 451 forbidden if name is reserved word`() {
        this.mockGetUserProjectsList(account)
        this.performGet("$projectNamesRoot/is-available?name=badges", token).isUnavailableForLegalReasons()
    }

    @Transactional
    @Rollback
    @Tag(TestTags.RESTDOC)
    @Test
    fun `Can request group check-availability slug for unused slug`() {
        val group = Group(id = randomUUID(), slug = "slug", name = "group-name", gitlabId = 100L)
        groupsRepository.save(group)

        this.mockUserAuthentication(groupIdLevelMap = mutableMapOf(group.id to AccessLevel.OWNER))

        val returnedResult = this.performGet("$groupNamesRoot/is-available?name=New Group", token)
            .expectOk()
            .document("group-check-availability-success",
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

        this.performGet("$groupNamesRoot/is-available?name=abuse_reports", token).isUnavailableForLegalReasons()
    }

    fun slugDtoResponseFields(): List<FieldDescriptor> {
        return listOf(
            fieldWithPath("slug").type(JsonFieldType.STRING).description("Valid usable Slug"),
        )
    }

}
