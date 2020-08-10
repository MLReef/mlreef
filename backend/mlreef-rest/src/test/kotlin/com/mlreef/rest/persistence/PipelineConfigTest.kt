package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineType
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class PipelineConfigTest : AbstractRepositoryTest() {

    private lateinit var dataProject: DataProject

    @Autowired
    private lateinit var repository: PipelineConfigRepository

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    companion object {
        private var gitlabIdCount: Long = 0
    }

    @Transactional
    @BeforeEach
    fun prepare() {
        val owner = Person(randomUUID(), "person${gitlabIdCount}", "name${gitlabIdCount}", ++gitlabIdCount)
        personRepository.save(owner)
        dataProject = dataProjectRepository.save(DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project${gitlabIdCount}", ++gitlabIdCount))
    }

    private fun createEntity(
        dataProjectId: UUID = randomUUID(),
        slug: String = "pipeline-1"
    ): Pair<UUID, PipelineConfig> {
        val id = randomUUID()
        val entity = PipelineConfig(
            id = id, slug = slug, name = "Pipeline 1",
            pipelineType = PipelineType.DATA,
            dataProjectId = dataProjectId,
            sourceBranch = "sourcebranch", targetBranchPattern = "")
        return Pair(id, entity)
    }

//    @Test
//    fun `find works`() {
//        val (id, entity) = createEntity(dataProjectId = dataProject.id)
//        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
//        repository.save(entity)
//        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
//    }
//
//    @Test
//    fun `save works`() {
//        val (id, entity) = createEntity(dataProjectId = dataProject.id)
//        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
//        val saved = repository.save(entity)
//        Assertions.assertThat(saved).isNotNull
//        checkAfterCreated(saved)
//        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
//    }
//
//    @Test
//    fun `update works`() {
//        val (_, entity) = createEntity(dataProjectId = dataProject.id)
//        val saved = repository.save(entity)
//        val newValue = "newname"
//        val copy = saved.copy(slug = newValue)
//        val updated = repository.save(copy)
//        Assertions.assertThat(updated).isNotNull
//        Assertions.assertThat(updated.slug).isEqualTo(newValue)
//    }
//
//    @Test
//    fun `delete works`() {
//        val (_, entity) = createEntity(dataProjectId = dataProject.id)
//        val saved = repository.save(entity)
//        repository.delete(saved)
//        Assertions.assertThat(saved).isNotNull
//    }

    @Transactional
    @Test
    fun `must not save duplicate slug per DataProject`() {

        val owner = Person(randomUUID(), "slug", "name", 1L)
        val dataProject = DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project", 0)

        personRepository.save(owner)
        dataProjectRepository.save(dataProject)

        commitAndFail {
            repository.save(createEntity(dataProjectId = dataProject.id, slug = "slug1").second)
            repository.save(createEntity(dataProjectId = dataProject.id, slug = "slug1").second)
        }
    }

    @Transactional
    @Test
    fun `can save duplicate slug for different DataProject`() {

        val owner = Person(randomUUID(), "slug", "name", 1L)
        val dataProject1 = DataProject(randomUUID(), "slug1", "url,", "CodeProject Augment", "", owner.id, "group1", "project1", 201)
        val dataProject2 = DataProject(randomUUID(), "slug2", "url,", "CodeProject Augment", "", owner.id, "group2", "project2", 202)

        personRepository.save(owner)
        dataProjectRepository.save(dataProject1)
        dataProjectRepository.save(dataProject2)

        repository.save(createEntity(dataProjectId = dataProject1.id, slug = "slug1").second)
        repository.save(createEntity(dataProjectId = dataProject2.id, slug = "slug1").second)
    }
}
