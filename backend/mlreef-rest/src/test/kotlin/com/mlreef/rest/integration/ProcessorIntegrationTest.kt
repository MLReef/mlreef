package com.mlreef.rest.integration

import com.mlreef.rest.api.v1.ProcessorCreateRequest
import com.mlreef.rest.api.v1.dto.ProcessorDto
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.testcommons.RestResponsePage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.test.annotation.Rollback
import java.util.UUID
import javax.transaction.Transactional

class ProcessorIntegrationTest : AbstractIntegrationTest() {
    val rootUrl = "/api/v1/data-processors"
    val rootUrl2 = "/api/v1/code-projects"

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account, processorType = operationProcessorType)
        val (codeProject2, _) = createRealCodeProject(token, account, processorType = algorithmProcessorType)

        createProcessor(codeProject, branch = "master", version = "1", slug = UUID.randomUUID().toString())
        createProcessor(codeProject, branch = "master", version = "2", slug = UUID.randomUUID().toString())
        createProcessor(codeProject2, branch = "master", version = "1", slug = UUID.randomUUID().toString())

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(rootUrl, token)
            .expectOk()
            .returns()

        assertThat(returnedResult.content.size).isEqualTo(3 + 4)
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filtered`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account)
        val (codeProject2, _) = createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)
        val url = "$rootUrl?type=OPERATION&input_data_type=IMAGE&output_data_type=VIDEO"

        val returnedResult: RestResponsePage<ProcessorDto> = this.performGet(url, token)
            .expectOk()
            .returns()

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("OPERATION")
            assertThat(it.inputDataType.contains("IMAGE")).isTrue()
            assertThat(it.outputDataType.contains("VIDEO")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters combined 1`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account)
        val (codeProject2, _) = createRealCodeProject(token, account)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=OPERATION&input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url, token)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("OPERATION")
            assertThat(it.inputDataType.contains("VIDEO")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters combined 2`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(
            token,
            account,
            processorType = visualizationProcessorType,
            outputTypes = listOf(imageDataType)
        )
        val (codeProject2, _) = createRealCodeProject(
            token,
            account,
            processorType = visualizationProcessorType,
            outputTypes = listOf(imageDataType)
        )

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=VISUALIZATION&output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url, token)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("VISUALIZATION")
            assertThat(it.outputDataType.contains("IMAGE")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters input DataType`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account, inputTypes = listOf(videoDataType))
        val (codeProject2, _) = createRealCodeProject(token, account, inputTypes = listOf(videoDataType))

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?input_data_type=VIDEO"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.inputDataType.contains("VIDEO")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters output DataType`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account, outputTypes = listOf(imageDataType))
        val (codeProject2, _) = createRealCodeProject(token, account, outputTypes = listOf(imageDataType))

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?output_data_type=IMAGE"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.outputDataType.contains("IMAGE")).isTrue()
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters OPERATION`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account, processorType = operationProcessorType)
        val (codeProject2, _) = createRealCodeProject(token, account, processorType = operationProcessorType)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=OPERATION"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo("OPERATION")
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters VISUALIZATION`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account, processorType = visualizationProcessorType)
        val (codeProject2, _) = createRealCodeProject(token, account, processorType = visualizationProcessorType)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=VISUALIZATION"
        val returnedResult = performFilterRequest(url, token)
        returnedResult.forEach {
            assertThat(it.type).isEqualTo("VISUALIZATION")
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve all DataProcessors filters ALGORITHM`() {
        val (account, token, _) = createRealUser()
        val (codeProject, _) = createRealCodeProject(token, account, processorType = algorithmProcessorType)
        val (codeProject2, _) = createRealCodeProject(token, account, processorType = algorithmProcessorType)

        createManyMocks(codeProject, codeProject2)

        val url = "$rootUrl?type=ALGORITHM"
        val returnedResult = performFilterRequest(url, token)

        returnedResult.forEach {
            assertThat(it.type).isEqualTo("ALGORITHM")
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `Cannot retrieve foreign DataProcessor`() {
        val (account, token1, _) = createRealUser()
        val (account2, token2, _) = createRealUser()

        val (codeProject, _) = createRealCodeProject(token1, account)
        val (codeProject2, _) = createRealCodeProject(token2, account2)

        createProcessor(codeProject)

        this.performGet("$rootUrl/${codeProject2.id}/processor", token1)
            .expect4xx()
    }

    @Transactional
    @Rollback
    @Test
    @Disabled("Data processor must be created using publishing")
    fun `Can create new Processor`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealCodeProject(token, account)

        val request = ProcessorCreateRequest(
            slug = "slug",
            name = "New Processor",
            branch = "master",
            version = "1",
            description = "description",
        )

        val url = "$rootUrl2/${project.id}/processor"

        val returnedResult: ProcessorDto = this.performPost(url, token, body = request)
            .expectOk()
            .returns(ProcessorDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `Can retrieve specific own DataProcessor`() {
        val (account, token, _) = createRealUser()
        val (project, _) = createRealCodeProject(token, account)

        createProcessor(project)

        this.performGet("$rootUrl2/${project.id}/processor", token)
            .expectOk()
    }

    private fun createManyMocks(codeProject: CodeProject, codeProject2: CodeProject) {
        createProcessor(
            project = codeProject,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 1",
            slug = "slug-1"
        )
        createProcessor(
            project = codeProject,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 2",
            slug = "slug-2"
        )
        createProcessor(
            project = codeProject,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 3",
            slug = "slug-3"
        )
        createProcessor(
            project = codeProject2,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 4",
            slug = "slug-4"
        )
        createProcessor(
            project = codeProject2,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 5",
            slug = "slug-5"
        )
        createProcessor(
            project = codeProject2,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 6",
            slug = "slug-6"
        )
        createProcessor(
            project = codeProject,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 7",
            slug = "slug-7"
        )
        createProcessor(
            project = codeProject,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 8",
            slug = "slug-8"
        )
        createProcessor(
            project = codeProject,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 9",
            slug = "slug-9"
        )
        createProcessor(
            project = codeProject2,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 10",
            slug = "slug-10"
        )
        createProcessor(
            project = codeProject2,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 11",
            slug = "slug-11"
        )
        createProcessor(
            project = codeProject2,
            branch = "master",
            version = UUID.randomUUID().toString(),
            name = "Process 12",
            slug = "slug-12"
        )
    }

    private fun performFilterRequest(url: String, token: String): RestResponsePage<ProcessorDto> {
        return this.performGet(url, token)
            .expectOk()
            .returns()
    }
}
