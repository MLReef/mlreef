package com.mlreef.rest.feature.marketplace

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.Project
import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.ProjectType
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.api.v1.FilterRequest
import com.mlreef.rest.marketplace.Searchable
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
    private lateinit var codeProjectRepository: CodeProjectRepository

    private lateinit var service: MarketplaceService
    private lateinit var author: Person
    private lateinit var dataProject: DataProject

    @BeforeEach
    @Transactional
    fun prepare() {
        truncateDbTables(listOf("subject", "marketplace_tag", "data_processor", "mlreef_project"), cascade = true)
        author = personRepository.save(EntityMocks.author)

        service = MarketplaceService(repository, dataProjectRepository, codeProjectRepository, tagRepository)
    }

    @Transactional
    @Test
    fun `createEntry persists Entry`() {

        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author.getId()))
        val createEntry = service.prepareEntry(dataProject, author)

        assertThat(createEntry).isNotNull()
        assertThat(createEntry.ownerId).isNotNull()

        val fromRepo = repository.findByIdOrNull(createEntry.getId())

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.ownerId).isNotNull()
    }

    @Transactional
    @Test
    fun `addTags persists Entry and tags collection`() {

        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author.getId()))
        // prepare
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val tag3 = SearchableTag(randomUUID(), "tag3")
        val tag4 = SearchableTag(randomUUID(), "tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.prepareEntry(dataProject, author)

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
    @Test
    fun `defineTags persists Entry and reset Tags`() {
        // prepare
        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author.getId()))
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val tag3 = SearchableTag(randomUUID(), "tag3")
        val tag4 = SearchableTag(randomUUID(), "tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.prepareEntry(dataProject, author)

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
        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author.getId()))
        val entity = service.prepareEntry(dataProject, author)

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
        dataProject = dataProjectRepository.save(EntityMocks.dataProject(author.getId()))
        val entity = service.prepareEntry(dataProject, author)

        val adapted = entity
            .addStar(person1)
            .addStar(person2)
            .addStar(person2)

        withinTransaction {
            repository.save(adapted as Project)
        }

        withinTransaction {
            service.removeStar(adapted, person1)
        }
