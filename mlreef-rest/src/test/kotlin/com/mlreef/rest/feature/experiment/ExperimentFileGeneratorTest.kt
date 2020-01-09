package com.mlreef.rest.feature.experiment

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
class ExperimentFileGeneratorTest {

    @Test
    fun `template is found`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertThat(generator).isNotNull
    }

    @Test
    fun `input and output is not empty`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertThat(generator.input).isNotEmpty()
        assertThat(generator.output).isNotEmpty()
    }

    @Test
    fun `template contains all necessary constants`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertContains(generator.input, ExperimentFileGenerator.EPF_TAG)
        assertContains(generator.input, ExperimentFileGenerator.CONF_EMAIL)
        assertContains(generator.input, ExperimentFileGenerator.CONF_NAME)
        assertContains(generator.input, ExperimentFileGenerator.GITLAB_ROOT_URL)
        assertContains(generator.input, ExperimentFileGenerator.GITLAB_GROUP)
        assertContains(generator.input, ExperimentFileGenerator.GITLAB_PROJECT)
        assertContains(generator.input, ExperimentFileGenerator.SOURCE_BRANCH)
        assertContains(generator.input, ExperimentFileGenerator.TARGET_BRANCH)
        assertContains(generator.input, ExperimentFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `single strings get replaced`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertContains(generator.output, ExperimentFileGenerator.EPF_TAG)
        assertContains(generator.output, ExperimentFileGenerator.CONF_EMAIL)
        assertContains(generator.output, ExperimentFileGenerator.CONF_NAME)
        assertContains(generator.output, ExperimentFileGenerator.GITLAB_ROOT_URL)
        assertContains(generator.output, ExperimentFileGenerator.GITLAB_GROUP)
        assertContains(generator.output, ExperimentFileGenerator.GITLAB_PROJECT)
        assertContains(generator.output, ExperimentFileGenerator.SOURCE_BRANCH)
        assertContains(generator.output, ExperimentFileGenerator.TARGET_BRANCH)
        assertContains(generator.output, ExperimentFileGenerator.PIPELINE_STRING)

        generator.replaceAllSingleStrings()

        assertMissing(generator.output, ExperimentFileGenerator.EPF_TAG)
        assertMissing(generator.output, ExperimentFileGenerator.CONF_EMAIL)
        assertMissing(generator.output, ExperimentFileGenerator.CONF_NAME)
        assertMissing(generator.output, ExperimentFileGenerator.GITLAB_ROOT_URL)
        assertMissing(generator.output, ExperimentFileGenerator.GITLAB_GROUP)
        assertMissing(generator.output, ExperimentFileGenerator.GITLAB_PROJECT)
        assertMissing(generator.output, ExperimentFileGenerator.SOURCE_BRANCH)
        assertMissing(generator.output, ExperimentFileGenerator.TARGET_BRANCH)
    }

    @Test
    fun `PIPELINE_STRING is not replaced implicitly`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertContains(generator.output, ExperimentFileGenerator.PIPELINE_STRING)
        generator.replaceAllSingleStrings()
        assertContains(generator.output, ExperimentFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `PIPELINE_STRING is replaced explicitly`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertContains(generator.output, ExperimentFileGenerator.PIPELINE_STRING)
        generator.replacePipeline(listOf())
        assertMissing(generator.output, ExperimentFileGenerator.PIPELINE_STRING)
    }

    @Test
    fun `Pipelines are multiline`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertContains(generator.output, ExperimentFileGenerator.PIPELINE_STRING)

        val countLinesBefore = generator.output.count { it == '\n' }

        val list = listOf(
            mockDataProcessorInstance("commons-data-operation1"),
            mockDataProcessorInstance("commons-data-operation2"))
        generator.replacePipeline(list)

        val countLinesAfterwards = generator.output.count { it == '\n' }

        assertMissing(generator.output, ExperimentFileGenerator.PIPELINE_STRING)
        assertThat(countLinesAfterwards).isEqualTo(countLinesBefore + 1)
    }

    @Test
    fun `Pipelines are indented correctly`() {
        val generator = ExperimentFileGenerator()
        generator.init()
        assertContains(generator.output, ExperimentFileGenerator.PIPELINE_STRING)

        val indexOf = generator.output.indexOf("git checkout -b %TARGET_BRANCH%")
        val lineBegin = generator.output.indexOf("\n", indexOf)
        val dash = generator.output.indexOf("-", lineBegin)
        val indent = dash - lineBegin - 1

        val list = listOf(
            mockDataProcessorInstance("commons-data-operation1"),
            mockDataProcessorInstance("commons-data-operation2"))
        generator.replacePipeline(list)

        val slugBegin = generator.output.indexOf("python ")
        val nextLineBegin = generator.output.indexOf("\n", slugBegin)
        val testDash = generator.output.indexOf("-", nextLineBegin)
        val testIndent = testDash - nextLineBegin - 1
        assertThat(testIndent).isEqualTo(4)
        assertThat(testIndent).isEqualTo(indent)
    }

    private fun mockDataProcessorInstance(slug: String): DataProcessorInstance {
        val dataOp1 = DataOperation(randomUUID(), slug, "name", "command", DataType.ANY, DataType.ANY)
        val processorParameter1 = ProcessorParameter(randomUUID(), dataOp1.id, "stringParam", ParameterType.STRING)
        val processorParameter2 = ProcessorParameter(randomUUID(), dataOp1.id, "floatParam", ParameterType.FLOAT)
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
