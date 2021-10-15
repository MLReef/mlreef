package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.domain.*
import com.mlreef.rest.utils.RandomUtils
import io.mockk.mockk
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID
import java.util.UUID.randomUUID


class YamlFileGeneratorTest {

    private val yamlFileGenerator = YamlFileGenerator()

    @Test
    fun `Template contains all necessary constants`() {
        with(yamlFileGenerator) {
            assertThat(template).isNotEmpty()
            assertThat(template).contains(EPF_GITLAB_HOST)
            assertThat(template).contains(EPF_PIPELINE_URL)
            assertThat(template).contains(EPF_PIPELINE_SECRET)
            assertThat(template).contains(CONF_EMAIL)
            assertThat(template).contains(CONF_NAME)
            assertThat(template).contains(TARGET_BRANCH)
            assertThat(template).contains(PIPELINE_STRING)
            assertThat(template).contains(ARTIFACTS_PATHS)
        }
    }

    @Test
    fun `Can replace specific template Strings`() {
        val output = yamlFileGenerator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            baseImagePath = "latest",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",
            processorsInstances = listOf(),
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
        assertThat(yamlFileGenerator.template).contains(PIPELINE_STRING)
        val output = yamlFileGenerator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            baseImagePath = "latest",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",
            processorsInstances = listOf(),
        )
        assertThat(output).doesNotContain(PIPELINE_STRING)
    }

    @Test
    fun `Can render multiple Data Operations`() {
        val generator = yamlFileGenerator
        val countLinesBefore = generator.template.lines().count()

        val output = generator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            baseImagePath = "latest",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",

            processorsInstances = listOf(
                mockProcessorInstance("commons-data-operation1"),
                mockProcessorInstance("commons-data-operation2")
            ),
        )

        assertThat(output).doesNotContain(PIPELINE_STRING)
        assertThat(output.lines().count()).isEqualTo(countLinesBefore + 4)
        assertThat(yamlFileGenerator.template).contains(ARTIFACTS_PATHS)
    }

    @Test
    @Disabled
    fun `Pipelines are indented correctly`() {
        val output = yamlFileGenerator.renderYaml(
            author = mockk(),
            epfPipelineSecret = "test-pipeline-secret",
            epfPipelineUrl = "test-pipeline-url",
            epfGitlabUrl = "test-gitlab-url",
            baseImagePath = "latest",
            epfImageTag = "latest",
            sourceBranch = "test-source-branch",
            targetBranch = "test-target-branch",
            processorsInstances = listOf(
                mockProcessorInstance("commons-data-operation1"),
                mockProcessorInstance("commons-data-operation2")
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

    private fun mockProcessorInstance(slug: String): ProcessorInstance {
        val baseEnv =
            BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker1:latest", sdkVersion = "3.7")

        val operationProcessorType = ProcessorType(UUID.randomUUID(), "OPERATION")

        val stringParameter = ParameterType(randomUUID(), "STRING")
        val floatParameter = ParameterType(randomUUID(), "STRING")

        val publisher = Account(
            randomUUID(),
            "account",
            "subject@mlreef.com",
            "password",
            "slug",
            "name",
            null,
            null,
            gitlabId = 1,
            hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = Instant.now()
        )

        val processor = Processor(
            randomUUID(),
            publisher = publisher,
            baseEnvironment = baseEnv,
            mainScriptPath = "main.py",
            branch = "master",
            version = "1",
            imageName = "alpine:latest"
        )

        val processorParameter1 =
            Parameter(randomUUID(), "stringParam", 0, "", parameterType = stringParameter, processor = processor)
        val processorParameter2 =
            Parameter(randomUUID(), "floatParam", 1, "0.1", parameterType = floatParameter, processor = processor)
        val processorParameter3 =
            Parameter(randomUUID(), "output-path", 1, "output", parameterType = floatParameter, processor = processor)

        val dataProcessorInstance = ProcessorInstance(randomUUID(), processor, slug = slug)

        dataProcessorInstance.createParameterInstances(processorParameter1, "string")
        dataProcessorInstance.createParameterInstances(processorParameter2, "0.1")
        dataProcessorInstance.createParameterInstances(processorParameter3, "testoutput")

        return dataProcessorInstance
    }
}
