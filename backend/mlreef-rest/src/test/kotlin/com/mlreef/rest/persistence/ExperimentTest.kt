package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.Person
import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.UserRole
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

class ExperimentTest : AbstractRepositoryTest() {
    @Autowired
    private lateinit var repository: ExperimentRepository

    @Autowired
    private lateinit var subjectRepository: SubjectRepository

    @Autowired
    private lateinit var projectRepository: ProjectRepository

    private fun createEntity(
        dataProjectId: UUID = randomUUID(),
        slug: String = "slug"
    ): Pair<UUID, Experiment> {
        val id = randomUUID()
        val owner = Person(randomUUID(), "slug", "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val dataProject = DataProject(dataProjectId, "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project", 0)
        val entity = Experiment(id, dataProjectId, null, slug, "name", "source", "target")

        return Pair(id, entity)
    }

    @Transactional
    @BeforeEach
    fun prepare() {
        truncateDbTables(listOf("account", "account_token"), cascade = true)
    }

    @Transactional
    @Test
    fun `find works`() {
        val (id, entity) = createEntity()

        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    fun `save works`() {
        val (id, entity) = createEntity()
        Assertions.assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
        Assertions.assertThat(repository.findByIdOrNull(id)).isNotNull
    }

    @Transactional
    @Test
    fun `update works`() {
        val owner = Person(randomUUID(), "slug", "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val dataProject = DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project", 0)
        val id = randomUUID()
        val item = Experiment(id, dataProject.id, null, "slug", "name", "source", "target")

        val saved = repository.save(item)
        saved.copy(status = ExperimentStatus.SUCCESS)
        val updated = repository.save(saved)
        Assertions.assertThat(updated).isNotNull
        checkAfterUpdated(updated)
    }

    @Transactional
    @Test
    fun `delete works`() {
        val (_, entity) = createEntity()
        val saved = repository.save(entity)
        repository.delete(saved)
        Assertions.assertThat(saved).isNotNull
        checkAfterCreated(saved)
    }

    @Transactional
    @Test
    fun `must not save duplicate slug per DataProject`() {

        val owner = Person(randomUUID(), "slug", "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val dataProject = DataProject(randomUUID(), "slug", "url,", "CodeProject Augment", "", owner.id, "group", "project", 0)

        subjectRepository.save(owner)
        projectRepository.save(dataProject)

        commitAndFail {
            repository.save(createEntity(dataProjectId = dataProject.id, slug = "slug1").second)
            repository.save(createEntity(dataProjectId = dataProject.id, slug = "slug1").second)
        }
    }

    @Transactional
    @Test
    fun `can save duplicate slug for different DataProject`() {

        val owner = Person(randomUUID(), "slug", "name", 1L, hasNewsletters = true,
            userRole = UserRole.DEVELOPER,
            termsAcceptedAt = ZonedDateTime.now())
        val dataProject1 = DataProject(randomUUID(), "slug1", "url,", "CodeProject Augment", "", owner.id, "group1", "project1", 201)
        val dataProject2 = DataProject(randomUUID(), "slug2", "url,", "CodeProject Augment", "", owner.id, "group2", "project2", 202)

        subjectRepository.save(owner)
        projectRepository.save(dataProject1)
        projectRepository.save(dataProject2)

        repository.save(createEntity(dataProjectId = dataProject1.id, slug = "slug1").second)
        repository.save(createEntity(dataProjectId = dataProject2.id, slug = "slug1").second)
    }
}


