package com.mlreef.rest.persistence

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorInstanceRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.UserRole
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.utils.RandomUtils
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class DataProcessorInstanceTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    private lateinit var baseEnvironmentsRepository: BaseEnvironmentsRepository

    private fun createEntity(): Pair<UUID, DataProcessorInstance> {
        val codeProjectId = randomUUID()
        val id = randomUUID()
        val author = Person(randomUUID(), "slug", "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val baseEnv = baseEnvironmentsRepository.save(BaseEnvironments(randomUUID(), RandomUtils.generateRandomUserName(15), "docker1:latest", sdkVersion = "3.7"))
        CodeProject(id = codeProjectId, slug = "code-project-augment",
            name = "CodeProject Augment", description = "", ownerId = author.id, url = "url",
            gitlabNamespace = "", gitlabId = 0, gitlabPath = "")
        val _dataOp1 = DataOperation(
            id = randomUUID(), slug = "commons-augment", name = "Augment",
            inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "description",
            codeProjectId = codeProjectId)
        val dataOp1 = ProcessorVersion(
            id = _dataOp1.id, dataProcessor = _dataOp1, publishingInfo = PublishingInfo(publisher = author),
            command = "augment", number = 1, baseEnvironment = baseEnv)

        val entity = DataProcessorInstance(id = id, processorVersion = dataOp1)
        return Pair(id, entity)
    }

    @BeforeEach
    fun prepare() {
        truncateDbTables(listOf("account", "account_token"), cascade = true)
    }

    @Transactional
    @Test
    fun `find works`() {
        val (id, entity) = createEntity()
        processorVersionRepository.save(entity.processorVersion)

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        processorVersionRepository.save(entity.processorVersion)

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    fun `update works`() {
        val (_, entity) = createEntity()
        processorVersionRepository.save(entity.processorVersion)

        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(slug = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull
        checkAfterUpdated(updated)
        Assertions.assertThat(updated.slug).isEqualTo(newValue)
    }

    @Transactional
    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        processorVersionRepository.save(entity.processorVersion)

        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }
}
