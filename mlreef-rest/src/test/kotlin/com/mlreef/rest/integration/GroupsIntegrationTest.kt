package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.dto.GroupOfUserDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

class GroupsIntegrationTest : IntegrationRestApiTest() {
    val rootUrl = "/api/v1/groups"

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @Test
    fun `Can retrieve all own groups`() {
        val (account, password, _) = gitlabHelper.createRealUser(index = -1)

        val (group1, gitlabGroup1) = gitlabHelper.createRealGroup(account)
        val (group2, gitlabGroup2) = gitlabHelper.createRealGroup(account)
        val (group3, gitlabGroup3) = gitlabHelper.createRealGroup(account)

        //when
        val returnedResult: List<GroupOfUserDto> = this.mockMvc.perform(
            this.acceptContentAuth(RestDocumentationRequestBuilders.get(rootUrl), account))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn().let {
                val constructCollectionType = objectMapper.typeFactory.constructCollectionType(List::class.java, GroupOfUserDto::class.java)
                objectMapper.readValue(it.response.contentAsByteArray, constructCollectionType)
            }

        //then
        assertThat(returnedResult.size).isEqualTo(3)
        assertThat(returnedResult.map(GroupOfUserDto::id).toSortedSet()).isEqualTo(listOf(group1.id, group2.id, group3.id).toSortedSet())
    }

    private fun genericGroupOfUserResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Group id"),
            PayloadDocumentation.fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Group name"),
            PayloadDocumentation.fieldWithPath(prefix + "access_level").type(JsonFieldType.STRING).description("Access level")
        )
    }
}