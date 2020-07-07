package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.ProcessorParameter
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.ConfigFileApplicationContextInitializer
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import java.util.UUID.randomUUID

@SpringJUnitConfig(initializers = [ConfigFileApplicationContextInitializer::class])
@ActiveProfiles(ApplicationProfiles.TEST)
class YamlFileGeneratorTest {

    @Test
    fun `template is found`() {
        val generator = YamlFileGenerator()
        generator.init()
        assertThat(generator).isNotNull()
    }

    @Test
    fun `input and output is not empty`() {
        val generator = YamlFileGenerator()
        generator.init()
        assertThat(generator.input).isNotEmpty()
        assertThat(generator.output).isNotEmpty()
    }

    @Test
    fun `template contains all necessary constants`() {
        val generator = YamlFileGenerator()
        generator.init()
        assertContains(generator.input, YamlFileGenerator.EPF_TAG)
        assertContains(generator.input, YamlFileGenerator.CONF_EMAIL)
        assertContains(generator.input, YamlFileGenerator.CONF_NAME)
        assertContains(generator.input, YamlFileGenerator.GITLAB_ROOT_URL)
        assertContains(generator.input, YamlFileGenerator.GITLAB_GROUP)
        assertContains(generator.input, YamlFileGenerator.GITLAB_PROJECT)
        assertContains(generator.input, YamlFileGenerator.SOURCE_BRANCH)
        assertContains(generator.input, YamlFileGenerator.TARGET_BRANCH)
        assertContains(generator.input, YamlFileGenerator.PIPELINE_STRING)
        assertContains(generator.input, YamlFileGenerator.INPUT_FILE_LIST)
    }

    @Test
    fun `single strings get replaced`() {
        val generator = YamlFileGenerator()
        generator.init()
        assertContains(generator.output, YamlFileGenerator.EPF_TAG)
        assertContains(generator.output, YamlFileGenerator.CONF_EMAIL)
        assertContains(generator.output, YamlFileGenerator.CONF_NAME)
        assertContains(generator.output, YamlFileGenerator.GITLAB_ROOT_URL)
        assertContains(generator.output, YamlFileGenerator.GITLAB_GROUP)
        assertContains(generator.output, YamlFileGenerator.GITLAB_PROJECT)
        assertContains(generator.output, YamlFileGenerator.SOURCE_BRANCH)
        assertContains(generator.output, YamlFileGenerator.TARGET_BRANCH)
        assertContains(generator.output, YamlFileGenerator.INPUT_FILE_LIST)

        assertContains(generator.output, YamlFileGenerator.PIPELINE_STRING)

        generator.replaceAllSingleStrings()

        assertMissing(generator.output, YamlFileGenerator.EPF_TAG)
        assertMissing(generator.output, YamlFileGenerator.CONF_EMAIL)
        assertMissing(generator.output, YamlFileGenerator.CONF_NAME)
        assertMissing(generator.output, YamlFileGenerator.GITLAB_ROOT_URL)
        assertMissing(generator.output, YamlFileGenerator.GITLAB_GROUP)
        assertMissing(generator.output, YamlFileGenerator.GITLAB_PROJECT)
        assertMissing(generator.output, YamlFileGenerator.SOURCE_BRANCH)
        assertMissing(generator.output, YamlFileGenerator.TARGET_BRANCH)
        assertMissing(generator.output, YamlFileGenerator.INPUT_FILE_LIST)
    }

    @Test
    fun `PIPELINE_STRING is not replaced implicitly`() {
        val generator = YamlFileGenerator()
        generator.init()
        assertContains(generator.output, YamlFileGenerator.PIPELINE_STRING)
        generator.replaceAllSingleStrings()
        assertContains(generator.output, YamlFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `PIPELINE_STRING is replaced explicitly`() {
        val generator = YamlFileGenerator()
        generator.init()
        assertContains(generator.output, YamlFileGenerator.PIPELINE_STRING)
        generator.replacePipeline(listOf())
        assertMissing(generator.output, YamlFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `Pipelines are multiline`() {
        val generator = YamlFileGenerator()
        generator.init()
        assertContains(generator.output, YamlFileGenerator.PIPELINE_STRING)

        val countLinesBefore = generator.output.count { it == '\n' }

        val list = listOf(
            mockDataProcessorInstance("commons-data-operation1"),
            mockDataProcessorInstance("commons-data-operation2"))
        generator.replacePipeline(list)

        val countLinesAfterwards = generator.output.count { it == '\n' }

        assertMissing(generator.output, YamlFileGenerator.PIPELINE_STRING)
        assertThat(countLinesAfterwards).isEqualTo(countLinesBefore + 1)
    }

    @Test
    fun `Pipelines are indented correctly`() {
        val generator = YamlFileGenerator().apply { init() }
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
        val dataOp1 = DataOperation(randomUUID(), slug, "name", "command", DataType.ANY, DataType.ANY)
        val processorParameter1 = ProcessorParameter(randomUUID(), dataOp1.id, "stringParam", ParameterType.STRING, 0, "")
        val processorParameter2 = ProcessorParameter(randomUUID(), dataOp1.id, "floatParam", ParameterType.FLOAT, 1, "0.1")
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), dataOp1)
        dataProcessorInstance.addParameterInstances(processorParameter1, "string")
        dataProcessorInstance.addParameterInstances(processorParameter2, "0.1")
        return dataProcessorInstance
    }

    private fun assertContains(string: String, needle: String) {
        assertThat(string.indexOf(needle)).isPositive()
    }

    private fun assertMissing(string: String, needle: String) {
        assertThat(string.indexOf(needle)).isNegative()
    }
}
