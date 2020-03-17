package com.mlreef.rest.persistence

import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataType
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.ParameterInstanceRepository
import com.mlreef.rest.ParameterType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.VisibilityScope
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.*

class ParameterInstanceTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: ParameterInstanceRepository

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository


    private fun createEntity(): Pair<UUID, ParameterInstance> {
        val id = UUID.randomUUID()
        val codeProjectId = UUID.randomUUID()
        val author = Person(UUID.randomUUID(), "slug", "name")
//        val codeProject = CodeProject(id = codeProjectId, slug = "code-project-augment", ownerId = author.id, url = "url")
        val dataProcessor = DataOperation(
            id = UUID.randomUUID(), slug = "commons-random-crop", name = "Random crop",
            command = "random_crop", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)

        val processorParameter = ProcessorParameter(UUID.randomUUID(), dataProcessor.id, "height", ParameterType.INTEGER, 1, "")
        val dataProcessorInstance = DataProcessorInstance(id = UUID.randomUUID(), dataProcessor = dataProcessor)
        val entity = ParameterInstance(
            id = id, processorParameter = processorParameter,
            dataProcessorInstanceId = dataProcessorInstance.id, value = "value")

        processorParameterRepository.save(processorParameter)
        return Pair(id, entity)
    }

    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Test
    fun `update works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(value = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull
        checkAfterUpdated(updated)
        Assertions.assertThat(updated.value).isEqualTo(newValue)
    }

    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}
