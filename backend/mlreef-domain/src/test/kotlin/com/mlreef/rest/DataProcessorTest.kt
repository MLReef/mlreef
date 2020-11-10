package com.mlreef.rest

import io.mockk.every
import io.mockk.mockk
import java.time.ZonedDateTime.*
import java.util.UUID.*
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

internal class DataProcessorTest {
    val dataAlgorithm = DataAlgorithm(
        id = randomUUID(),
        name = "Test Data Operation",
        slug = "test-data-operation",
        author = mockk { every { id } returns randomUUID() },
        codeProject = mockk { every { id } returns randomUUID() },
        codeProjectId = randomUUID(),
        createdAt = now(),
        inputDataType = DataType.ANY,
        outputDataType = DataType.ANY,
    )

    val dataOperation = DataOperation(
        id = randomUUID(),
        name = "Test Data Operation",
        slug = "test-data-operation",
        author = mockk { every { id } returns randomUUID() },
        codeProject = mockk { every { id } returns randomUUID() },
        codeProjectId = randomUUID(),
        createdAt = now(),
        inputDataType = DataType.ANY,
        outputDataType = DataType.ANY,
    )

    val dataVisualization = DataVisualization(
        id = randomUUID(),
        name = "Test Data Operation",
        slug = "test-data-operation",
        author = mockk { every { id } returns randomUUID() },
        codeProject = mockk { every { id } returns randomUUID() },
        codeProjectId = randomUUID(),
        createdAt = now(),
        inputDataType = DataType.ANY,
    )

    @Test fun `Can copy DataAlgorithm`() = this.`Can copy entity`(source = dataAlgorithm)
    @Test fun `Can copy DataOperation`() = this.`Can copy entity`(source = dataOperation)
    @Test fun `Can copy DataVisualization`() = this.`Can copy entity`(source = dataVisualization)

    @Test fun `Can set DataAlgorithm fields to null`() = this.`Can set fields null`(source = dataAlgorithm)
    @Test fun `Can set DataOperation fields to null`() = this.`Can set fields null`(source = dataOperation)
    @Test fun `Can set DataVisualization fields to null`() = this.`Can set fields null`(source = dataVisualization)

    private fun `Can copy entity`(source: DataProcessor) {
        with(source.copy()) {
            assertThat(id).isEqualTo(source.id)
            assertThat(slug).isEqualTo(source.slug)
            assertThat(name).isEqualTo(source.name)
            assertThat(description).isEqualTo(source.description)
            assertThat(author).isEqualTo(source.author)
            assertThat(codeProject).isEqualTo(source.codeProject)
            assertThat(codeProjectId).isEqualTo(source.codeProjectId)
            assertThat(createdAt).isEqualTo(source.createdAt)
            assertThat(inputDataType).isEqualTo(source.inputDataType)
            assertThat(outputDataType).isEqualTo(source.outputDataType)
        }
    }

    private fun `Can set fields null`(source: DataProcessor) {
        with(source.copy(
            author = null,
            codeProject = null,
            codeProjectId = null,
        )) {
            assertThat(id).isEqualTo(source.id)
            assertThat(slug).isEqualTo(source.slug)
            assertThat(name).isEqualTo(source.name)
            assertThat(description).isEqualTo(source.description)
            assertThat(author).isNull()
            assertThat(codeProject).isNull()
            assertThat(codeProjectId).isNull()
            assertThat(createdAt).isNotNull
            assertThat(inputDataType).isEqualTo(source.inputDataType)
            assertThat(outputDataType).isEqualTo(source.outputDataType)
        }
    }
}
