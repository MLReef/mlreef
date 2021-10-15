package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.domain.*
import com.mlreef.rest.utils.RandomUtils
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.test.annotation.Rollback
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID.randomUUID

open class ProcessorInstanceTest {

    lateinit var entity: ProcessorInstance
    lateinit var parameterType: ParameterType

    @BeforeEach
    fun prepare() {
        val author = Account(
            randomUUID(),
            "testuser",
            "testuser@mlreef.com",
            "password",
            "slug",
            "name",
            null,
            null,
            null,
            gitlabId = 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER, termsAcceptedAt = Instant.now()
        )

        parameterType = ParameterType(randomUUID(), "Parameter type")

        val codeProjectId = randomUUID()

        val codeProject = CodeProject(
            id = codeProjectId, slug = "code-project-augment", name = "CodeProject Augment", description = "", ownerId = author.id, url = "url",
            gitlabNamespace = "", gitlabId = 0, gitlabPath = "", processorType = ProcessorType(randomUUID(), "type")
        )

        val env = BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker:latest")

        val processor = Processor(randomUUID(), codeProject = codeProject, baseEnvironment = env)

        entity = ProcessorInstance(id = randomUUID(), processor = processor)
    }

    @Test
    @Transactional
    @Rollback
    open fun `addParameterInstances adds to mutable list`() {
        val size = entity.parameterInstances.size

        entity.createParameterInstances(
            Parameter(
                randomUUID(),
                processor = entity.processor,
                name = "name",
                parameterType = parameterType,
                order = 0,
                defaultValue = "",
            ),
            ""
        )

        Assertions.assertThat(entity.parameterInstances.size).isEqualTo(size + 1)
    }

    @Test
    @Transactional
    @Rollback
    open fun `duplicate changes parameterInstances ID `() {
        entity.createParameterInstances(
            Parameter(
                randomUUID(),
                processor = entity.processor,
                name = "name",
                parameterType = parameterType,
                order = 0,
                defaultValue = "",
            ),
            ""
        )

        val duplicate = entity.duplicate()
        val oldParam = entity.parameterInstances[0]
        val newParam = duplicate.parameterInstances[0]

        Assertions.assertThat(newParam.value).isEqualTo(oldParam.value)
        Assertions.assertThat(newParam.name).isEqualTo(oldParam.name)
        Assertions.assertThat(newParam.processorInstance).isNotEqualTo(oldParam.processorInstance)
        Assertions.assertThat(newParam.processorInstance).isEqualTo(duplicate)
        Assertions.assertThat(oldParam.processorInstance.id).isEqualTo(entity.id)
        Assertions.assertThat(newParam.parameter.parameterType).isEqualTo(oldParam.parameter.parameterType)
        Assertions.assertThat(newParam.id).isNotEqualTo(oldParam.id)
    }

    @Test
    @Transactional
    @Rollback
    open fun `validate throws IllegalStateException `() {
        assertThrows<IllegalStateException> {
            this.entity.copy(
                experimentProcessingId = randomUUID(),
                experimentPostProcessingId = randomUUID()
            )
        }
    }
}
