package com.mlreef.rest.api

import org.junit.jupiter.api.Disabled
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation

@Disabled
class GroupsApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/groups"

    private fun genericGroupOfUserResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Group id"),
            PayloadDocumentation.fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("Group name"),
            PayloadDocumentation.fieldWithPath(prefix + "access_level").type(JsonFieldType.STRING).description("Access level")
        )
    }
}