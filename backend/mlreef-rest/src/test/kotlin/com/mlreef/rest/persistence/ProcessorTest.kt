package com.mlreef.rest.persistence

import com.mlreef.rest.ProcessorsRepository
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.Processor
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import java.time.Instant
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ProcessorTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: ProcessorsRepository

    private lateinit var codeProject1: CodeProject
    private lateinit var codeProject2: CodeProject
    private lateinit var codeProject3: CodeProject

    private fun createEntity(
        codeProject: CodeProject,
        slug: String? = null,
        branch: String? = null,
        version: String? = null
    ): Processor {
        return Processor(
            randomUUID(),
            codeProject,
            name = "Test Processor",
            slug = slug ?: "slug1",
            mainScriptPath = "main.py",
            imageName = "image:master",
            branch = branch ?: "master",
            version = version ?: "1",
            publisher = mainAccount3,
            publishedAt = Instant.now(),
        )
    }

    @Transactional
    @Rollback
    @BeforeEach
    fun prepare() {
//        truncateDbTables(listOf("account", "account_token"), cascade = true)

        codeProject1 = createCodeProject(
            slug = "test-project-1",
            name = "Test project 1", ownerId = mainAccount.id, url = "url",
            namespace = "namespace1", gitlabId = 1L, path = ""
        )

        codeProject2 = createCodeProject(
            slug = "test-project-2",
            name = "Test project 2", ownerId = mainAccount.id, url = "url",
            namespace = "namespace2", gitlabId = 2L, path = ""
        )

        codeProject3 = createCodeProject(
            slug = "test-project-3",
            name = "Test project 3", ownerId = mainAccount2.id, url = "url",
            namespace = "namespace3", gitlabId = 3L, path = ""
        )
    }

    @Transactional
    @Rollback
    @Test
    fun `find works`() {
        val entity = createEntity(codeProject1)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `save works`() {
        val entity = createEntity(codeProject1)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `update works`() {
        val entity = createEntity(codeProject1)
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(slug = newValue)
        val updated = repository.save(copy)
        Assertions.assertThat(updated).isNotNull
        checkAfterUpdated(updated)
        Assertions.assertThat(updated.slug).isEqualTo(newValue)
    }

    @Transactional
    @Rollback
    @Test
    fun `delete works`() {
        val entity = createEntity(codeProject1)
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate slug for the same project`() {
        commitAndFail {
            repository.save(createEntity(codeProject1, slug = "slug1", branch = "master", version = "1"))
            repository.save(createEntity(codeProject1, slug = "slug1", branch = "master", version = "2"))
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate branc and version for the same project`() {
        commitAndFail {
            repository.save(createEntity(codeProject1, slug = "slug1", branch = "master", version = "1"))
            repository.save(createEntity(codeProject1, slug = "slug2", branch = "master", version = "1"))
        }
    }
}
