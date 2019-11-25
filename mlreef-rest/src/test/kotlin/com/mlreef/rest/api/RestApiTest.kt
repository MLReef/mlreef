package com.mlreef.rest.api

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation
import org.springframework.restdocs.mockmvc.RestDocumentationResultHandler
import org.springframework.restdocs.operation.preprocess.Preprocessors
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation
import org.springframework.restdocs.snippet.Snippet
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext

@TestPropertySource(locations = ["classpath:secrets.properties"])
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class RestApiTest {

    lateinit var mockMvc: MockMvc

    val objectMapper = ObjectMapper()


    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(MockMvcRestDocumentation.documentationConfiguration(restDocumentation))
//            .alwaysDo<DefaultMockMvcBuilder>(
//                document())
            .build()
    }


    protected fun document(name: String, vararg snippets: Snippet): RestDocumentationResultHandler {
        return MockMvcRestDocumentation.document(
            name,
            Preprocessors.preprocessRequest(Preprocessors.prettyPrint()),
            Preprocessors.preprocessResponse(Preprocessors.prettyPrint()),
            *snippets
        ) as RestDocumentationResultHandler
    }

    protected fun errorResponseFields(): List<FieldDescriptor> {
        return listOf(
            PayloadDocumentation.fieldWithPath("errorCode").type(JsonFieldType.NUMBER).description("Unique error code"),
            PayloadDocumentation.fieldWithPath("errorName").type(JsonFieldType.STRING).description("Short error title"),
            PayloadDocumentation.fieldWithPath("errorMessage").type(JsonFieldType.STRING).description("A detailed message"),
            PayloadDocumentation.fieldWithPath("time").type(JsonFieldType.STRING).description("Timestamp of error")
        )
    }


}
