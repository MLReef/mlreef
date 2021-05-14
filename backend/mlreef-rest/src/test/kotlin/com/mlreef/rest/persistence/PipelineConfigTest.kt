package com.mlreef.rest.persistence

import com.mlreef.rest.PipelineConfigurationRepository
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.FileLocationType
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
import kotlin.math.absoluteValue
import kotlin.random.Random

class PipelineConfigTest : AbstractRepositoryTest() {

    private lateinit var dataProject: DataProject
    private lateinit var dataProject2: DataProject

    @Autowired
    private lateinit var repository: PipelineConfigurationRepository

    companion object {
        private var gitlabIdCount: Long = 0
    }

    @Transactional
    @Rollback
    @BeforeEach
    fun prepare() {
        dataProject = createDataProject(
            slug = "slug",
            name = "Test pipeline config project 1",
            ownerId = mainPerson.id,
            namespace = "group1",
            path = "project1",
            gitlabId = Random.nextInt().absoluteValue.toLong(),
        )

        dataProject2 = createDataProject(
            slug = "slug2",
            name = "Test pipeline config project 2",
            ownerId = mainPerson.id,
            namespace = "group2",
            path = "project2",
            gitlabId = Random.nextInt().absoluteValue.toLong(),
        )
    }

    private fun createEntity(
        dataProject: DataProject,
        slug: String = "pipeline-1"
    ): PipelineConfiguration {
        return PipelineConfiguration(
            id = randomUUID(),
            slug = slug,
            name = "Pipeline 1",
            pipelineType = dataPipelineType,
            dataProject = dataProject,
            sourceBranch = "sourcebranch",
            targetBranchPattern = ""
        )
    }

    @Transactional
    @Rollback
    @Test
    fun `find works`() {
        val entity = createEntity(dataProject)
        assertThat(repository.findByIdOrNull(entity.id)).isNull()
        repository.save(entity)
        assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `save works`() {
        val entity = createEntity(dataProject = dataProject)
        assertThat(repository.findByIdOrNull(entity.id)).isNull()
        val saved = repository.save(entity)
        assertThat(saved).isNotNull
        checkAfterCreated(saved)
        assertThat(repository.findByIdOrNull(entity.id)).isNotNull
    }

    @Transactional
    @Rollback
    @Test
    fun `update works`() {
        val entity = createEntity(dataProject)
        val saved = repository.save(entity)
        val newValue = "newname"
        val copy = saved.copy(slug = newValue)
        val updated = repository.save(copy)
        assertThat(updated).isNotNull
        assertThat(updated.slug).isEqualTo(newValue)
    }

    @Transactional
    @Rollback
    @Test
    fun `delete works`() {
        val entity = createEntity(dataProject = dataProject)
        val saved = repository.save(entity)
        repository.delete(saved)
        assertThat(saved).isNotNull
        assertThat(repository.findByIdOrNull(entity.id)).isNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `must not save duplicate slug per DataProject`() {
        commitAndFail {
            repository.save(createEntity(dataProject = dataProject, slug = "slug1"))
            repository.save(createEntity(dataProject = dataProject, slug = "slug1"))
        }
    }

    @Transactional
    @Rollback
    @Test
    fun `can save duplicate slug for different DataProject`() {
        repository.save(createEntity(dataProject = dataProject, slug = "slug1"))
        repository.save(createEntity(dataProject = dataProject2, slug = "slug1"))
    }

    @Transactional
    @Rollback
    @Test
    fun `inputFiles are added`() {
        val entity = createEntity(dataProject)
        val fileLocation = FileLocation(randomUUID(), FileLocationType.PATH, "path")

        assertThat(entity.inputFiles).isEmpty()

        entity.addInputFile(fileLocation = fileLocation)
        assertThat(entity.inputFiles).isNotEmpty()
    }

    @Transactional
    @Rollback
    @Test
    fun `added inputFile has a set pipelineConfigId`() {
        val entity = createEntity(dataProject)
        val fileLocation = FileLocation(randomUUID(), FileLocationType.PATH, "path")

        val inputFile = entity.addInputFile(fileLocation = fileLocation)
        Assertions.assertThat(inputFile.id).isEqualTo(fileLocation.id)
    }

    @Transactional
    @Rollback
    @Test
    fun `added inputFile changes only pipelineConfigId`() {
        val entity = createEntity(dataProject)
        val fileLocation = FileLocation(randomUUID(), FileLocationType.PATH, "path")

        val inputFile = entity.addInputFile(fileLocation = fileLocation)

        // no changes
        assertThat(inputFile.id).isEqualTo(fileLocation.id)
        assertThat(inputFile.locationType).isEqualTo(fileLocation.locationType)
        assertThat(inputFile.location).isEqualTo(fileLocation.location)
    }
}
