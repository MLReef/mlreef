package com.mlreef.rest.feature.marketplace

import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataOperationRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.MarketplaceEntryRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.marketplace.MarketplaceEntry
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.Star
import com.mlreef.rest.persistence.AbstractRepositoryTest
import com.mlreef.rest.testcommons.EntityMocks
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Commit
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Transactional
@Commit
class MarketplaceServiceTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: MarketplaceEntryRepository

    @Autowired
    private lateinit var tagRepository: SearchableTagRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var dataOperationRepository: DataOperationRepository

    private lateinit var service: MarketplaceService
    private lateinit var author: Person
    private lateinit var dataProject: DataProject
    private lateinit var dataOperation: DataOperation

    companion object {
        var lastGitlabId: Long = 1
    }

    @BeforeEach
    @Transactional
    fun prepare() {
        truncateDbTables(listOf("subject", "marketplace_entry", "marketplace_tag"), cascade = true)
        author = personRepository.save(EntityMocks.author)

        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author.id))
        dataOperation = dataOperationRepository.save(EntityMocks.dataOperation(author))
        service = MarketplaceService(repository, tagRepository)
    }

//    @Transactional
//    @Test
//    @Disabled - Ignores the annotation and tries to run the test
    fun `createEntry persists Entry`() {
        val createEntry = service.createEntry(dataOperation, author)

        assertThat(createEntry).isNotNull()
        assertThat(createEntry.owner).isNotNull()

        val fromRepo = repository.findByIdOrNull(createEntry.id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.owner).isNotNull()
    }

    @Transactional
    @Test
    fun `deleteEntry persists Entry`() {
        val createEntry = service.createEntry(dataOperation, author)

        assertThat(createEntry).isNotNull()
        assertThat(createEntry.owner).isNotNull()

        val fromRepo = repository.findByIdOrNull(createEntry.id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.owner).isNotNull()

        service.deleteEntry(fromRepo)

        val fromRepo2 = repository.findByIdOrNull(createEntry.id)
        assertThat(fromRepo2).isNull()
    }

    @Transactional
    @Test
    fun `updateEntry persists Entry and manipulates fields`() {

        val dataTypes = listOf(DataType.TABULAR, DataType.IMAGE)
        val createEntry = service.createEntry(dataOperation, author)
        service.updateEntry(
            createEntry,
            title = "newtitle",
            description = "newtitle",
            visibilityScope = VisibilityScope.PRIVATE,
            inputDataTypes = dataTypes,
            outputDataTypes = dataTypes
        )
        val fromRepo = repository.findByIdOrNull(createEntry.id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.name).isEqualTo("newtitle")
        assertThat(fromRepo.description).isEqualTo("newtitle")
        assertThat(fromRepo.visibilityScope).isEqualTo(VisibilityScope.PRIVATE)
        assertThat(fromRepo.inputDataTypes).containsAll(dataTypes)
        assertThat(fromRepo.outputDataTypes).containsAll(dataTypes)
    }

    @Transactional
    @Test
    fun `addTags persists Entry and tags collection`() {
        // prepare
        val tag1 = SearchableTag(randomUUID(), "Tag1")
        val tag2 = SearchableTag(randomUUID(), "Tag2")
        val tag3 = SearchableTag(randomUUID(), "Tag3")
        val tag4 = SearchableTag(randomUUID(), "Tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.createEntry(dataOperation, author)

        service.addTags(entry, bunch1)
        val fromRepo1 = repository.findByIdOrNull(entry.id)

        assertThat(fromRepo1).isNotNull()
        assertThat(fromRepo1!!.tags).hasSize(2)

        assertThat(fromRepo1.tags).contains(tag1)
        assertThat(fromRepo1.tags).contains(tag2)
        assertThat(fromRepo1.tags).doesNotContain(tag3)
        assertThat(fromRepo1.tags).doesNotContain(tag4)

        service.addTags(fromRepo1, bunch2)
        val fromRepo2 = repository.findByIdOrNull(entry.id)

        assertThat(fromRepo2).isNotNull()
        assertThat(fromRepo2!!.tags).hasSize(4)

        assertThat(fromRepo2.tags).contains(tag1)
        assertThat(fromRepo2.tags).contains(tag2)
        assertThat(fromRepo2.tags).contains(tag3)
        assertThat(fromRepo2.tags).contains(tag4)
    }

    @Transactional
    @Test
    fun `defineTags persists Entry and reset Tags`() {
        // prepare
        val tag1 = SearchableTag(randomUUID(), "Tag1")
        val tag2 = SearchableTag(randomUUID(), "Tag2")
        val tag3 = SearchableTag(randomUUID(), "Tag3")
        val tag4 = SearchableTag(randomUUID(), "Tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.createEntry(dataOperation, author)

        service.defineTags(entry, bunch1)
        val fromRepo1 = repository.findByIdOrNull(entry.id)

        assertThat(fromRepo1).isNotNull()
        assertThat(fromRepo1!!.tags).hasSize(2)

        assertThat(fromRepo1.tags).contains(tag1)
        assertThat(fromRepo1.tags).contains(tag2)
        assertThat(fromRepo1.tags).doesNotContain(tag3)
        assertThat(fromRepo1.tags).doesNotContain(tag4)

        service.defineTags(entry, bunch2)
        val fromRepo2 = repository.findByIdOrNull(entry.id)

        assertThat(fromRepo2).isNotNull()
        assertThat(fromRepo2!!.tags).hasSize(2)

        assertThat(fromRepo2.tags).doesNotContain(tag1)
        assertThat(fromRepo2.tags).doesNotContain(tag2)
        assertThat(fromRepo2.tags).contains(tag3)
        assertThat(fromRepo2.tags).contains(tag4)
    }

    @Transactional
    @Test
    fun `addStar persists stars for Entity`() {
        // prepare
        val person1 = EntityMocks.person(slug = "slug23")
        val person2 = EntityMocks.person(slug = "slug234")
        personRepository.saveAll(listOf(person1, person2))
        val entity = service.createEntry(dataOperation, author)

        val v1 = service.addStar(entity, person1)
        service.addStar(v1, person2)
        val fromRepo = repository.findByIdOrNull(entity.id)

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.stars).hasSize(2)
        assertThat(fromRepo.starsCount).isEqualTo(2)
        assertThat(fromRepo.stars).contains(Star(entity.id, person1.id))
        assertThat(fromRepo.stars).contains(Star(entity.id, person2.id))
    }

    @Transactional
    @Test
    fun `saving persists Entry and stars after remove`() {
        val id = randomUUID()

        val entity = EntityMocks.marketplaceEntry(searchable = EntityMocks.dataAlgorithm(author = author))

        val person1 = EntityMocks.person(slug = "slug23")
        val person2 = EntityMocks.person(slug = "slug234")
        personRepository.saveAll(listOf(person1, person2))

        val adapted = entity
            .addStar(person1)
            .addStar(person2)
            .addStar(person2)

        withinTransaction {
            repository.save(adapted)
        }

        service.removeStar(adapted, person1)

        val fromRepo = repository.findByIdOrNull(entity.id)

        assertThat(fromRepo!!.stars).hasSize(1)
        assertThat(fromRepo.starsCount).isEqualTo(1)
        assertThat(fromRepo.stars).contains(Star(entity.id, person2.id))
    }

    @Transactional
    @Test
    fun `finds all public Entries`() {
        val dataProject1 = EntityMocks.dataProject(slug = "slug1")
        val dataProject2 = EntityMocks.dataProject(slug = "slug2")
        val dataProject3 = EntityMocks.dataProject(slug = "slug3")
        val dataProject4 = EntityMocks.dataProject(slug = "slug4")
        val entry1 = EntityMocks.marketplaceEntry(searchable = dataProject1, owner = author, globalSlug = "slug1", visibilityScope = VisibilityScope.PUBLIC)
        val entry2 = EntityMocks.marketplaceEntry(searchable = dataProject2, owner = author, globalSlug = "slug2", visibilityScope = VisibilityScope.PUBLIC)
        val entry3 = EntityMocks.marketplaceEntry(searchable = dataProject3, owner = author, globalSlug = "slug3", visibilityScope = VisibilityScope.PUBLIC)
        val entry4 = EntityMocks.marketplaceEntry(searchable = dataProject4, owner = author, globalSlug = "slug4", visibilityScope = VisibilityScope.PUBLIC)

        repository.saveAll<MarketplaceEntry>(listOf(entry1, entry2, entry3, entry4))

    }
}
