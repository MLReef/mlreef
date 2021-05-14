package com.mlreef.rest.persistence

import com.mlreef.rest.PipelinesRepository
import com.mlreef.rest.domain.Pipeline
import com.mlreef.rest.domain.PipelineConfiguration
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelineInstanceTest : AbstractRepositoryTest() {

    private lateinit var pipelineConfig: PipelineConfiguration

    @Autowired
    private lateinit var repository: PipelinesRepository

    companion object {
        private var gitlabIdCount: Long = 0
    }

    private fun createEntity(
        config: PipelineConfiguration,
        slug: String = "pipeline-1",
        number: Int = 1
    ): Pipeline {
        return Pipeline(
            id = randomUUID(), slug = slug, name = "Pipeline 1",
            pipelineType = dataPipelineType,
            pipelineConfiguration = config,
            sourceBranch = "sourcebranch",
            targetBranch = "",
            number = number
        )
    }

    @Transactional
    @Rollback
    @BeforeEach
    fun prepare() {
//        truncateDbTables(listOf("account", "account_token", "mlreef_project"), cascade = true)
        val dataProject = createDataProject(
            slug = "slug",
            name = "CodeProject Augment",
            ownerId = mainPerson.id,
            namespace = "group",
            path = "project$gitlabIdCount",
            gitlabId = ++gitlabIdCount
        )

        pipelineConfig = createPipelineConfiguration(
            slug = "pipeline-1",
            name = "Pipeline 1",
            type = dataPipelineType,
            dataProject = dataProject,
            sourceBranch = "sourcebranch", targetBranchPattern = ""
        )
    }

    @Test
    @Transactional
    @Rollback
    fun `find works`() {
        val entity = createEntity(config = pipelineConfig)

        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `save works`() {
        val entity = createEntity(config = pipelineConfig)
        assertThat(repository.findByIdOrNull(entity.id)).isNull()
        val saved = repository.save(entity)
        assertThat(saved).isNotNull
        checkAfterCreated(saved)
        assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Test
    @Transactional
    @Rollback
    fun `update works`() {
        val entity = createEntity(config = pipelineConfig)
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(slug = newValue)
        val updated = repository.save(copy)
        assertThat(updated).isNotNull
//        checkAfterUpdated(updated)
        assertThat(updated.slug).isEqualTo(newValue)
    }

    @Test
    @Transactional
    @Rollback
    fun `delete works`() {
        val entity = createEntity(config = pipelineConfig)
        val saved = repository.save(entity)
        repository.delete(saved)
        assertThat(saved).isNotNull
//        checkAfterUpdated(saved)
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate slug per PipelineConfig`() {
        commitAndFail {
            repository.save(
                createEntity(
                    config = pipelineConfig,
                    slug = "slug1",
                    number = 1
                )
            )
            repository.save(
                createEntity(
                    config = pipelineConfig,
                    slug = "slug1",
                    number = 2
                )
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    //FIXME: Looks like incorrect behavior
    fun `can save duplicate slug for different PipelineConfig`() {
        val dataProject1 =
            createDataProject(
                slug = "slug1",
                name = "CodeProject Augment",
                ownerId = mainPerson.id,
                namespace = "group1",
                path = "project1",
                gitlabId = 201
            )

        val dataProject2 =
            createDataProject(
                slug = "slug2",
                name = "CodeProject Augment",
                ownerId = mainPerson.id,
                namespace = "group2",
                path = "project2",
                gitlabId = 202
            )

        repository.save(createEntity(slug = "slug1", number = 1, config = pipelineConfig))
        repository.save(createEntity(slug = "slug1", number = 2, config = pipelineConfig))
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate number per PipelineConfig`() {
        commitAndFail {
            repository.save(
                createEntity(
                    config = pipelineConfig,
                    slug = "slug1",
                    number = 1
                )
            )
            repository.save(
                createEntity(
                    config = pipelineConfig,
                    slug = "slug2",
                    number = 1
                )
            )
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `can save duplicate number for different PipelineConfig`() {
        val dataProject1 =
            createDataProject(
                slug = "slug1",
                name = "CodeProject Augment",
                ownerId = mainPerson.id,
                namespace = "group1",
                path = "project1",
                gitlabId = 201
            )

        val dataProject2 =
            createDataProject(
                slug = "slug2",
                name = "CodeProject Augment",
                ownerId = mainPerson.id,
                namespace = "group2",
                path = "project2",
                gitlabId = 202
            )

        repository.save(createEntity(slug = "slug1", number = 1, config = pipelineConfig))
        repository.save(createEntity(slug = "slug2", number = 2, config = pipelineConfig))
    }
}
