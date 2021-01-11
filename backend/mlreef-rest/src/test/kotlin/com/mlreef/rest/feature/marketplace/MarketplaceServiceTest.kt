package com.mlreef.rest.feature.marketplace

import com.mlreef.rest.AccessLevel.DEVELOPER
import com.mlreef.rest.AccessLevel.GUEST
import com.mlreef.rest.AccessLevel.MAINTAINER
import com.mlreef.rest.AccessLevel.OWNER
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.ProjectType.CODE_PROJECT
import com.mlreef.rest.ProjectType.DATA_PROJECT
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.VisibilityScope.PRIVATE
import com.mlreef.rest.VisibilityScope.PUBLIC
import com.mlreef.rest.api.v1.SearchRequest
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import com.mlreef.rest.marketplace.Star
import com.mlreef.rest.persistence.AbstractRepositoryTest
import com.mlreef.rest.testcommons.EntityMocks
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Commit
import org.springframework.test.annotation.Rollback
import java.time.ZonedDateTime
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

@Transactional
@Commit
class MarketplaceServiceTest : AbstractRepositoryTest() {

    @Autowired
    private lateinit var repository: ProjectRepository

    @Autowired
    private lateinit var tagRepository: SearchableTagRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    private lateinit var projectRepository: ProjectRepository

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    private lateinit var service: MarketplaceService
    private lateinit var author1: Person
    private lateinit var author2: Person
    private lateinit var token1: TokenDetails
    private lateinit var token2: TokenDetails
    private lateinit var dataProject: DataProject

    private lateinit var dataProject0: DataProject
    private lateinit var dataProject1: DataProject
    private lateinit var dataProject2: DataProject
    private lateinit var dataProject3: DataProject
    private lateinit var dataProject4: DataProject
    private lateinit var dataProject5: DataProject
    private lateinit var dataProject6: DataProject
    private lateinit var dataProject7: DataProject
    private lateinit var dataProject8: DataProject
    private lateinit var dataProject9: DataProject

    private lateinit var codeProject0: CodeProject
    private lateinit var codeProject1: CodeProject
    private lateinit var codeProject2: CodeProject
    private lateinit var codeProject3: CodeProject
    private lateinit var codeProject4: CodeProject
    private lateinit var codeProject5: CodeProject
    private lateinit var codeProject6: CodeProject
    private lateinit var codeProject7: CodeProject
    private lateinit var codeProject8: CodeProject
    private lateinit var codeProject9: CodeProject

    private lateinit var dataProjectList: List<DataProject>
    private lateinit var codeProjectList: List<CodeProject>

    @BeforeEach
    @Transactional
    fun prepare() {
        truncateDbTables(listOf("subject", "marketplace_tag", "data_processor", "mlreef_project"), cascade = true)
        author1 = personRepository.save(EntityMocks.author)
        author2 = personRepository.save(EntityMocks.person())

        service = MarketplaceService(repository, dataProjectRepository, codeProjectRepository, tagRepository, entityManager!!)
    }

