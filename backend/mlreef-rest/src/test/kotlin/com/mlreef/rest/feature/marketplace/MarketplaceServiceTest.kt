package com.mlreef.rest.feature.marketplace

import com.mlreef.rest.api.v1.SearchRequest
import com.mlreef.rest.domain.AccessLevel.DEVELOPER
import com.mlreef.rest.domain.AccessLevel.GUEST
import com.mlreef.rest.domain.AccessLevel.MAINTAINER
import com.mlreef.rest.domain.AccessLevel.OWNER
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.ProjectType.CODE_PROJECT
import com.mlreef.rest.domain.ProjectType.DATA_PROJECT
import com.mlreef.rest.domain.PublishStatus
import com.mlreef.rest.domain.VisibilityScope.PRIVATE
import com.mlreef.rest.domain.VisibilityScope.PUBLIC
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.SearchableType
import com.mlreef.rest.domain.marketplace.Star
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.persistence.AbstractRepositoryTest
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Rollback
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import java.util.UUID.randomUUID

class MarketplaceServiceTest : AbstractRepositoryTest() {

    private lateinit var service: MarketplaceService
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
    @Rollback
    fun prepare() {
        service = MarketplaceService(
            projectRepository,
            dataProjectRepository,
            codeProjectRepository,
            tagRepository,
            entityManager,
            processorTypeRepository,
            dataTypesRepository
        )
    }

    @Transactional
    @Rollback
    @Test
    fun `createEntry persists Entry`() {
        dataProject = createDataProject(ownerId = mainPerson.id)
        val createEntry = service.prepareEntry(dataProject, mainPerson)

        assertThat(createEntry).isNotNull()
        assertThat(createEntry.ownerId).isNotNull()

        val fromRepo = projectRepository.findByIdOrNull(createEntry.getId())

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.ownerId).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    fun `addTags persists Entry and tags collection`() {

        dataProject = createDataProject(ownerId = mainPerson.id)
        // prepare
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val tag3 = SearchableTag(randomUUID(), "tag3")
        val tag4 = SearchableTag(randomUUID(), "tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.prepareEntry(dataProject, mainPerson)

        val addTags = service.addTags(entry, bunch1)
        val fromRepo1 = projectRepository.findByIdOrNull(addTags.getId())

        assertThat(fromRepo1).isNotNull()
        assertThat(fromRepo1!!.tags).hasSize(2)

        assertThat(fromRepo1.tags).contains(tag1)
        assertThat(fromRepo1.tags).contains(tag2)
        assertThat(fromRepo1.tags).doesNotContain(tag3)
        assertThat(fromRepo1.tags).doesNotContain(tag4)

        service.addTags(fromRepo1, bunch2)
        val fromRepo2 = projectRepository.findByIdOrNull(entry.getId())

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
        dataProject = createDataProject(ownerId = mainPerson.id)
        val tag1 = SearchableTag(randomUUID(), "tag1")
        val tag2 = SearchableTag(randomUUID(), "tag2")
        val tag3 = SearchableTag(randomUUID(), "tag3")
        val tag4 = SearchableTag(randomUUID(), "tag4")
        val bunch1 = tagRepository.saveAll(arrayListOf(tag1, tag2)).toList()
        val bunch2 = tagRepository.saveAll(arrayListOf(tag3, tag4)).toList()
        val entry = service.prepareEntry(dataProject, mainPerson)

        service.defineTags(entry, bunch1)
        val fromRepo1 = projectRepository.findByIdOrNull(entry.getId())

        assertThat(fromRepo1).isNotNull()
        assertThat(fromRepo1!!.tags).hasSize(2)

        assertThat(fromRepo1.tags).contains(tag1)
        assertThat(fromRepo1.tags).contains(tag2)
        assertThat(fromRepo1.tags).doesNotContain(tag3)
        assertThat(fromRepo1.tags).doesNotContain(tag4)

        service.defineTags(entry, bunch2)
        val fromRepo2 = projectRepository.findByIdOrNull(entry.getId())

        assertThat(fromRepo2).isNotNull()
        assertThat(fromRepo2!!.tags).hasSize(2)

        assertThat(fromRepo2.tags).doesNotContain(tag1)
        assertThat(fromRepo2.tags).doesNotContain(tag2)
        assertThat(fromRepo2.tags).contains(tag3)
        assertThat(fromRepo2.tags).contains(tag4)
    }

    @Transactional
    @Rollback
    @Test
    fun `addStar persists stars for Entity`() {
        // prepare
        dataProject = createDataProject(ownerId = mainPerson.id)
        val entity = service.prepareEntry(dataProject, mainPerson)

        val v1 = service.addStar(entity, mainPerson)
        service.addStar(v1, mainPerson2)
        val fromRepo = projectRepository.findByIdOrNull(entity.getId())

        assertThat(fromRepo).isNotNull()
        assertThat(fromRepo!!.stars).hasSize(2)
        assertThat(fromRepo.starsCount).isEqualTo(2)
        assertThat(fromRepo.stars).contains(Star(entity.getId(), mainPerson.getId()))
        assertThat(fromRepo.stars).contains(Star(entity.getId(), mainPerson2.getId()))
    }

    @Transactional
    @Rollback
    @Test
    fun `search DATA_PROJECT AND CODE_PROJECT without any filter`() {
        createMockedProjects()
        var searchResult = service.searchProjects(SearchRequest(), page(), token1)
        var ids = searchResult.content.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 5, 6, 7, 8, 9) +
            getCodeProjectIdsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9) +
            listOf(codeProjectOperation.id, codeProjectAlgorithm.id, codeProjectVisualization.id, dataProjectImages.id)

