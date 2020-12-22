package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.UserRole
import com.mlreef.rest.utils.RandomUtils
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime
import java.util.UUID.randomUUID


class YamlFileGeneratorTest {

    @Test
    fun `Template contains all necessary constants`() {
        with(YamlFileGenerator) {
            assertThat(template).isNotEmpty()
            assertThat(template).contains(EPF_IMAGE_TAG)
            assertThat(template).contains(EPF_GITLAB_HOST)
            assertThat(template).contains(EPF_PIPELINE_URL)
            assertThat(template).contains(EPF_PIPELINE_SECRET)
            assertThat(template).contains(CONF_EMAIL)
            assertThat(template).contains(CONF_NAME)
            assertThat(template).contains(TARGET_BRANCH)
            assertThat(template).contains(PIPELINE_STRING)
        }
    }

    @Test
    fun `Can replace specific template Strings`() {
        val output = YamlFileGenerator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",
            dataProcessors = listOf(),
        )

        assertThat(output).doesNotContain(EPF_IMAGE_TAG)
        assertThat(output).doesNotContain(EPF_GITLAB_HOST)
        assertThat(output).doesNotContain(EPF_PIPELINE_URL)
        assertThat(output).doesNotContain(EPF_PIPELINE_SECRET)
        assertThat(output).doesNotContain(CONF_EMAIL)
        assertThat(output).doesNotContain(CONF_NAME)
        assertThat(output).doesNotContain(SOURCE_BRANCH)
        assertThat(output).doesNotContain(TARGET_BRANCH)
    }

    @Test
    fun `Can render Data Operations`() {
        assertThat(YamlFileGenerator.template).contains(PIPELINE_STRING)
        val output = YamlFileGenerator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",
            dataProcessors = listOf(),
        )
        assertThat(output).doesNotContain(PIPELINE_STRING)
    }

    @Test
    fun `Can render multiple Data Operations`() {
        val generator = YamlFileGenerator
        val countLinesBefore = generator.template.lines().count()

        val output = generator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",
            dataProcessors = listOf(
                mockDataProcessorInstance("commons-data-operation1"),
                mockDataProcessorInstance("commons-data-operation2")
            ),
        )

        assertThat(output).doesNotContain(PIPELINE_STRING)
        assertThat(output.lines().count()).isEqualTo(countLinesBefore + 1)
    }

    @Test
    fun `Pipelines are indented correctly`() {
        val output = YamlFileGenerator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",
            dataProcessors = listOf(
                mockDataProcessorInstance("commons-data-operation1"),
                mockDataProcessorInstance("commons-data-operation2")
            ),
        )

        output.lines()
            .filter { it.contains("python") }
            .forEach {
                assertThat(it.indexOf("python"))
                    .withFailMessage("Expected an indentation of ${4} spaces for line: '$it'")
                    .isEqualTo(4)
            }

        println(output.lines())
    }

    private fun mockDataProcessorInstance(slug: String): DataProcessorInstance {
        val dataOperation = DataOperation(randomUUID(), slug, "name", DataType.ANY, DataType.ANY)

        val baseEnv = BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker1:latest", sdkVersion = "3.7")

        val publisher = Person(randomUUID(), "subject", "name", 1, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())

        val processorVersion = ProcessorVersion(
            id = dataOperation.id, dataProcessor = dataOperation, publishingInfo = PublishingInfo(publisher = publisher),
            command = "augment", number = 1, baseEnvironment = baseEnv)

        val processorParameter1 = ProcessorParameter(randomUUID(), processorVersion.id, "stringParam", ParameterType.STRING, 0, "")
        val processorParameter2 = ProcessorParameter(randomUUID(), processorVersion.id, "floatParam", ParameterType.FLOAT, 1, "0.1")
        val dataProcessorInstance = DataProcessorInstance(randomUUID(), processorVersion)
        dataProcessorInstance.addParameterInstances(processorParameter1, "string")
        dataProcessorInstance.addParameterInstances(processorParameter2, "0.1")
        return dataProcessorInstance
    }
}
