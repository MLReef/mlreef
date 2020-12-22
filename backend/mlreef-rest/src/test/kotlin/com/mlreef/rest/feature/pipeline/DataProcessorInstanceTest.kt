package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataType
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.utils.RandomUtils
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.ZonedDateTime
import java.util.UUID.randomUUID

class DataProcessorInstanceTest {

    lateinit var entity: DataProcessorInstance

    @BeforeEach
    fun prepare() {
        val author = Person(randomUUID(), "slug", "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val codeProjectId = randomUUID()

        CodeProject(id = codeProjectId, slug = "code-project-augment", name = "CodeProject Augment", description = "", ownerId = author.id, url = "url",
            gitlabNamespace = "", gitlabId = 0, gitlabPath = "")

        val _dataOp1 = DataOperation(
            id = randomUUID(), slug = "commons-augment", name = "Augment",
            inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)

        val env = BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker:latest")

        val dataOp1 = ProcessorVersion(
            id = _dataOp1.id, dataProcessor = _dataOp1, publishingInfo = PublishingInfo(publisher = author),
            command = "augment", number = 1, baseEnvironment = env)


        entity = DataProcessorInstance(id = randomUUID(), processorVersion = dataOp1)
    }

    @Test
    fun `addParameterInstances adds to mutable list`() {
        val size = entity.parameterInstances.size
        entity.addParameterInstances(
            ProcessorParameter(randomUUID(), entity.dataProcessorId, "name", ParameterType.STRING, 0, ""),
            "")

        Assertions.assertThat(entity.parameterInstances.size).isEqualTo(size + 1)
    }

    @Test
    fun `duplicate changes parameterInstances ID `() {
        entity.addParameterInstances(
            ProcessorParameter(randomUUID(), entity.dataProcessorId, "name", ParameterType.STRING, 0, ""),
            "")

        val duplicate = entity.duplicate()
        val oldParam = entity.parameterInstances[0]
        val newParam = duplicate.parameterInstances[0]

        Assertions.assertThat(newParam.value).isEqualTo(oldParam.value)
        Assertions.assertThat(newParam.name).isEqualTo(oldParam.name)
        Assertions.assertThat(newParam.dataProcessorInstanceId).isNotEqualTo(oldParam.dataProcessorInstanceId)
        Assertions.assertThat(newParam.dataProcessorInstanceId).isEqualTo(duplicate.id)
        Assertions.assertThat(oldParam.dataProcessorInstanceId).isEqualTo(entity.id)
        Assertions.assertThat(newParam.type).isEqualTo(oldParam.type)
        Assertions.assertThat(newParam.id).isNotEqualTo(oldParam.id)
    }

    @Test
    fun `validate throws IllegalStateException `() {
        assertThrows<IllegalStateException> {
            this.entity.copy(
                experimentProcessingId = randomUUID(),
                experimentPostProcessingId = randomUUID()
            )
        }
    }
}
