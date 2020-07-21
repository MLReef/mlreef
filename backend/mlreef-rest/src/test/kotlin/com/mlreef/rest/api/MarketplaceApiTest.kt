@file:Suppress("UsePropertyAccessSyntax")

package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.DataType
import com.mlreef.rest.Person
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.api.v1.FilterRequest
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.SearchResultDto
import com.mlreef.rest.api.v1.dto.SearchableTagDto
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import com.mlreef.rest.testcommons.EntityMocks
import com.mlreef.rest.testcommons.RestResponsePage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import java.util.UUID
import javax.transaction.Transactional

class MarketplaceApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/explore"
    private lateinit var account2: Account
    private lateinit var subject: Person
    private lateinit var subject2: Person

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var marketplaceTagRepository: SearchableTagRepository

    @Autowired
    private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var marketplaceService: MarketplaceService

    @BeforeEach
    @AfterEach
    fun setUp() {
        marketplaceTagRepository.deleteAll()

        codeProjectRepository.deleteAll()
        dataProcessorRepository.deleteAll()
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()

        accountSubjectPreparationTrait.apply()

        account = accountSubjectPreparationTrait.account
        account2 = accountSubjectPreparationTrait.account2

        subject = accountSubjectPreparationTrait.subject
        subject2 = accountSubjectPreparationTrait.subject2

        mockGetUserProjectsList(account)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all public MarketplaceEntries`() {

        val dataProject1 = EntityMocks.dataProject(slug = "slug1")
        val dataProject2 = EntityMocks.dataProject(slug = "slug2")
        val dataProject3 = EntityMocks.dataProject(slug = "slug3")

        this.mockGetUserProjectsList(listOf(dataProject1.id, dataProject2.id, dataProject3.id), account, AccessLevel.GUEST)

        personRepository.saveAll(listOf(EntityMocks.author))
        dataProjectRepository.saveAll(listOf(dataProject1, dataProject2, dataProject3))

        val returnedResult = this.performGet("$rootUrl/entries", account)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-entries-retrieve-all", responseFields(projectResponseFields("[].")))
            .returnsList(ProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve MarketplaceEntries per Slug`() {
        val dataProject1 = EntityMocks.dataProject(slug = "slug1")

        personRepository.saveAll(listOf(EntityMocks.author))
        dataProjectRepository.saveAll(listOf(dataProject1))

        marketplaceService.prepareEntry(dataProject1, EntityMocks.author)
        this.mockGetUserProjectsList(listOf(dataProject1.id), account, AccessLevel.GUEST)

        val returnedResult = this.performGet("$rootUrl/entries/${dataProject1.globalSlug}", account)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-entries-retrieve-one", responseFields(projectResponseFields("")))
            .returns(ProjectDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api`() {
        prepareMocks()

        val filterRequest = FilterRequest(
            searchableType = SearchableType.CODE_PROJECT

        )
        val pagedResult: RestResponsePage<SearchResultDto> = this.performPost("$rootUrl/entries/search", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-explore-search",
                requestFields(filterRequestFields("")),
                responseFields(searchResultFields(""))
            )
            .returns()

        assertThat(pagedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with minimal filter`() {
        prepareMocks()

        val filterRequest = FilterRequest(
            searchableType = SearchableType.CODE_PROJECT
        )
        val pagedResult: RestResponsePage<SearchResultDto> = this.performPost("$rootUrl/entries/search", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-explore-search-minimal")
            .returns()

        assertThat(pagedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with maximal filter`() {
        val tags = prepareMocks()

        val filterRequest = FilterRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypes = listOf(DataType.IMAGE),
            outputDataTypes = listOf(),
            query = "query",
            queryAnd = true,
            tags = listOf(tags[0].name),
            minStars = 0,
            maxStars = 100
        )
        val pagedResult: RestResponsePage<SearchResultDto> = this.performPost("$rootUrl/entries/search", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-explore-search-maximal")
            .returns()

        assertThat(pagedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with paging parameters`() {
        prepareMocks()

        val filterRequest = FilterRequest(searchableType = SearchableType.CODE_PROJECT)

        val pagedResult: RestResponsePage<SearchResultDto> = this.performPost("$rootUrl/entries/search?page=2&size=10&sort=name&name.dir=desc", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-explore-search-params",
                requestParameters(
                    parameterWithName("page").description("The page to retrieve"),
                    parameterWithName("size").description("Number of results to retrieve"),
                    parameterWithName("sort").description("Sort per a named field"),
                    parameterWithName("name.dir").description("Example, sort \$field.dir with direction 'desc' or 'asc'"))
            )
            .returns()

        assertThat(pagedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    @Disabled
    // Cannot use postgresql FTS with H2
    fun `Can use Search Api with fts query and sort`() {
        prepareMocks()

        val filterRequest = FilterRequest(searchableType = SearchableType.CODE_PROJECT, query = "project A")

        val pagedResult: RestResponsePage<SearchResultDto> = this.performPost("$rootUrl/entries/search?sort=name&name.dir=desc", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .returns()

        assertThat(pagedResult).isNotNull()
        assertThat(pagedResult.content).isNotNull()
        val content = pagedResult.content
        assertThat(content).isNotEmpty()

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Visitors can use Search Api`() {
        prepareMocks()

        val filterRequest = FilterRequest(
            searchableType = SearchableType.CODE_PROJECT
        )
        val pagedResult: RestResponsePage<SearchResultDto> = this.performPost("$rootUrl/entries/search", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .returns()

        assertThat(pagedResult).isNotNull()
        assertThat(pagedResult.content).isNotNull()
        assertThat(pagedResult.content).hasSize(3)
    }

    private fun prepareMocks(): List<SearchableTag> {
        val tag1 = marketplaceTagRepository.save(SearchableTag(UUID.randomUUID(), "tag1"))
        val tag2 = marketplaceTagRepository.save(SearchableTag(UUID.randomUUID(), "tag2"))
        val tag3 = marketplaceTagRepository.save(SearchableTag(UUID.randomUUID(), "tag3"))

        val author = personRepository.save(EntityMocks.author)

        val dataProcessor1 = EntityMocks.dataOperation(slug = "op1", author = author).copy(inputDataType = DataType.IMAGE)
        val dataProcessor2 = EntityMocks.dataOperation(slug = "op2", author = author).copy(inputDataType = DataType.IMAGE)

        val project1 = EntityMocks.codeProject(slug = "entry1", name = "AA Project")
            .copy(dataProcessor = dataProcessor1,
                inputDataTypes = setOf(DataType.IMAGE, DataType.TABULAR),
                outputDataTypes = setOf(DataType.MODEL, DataType.TIME_SERIES),
                tags = setOf(tag1, tag2)
            )
        val project2 = EntityMocks.codeProject(slug = "entry2", name = "BB Project")
            .copy(dataProcessor = dataProcessor2,
                inputDataTypes = setOf(DataType.IMAGE, DataType.TABULAR),
                outputDataTypes = setOf(DataType.MODEL, DataType.TIME_SERIES),
                tags = setOf(tag1, tag2))

        val project3 = EntityMocks.codeProject(slug = "entry2", name = "ZZ Project")
            .copy<CodeProject>(inputDataTypes = setOf(DataType.IMAGE, DataType.TABULAR),
                outputDataTypes = setOf(DataType.MODEL, DataType.TIME_SERIES),
                tags = setOf(tag1, tag2))


        codeProjectRepository.saveAll(listOf(project1, project2, project3))
        dataProcessorRepository.saveAll(listOf(dataProcessor1, dataProcessor2))

        marketplaceService.prepareEntry(project1, EntityMocks.author)
        marketplaceService.prepareEntry(project2, EntityMocks.author)

        return listOf(tag1, tag2, tag3)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all public SearchableTags`() {
        val searchableTag1 = EntityMocks.searchableTag(name = "TAG1")
        val searchableTag2 = EntityMocks.searchableTag(name = "TAG2")
        val searchableTag3 = EntityMocks.searchableTag(name = "TAG3")

        personRepository.saveAll(listOf(EntityMocks.author))
        marketplaceTagRepository.saveAll(listOf(searchableTag1, searchableTag2, searchableTag3))

        val returnedResult = this.performGet("$rootUrl/tags", account)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-tags-retrieve-all", responseFields(searchableTags("[].")))
            .returnsList(SearchableTagDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Visitor can retrieve all public MarketplaceEntries`() {
        val dataProject1 = EntityMocks.dataProject(slug = "slug1")
        val dataProject2 = EntityMocks.dataProject(slug = "slug2")
        val dataProject3 = EntityMocks.dataProject(slug = "slug3")

        personRepository.saveAll(listOf(EntityMocks.author))
        dataProjectRepository.saveAll(listOf(dataProject1, dataProject2, dataProject3))

        val returnedResult = this.performGet("$rootUrl/entries")
            .checkStatus(HttpStatus.OK)
            .returnsList(ProjectDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Visitor can retrieve MarketplaceEntries per Slug`() {
        val dataProject1 = EntityMocks.dataProject(slug = "slug1")

        personRepository.saveAll(listOf(EntityMocks.author))
        dataProjectRepository.saveAll(listOf(dataProject1))

        marketplaceService.prepareEntry(dataProject1, EntityMocks.author)

        val returnedResult = this.performGet("$rootUrl/entries/${dataProject1.globalSlug}")
            .checkStatus(HttpStatus.OK)
            .returns(ProjectDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Visitor can retrieve all public SearchableTags`() {
        val searchableTag1 = EntityMocks.searchableTag(name = "TAG1")
        val searchableTag2 = EntityMocks.searchableTag(name = "TAG2")
        val searchableTag3 = EntityMocks.searchableTag(name = "TAG3")

        personRepository.saveAll(listOf(EntityMocks.author))
        marketplaceTagRepository.saveAll(listOf(searchableTag1, searchableTag2, searchableTag3))

        val returnedResult = this.performGet("$rootUrl/tags")
            .checkStatus(HttpStatus.OK)
            .returnsList(SearchableTagDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    internal fun searchResultFields(prefix: String = ""): List<FieldDescriptor> {
        return projectResponseFields(prefix + "content[].project.").apply {
            this.add(fieldWithPath(prefix + "content[].probability").type(JsonFieldType.NUMBER).description("DataProcessor"))
            this.addAll(pageable())
        }
    }

    internal fun filterRequestFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "searchable_type").type(JsonFieldType.STRING).optional().description("Searchable Type, can be CODE_PROJECT, DATA_PROJECT, ALGORITHM, OPERATION or VISUALISATION"),
            fieldWithPath(prefix + "input_data_types").type(JsonFieldType.ARRAY).optional().description("List of DataTypes for input, must match any"),
            fieldWithPath(prefix + "output_data_types").optional().type(JsonFieldType.ARRAY).optional().description("List of DataTypes for output, must match any"),
            fieldWithPath(prefix + "query").type(JsonFieldType.STRING).optional().description("Query for text search relevance"),
            fieldWithPath(prefix + "query_and").type(JsonFieldType.BOOLEAN).optional().description("Query can be AND or OR, default to AND"),
            fieldWithPath(prefix + "tags").type(JsonFieldType.ARRAY).optional().description("List of Tags, must match any"),
            fieldWithPath(prefix + "min_stars").type(JsonFieldType.NUMBER).optional().description("Minimum amount of stars"),
            fieldWithPath(prefix + "max_stars").type(JsonFieldType.NUMBER).optional().description("Maximum amount of stars")
        )
    }

//    internal fun projectResponseFields(prefix: String = ""): MutableList<FieldDescriptor> {
//        return projectResponseFields(prefix).apply {
//            this.add(fieldWithPath(prefix + "data_processor").optional().type(JsonFieldType.OBJECT).description("DataProcessor"))
//            this.addAll(dataProcessorFields(prefix + "data_processor."))
//            this.addAll(searchableTags(prefix + "tags[]."))
//        }
//    }

}
