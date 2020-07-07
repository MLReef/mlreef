package com.mlreef.rest.persistence

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.Project
import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.marketplace.Searchable
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.Star
import com.mlreef.rest.testcommons.EntityMocks
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Commit
import org.springframework.test.context.transaction.TestTransaction
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Transactional
@Commit
class ProjectTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: ProjectRepository

    @Autowired
    private lateinit var tagRepository: SearchableTagRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    private lateinit var author: Person

    companion object {
        var lastGitlabId: Long = 1
    }

    @BeforeEach
    @Transactional
    fun prepare() {
        truncateDbTables(listOf("subject", "mlreef_project"), cascade = true)
        author = personRepository.save(Person(randomUUID(), "slug", "name", lastGitlabId++))
    }

    @Transactional
    @Test
    fun `saving persists Entry and inputDataTypes collection`() {
        val id = randomUUID()

        val entity = marketplaceEntry(owner = author, id = id, inputDataTypes = setOf(DataType.IMAGE, DataType.VIDEO))

        repository.save(entity)
        val fromRepo = repository.findByIdOrNull(id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.inputDataTypes).hasSize(2)
        assertThat(fromRepo.inputDataTypes).hasSize(2)

        assertThat(fromRepo.inputDataTypes).contains(DataType.IMAGE)
        assertThat(fromRepo.inputDataTypes).contains(DataType.VIDEO)
        //
    }

    @Transactional
    @Test
    fun `saving persists Entry and outputDataTypes collection`() {
        val id = randomUUID()

        val entity = marketplaceEntry(id)

        repository.save(entity)
        val fromRepo = repository.findByIdOrNull(id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.outputDataTypes).hasSize(2)

        assertThat(fromRepo.outputDataTypes).contains(DataType.TABULAR)
        assertThat(fromRepo.outputDataTypes).contains(DataType.ANY)
    }

    private fun marketplaceEntry(
        id: UUID,
        tags: Set<SearchableTag> = emptySet(),
        globalSlug: String = "slug",
        searchable: Searchable = EntityMocks.dataProject(),
        owner: Subject = author,
        inputDataTypes: Set<DataType> = setOf(DataType.TABULAR, DataType.ANY),
        outputDataTypes: Set<DataType> = setOf(DataType.TABULAR, DataType.ANY)
    ) = DataProject(
        id = id,
        globalSlug = globalSlug,
        visibilityScope = VisibilityScope.PUBLIC,
        name = "title",
        inputDataTypes = inputDataTypes,
        outputDataTypes = outputDataTypes,
        description = "description",
        tags = tags,
        gitlabId = 2,
        gitlabNamespace = "",
        ownerId = owner.id,
        slug = globalSlug,
        gitlabPath = globalSlug,
        url = "url.com"
    )

    @Transactional
    @Test
    fun `saving persists Entry and tags collection`() {
        // prepare
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val saveAll = tagRepository.saveAll(listOf(tag1, tag2))

        // test
        val id = randomUUID()
        val entity = marketplaceEntry(id, tags = saveAll.toSet(), owner = author, globalSlug = "slug")

        repository.save(entity)

        val fromRepo = repository.findByIdOrNull(id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.tags).hasSize(2)

        assertThat(fromRepo.tags).contains(tag1)
        assertThat(fromRepo.tags).contains(tag2)
    }

    @Transactional
    @Test
    fun `saving persists Entry and stars`() {
        val id = randomUUID()

        val person1 = EntityMocks.person(slug = "slug23")
        val person2 = EntityMocks.person(slug = "slug234")
        personRepository.saveAll(listOf(person1, person2))

        val entity = marketplaceEntry(owner = person1, id = id)

        val adapted = entity
            .addStar(person1)
            .addStar(person2)
        val save = repository.save(adapted as Project)
        assertThat(save).isNotNull()

        val fromRepo = repository.findByIdOrNull(id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.stars).hasSize(2)
        assertThat(fromRepo.starsCount).isEqualTo(2)
        assertThat(fromRepo.stars).contains(Star(entity.id, person1.id))
        assertThat(fromRepo.stars).contains(Star(entity.id, person2.id))
    }

    @Transactional
    @Test
    @Disabled
    fun `saving persists Entry and stars after remove`() {
        val id = randomUUID()

        val entity = marketplaceEntry(owner = author, id = id)

        val person1 = EntityMocks.person(slug = "slug23")
        val person2 = EntityMocks.person(slug = "slug234")
        personRepository.saveAll(listOf(person1, person2))

        val adapted = entity
            .addStar(person1)
            .addStar(person2)
            .addStar(person2)

        withinTransaction {
            repository.save(adapted as Project)
        }

        val fromRepo = repository.findByIdOrNull(id)
        assertThat(fromRepo!!.stars).hasSize(2)
        assertThat(fromRepo.starsCount).isEqualTo(2)
        assertThat(fromRepo.stars).contains(Star(entity.id, person1.id))
        assertThat(fromRepo.stars).contains(Star(entity.id, person2.id))

        val afterRemove = withinTransaction {
            val beforeRemove = fromRepo
                .removeStar(person1)
                .removeStar(person1)
            repository.save(beforeRemove as Project)
        }
        assertThat(afterRemove.stars).hasSize(1)
        assertThat(afterRemove.starsCount).isEqualTo(1)
        assertThat(fromRepo.stars).contains(Star(entity.id, person2.id))
    }

    @Transactional
    @Test
    @Commit
    fun `saving fails with Stars with non-persisted Subjects`() {
        val id = randomUUID()
        TestTransaction.flagForCommit()

        val entity = marketplaceEntry(owner = author, id = id)

        val starId1 = EntityMocks.person()
        val starId2 = EntityMocks.person()
        val adapted = entity
            .addStar(starId1)
            .addStar(starId2)

        assertThrows<DataIntegrityViolationException> {
            withinTransaction {
                repository.save(adapted as Project)
            }
        }
    }

    @Transactional
    @Test
    fun `find works`() {
        val id = randomUUID()

        val entity = marketplaceEntry(owner = author, id = id)

        assertThat(repository.findByIdOrNull(id)).isNull()
        repository.save(entity)
        assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Transactional
    @Test
    fun `save works`() {
        val id = randomUUID()
        val entity = marketplaceEntry(owner = author, id = id)

        assertThat(repository.findByIdOrNull(id)).isNull()
        val saved = repository.save(entity)
        assertThat(saved).isNotNull()
        checkAfterCreated(saved)
        assertThat(repository.findByIdOrNull(id)).isNotNull()
    }

    @Transactional
    @Test
    fun `delete works`() {
        val id = randomUUID()
        val entity = marketplaceEntry(owner = author, id = id)

        val saved = repository.save(entity)
        repository.delete(saved)
        assertThat(saved).isNotNull()
        checkAfterCreated(saved)
    }
}
