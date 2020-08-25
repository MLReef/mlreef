package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.BaseEnvironment
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.UserRole
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime
import java.util.UUID.randomUUID


class YamlFileGeneratorTest {

    @Test
    fun `Template is found`() {
        val generator = YamlFileGenerator()
        assertThat(generator).isNotNull
    }

    @Test
    fun `Input and output is not empty`() {
        val generator = YamlFileGenerator()
        assertThat(generator.input).isNotEmpty()
        assertThat(generator.output).isNotEmpty()
    }

    @Test
    fun `Template contains all necessary constants`() {
        val generator = YamlFileGenerator()
        assertThat(generator.input).contains(YamlFileGenerator.EPF_IMAGE_TAG)
        assertThat(generator.input).contains(YamlFileGenerator.EPF_GITLAB_HOST)
        assertThat(generator.input).contains(YamlFileGenerator.EPF_PIPELINE_URL)
        assertThat(generator.input).contains(YamlFileGenerator.EPF_PIPELINE_SECRET)
        assertThat(generator.input).contains(YamlFileGenerator.CONF_EMAIL)
        assertThat(generator.input).contains(YamlFileGenerator.CONF_NAME)
        assertThat(generator.input).contains(YamlFileGenerator.SOURCE_BRANCH)
        assertThat(generator.input).contains(YamlFileGenerator.TARGET_BRANCH)
        assertThat(generator.input).contains(YamlFileGenerator.INPUT_FILE_LIST)
        assertThat(generator.input).contains(YamlFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `Single strings get replaced`() {
        val generator = YamlFileGenerator()
            .replaceAllSingleStrings()

        assertThat(generator.output).doesNotContain(YamlFileGenerator.EPF_IMAGE_TAG)
        assertThat(generator.output).doesNotContain(YamlFileGenerator.EPF_GITLAB_HOST)
        assertThat(generator.output).doesNotContain(YamlFileGenerator.EPF_PIPELINE_URL)
        assertThat(generator.output).doesNotContain(YamlFileGenerator.EPF_PIPELINE_SECRET)
        assertThat(generator.output).doesNotContain(YamlFileGenerator.CONF_EMAIL)
        assertThat(generator.output).doesNotContain(YamlFileGenerator.CONF_NAME)
        assertThat(generator.output).doesNotContain(YamlFileGenerator.SOURCE_BRANCH)
        assertThat(generator.output).doesNotContain(YamlFileGenerator.TARGET_BRANCH)
    }

    @Test
    fun `PIPELINE_STRING is not replaced implicitly`() {
        val generator = YamlFileGenerator()
        assertThat(generator.output).contains(YamlFileGenerator.PIPELINE_STRING)
        generator.replaceAllSingleStrings()
        assertThat(generator.output).contains(YamlFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `PIPELINE_STRING is replaced explicitly`() {
        val generator = YamlFileGenerator()
        assertThat(generator.output).contains(YamlFileGenerator.PIPELINE_STRING)
        generator.replacePipeline()
        assertThat(generator.output).doesNotContain(YamlFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `Pipelines are multiline`() {
        val generator = YamlFileGenerator()
        assertThat(generator.output).contains(YamlFileGenerator.PIPELINE_STRING)

        val countLinesBefore = generator.output.count { it == '\n' }

        val list = listOf(
            mockDataProcessorInstance("commons-data-operation1"),
            mockDataProcessorInstance("commons-data-operation2"))
        generator.replacePipeline(list)

        val countLinesAfterwards = generator.output.count { it == '\n' }

        assertThat(generator.output).doesNotContain(YamlFileGenerator.PIPELINE_STRING)
        assertThat(countLinesAfterwards).isEqualTo(countLinesBefore + 1)
    }

    @Test
    fun `Pipelines are indented correctly`() {
        val generator = YamlFileGenerator()
        assertThat(generator.output).contains(YamlFileGenerator.PIPELINE_STRING)

        generator.replacePipeline(listOf(
            mockDataProcessorInstance("commons-data-operation1"),
            mockDataProcessorInstance("commons-data-operation2")
        ))

        generator.output.lines()
            .filter { it.contains("python") }
            .forEach {
                val indent = it.indexOf("-")
                val expected = 4
                assertThat(indent)
                    .withFailMessage("Expected an indentation of $expected spaces for line: '$it'")
                    .isEqualTo(expected)
            }
    }

    private fun mockDataProcessorInstance(slug: String): DataProcessorInstance {
        val dataOperation = DataOperation(randomUUID(), slug, "name", DataType.ANY, DataType.ANY)
        val processorVersion = ProcessorVersion(
            id = dataOperation.id, dataProcessor = dataOperation, publisher = Person(randomUUID(), "subject", "name", 1, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now()),
            command = "augment", number = 1, baseEnvironment = BaseEnvironment.default())

        val processorParameter1 = ProcessorParameter(randomUUID(), processorVersion.id, "stringParam", ParameterType.STRING, 0, "")
        val processorParameter2 = ProcessorParameter(randomUUID(), processorVersion.id, "floatParam", ParameterType.FLOAT, 1, "0.1")
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), processorVersion)
        dataProcessorInstance.addParameterInstances(processorParameter1, "string")
        dataProcessorInstance.addParameterInstances(processorParameter2, "0.1")
        return dataProcessorInstance
    }
}