//        val afterRemove = withinTransaction {
//            val beforeRemove = adapted
//                .removeStar(person1)
//                .removeStar(person1)
//            repository.save(beforeRemove as Project)
//        }

        val fromRepo = repository.findByIdOrNull(entity.getId())

        assertThat(fromRepo!!.stars).hasSize(1)
        assertThat(fromRepo.starsCount).isEqualTo(1)
        assertThat(fromRepo.stars).contains(Star(entity.getId(), person2.getId()))
    }

    @Transactional
    @Test
    fun `finds all public CODE_PROJECT Entries`() {
        mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(),
            FilterRequest(searchableType = SearchableType.CODE_PROJECT, maxStars = 100, minStars = 0), hashMapOf())
        assertThat(performSearch).hasSize(4)
    }

    @Transactional
    @Test
    fun `finds all public DATA_PROJECT Entries`() {
        mockMarkeplaceEntries(ProjectType.DATA_PROJECT)
        val performSearch = service.performSearch(page(),
            FilterRequest(searchableType = SearchableType.DATA_PROJECT, maxStars = 100, minStars = 0), hashMapOf())
        assertThat(performSearch).hasSize(4)
    }

    @Transactional
    @Test
    fun `filter for searchableType ALGORITHM finds specified CODE_PROJECT`() {
        val (entry1, _, _, _) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.ALGORITHM,
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(1)
        assertThat(ids).containsAll(listOf(entry1).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter for searchableType OPERATION finds specified CODE_PROJECT `() {
        val (_, entry2, entry3, _) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.OPERATION,
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(2)
        assertThat(ids).containsAll(listOf(entry2, entry3).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter for searchableType VISUALISATION finds specified CODE_PROJECT`() {
        val (_, _, _, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.VISUALISATION,
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(1)
        assertThat(ids).containsAll(listOf(entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for inputDataTypes`() {
        val (_, entry2, _, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypes = listOf(DataType.IMAGE),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(2)
        assertThat(ids).containsAll(listOf(entry2, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for inputDataTypes WITH specific DATAPROCESSOR checks inputDataTypes of DataProcessor`() {
        val (_, _, _, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT, faulty = true)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.VISUALISATION,
            inputDataTypes = listOf(DataType.IMAGE),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(1)
        assertThat(ids).containsAll(listOf(entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for inputDataTypes WITH specific DATAPROCESSOR checks inputDataTypes of DataProcessor overides PROJECT`() {
        val (entry1, _, _, _) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT, faulty = true)

        // if no explicit Data_processor (e.g. ALGORITHM) is set, Tabular will match
        val performSearch1 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypes = listOf(DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        // NUMBER of ALGORITHM overides TABULAR of CODE_PROJECT
        val performSearch2 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.ALGORITHM,
            inputDataTypes = listOf(DataType.TIME_SERIES),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        // But number for ALL CODE_PROJECT is not found, join would be necessary
        val performSearch3 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypes = listOf(DataType.TIME_SERIES),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        // also, when joining, JUST the dataprocessors explicitly are found with the stated DataType
        val performSearch4 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.ALGORITHM,
            inputDataTypes = listOf(DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        val ids1 = performSearch1.map { it.project.getId() }
        val ids2 = performSearch2.map { it.project.getId() }
        val ids3 = performSearch3.map { it.project.getId() }
        val ids4 = performSearch4.map { it.project.getId() }
        assertThat(ids1).containsAll(listOf(entry1).map(Searchable::getId))
        assertThat(ids2).containsAll(listOf(entry1).map(Searchable::getId))
        assertThat(ids3).isEmpty()
        assertThat(ids4).isEmpty()
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for outputDataTypes WITH specific DATAPROCESSOR checks inputDataTypes of DataProcessor overides PROJECT`() {
        val (_, _, entry3, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT, faulty = true)

        // if no explicit Data_processor (e.g. ALGORITHM) is set, Tabular will match
        val performSearch1 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            outputDataTypes = listOf(DataType.MODEL),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        // NUMBER of ALGORITHM overides TABULAR of CODE_PROJECT
        val performSearch2 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            outputDataTypes = listOf(DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        // But number for ALL CODE_PROJECT is not found, join would be necessary
        val performSearch3 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.OPERATION,
            outputDataTypes = listOf(DataType.MODEL),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        // also, when joining, JUST the dataprocessors explicitly are found with the stated DataType
        val performSearch4 = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.VISUALISATION,
            outputDataTypes = listOf(DataType.MODEL),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())

        val ids1 = performSearch1.map { it.project.getId() }
        val ids2 = performSearch2.map { it.project.getId() }
        val ids3 = performSearch3.map { it.project.getId() }
        val ids4 = performSearch4.map { it.project.getId() }
        assertThat(ids1).hasSize(2)
        assertThat(ids2).hasSize(1)
        assertThat(ids3).hasSize(1)
        assertThat(ids4).hasSize(0)
        assertThat(ids1).containsAll(listOf(entry3, entry4).map(Searchable::getId))
        assertThat(ids2).containsAll(listOf(entry4).map(Searchable::getId))
        assertThat(ids3).containsAll(listOf(entry3).map(Searchable::getId))
        assertThat(ids4).isEmpty()
    }

    @Transactional
    @Test
    fun `filter DATA_PROJECT for inputDataTypes`() {
        val (_, entry2, _, entry4) = mockMarkeplaceEntries(ProjectType.DATA_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.DATA_PROJECT,
            inputDataTypes = listOf(DataType.IMAGE),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(2)
        assertThat(ids).containsAll(listOf(entry2, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for inputDataTypes OR`() {
        val (_, entry2, _, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypes = listOf(DataType.IMAGE, DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(3)
        assertThat(ids).containsAll(listOf(entry2, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for outputDataTypes`() {
        val (_, _, _, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            outputDataTypes = listOf(DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(1)
        assertThat(ids).containsAll(listOf(entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for outputDataTypes OR`() {
        val (_, _, entry3, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            outputDataTypes = listOf(DataType.MODEL, DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(2)
        assertThat(ids).containsAll(listOf(entry3, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for tags`() {
        val (entry1, _, _, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            tags = listOf("tag1"),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(2)
        assertThat(ids).containsAll(listOf(entry1, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter CODE_PROJECT for tags AND`() {
        val (_, _, _, entry4) = mockMarkeplaceEntries(ProjectType.CODE_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,

            tags = listOf("tag1", "tag2"),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(1)
        assertThat(ids).containsAll(listOf(entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter DATA_PROJECT for inputDataTypes OR`() {
        val (_, entry2, _, entry4) = mockMarkeplaceEntries(ProjectType.DATA_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.DATA_PROJECT,
            inputDataTypes = listOf(DataType.IMAGE, DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(3)
        assertThat(ids).containsAll(listOf(entry2, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter DATA_PROJECT for outputDataTypes`() {
        val (_, _, _, entry4) = mockMarkeplaceEntries(ProjectType.DATA_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.DATA_PROJECT,
            outputDataTypes = listOf(DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.id }
        assertThat(performSearch).hasSize(1)
        assertThat(ids).containsAll(listOf(entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter DATA_PROJECT for outputDataTypes OR`() {
        val (_, _, entry3, entry4) = mockMarkeplaceEntries(ProjectType.DATA_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.DATA_PROJECT,
            outputDataTypes = listOf(DataType.MODEL, DataType.TABULAR),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(2)
        assertThat(ids).containsAll(listOf(entry3, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter DATA_PROJECT for tags`() {
        val (entry1, _, _, entry4) = mockMarkeplaceEntries(ProjectType.DATA_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.DATA_PROJECT,
            tags = listOf("tag1"),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(2)
        assertThat(ids).containsAll(listOf(entry1, entry4).map(Searchable::getId))
    }

    @Transactional
    @Test
    fun `filter DATA_PROJECT for tags AND`() {
        val (_, _, _, entry4) = mockMarkeplaceEntries(ProjectType.DATA_PROJECT)
        val performSearch = service.performSearch(page(), FilterRequest(
            searchableType = SearchableType.DATA_PROJECT,

            tags = listOf("tag1", "tag2"),
            maxStars = 100,
            minStars = 0
        ), hashMapOf())
        val ids = performSearch.map { it.project.getId() }
        assertThat(performSearch).hasSize(1)
        assertThat(ids).containsAll(listOf(entry4).map(Searchable::getId))
    }

    private fun page() = PageRequest.of(0, 100)

    private fun saveProjects(projects: List<Searchable>) {
        projects.forEach {
            if (it is DataProject) {
                dataProjectRepository.save(it)
            } else if (it is CodeProject) {
                codeProjectRepository.save(it)
            }
        }
    }

    private fun mockMarkeplaceEntries(type: ProjectType, faulty: Boolean = false): List<Searchable> {
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")

        var project1: Searchable?
        var project2: Searchable?
        var project3: Searchable?
        var project4: Searchable?
        if (type == ProjectType.DATA_PROJECT) {
            project1 = EntityMocks.dataProject(slug = "entry1")
            project2 = EntityMocks.dataProject(slug = "entry2")
            project3 = EntityMocks.dataProject(slug = "entry3")
            project4 = EntityMocks.dataProject(slug = "entry4")
        } else {
            var dataProcessor1 = EntityMocks.dataAlgorithm(author = author)
            var dataProcessor2 = EntityMocks.dataOperation(slug = "op1", author = author)
            var dataProcessor3 = EntityMocks.dataOperation(slug = "op2", author = author)
            var dataProcessor4 = EntityMocks.dataVisualization(author = author)
            if (faulty) {
                dataProcessor1 = dataProcessor1.copy(inputDataType = DataType.TIME_SERIES)
                dataProcessor2 = dataProcessor2.copy(inputDataType = DataType.IMAGE)
                dataProcessor3 = dataProcessor3.copy(inputDataType = DataType.VIDEO, outputDataType = DataType.MODEL)
                dataProcessor4 = dataProcessor4.copy(inputDataType = DataType.IMAGE)
            }
            dataProcessorRepository.saveAll(listOf(dataProcessor1, dataProcessor2, dataProcessor3, dataProcessor4))
            project1 = EntityMocks.codeProject(slug = "entry1").copy(dataProcessor = dataProcessor1)
            project2 = EntityMocks.codeProject(slug = "entry2").copy(dataProcessor = dataProcessor2)
            project3 = EntityMocks.codeProject(slug = "entry3").copy(dataProcessor = dataProcessor3)
            project4 = EntityMocks.codeProject(slug = "entry4").copy(dataProcessor = dataProcessor4)
        }
        project1 = project1.clone(inputDataTypes = hashSetOf(DataType.VIDEO, DataType.TABULAR)
        ).addTags(listOf(tag1))

        project2 = project2.clone(inputDataTypes = hashSetOf(DataType.IMAGE))
            .addTags(listOf(tag2))

        project3 = project3.clone(inputDataTypes = hashSetOf(DataType.VIDEO, DataType.MODEL),
            outputDataTypes = hashSetOf(DataType.MODEL))
            .addTags(listOf())

        project4 = project4.clone(inputDataTypes = hashSetOf(DataType.IMAGE),
            outputDataTypes = hashSetOf(DataType.MODEL, DataType.TABULAR)
        ).addTags(listOf(tag1, tag2))

        val listOf: List<Searchable> = listOf(project1, project2, project3, project4)
        saveProjects(listOf)
        return listOf
    }
}
