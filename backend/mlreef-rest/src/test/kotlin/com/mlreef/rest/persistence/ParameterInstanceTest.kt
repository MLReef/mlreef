package com.mlreef.rest.persistence

import com.mlreef.rest.ParameterInstancesRepository
import com.mlreef.rest.ParametersRepository
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.Parameter
import com.mlreef.rest.domain.ParameterInstance
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.ProcessorInstance
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.util.UUID
import javax.transaction.Transactional

class ParameterInstanceTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: ParameterInstancesRepository

    @Autowired
    private lateinit var processorParameterRepository: ParametersRepository

    private lateinit var codeProject1: CodeProject
    private lateinit var processor: Processor
    private lateinit var parameter: Parameter
    private lateinit var processorInstance: ProcessorInstance


    private fun createEntity(): ParameterInstance {
        return ParameterInstance(UUID.randomUUID(), parameter, processorInstance, "123")
    }

    @BeforeEach
    fun prepare() {
        codeProject1 = createCodeProject(
            slug = "test-project-1",
            name = "Test project 1", ownerId = mainPerson.id, url = "url",
            namespace = "namespace1", gitlabId = 1L, path = ""
        )

        processor = createProcessor(codeProject1)
        parameter = createParameter(processor)
        processorInstance = createProcessorInstance(processor)
    }

    @Transactional
    @Test
    fun `find works`() {
        val entity = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Test
    fun `save works`() {
        val entity = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Test
    fun `update works`() {
        val entity = createEntity()
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(value = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull
        checkAfterUpdated(updated)
        Assertions.assertThat(updated.value).isEqualTo(newValue)
    }

    @Transactional
    @Test
    fun `delete works`() {
        val entity = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}