        assertThat(searchResult).hasSize(22)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(SearchRequest(), page(), token2)
        ids = searchResult.content.map { it.id }

        expectationIds = getDataProjectIdsByIndex(0, 1, 3, 4, 5, 6, 7, 9) +
            getCodeProjectIdsByIndex(0, 1, 3, 6, 7, 9) +
            listOf(codeProjectOperation.id, codeProjectAlgorithm.id, codeProjectVisualization.id, dataProjectImages.id)

        assertThat(searchResult).hasSize(18)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search DATA_PROJECT`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                projectType = DATA_PROJECT
            ), page(), token1
        )
        var ids = searchResult.content.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 5, 6, 7, 8, 9) + dataProjectImages.id

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                projectType = DATA_PROJECT
            ), page(), token2
        )
        ids = searchResult.content.map { it.id }

        expectationIds = getDataProjectIdsByIndex(0, 1, 3, 4, 5, 6, 7, 9) + dataProjectImages.id

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search CODE_PROJECT`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                projectType = CODE_PROJECT
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9) +
            listOf(codeProjectOperation.id, codeProjectVisualization.id, codeProjectAlgorithm.id)

        assertThat(searchResult).hasSize(12)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                projectType = CODE_PROJECT
            ), page(), token2
        )
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 1, 3, 6, 7, 9) +
            listOf(codeProjectOperation.id, codeProjectVisualization.id, codeProjectAlgorithm.id)

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search CODE_PROJECT by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.CODE_PROJECT
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9) +
            listOf(codeProjectOperation.id, codeProjectVisualization.id, codeProjectAlgorithm.id) //Predefined

        assertThat(searchResult).hasSize(12)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.CODE_PROJECT
            ), page(), token2
        )
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 1, 3, 6, 7, 9) +
            listOf(codeProjectOperation.id, codeProjectVisualization.id, codeProjectAlgorithm.id)

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with VISUALIZATION dataprocessor by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.VISUALIZATION
            ), page(), token1
        )
        var ids = searchResult.content.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(2, 6, 9) + codeProjectVisualization.id

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.VISUALIZATION
            ), page(), token2
        )
        ids = searchResult.content.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(6, 9) + codeProjectVisualization.id

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with OPERATION dataprocessor by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.OPERATION
            ), page(), token1
        )
        var ids = searchResult.content.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(5, 7, 8) + codeProjectOperation.id

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.OPERATION
            ), page(), token2
        )
        ids = searchResult.content.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(1, 7) + codeProjectOperation.id

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with ALGORITHM dataprocessor by searchable field`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.ALGORITHM
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 3, 4) + codeProjectAlgorithm.id

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.ALGORITHM
            ), page(), token2
        )
        ids = searchResult.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 3) + codeProjectAlgorithm.id

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project VISUALIZATION`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                processorType = "VISUALIZATION"
            ), page(), token1
        )
        var ids = searchResult.content.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(2, 6, 9) + codeProjectVisualization.id

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                processorType = "VISUALIZATION"
            ), page(), token2
        )
        ids = searchResult.content.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(6, 9) + codeProjectVisualization.id

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with OPERATION dataprocessor`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                processorType = "OPERATION"
            ), page(), token1
        )
        var ids = searchResult.content.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(5, 7, 8) + codeProjectOperation.id

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                processorType = "OPERATION"
            ), page(), token2
        )
        ids = searchResult.content.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(1, 7) + codeProjectOperation.id

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with ALGORITHM dataprocessor`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                processorType = "ALGORITHM"
            ), page(), token1
        )
        var ids = searchResult.content.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 3, 4) + codeProjectAlgorithm.id

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                processorType = "ALGORITHM"
            ), page(), token2
        )
        ids = searchResult.content.map { it.id }

        expectationIds = getCodeProjectIdsByIndex(0, 3) + codeProjectAlgorithm.id

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with OPERATION dataprocessor AND input type IMAGE`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.OPERATION,
                inputDataTypes = setOf("IMAGE"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(7)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.OPERATION,
                inputDataTypes = setOf("IMAGE"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.OPERATION,
                inputDataTypes = setOf("TEXT", "TIME_SERIES"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        val expectationIds = getCodeProjectIdsByIndex(5)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.OPERATION,
                inputDataTypes = setOf("TEXT", "TIME_SERIES"),
            ), page(), token2
        )
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project with ALGORITHM dataprocessor AND input type NONE AND output type MODEL`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.ALGORITHM,
                inputDataTypes = setOf("NONE"),
                outputDataTypes = setOf("MODEL"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(3)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.ALGORITHM,
                inputDataTypes = setOf("NONE"),
                outputDataTypes = setOf("MODEL"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.CODE_PROJECT,
                inputDataTypesOr = setOf("IMAGE", "TEXT", "MODEL"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 5, 7, 8, 9)

        assertThat(searchResult).hasSize(5)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                searchableType = SearchableType.CODE_PROJECT,
                inputDataTypesOr = setOf("IMAGE", "TEXT", "MODEL"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag1"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3) + getCodeProjectIdsByIndex(0, 2, 3, 9)

        assertThat(searchResult).hasSize(8)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag1"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag1", "tAg4"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(3) + getCodeProjectIdsByIndex(0)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag1", "TAG4"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag1", "TAG4", "tag-does-not-exist"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)

        searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag1", "TAG4", "tag-does-not-exist"),
            ), page(), token2
        )
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by TAG1 OR TAG4`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                tagsOr = listOf("tag1", "TaG4"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 7) + getCodeProjectIdsByIndex(0, 2, 3, 6, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                tagsOr = listOf("tag1", "TAG4"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                tagsOr = listOf("tag1", "TAG4", "tag-does-not-exist"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(0, 1, 2, 3, 7) + getCodeProjectIdsByIndex(0, 2, 3, 6, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                tagsOr = listOf("tag1", "TAG4", "tag-does-not-exist"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag-does-not-exist"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)

        searchResult = service.searchProjects(
            SearchRequest(
                tags = listOf("tag-does-not-exist"),
            ), page(), token2
        )
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by OR NON-EXISTEN-TAG`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                tagsOr = listOf("tag-does-not-exist"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)

        searchResult = service.searchProjects(
            SearchRequest(
                tagsOr = listOf("tag-does-not-exist"),
            ), page(), token2
        )
        ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by single MODEL TYPE`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                modelTypeOr = listOf("modelType1"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        assertThat(searchResult).hasSize(0)
        //There are no projects returned because the project with ModelType1 is not visible for token1 (owner - token2, private)

        searchResult = service.searchProjects(
            SearchRequest(
                modelTypeOr = listOf("modelType1"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                modelTypeOr = listOf("MODELType0", "modelType1", "modelType2"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(0, 2)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                modelTypeOr = listOf("modeltype0", "modelType1", "modelType2"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                mlCategoryOr = listOf("MLCategory5", "MLCATEGORY7", "mlCategory9"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(5, 7, 9)

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                mlCategoryOr = listOf("MLCategory5", "MLCATEGORY7", "mlCategory9"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                modelTypeOr = listOf("MODELType0", "modelType1", "modeltype9"),
                mlCategoryOr = listOf("MLCategory1", "MLCATEGORY7", "mlCategory9"),
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getCodeProjectIdsByIndex(9)

        assertThat(searchResult).hasSize(1)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                modelTypeOr = listOf("modeltype0", "modelType1", "modelType9"),
                mlCategoryOr = listOf("MLCategory1", "MLCATEGORY7", "mlCategory9"),
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                minForksCount = 2,
                maxForksCount = 5,
            ), page(), token1
        )
        var ids = searchResult.map { it.slug }

        var expectationIds = getDataProjectSlugsByIndex(5, 6, 7) + getCodeProjectSlugsByIndex(2, 3, 4, 5)

        assertThat(searchResult).hasSize(7)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                minForksCount = 2,
                maxForksCount = 5,
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                minStars = 2,
                maxStars = 2,
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(1) + getCodeProjectIdsByIndex(6)

        assertThat(searchResult).hasSize(2)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                minStars = 2,
                maxStars = 2,
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                minStars = 1,
                maxStars = 2,
            ), page(), token1
        )
        var ids = searchResult.map { it.id }

        var expectationIds = getDataProjectIdsByIndex(1, 2) + getCodeProjectIdsByIndex(6, 8)

        assertThat(searchResult).hasSize(4)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                minStars = 1,
                maxStars = 2,
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                ownerIdsOr = listOf(mainPerson.id, mainPerson2.id),
            ), page(), token1
        )
        var ids = searchResult.content.map { it.slug }

        var expectationIds = getDataProjectSlugsByIndex(0, 1, 2, 3, 5, 6, 7, 8, 9) +
            getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9) +
            listOf(
                codeProjectOperation.slug,
                codeProjectAlgorithm.slug,
                codeProjectVisualization.slug,
                dataProjectImages.slug
            )

        assertThat(searchResult).hasSize(22)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                ownerIdsOr = listOf(mainPerson.id, mainPerson2.id),
            ), page(), token2
        )
        ids = searchResult.content.map { it.slug }

        expectationIds = getDataProjectSlugsByIndex(0, 1, 3, 4, 5, 6, 7, 9) +
            getCodeProjectSlugsByIndex(0, 1, 3, 6, 7, 9) +
            listOf(
                codeProjectOperation.slug,
                codeProjectAlgorithm.slug,
                codeProjectVisualization.slug,
                dataProjectImages.slug
            )

        assertThat(searchResult).hasSize(18)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by name`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                name = "code",
            ), page(), token1
        )
        var ids = searchResult.map { it.slug }

        var expectationIds = getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 6, 7, 8, 9)

        assertThat(searchResult).hasSize(9)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                name = "code",
            ), page(), token2
        )
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
        var searchResult = service.searchProjects(
            SearchRequest(
                slug = "slug",
            ), page(), token1
        )
        var ids = searchResult.content.map { it.slug }

        var expectationIds = getDataProjectSlugsByIndex(0, 1, 2, 3, 5, 9) +
            getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 9)

        assertThat(searchResult).hasSize(12)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                slug = "slug",
            ), page(), token2
        )
        ids = searchResult.content.map { it.slug }

        expectationIds = getDataProjectSlugsByIndex(0, 1, 3, 4, 5, 9) + getCodeProjectSlugsByIndex(0, 1, 3, 9)

        assertThat(searchResult).hasSize(10)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by published`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                published = true,
            ), page(), token1
        )
        var ids = searchResult.map { it.slug }

        var expectationIds = getCodeProjectSlugsByIndex(0, 3, 8) +
            listOf(
                codeProjectOperation.slug,
                codeProjectAlgorithm.slug,
                codeProjectVisualization.slug,
            )

        assertThat(searchResult).hasSize(6)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                published = true,
            ), page(), token2
        )
        ids = searchResult.map { it.slug }

        expectationIds = getCodeProjectSlugsByIndex(0, 1, 3) +
            listOf(
                codeProjectOperation.slug,
                codeProjectAlgorithm.slug,
                codeProjectVisualization.slug,
            )

        assertThat(searchResult).hasSize(6)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by not published`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                published = false,
            ), page(), token1
        )
        var ids = searchResult.map { it.slug }

        var expectationIds = getCodeProjectSlugsByIndex(2, 4, 5, 6, 7, 9)

        assertThat(searchResult).hasSize(6)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                published = false,
            ), page(), token2
        )
        ids = searchResult.map { it.slug }

        expectationIds = getCodeProjectSlugsByIndex(6, 7, 9)

        assertThat(searchResult).hasSize(3)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)
    }

    @Transactional
    @Rollback
    @Test
    fun `search project by namespace`() {
        createMockedProjects()
        var searchResult = service.searchProjects(
            SearchRequest(
                namespace = "namespace1",
            ), page(), token1
        )
        var ids = searchResult.map { it.slug }

        var expectationIds =
            getDataProjectSlugsByIndex(0, 2, 3, 5, 6, 8) + getCodeProjectSlugsByIndex(0, 2, 3, 4, 5, 6, 8, 9)

        assertThat(searchResult).hasSize(14)
        assertThat(ids).containsExactlyInAnyOrderElementsOf(expectationIds)

        searchResult = service.searchProjects(
            SearchRequest(
                namespace = "namespace2",
            ), page(), token2
        )
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

        val dataTypeSet1 = listOf(videoDataType, tabularDataType)
        val dataTypeSet2 = listOf(imageDataType)
        val dataTypeSet3 = listOf(hierDataType, modelDataType, numberDataType)
        val dataTypeSet4 = listOf(noneDataType)
        val dataTypeSet5 = listOf(textDataType, timeSeriesDataType)
        val dataTypeSet6 = listOf(modelDataType)
        val dataTypeSet7 = listOf(anyDataType)
        val dataTypeSet8 = listOf(imageDataType, audioDataType)

        dataProject0 = createDataProject(
            slug = "slug0",
            inputTypes = dataTypeSet1,
            tags = mutableListOf(tag1),
            visibility = PUBLIC,
            forksCount = 9,
            namespace = "namespace1",
            name = "Marketplace service test data project 0",
        )

        dataProject1 = createDataProject(
            slug = "slug1",
            inputTypes = dataTypeSet4,
            tags = tagSet2,
            ownerId = mainPerson2.id,
            visibility = PUBLIC,
            forksCount = 8,
            namespace = "namespace2",
            stars = listOf(mainPerson, mainPerson2),
            name = "Marketplace service test data project 1",
        )

        dataProject2 = createDataProject(
            slug = "slug2",
            inputTypes = dataTypeSet1,
            tags = tagSet3,
            visibility = PRIVATE,
            forksCount = 7,
            namespace = "namespace1",
            stars = listOf(mainPerson),
            name = "Marketplace service test data project 2",
        )

        dataProject3 = createDataProject(
            slug = "notslug3",
            inputTypes = dataTypeSet5,
            tags = tagSet4,
            visibility = PUBLIC,
            forksCount = 6,
            namespace = "namespace1",
            name = "Marketplace service test data project 3",
        )

        dataProject4 = createDataProject(
            slug = "Slug4",
            inputTypes = dataTypeSet4,
            tags = tagSet5,
            ownerId = mainPerson2.id,
            visibility = PRIVATE,
            forksCount = 5,
            namespace = "namespace1",
            name = "Marketplace service test data project 4",
        )

        dataProject5 = createDataProject(
            slug = "SLUG5",
            tags = mutableListOf(tag2),
            visibility = PUBLIC,
            forksCount = 4,
            namespace = "namespace1",
            name = "Marketplace service test data project 5",
        )

        dataProject6 = createDataProject(
            slug = "lug6",
            inputTypes = dataTypeSet2,
            tags = mutableListOf(tag3),
            visibility = PRIVATE,
            forksCount = 3,
            namespace = "namespace1",
            name = "Marketplace service test data project 6",
        )

        dataProject7 = createDataProject(
            slug = "slu7",
            inputTypes = dataTypeSet7,
            tags = mutableListOf(tag4),
            ownerId = mainPerson2.id,
            visibility = PUBLIC,
            forksCount = 2,
            namespace = "namespace2",
            name = "Marketplace service test data project 7",
        )

        dataProject8 = createDataProject(
            slug = "8guls",
            inputTypes = dataTypeSet3,
            tags = mutableListOf(tag5),
            visibility = PRIVATE,
            forksCount = 1,
            namespace = "namespace1",
            name = "Marketplace service test data project 8",
        )

        dataProject9 = createDataProject(
            slug = "slug9",
            ownerId = mainPerson2.id,
            visibility = PRIVATE,
            namespace = "namespace2",
            name = "Marketplace service test data project 9",
        )

        dataProjectList = listOf(
            dataProject0,
            dataProject1,
            dataProject2,
            dataProject3,
            dataProject4,
            dataProject5,
            dataProject6,
            dataProject7,
            dataProject8,
            dataProject9
        )

        codeProject0 = createCodeProject(
            slug = "slug10",
            inputTypes = dataTypeSet3,
            outputTypes = dataTypeSet7,
            tags = tagSet5,
            visibility = PUBLIC,
            namespace = "namespace1",
            processorType = algorithmProcessorType,
            modelType = "modelType0",
            mlCategory = "mlCategory0",
            name = "Marketplace service test code project 0",
        )


        codeProject1 = createCodeProject(
            slug = "slug11",
            inputTypes = dataTypeSet2,
            outputTypes = dataTypeSet2,
            tags = tagSet4,
            ownerId = mainPerson2.id,
            visibility = PRIVATE,
            forksCount = 1,
            namespace = "namespace2",
            processorType = operationProcessorType,
            modelType = "modelType1",
            mlCategory = "mlCategory1",
            name = "Marketplace service test code project 1",
        )

        codeProject2 = createCodeProject(
            slug = "slug12",
            inputTypes = dataTypeSet1,
            outputTypes = dataTypeSet5,
            tags = tagSet3,
            visibility = PRIVATE,
            forksCount = 2,
            namespace = "namespace1",
            processorType = visualizationProcessorType,
            modelType = "modelType2",
            mlCategory = "mlCategory2",
            name = "Marketplace service test code project 2",
        )

        codeProject3 = createCodeProject(
            slug = "slug13",
            inputTypes = dataTypeSet4,
            outputTypes = dataTypeSet6,
            tags = tagSet2,
            visibility = PUBLIC,
            forksCount = 3,
            namespace = "namespace1",
            processorType = algorithmProcessorType,
            modelType = "modelType3",
            mlCategory = "mlCategory3",
            name = "Marketplace service test code project 3",
        )

        codeProject4 = createCodeProject(
            slug = "Slug14",
            visibility = PRIVATE,
            forksCount = 4,
            namespace = "namespace1",
            processorType = algorithmProcessorType,
            modelType = "modelType4",
            mlCategory = "mlCategory4",
            name = "Marketplace service test code project 4",
        )

        codeProject5 = createCodeProject(
            slug = "SLUG15",
            inputTypes = dataTypeSet5,
            tags = mutableListOf(tag5),
            visibility = PRIVATE,
            forksCount = 5,
            namespace = "namespace1",
            processorType = operationProcessorType,
            modelType = "modelType5",
            mlCategory = "mlCategory5",
            name = "Marketplace service test code project 5",
        )

        codeProject6 = createCodeProject(
            slug = "lug16",
            outputTypes = dataTypeSet7,
            tags = mutableListOf(tag4),
            visibility = PUBLIC,
            forksCount = 6,
            namespace = "namespace1",
            processorType = visualizationProcessorType,
            modelType = "modelType6",
            mlCategory = "mlCategory6",
            stars = listOf(mainPerson, mainPerson2),
            name = "Marketplace service test code project 6",
        )

        codeProject7 = createCodeProject(
            slug = "slu17",
            inputTypes = dataTypeSet8,
            outputTypes = dataTypeSet6,
            tags = mutableListOf(tag3),
            ownerId = mainPerson2.id,
            visibility = PUBLIC,
            forksCount = 7,
            namespace = "namespace2",
            processorType = operationProcessorType,
            modelType = "modelType7",
            mlCategory = "mlCategory7",
            name = "Marketplace service test code project 7",
        )

        codeProject8 = createCodeProject(
            slug = "81guls",
            inputTypes = dataTypeSet3,
            outputTypes = dataTypeSet1,
            tags = mutableListOf(tag2),
            visibility = PRIVATE,
            forksCount = 8,
            namespace = "namespace1",
            processorType = operationProcessorType,
            stars = listOf(mainPerson2),
            name = "Marketplace service test code project 8",
        )

        codeProject9 = createCodeProject(
            slug = "slug19",
            inputTypes = dataTypeSet6,
            outputTypes = dataTypeSet2,
            tags = mutableListOf(tag1),
            visibility = PRIVATE,
            forksCount = 9,
            namespace = "namespace1",
            processorType = visualizationProcessorType,
            modelType = "modelType9",
            mlCategory = "mlCategory9",
            name = "Marketplace service test code project 9",
        )

        codeProjectList = listOf(
            codeProject0,
            codeProject1,
            codeProject2,
            codeProject3,
            codeProject4,
            codeProject5,
            codeProject6,
            codeProject7,
            codeProject8,
            codeProject9
        )

        val processorForCodeProject0 = createProcessor(codeProject0, status = PublishStatus.PUBLISHED) //public, token1
        val processorForCodeProject1 = createProcessor(codeProject1, status = PublishStatus.PUBLISHED) //private, token2

        val processorForCodeProject3_1 = createProcessor(codeProject3, status = PublishStatus.PUBLISH_FAILED, branch = "master", version = "1") //public, token1
        val processorForCodeProject3_2 = createProcessor(codeProject3, status = PublishStatus.PUBLISHED, branch = "master", version = "2") //public, token1
        val processorForCodeProject3_3 = createProcessor(codeProject3, status = PublishStatus.UNPUBLISHED, branch = "master", version = "3") //public, token1

        val processorForCodeProject7 = createProcessor(codeProject7, status = PublishStatus.PUBLISH_FAILED) //public, token2

        val processorForCodeProject8 = createProcessor(codeProject8, status = PublishStatus.PUBLISH_FINISHING) //private, token1

        token1 = TokenDetails(
            mainPerson.name, "1234", mainPerson.id, mainPerson.id, projects = mutableMapOf(
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
            )
        )

        token2 = TokenDetails(
            mainPerson2.name, "98765", mainPerson2.id, mainPerson2.id, projects = mutableMapOf(
                dataProject0.id to DEVELOPER,
                dataProject1.id to OWNER,
                dataProject4.id to OWNER,
                dataProject6.id to MAINTAINER,
                dataProject7.id to OWNER,
                dataProject9.id to OWNER,
                codeProject1.id to OWNER,
                codeProject7.id to OWNER,
                codeProject9.id to GUEST,
            )
        )
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
