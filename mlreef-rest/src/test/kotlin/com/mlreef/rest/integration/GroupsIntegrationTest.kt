package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.dto.GroupOfUserDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

class GroupsIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/groups"

    @Test
    fun `Can retrieve all own groups`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)

        val (group1, _) = testsHelper.createRealGroup(account)
        val (group2, _) = testsHelper.createRealGroup(account)
        val (group3, _) = testsHelper.createRealGroup(account)

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
}