    @Transactional
    @Test
    fun `createEntry persists Entry`() {

        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author1.getId()))
        val createEntry = service.prepareEntry(dataProject, author1)

        assertThat(createEntry).isNotNull()
        assertThat(createEntry.ownerId).isNotNull()

        val fromRepo = repository.findByIdOrNull(createEntry.getId())

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.ownerId).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `addTags persists Entry and tags collection`() {

        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author1.getId()))
        // prepare
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val tag3 = SearchableTag(randomUUID(), "tag3")
        val tag4 = SearchableTag(randomUUID(), "tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.prepareEntry(dataProject, author1)

        val addTags = service.addTags(entry, bunch1)
        val fromRepo1 = repository.findByIdOrNull(addTags.getId())

        assertThat(fromRepo1).isNotNull()
        assertThat(fromRepo1!!.tags).hasSize(2)

        assertThat(fromRepo1.tags).contains(tag1)
        assertThat(fromRepo1.tags).contains(tag2)
        assertThat(fromRepo1.tags).doesNotContain(tag3)
        assertThat(fromRepo1.tags).doesNotContain(tag4)

        service.addTags(fromRepo1, bunch2)
        val fromRepo2 = repository.findByIdOrNull(entry.getId())

        assertThat(fromRepo2).isNotNull()
        assertThat(fromRepo2!!.tags).hasSize(4)

        assertThat(fromRepo2.tags).contains(tag1)
        assertThat(fromRepo2.tags).contains(tag2)
        assertThat(fromRepo2.tags).contains(tag3)
        assertThat(fromRepo2.tags).contains(tag4)
    }

    @Transactional
    @Rollback
    @Test
    fun `defineTags persists Entry and reset Tags`() {
        // prepare
        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author1.getId()))
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val tag3 = SearchableTag(randomUUID(), "tag3")
        val tag4 = SearchableTag(randomUUID(), "tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.prepareEntry(dataProject, author1)

        service.defineTags(entry, bunch1)
        val fromRepo1 = repository.findByIdOrNull(entry.getId())

        assertThat(fromRepo1).isNotNull()
        assertThat(fromRepo1!!.tags).hasSize(2)

        assertThat(fromRepo1.tags).contains(tag1)
        assertThat(fromRepo1.tags).contains(tag2)
        assertThat(fromRepo1.tags).doesNotContain(tag3)
        assertThat(fromRepo1.tags).doesNotContain(tag4)

        service.defineTags(entry, bunch2)
        val fromRepo2 = repository.findByIdOrNull(entry.getId())

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
        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author1.getId()))
        val entity = service.prepareEntry(dataProject, author1)

        val v1 = service.addStar(entity, person1)
        service.addStar(v1, person2)
        val fromRepo = repository.findByIdOrNull(entity.getId())

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.stars).hasSize(2)
        assertThat(fromRepo.starsCount).isEqualTo(2)
        assertThat(fromRepo.stars).contains(Star(entity.getId(), person1.getId()))
        assertThat(fromRepo.stars).contains(Star(entity.getId(), person2.getId()))
    }

    @Transactional
    @Test
    @Disabled
    fun `saving persists Entry and stars after remove`() {
        val person1 = EntityMocks.person(slug = "slug23")
        val person2 = EntityMocks.person(slug = "slug234")
        personRepository.saveAll(listOf(person1, person2))
        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author1.getId()))
        val entity = service.prepareEntry(dataProject, author1)

        val adapted = entity
            .addStar(person1)
            .addStar(person2)
            .addStar(person2)

        withinTransaction {
            repository.save(adapted)
        }

        withinTransaction {
            service.removeStar(adapted, person1)
        }

        val fromRepo = repository.findByIdOrNull(entity.getId())

        assertThat(fromRepo!!.stars).hasSize(1)
        assertThat(fromRepo.starsCount).isEqualTo(1)
        assertThat(fromRepo.stars).contains(Star(entity.getId(), person2.getId()))
    }

    @Transactional
    @Rollback
    @Test
    fun `search DATA_PROJECT AND CODE_PROJECT without any filter`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 5, 6, 7, 8, 9) + getCodeProjectIdsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9)

        assertThat(searchResult).hasSize(18)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(0, 1, 3, 4, 5, 6, 7, 9) + getCodeProjectIdsByIndex(0, 1, 3, 6, 7, 9)

        assertThat(searchResult).hasSize(14)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search DATA_PROJECT`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            projectType = DATA_PROJECT
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 5, 6, 7, 8, 9)

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            projectType = DATA_PROJECT
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(0, 1, 3, 4, 5, 6, 7, 9)

        assertThat(searchResult).hasSize(8)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search CODE_PROJECT`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            projectType = CODE_PROJECT
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9)

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            projectType = CODE_PROJECT
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 1, 3, 6, 7, 9)

        assertThat(searchResult).hasSize(6)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search CODE_PROJECT by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.CODE_PROJECT
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9)

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.CODE_PROJECT
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 1, 3, 6, 7, 9)

        assertThat(searchResult).hasSize(6)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with VISUALIZATION dataprocessor by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.VISUALIZATION
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(2, 6, 9)

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.VISUALIZATION
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(6, 9)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with OPERATION dataprocessor by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.OPERATION
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(5, 7)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.OPERATION
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(1, 7)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with ALGORITHM dataprocessor by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.ALGORITHM
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 3, 4)

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.ALGORITHM
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 3)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with VISUALIZATION dataprocessor`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            processorType = DataProcessorType.VISUALIZATION
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(2, 6, 9)

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            processorType = DataProcessorType.VISUALIZATION
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(6, 9)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with OPERATION dataprocessor`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            processorType = DataProcessorType.OPERATION
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(5, 7)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            processorType = DataProcessorType.OPERATION
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(1, 7)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with ALGORITHM dataprocessor`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            processorType = DataProcessorType.ALGORITHM
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 3, 4)

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            processorType = DataProcessorType.ALGORITHM
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 3)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with OPERATION dataprocessor AND input type IMAGE`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.OPERATION,
            inputDataTypes = setOf(DataType.IMAGE),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(7)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.OPERATION,
            inputDataTypes = setOf(DataType.IMAGE),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(1, 7)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with OPERATION dataprocessor AND input type TEXT AND TIMESERIES`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.OPERATION,
            inputDataTypes = setOf(DataType.TEXT, DataType.TIME_SERIES),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        val expectationIds = getCodeProjectIdsByIndex(5)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.OPERATION,
            inputDataTypes = setOf(DataType.TEXT, DataType.TIME_SERIES),
        ), page(), token2)
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with ALGORITHM dataprocessor AND input type NONE AND output type MODEL`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.ALGORITHM,
            inputDataTypes = setOf(DataType.NONE),
            outputDataTypes = setOf(DataType.MODEL),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(3)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.ALGORITHM,
            inputDataTypes = setOf(DataType.NONE),
            outputDataTypes = setOf(DataType.MODEL),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(3)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search code project AND input type IMAGE OR TEXT OR MODEL`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypesOr = setOf(DataType.IMAGE, DataType.TEXT, DataType.MODEL),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 5, 7, 8, 9)

        assertThat(searchResult).hasSize(5)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypesOr = setOf(DataType.IMAGE, DataType.TEXT, DataType.MODEL),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 1, 7, 9)

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by TAG1`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag1"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3) + getCodeProjectIdsByIndex(0, 2, 3, 9)

        assertThat(searchResult).hasSize(8)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag1"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(0, 1, 3, 4) + getCodeProjectIdsByIndex(0, 1, 3, 9)

        assertThat(searchResult).hasSize(8)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by TAG1 AND TAG4`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag1", "tAg4"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(3) + getCodeProjectIdsByIndex(0)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag1", "TAG4"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(3, 4) + getCodeProjectIdsByIndex(0, 1)

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by TAG1 AND TAG4 AND NON-EXISTEN-TAG`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag1", "TAG4", "tag-does-not-exist"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)

        searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag1", "TAG4", "tag-does-not-exist"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by TAG1 OR TAG4`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            tagsOr = listOf("tag1", "TaG4"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 7) + getCodeProjectIdsByIndex(0, 2, 3, 6, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            tagsOr = listOf("tag1", "TAG4"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(0, 1, 3, 4, 7) + getCodeProjectIdsByIndex(0, 1, 3, 6, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by TAG1 OR TAG4 OR NON-EXISTEN-TAG`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            tagsOr = listOf("tag1", "TAG4", "tag-does-not-exist"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 7) + getCodeProjectIdsByIndex(0, 2, 3, 6, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            tagsOr = listOf("tag1", "TAG4", "tag-does-not-exist"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(0, 1, 3, 4, 7) + getCodeProjectIdsByIndex(0, 1, 3, 6, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by AND NON-EXISTEN-TAG`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag-does-not-exist"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)

        searchResult = service.searchProjects(SearchRequest(
            tags = listOf("tag-does-not-exist"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by OR NON-EXISTEN-TAG`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            tagsOr = listOf("tag-does-not-exist"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)

        searchResult = service.searchProjects(SearchRequest(
            tagsOr = listOf("tag-does-not-exist"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by single MODEL TYPE`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            modelTypeOr = listOf("modelType1"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
        //There are no projects returned because the project with ModelType1 is not visible for token1 (owner - token2, private)

        searchResult = service.searchProjects(SearchRequest(
            modelTypeOr = listOf("modelType1"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        val expectationIds = getCodeProjectIdsByIndex(1)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by many MODEL TYPES`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            modelTypeOr = listOf("MODELType0", "modelType1", "modelType2"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 2)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            modelTypeOr = listOf("modeltype0", "modelType1", "modelType2"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 1)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by many ML CATEGORIES`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            mlCategoryOr = listOf("MLCategory5", "MLCATEGORY7", "mlCategory9"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(5, 7, 9)

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            mlCategoryOr = listOf("MLCategory5", "MLCATEGORY7", "mlCategory9"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(7, 9)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by many MODEL TYPES and ML CATEGORIES`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            modelTypeOr = listOf("MODELType0", "modelType1", "modeltype9"),
            mlCategoryOr = listOf("MLCategory1", "MLCATEGORY7", "mlCategory9"),
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(9)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            modelTypeOr = listOf("modeltype0", "modelType1", "modelType9"),
            mlCategoryOr = listOf("MLCategory1", "MLCATEGORY7", "mlCategory9"),
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(1, 9)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by forks count`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            minForksCount = 2,
            maxForksCount = 5,
        ), page(), token1)
        var ids = searchResult.map { it.slug }

        var expectationIds = getDataProjectSlugsByIndex(5, 6, 7) + getCodeProjectSlugsByIndex(2, 3, 4, 5)

        assertThat(searchResult).hasSize(7)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            minForksCount = 2,
            maxForksCount = 5,
        ), page(), token2)
        ids = searchResult.map { it.slug }

        expectationIds = getDataProjectSlugsByIndex(4, 5, 6, 7) + getCodeProjectSlugsByIndex(3)

        assertThat(searchResult).hasSize(5)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by 2 stars`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            minStars = 2,
            maxStars = 2,
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(1) + getCodeProjectIdsByIndex(6)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            minStars = 2,
            maxStars = 2,
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(1) + getCodeProjectIdsByIndex(6)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by 1 and 2 stars`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            minStars = 1,
            maxStars = 2,
        ), page(), token1)
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(1, 2) + getCodeProjectIdsByIndex(6, 8)

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            minStars = 1,
            maxStars = 2,
        ), page(), token2)
        ids = searchResult.map { it.id }

        expectationIds = getDataProjectIdsByIndex(1) + getCodeProjectIdsByIndex(6)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by 2 owners`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            ownerIdsOr = listOf(author1.id, author2.id),
        ), page(), token1)
        var ids = searchResult.map { it.slug }

        var expectationIds = getDataProjectSlugsByIndex(0, 1, 2, 3, 5, 6, 7, 8, 9) + getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9)

        assertThat(searchResult).hasSize(18)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            ownerIdsOr = listOf(author1.id, author2.id),
        ), page(), token2)
        ids = searchResult.map { it.slug }

        expectationIds = getDataProjectSlugsByIndex(0, 1, 3, 4, 5, 6, 7, 9) + getCodeProjectSlugsByIndex(0, 1, 3, 6, 7, 9)

        assertThat(searchResult).hasSize(14)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by name`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            name = "code",
        ), page(), token1)
        var ids = searchResult.map { it.slug }

        var expectationIds = getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9)

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            name = "code",
        ), page(), token2)
        ids = searchResult.map { it.slug }

        expectationIds = getCodeProjectSlugsByIndex(0, 1, 3, 6, 7, 9)

        assertThat(searchResult).hasSize(6)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by slug`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            slug = "slug",
        ), page(), token1)
        var ids = searchResult.map { it.slug }

        var expectationIds = getDataProjectSlugsByIndex(0, 1, 2, 3, 5, 9) + getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 9)

        assertThat(searchResult).hasSize(12)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            slug = "slug",
        ), page(), token2)
        ids = searchResult.map { it.slug }

        expectationIds = getDataProjectSlugsByIndex(0, 1, 3, 4, 5, 9) + getCodeProjectSlugsByIndex(0, 1, 3, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by published`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            published = true,
        ), page(), token1)
        var ids = searchResult.map { it.slug }

        var expectationIds = getCodeProjectSlugsByIndex(0)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            published = true,
        ), page(), token2)
        ids = searchResult.map { it.slug }

        expectationIds = getCodeProjectSlugsByIndex(0, 1)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by namespace`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(
            namespace = "namespace1",
        ), page(), token1)
        var ids = searchResult.map { it.slug }

        var expectationIds = getDataProjectSlugsByIndex(0, 2, 3, 5, 6, 8) + getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 6, 8, 9)

        assertThat(searchResult).hasSize(14)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(
            namespace = "namespace2",
        ), page(), token2)
        ids = searchResult.map { it.slug }

        expectationIds = getDataProjectSlugsByIndex(1, 7, 9) + getCodeProjectSlugsByIndex(1, 7)

        assertThat(searchResult).hasSize(5)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    private fun page() = PageRequest.of(0, 100)

    private fun createMockedProjects() {
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val tag3 = SearchableTag(randomUUID(), "Tag2")
        val tag4 = SearchableTag(randomUUID(), "TAG4")
        val tag5 = SearchableTag(randomUUID(), "gat5")

        val tagSet2 = listOf(tag1, tag2)
        val tagSet3 = listOf(tag1, tag2, tag3)
        val tagSet4 = listOf(tag1, tag2, tag3, tag4)
        val tagSet5 = listOf(tag1, tag2, tag3, tag4, tag5)

        val dataTypeSet1 = listOf(DataType.VIDEO, DataType.TABULAR)
        val dataTypeSet2 = listOf(DataType.IMAGE)
        val dataTypeSet3 = listOf(DataType.HIERARCHICAL, DataType.MODEL, DataType.NUMBER)
        val dataTypeSet4 = listOf(DataType.NONE)
        val dataTypeSet5 = listOf(DataType.TEXT, DataType.TIME_SERIES)
        val dataTypeSet6 = listOf(DataType.MODEL)
        val dataTypeSet7 = listOf(DataType.ANY)
        val dataTypeSet8 = listOf(DataType.IMAGE, DataType.VIDEO)

        dataProject0 = projectRepository.save(EntityMocks.dataProject(slug = "slug0", inputDataTypes = dataTypeSet1, outputDataTypes = dataTypeSet2, tags = mutableListOf(tag1), visibilityScope = PUBLIC, forksCount = 9, namespace = "namespace1"))
        dataProject1 = projectRepository.save(EntityMocks.dataProject(slug = "slug1", inputDataTypes = dataTypeSet4, outputDataTypes = dataTypeSet3, tags = tagSet2, ownerId = author2.id, visibilityScope = PUBLIC, forksCount = 8, namespace = "namespace2"))
        dataProject2 = projectRepository.save(EntityMocks.dataProject(slug = "slug2", inputDataTypes = dataTypeSet1, outputDataTypes = dataTypeSet1, tags = tagSet3, visibilityScope = PRIVATE, forksCount = 7, namespace = "namespace1"))
        dataProject3 = projectRepository.save(EntityMocks.dataProject(slug = "notslug3", inputDataTypes = dataTypeSet5, outputDataTypes = dataTypeSet6, tags = tagSet4, visibilityScope = PUBLIC, forksCount = 6, namespace = "namespace1"))
        dataProject4 = projectRepository.save(EntityMocks.dataProject(slug = "Slug4", inputDataTypes = dataTypeSet4, outputDataTypes = dataTypeSet4, tags = tagSet5, ownerId = author2.id, visibilityScope = PRIVATE, forksCount = 5, namespace = "namespace1"))
        dataProject5 = projectRepository.save(EntityMocks.dataProject(slug = "SLUG5", tags = mutableListOf(tag2), visibilityScope = PUBLIC, forksCount = 4, namespace = "namespace1"))
        dataProject6 = projectRepository.save(EntityMocks.dataProject(slug = "lug6", inputDataTypes = dataTypeSet2, outputDataTypes = dataTypeSet6, tags = mutableListOf(tag3), visibilityScope = PRIVATE, forksCount = 3, namespace = "namespace1"))
        dataProject7 = projectRepository.save(EntityMocks.dataProject(slug = "slu7", inputDataTypes = dataTypeSet7, outputDataTypes = dataTypeSet1, tags = mutableListOf(tag4), ownerId = author2.id, visibilityScope = PUBLIC, forksCount = 2, namespace = "namespace2"))
        dataProject8 = projectRepository.save(EntityMocks.dataProject(slug = "8guls", inputDataTypes = dataTypeSet3, tags = mutableListOf(tag5), visibilityScope = PRIVATE, forksCount = 1, namespace = "namespace1"))
        dataProject9 = projectRepository.save(EntityMocks.dataProject(slug = "slug9", outputDataTypes = dataTypeSet2, ownerId = author2.id, visibilityScope = PRIVATE, namespace = "namespace2"))

        dataProjectList = listOf(dataProject0, dataProject1, dataProject2, dataProject3, dataProject4, dataProject5, dataProject6, dataProject7, dataProject8, dataProject9)

        codeProject0 = projectRepository.save(EntityMocks.codeProject(slug = "slug10", inputDataTypes = dataTypeSet3, outputDataTypes = dataTypeSet7, tags = tagSet5, visibilityScope = PUBLIC, namespace = "namespace1"))
        codeProject1 = projectRepository.save(EntityMocks.codeProject(slug = "slug11", inputDataTypes = dataTypeSet2, outputDataTypes = dataTypeSet2, tags = tagSet4, ownerId = author2.id, visibilityScope = PRIVATE, forksCount = 1, namespace = "namespace2"))
        codeProject2 = projectRepository.save(EntityMocks.codeProject(slug = "slug12", inputDataTypes = dataTypeSet1, outputDataTypes = dataTypeSet5, tags = tagSet3, visibilityScope = PRIVATE, forksCount = 2, namespace = "namespace1"))
        codeProject3 = projectRepository.save(EntityMocks.codeProject(slug = "slug13", inputDataTypes = dataTypeSet4, outputDataTypes = dataTypeSet6, tags = tagSet2, visibilityScope = PUBLIC, forksCount = 3, namespace = "namespace1"))
        codeProject4 = projectRepository.save(EntityMocks.codeProject(slug = "Slug14", visibilityScope = PRIVATE, forksCount = 4, namespace = "namespace1"))
        codeProject5 = projectRepository.save(EntityMocks.codeProject(slug = "SLUG15", inputDataTypes = dataTypeSet5, tags = mutableListOf(tag5), visibilityScope = PRIVATE, forksCount = 5, namespace = "namespace1"))
        codeProject6 = projectRepository.save(EntityMocks.codeProject(slug = "lug16", outputDataTypes = dataTypeSet7, tags = mutableListOf(tag4), visibilityScope = PUBLIC, forksCount = 6, namespace = "namespace1"))
        codeProject7 = projectRepository.save(EntityMocks.codeProject(slug = "slu17", inputDataTypes = dataTypeSet8, outputDataTypes = dataTypeSet6, tags = mutableListOf(tag3), ownerId = author2.id, visibilityScope = PUBLIC, forksCount = 7, namespace = "namespace2"))
        codeProject8 = projectRepository.save(EntityMocks.codeProject(slug = "81guls", inputDataTypes = dataTypeSet3, outputDataTypes = dataTypeSet1, tags = mutableListOf(tag2), visibilityScope = PRIVATE, forksCount = 8, namespace = "namespace1"))
        codeProject9 = projectRepository.save(EntityMocks.codeProject(slug = "slug19", inputDataTypes = dataTypeSet6, outputDataTypes = dataTypeSet2, tags = mutableListOf(tag1), visibilityScope = PRIVATE, forksCount = 9, namespace = "namespace1"))

        codeProjectList = listOf(codeProject0, codeProject1, codeProject2, codeProject3, codeProject4, codeProject5, codeProject6, codeProject7, codeProject8, codeProject9)

        dataProject1 = projectRepository.save(dataProject1.addStar(author1).addStar(author2) as DataProject)
        dataProject2 = projectRepository.save(dataProject2.addStar(author1) as DataProject)

        codeProject6 = projectRepository.save(codeProject6.addStar(author1).addStar(author2) as CodeProject)
        codeProject8 = projectRepository.save(codeProject8.addStar(author2) as CodeProject)

        val dataProcessor0 = EntityMocks.dataAlgorithm(codeProject = codeProject0, author = author1, slug = "alg-1")
        val dataProcessor1 = EntityMocks.dataOperation(codeProject = codeProject1, author = author2, slug = "op-1")
        val dataProcessor2 = EntityMocks.dataVisualization(codeProject = codeProject2, author = author1, slug = "vis-1")
        val dataProcessor3 = EntityMocks.dataAlgorithm(codeProject = codeProject3, author = author2, slug = "alg-2")
        val dataProcessor4 = EntityMocks.dataAlgorithm(codeProject = codeProject4, author = author1, slug = "alg-3")
        val dataProcessor5 = EntityMocks.dataOperation(codeProject = codeProject5, author = author1, slug = "op-2")
        val dataProcessor6 = EntityMocks.dataVisualization(codeProject = codeProject6, author = author1, slug = "vis-2")
        val dataProcessor7 = EntityMocks.dataOperation(codeProject = codeProject7, author = author1, slug = "op-3")
        val dataProcessor9 = EntityMocks.dataVisualization(codeProject = codeProject9, author = author1, slug = "vis-3")

        val version0 = EntityMocks.processorVersion(dataProcessor0, "modelType0", "mlCategory0", publisher = author1, publishFinishedAt = ZonedDateTime.now())
        val version1 = EntityMocks.processorVersion(dataProcessor1, "modelType1", "mlCategory1", publisher = author2, publishFinishedAt = ZonedDateTime.now())
        val version2 = EntityMocks.processorVersion(dataProcessor2, "modelType2", "mlCategory2", publisher = author1)
        val version3 = EntityMocks.processorVersion(dataProcessor3, "modelType3", "mlCategory3", publisher = author2)
        val version4 = EntityMocks.processorVersion(dataProcessor4, "modelType4", "mlCategory4", publisher = author1)
        val version5 = EntityMocks.processorVersion(dataProcessor5, "modelType5", "mlCategory5", publisher = author1)
        val version6 = EntityMocks.processorVersion(dataProcessor6, "modelType6", "mlCategory6", publisher = author1)
        val version7 = EntityMocks.processorVersion(dataProcessor7, "modelType7", "mlCategory7", publisher = author1)
        val version9 = EntityMocks.processorVersion(dataProcessor9, "modelType9", "mlCategory9", publisher = author1)

        processorVersionRepository.saveAll(listOf(version0, version1, version3, version4, version5, version6, version2, version7, version9))

        token1 = TokenDetails(author1.name, "1234", author1.id, author1.id, projects = mutableMapOf(
            dataProject0.id to OWNER,
            dataProject1.id to DEVELOPER,
            dataProject2.id to OWNER,
            dataProject3.id to OWNER,
            dataProject5.id to OWNER,
            dataProject6.id to OWNER,
            dataProject8.id to OWNER,
            dataProject9.id to GUEST,
            codeProject0.id to OWNER,
            codeProject2.id to OWNER,
            codeProject3.id to OWNER,
            codeProject4.id to OWNER,
            codeProject5.id to OWNER,
            codeProject6.id to OWNER,
            codeProject8.id to OWNER,
            codeProject9.id to GUEST,
        ))

        token2 = TokenDetails(author2.name, "98765", author2.id, author2.id, projects = mutableMapOf(
            dataProject0.id to DEVELOPER,
            dataProject1.id to OWNER,
            dataProject4.id to OWNER,
            dataProject6.id to MAINTAINER,
            dataProject7.id to OWNER,
            dataProject9.id to OWNER,
            codeProject1.id to OWNER,
            codeProject7.id to OWNER,
            codeProject9.id to GUEST,
        ))
    }

    private fun getDataProjectIdsByIndex(vararg indexes: Int): List<UUID> {
        return indexes.map { dataProjectList[it] }.map { it.id }
    }

    private fun getDataProjectSlugsByIndex(vararg indexes: Int): List<String> {
        return indexes.map { dataProjectList[it] }.map { it.slug }
    }

    private fun getCodeProjectIdsByIndex(vararg indexes: Int): List<UUID> {
        return indexes.map { codeProjectList[it] }.map { it.id }
    }

    private fun getCodeProjectSlugsByIndex(vararg indexes: Int): List<String> {
        return indexes.map { codeProjectList[it] }.map { it.slug }
    }
}
