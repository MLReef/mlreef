@file:Suppress("UsePropertyAccessSyntax")

package com.mlreef.rest.api

import com.mlreef.rest.api.v1.SearchByTextRequest
import com.mlreef.rest.api.v1.SearchRequest
import com.mlreef.rest.api.v1.dto.ProjectDto
import com.mlreef.rest.api.v1.dto.SearchResultDto
import com.mlreef.rest.api.v1.dto.SearchableTagDto
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.SearchableType
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.testcommons.RestResponsePage
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.*
import org.springframework.restdocs.request.ParameterDescriptor
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.requestParameters
import org.springframework.test.annotation.Rollback
import java.util.concurrent.CopyOnWriteArrayList
import javax.transaction.Transactional
import kotlin.random.Random

class MarketplaceApiTest : AbstractRestApiTest() {

    val rootUrl = "/api/v1/explore"

    @Autowired
    private lateinit var marketplaceService: MarketplaceService

    @BeforeEach
    fun setUp() {

    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with filter`() {
        val tags = prepareMocks2()

        val filterRequest = SearchRequest(
            searchableType = SearchableType.CODE_PROJECT,
            inputDataTypes = setOf("IMAGE"),
            outputDataTypes = setOf(),
            tags = listOf(tags[0].name),
            minStars = 0,
            maxStars = 100
        )

        val pagedResult: RestResponsePage<ProjectDto> = this.performPost("$rootUrl/entries/search", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .expectOk()
            .document(
                "marketplace-search",
                requestParameters(
                    *pageableResourceParameters(),
                    *searchProjectsRequestParams(),
                ),
                requestFields(searchProjectsRequestFields()),
                responseFields(
                    wrapToPage(
                        projectResponseFields()
                    )
                )
            )
            .returns()

        assertThat(pagedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all public MarketplaceEntries`() {
        val dataProject1 = createDataProject(slug = "slug1")
        val dataProject2 = createDataProject(slug = "slug2")
        val dataProject3 = createDataProject(slug = "slug3")

        this.mockUserAuthentication(
            listOf(dataProject1.id, dataProject2.id, dataProject3.id),
            mainAccount,
            AccessLevel.GUEST
        )

        val returnedResult: RestResponsePage<ProjectDto> = this.performGet("$rootUrl/entries", mainToken)
            .checkStatus(HttpStatus.OK)
            .document(
                "marketplace-entries-retrieve-all",
                responseFields(
                    wrapToPage(
                        projectResponseFields()
                    )
                )
            )
            .returns()

        assertThat(returnedResult.content.size).isEqualTo(3 + 4) //Plus 4 - predefined projects
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve MarketplaceEntries per Slug`() {
        val dataProject1 = createDataProject(slug = "slug1")

        marketplaceService.prepareEntry(dataProject1, mainPerson)
        this.mockUserAuthentication(listOf(dataProject1.id), mainAccount, AccessLevel.GUEST)

        val returnedResult = this.performGet("$rootUrl/entries/${dataProject1.globalSlug}", mainToken)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-entries-retrieve-one", responseFields(projectResponseFields("")))
            .returns(ProjectDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api by text`() {
        prepareMocks2()

        val filterRequest = SearchByTextRequest(
            query = "project A"
        )
        val pagedResult: List<SearchResultDto> = this.performPost("$rootUrl/entries/search/text", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-explore-search")
            .returns()

        assertThat(pagedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type CODE_PROJECT`() {
        prepareMocks2()
        val filterRequest = SearchRequest(searchableType = SearchableType.CODE_PROJECT)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(4 + 3) //Plus 3 predefined code project
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type DATA_PROJECT`() {
        prepareMocks2()
        val filterRequest = SearchRequest(searchableType = SearchableType.DATA_PROJECT)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(1 + 1) //Plus 1 predefined data project
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type OPERATION`() {
        prepareMocks2()
        val filterRequest = SearchRequest(searchableType = SearchableType.OPERATION)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(2 + 1) //Plus 1 predefined operation
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type VISUALIZATION`() {
        prepareMocks2()
        val filterRequest = SearchRequest(searchableType = SearchableType.VISUALIZATION)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(1 + 1)  //Plus 1 predefined visualization
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type ALGORITHM`() {
        prepareMocks2()
        val filterRequest = SearchRequest(searchableType = SearchableType.ALGORITHM)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(1 + 1) //Plus 1 predefined algorithm
    }

    //
    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type CODE_PROJECT and inputTypeFilter`() {
        prepareMocks2()
        val filterRequest =
            SearchRequest(searchableType = SearchableType.CODE_PROJECT, inputDataTypes = setOf("IMAGE"))
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type DATA_PROJECT and inputTypeFilter`() {
        prepareMocks2()
        val filterRequest =
            SearchRequest(searchableType = SearchableType.DATA_PROJECT, inputDataTypes = setOf("IMAGE"))
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(1)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type VISUALIZATION and inputTypeFilter - ANONYMOUS`() {
        prepareMocks2()
        val filterRequest =
            SearchRequest(searchableType = SearchableType.VISUALIZATION, inputDataTypes = setOf("IMAGE"))
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(0)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with type VISUALIZATION and inputTypeFilter - LOGGED USER`() {
        prepareMocks2()

        mockUserAuthentication(forAccount = mainAccount)

        val filterRequest =
            SearchRequest(searchableType = SearchableType.VISUALIZATION, inputDataTypes = setOf("IMAGE"))
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", "token-123", filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(0)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with paging parameters`() {
        prepareMocks2()

        val filterRequest = SearchRequest(searchableType = SearchableType.CODE_PROJECT)

        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search?page=2&size=10&sort=name&name.dir=desc", null, filterRequest)
                .checkStatus(HttpStatus.OK)
                .document(
                    "marketplace-explore-search-params",
                    requestParameters(
                        parameterWithName("page").description("The page to retrieve"),
                        parameterWithName("size").description("Number of results to retrieve"),
                        parameterWithName("sort").description("Sort per a named field"),
                        parameterWithName("name.dir").description("Example, sort \$field.dir with direction 'desc' or 'asc'")
                    )
                )
                .returns()

        assertThat(pagedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with fts query and sort`() {
        prepareMocks2()

        val filterRequest = SearchRequest(
            searchableType = SearchableType.CODE_PROJECT,
//            query = "project A"
        )

        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search?sort=name&name.dir=desc", null, filterRequest)
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
        prepareMocks2()

        val filterRequest = SearchRequest(
            searchableType = SearchableType.CODE_PROJECT
        )
        val pagedResult: RestResponsePage<ProjectDto> = this.performPost("$rootUrl/entries/search", null, filterRequest)
            .checkStatus(HttpStatus.OK)
            .returns()

        assertThat(pagedResult).isNotNull()
        assertThat(pagedResult.content).isNotNull()
        assertThat(pagedResult.content).hasSize(4 + 3) //Plus 3 predefined codeprojects
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with min-max stars`() {
        prepareMocks2()
        val filterRequest = SearchRequest(minStars = 5, maxStars = 7)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with min stars`() {
        prepareMocks2()
        val filterRequest = SearchRequest(minStars = 6)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest).expectOk().returns()
        assertThat(pagedResult.content.size).isEqualTo(2)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can use Search Api with max stars`() {
        prepareMocks2()
        val filterRequest = SearchRequest(maxStars = 7)
        val pagedResult: RestResponsePage<ProjectDto> =
            this.performPost("$rootUrl/entries/search", null, filterRequest)
                .expectOk()
                .returns()
        assertThat(pagedResult.content.size).isEqualTo(4 + 3 + 1) //Plus 3 predefined code projects and 1 data project
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve all public SearchableTags`() {
        createTag("TAG1")
        createTag("TAG2")
        createTag("TAG3")

        mockUserAuthentication(forAccount = mainAccount)

        val returnedResult = this.performGet("$rootUrl/tags", token)
            .checkStatus(HttpStatus.OK)
            .document("marketplace-tags-retrieve-all", responseFields(searchableTags("[].")))
            .returnsList(SearchableTagDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    fun `Visitor can retrieve all public MarketplaceEntries`() {
        createDataProject(slug = "slug1")
        createDataProject(slug = "slug2")
        createDataProject(slug = "slug3")

        val returnedResult: RestResponsePage<ProjectDto> = this.performGet("$rootUrl/entries")
            .checkStatus(HttpStatus.OK)
            .returns()

        assertThat(returnedResult.content.size).isEqualTo(3 + 4) //Plus 4 predefined projects
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Visitor can retrieve MarketplaceEntries per Slug`() {
        val dataProject1 = createDataProject(slug = "slug1")

        marketplaceService.prepareEntry(dataProject1, mainPerson3)

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
        createTag("TAG1")
        createTag("TAG2")
        createTag("TAG3")

        val returnedResult = this.performGet("$rootUrl/tags")
            .checkStatus(HttpStatus.OK)
            .returnsList(SearchableTagDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Can retrieve recent projects`() {
        val dataProject1 = createDataProject(slug = "slug1")
        val dataProject2 = createDataProject(slug = "slug2")
        val dataProject3 = createDataProject(slug = "slug3")

        val codeProject1 = createDataProject(slug = "slug11")
        val codeProject2 = createDataProject(slug = "slug12")
        val codeProject3 = createDataProject(slug = "slug13")

        createRecentProject(dataProject1, mainPerson)
        createRecentProject(dataProject2, mainPerson)
        createRecentProject(dataProject3, mainPerson)
        createRecentProject(codeProject1, mainPerson)
        createRecentProject(codeProject2, mainPerson)
        createRecentProject(codeProject3, mainPerson)

        this.mockUserAuthentication(
            listOf(dataProject1.id, dataProject2.id, dataProject3.id),
            mainAccount,
            AccessLevel.GUEST
        )

        val returnedResult: RestResponsePage<ProjectDto> = this.performGet("$rootUrl/recent", mainToken)
            .checkStatus(HttpStatus.OK)
            .document(
                "marketplace-recent-projects",
                requestParameters(
                    parameterWithName("page").optional().description("The page to retrieve"),
                    parameterWithName("size").optional().description("Number of results to retrieve"),
                    parameterWithName("sort").optional().description("Sort per a named field"),
                    parameterWithName("type").optional().description("Filter by project type: code or data")
                ),
                responseFields(
                    wrapToPage(
                        projectResponseFields()
                    )
                )
            )
            .returns()

        assertThat(returnedResult.content.size).isEqualTo(6)
    }

    @Transactional
    @Rollback
    @Test
    @Tag(TestTags.RESTDOC)
    fun `Test pagination for the search - Sync mode`() {
        val codeProjectsCount = Random.nextInt(51, 59)
        val dataProjectsCount = Random.nextInt(52, 55)
        val totalProjectsCount = codeProjectsCount + dataProjectsCount
        val pageSize = Random.nextInt(10, 19)
        val pageCount = (totalProjectsCount / pageSize) + (if (totalProjectsCount % pageSize != 0) 1 else 0)
        val lastPageIsComplete = (totalProjectsCount % pageSize == 0)

        val codeProjectsList = (1..codeProjectsCount).map {
            createCodeProject(
                slug = "code-project-sync-pagination-$it",
                name = "Code Project pagination sync test $it",
                processorType = listOf(operationProcessorType, algorithmProcessorType, visualizationProcessorType)[Random.nextInt(0, 3)],
                inputTypes = listOf(imageDataType, tabularDataType),
                outputTypes = listOf(modelDataType, timeSeriesDataType),
                ownerId = mainPerson2.id,
            )
        }

        val dataProjectsList = (1..dataProjectsCount).map {
            createDataProject(
                slug = "data-project-sync-pagination-$it",
                name = "Data Project pagination sync test $it",
                inputTypes = listOf(imageDataType, tabularDataType),
                ownerId = mainPerson2.id,
            )
        }

        val filterRequest = SearchRequest(
            ownerIdsOr = listOf(mainPerson2.id),
        )

        val totalResults = mutableListOf<ProjectDto>()
        val url = "$rootUrl/entries/search"

        (0..pageCount - 1).forEach {
            val pagedResult: RestResponsePage<ProjectDto> = this.performPost("$url?page=$it&size=$pageSize", null, filterRequest)
                .checkStatus(HttpStatus.OK)
                .expectOk()
                .returns()

            if (it != pageCount - 1 || lastPageIsComplete) {
                assertThat(pagedResult.content.size).isEqualTo(pageSize)
            } else {
                assertThat(pagedResult.content.size).isEqualTo(totalProjectsCount % pageSize)
            }

            totalResults.addAll(pagedResult.content)
        }

        assertThat(totalResults.size).isEqualTo(totalProjectsCount)
        assertThat(totalResults.map { it.name }).containsOnlyOnceElementsOf((codeProjectsList + dataProjectsList).map { it.name })
    }

    @Test
//    @Disabled("Working but need to be skipped")
    @Tag(TestTags.RESTDOC)
    fun `Test pagination for the search - Async mode`() {
        val codeProjectsCount = Random.nextInt(51, 59)
        val dataProjectsCount = Random.nextInt(52, 55)
        val totalProjectsCount = codeProjectsCount + dataProjectsCount
        val pageSize = Random.nextInt(10, 19)
        val pageCount = (totalProjectsCount / pageSize) + (if (totalProjectsCount % pageSize != 0) 1 else 0)
        val lastPageIsComplete = (totalProjectsCount % pageSize == 0)

        val codeProjectsList = (1..codeProjectsCount).map {
            createCodeProject(
                slug = "code-project-sync-pagination-$it",
                name = "Code Project pagination sync test $it",
                processorType = listOf(operationProcessorType, algorithmProcessorType, visualizationProcessorType)[Random.nextInt(0, 3)],
                inputTypes = listOf(imageDataType, tabularDataType),
                outputTypes = listOf(modelDataType, timeSeriesDataType),
                ownerId = mainPerson2.id,
            )
        }

        val dataProjectsList = (1..dataProjectsCount).map {
            createDataProject(
                slug = "data-project-sync-pagination-$it",
                name = "Data Project pagination sync test $it",
                inputTypes = listOf(imageDataType, tabularDataType),
                ownerId = mainPerson2.id,
            )
        }

        val filterRequest = SearchRequest(
            ownerIdsOr = listOf(mainPerson2.id),
        )

        val totalResults = CopyOnWriteArrayList<ProjectDto>()
        val url = "$rootUrl/entries/search"

        val jobs = (0..pageCount - 1).map {
            GlobalScope.launch {
                val pagedResult: RestResponsePage<ProjectDto> = performPost("$url?page=$it&size=$pageSize", null, filterRequest)
                    .checkStatus(HttpStatus.OK)
                    .expectOk()
                    .returns()

                println("Page received: ${pagedResult.number} last - ${pagedResult.isLast}")

                if (it != pageCount - 1 || lastPageIsComplete) {
                    assertThat(pagedResult.content.size).isEqualTo(pageSize)
                } else {
                    assertThat(pagedResult.content.size).isEqualTo(totalProjectsCount % pageSize)
                }

                totalResults.addAll(pagedResult.content)
            }
        }

        while (jobs.any { it.isActive }) Thread.sleep(1000)

        assertThat(totalResults.size).isEqualTo(totalProjectsCount)
        assertThat(totalResults.map { it.name }).containsOnlyOnceElementsOf((codeProjectsList + dataProjectsList).map { it.name })

        //Cleanup - as we work in async mode without transactional and rollback we need to delete just created projects
        dataProjectRepository.deleteAll(dataProjectsList)
        codeProjectRepository.deleteAll(codeProjectsList)
    }

    internal fun searchResultFields(prefix: String = ""): List<FieldDescriptor> {
        return projectResponseFields(prefix + "content[].project.").apply {
            this.add(
                fieldWithPath(prefix + "content[].probability").type(JsonFieldType.NUMBER).description("DataProcessor")
            )
            this.addAll(pageable())
        }
    }

    internal fun filterRequestFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "searchable_type").type(JsonFieldType.STRING).optional()
                .description("Searchable Type, can be CODE_PROJECT, DATA_PROJECT, ALGORITHM, OPERATION or VISUALIZATION"),
            fieldWithPath(prefix + "input_data_types").type(JsonFieldType.ARRAY).optional()
                .description("List of DataTypes for input, must match any"),
            fieldWithPath(prefix + "output_data_types").optional().type(JsonFieldType.ARRAY).optional()
                .description("List of DataTypes for output, must match any"),
            fieldWithPath(prefix + "query").type(JsonFieldType.STRING).optional()
                .description("Query for text search relevance"),
            fieldWithPath(prefix + "query_and").type(JsonFieldType.BOOLEAN).optional()
                .description("Query can be AND or OR, default to AND"),
            fieldWithPath(prefix + "tags").type(JsonFieldType.ARRAY).optional()
                .description("List of Tags, must match any"),
            fieldWithPath(prefix + "min_stars").type(JsonFieldType.NUMBER).optional()
                .description("Minimum amount of stars"),
            fieldWithPath(prefix + "max_stars").type(JsonFieldType.NUMBER).optional()
                .description("Maximum amount of stars")
        )
    }

    internal fun searchProjectsRequestFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "searchable_type").type(JsonFieldType.STRING).optional()
                .description("Searchable Type, can be CODE_PROJECT, DATA_PROJECT, ALGORITHM, OPERATION or VISUALIZATION"),
            fieldWithPath(prefix + "project_type").type(JsonFieldType.STRING).optional()
                .description("Project Type, can be CODE_PROJECT, DATA_PROJECT"),
            fieldWithPath(prefix + "processor_type").type(JsonFieldType.STRING).optional()
                .description("Processor Type, can be ALGORITHM, OPERATION or VISUALIZATION"),
            fieldWithPath(prefix + "input_data_types").type(JsonFieldType.ARRAY).optional()
                .description("List of DataTypes for input, must match all (AND connection between items)"),
            fieldWithPath(prefix + "output_data_types").optional().type(JsonFieldType.ARRAY).optional()
                .description("List of DataTypes for output, must match all (AND connection between items)"),
            fieldWithPath(prefix + "input_data_types_or").type(JsonFieldType.ARRAY).optional()
                .description("List of DataTypes for input, must match any (OR connection between items)"),
            fieldWithPath(prefix + "output_data_types_or").optional().type(JsonFieldType.ARRAY).optional()
                .description("List of DataTypes for output, must match any (OR connection between items)"),
            fieldWithPath(prefix + "tags").type(JsonFieldType.ARRAY).optional()
                .description("List of Tags, must match all (AND connection between items)"),
            fieldWithPath(prefix + "tags_or").type(JsonFieldType.ARRAY).optional()
                .description("List of Tags, must match any (OR connection between items)"),
            fieldWithPath(prefix + "min_stars").type(JsonFieldType.NUMBER).optional()
                .description("Minimum amount of stars"),
            fieldWithPath(prefix + "max_stars").type(JsonFieldType.NUMBER).optional()
                .description("Maximum amount of stars"),
            fieldWithPath(prefix + "starred_by_me").type(JsonFieldType.BOOLEAN).optional()
                .description("Starred by user"),
            fieldWithPath(prefix + "min_forks_count").type(JsonFieldType.NUMBER).optional()
                .description("Minimum forks count"),
            fieldWithPath(prefix + "max_forks_count").type(JsonFieldType.NUMBER).optional()
                .description("Maximum forks count"),
            fieldWithPath(prefix + "visibility").type(JsonFieldType.STRING).optional()
                .description("Project visibility, can be PRIVATE or PUBLIC (in case of PRIVATE only relevant projects will be returned)"),
            fieldWithPath(prefix + "model_type_or").type(JsonFieldType.ARRAY).optional()
                .description("Model type of published project, must match any (OR connection between items)"),
            fieldWithPath(prefix + "ml_category_or").type(JsonFieldType.ARRAY).optional()
                .description("ML category of published project, must match any (OR connection between items)"),
            fieldWithPath(prefix + "owner_ids_or").type(JsonFieldType.ARRAY).optional()
                .description("Owner ids list, must match any (OR connection between items)"),
            fieldWithPath(prefix + "global_slug").type(JsonFieldType.STRING).optional()
                .description("Global slug of project, any part of requested string must match (LIKE %TEXT% request)"),
            fieldWithPath(prefix + "global_slug_exact").type(JsonFieldType.STRING).optional()
                .description("Global slug of project, complete part of requested string must match (EQUAL TEXT request)"),
            fieldWithPath(prefix + "slug").type(JsonFieldType.STRING).optional()
                .description("Slug of project, any part of requested string must match (LIKE %TEXT% request)"),
            fieldWithPath(prefix + "slug_exact").type(JsonFieldType.STRING).optional()
                .description("Slug of project, complete part of requested string must match (EQUAL TEXT request)"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).optional()
                .description("Name of project, any part of requested string must match (LIKE %TEXT% request)"),
            fieldWithPath(prefix + "name_exact").type(JsonFieldType.STRING).optional()
                .description("Name of project, complete part of requested string must match (EQUAL TEXT request)"),
            fieldWithPath(prefix + "published").type(JsonFieldType.BOOLEAN).optional()
                .description("Whether project published or not"),
            fieldWithPath(prefix + "namespace").type(JsonFieldType.STRING).optional()
                .description("Namespace of project, any part of requested string must match (LIKE %TEXT% request)"),
            fieldWithPath(prefix + "namespace_exact").type(JsonFieldType.STRING).optional()
                .description("Namespace of project, complete part of requested string must match (EQUAL TEXT request)"),
            fieldWithPath(prefix + "own").type(JsonFieldType.BOOLEAN).optional()
                .description("Filter by own project"),
            fieldWithPath(prefix + "participate").type(JsonFieldType.BOOLEAN).optional()
                .description("Filter by participation in project"),
        )
    }

    internal fun searchProjectsRequestParams(): Array<ParameterDescriptor> {
        return searchProjectsRequestFields().map {
            val param = parameterWithName(it.path).description(it.description)
            if (it.isOptional) param.optional() else param
        }.toTypedArray()
    }

    private fun prepareMocks2(): List<SearchableTag> {
        val tag1 = createTag("tag1")
        val tag2 = createTag("tag2")
        val tag3 = createTag("tag3")

        val persons = (0..10).map {
            createPerson(name = "person$it", slug = "person-$it")
        }

        val project1 = createCodeProject(
            slug = "entry1",
            name = "AA Project",
            processorType = operationProcessorType,
            inputTypes = listOf(imageDataType, tabularDataType),
            outputTypes = listOf(modelDataType, timeSeriesDataType),
            tags = mutableSetOf(tag1, tag2),
            stars = listOf(persons[1], persons[2], persons[3])
        )

        val project2 = createCodeProject(
            slug = "entry2",
            name = "BB Project",
            processorType = operationProcessorType,
            inputTypes = listOf(imageDataType, tabularDataType),
            outputTypes = listOf(modelDataType, timeSeriesDataType),
            tags = mutableSetOf(tag1, tag2),
            stars = listOf(persons[1], persons[2], persons[3], persons[4], persons[5])
        )

        val project3 = createCodeProject(
            slug = "entry3",
            name = "YY Project",
            processorType = algorithmProcessorType,
            inputTypes = listOf(timeSeriesDataType, tabularDataType),
            outputTypes = listOf(modelDataType, timeSeriesDataType),
            tags = mutableSetOf(tag1, tag2),
            stars = listOf(persons[1], persons[2], persons[3], persons[4], persons[5], persons[6], persons[7])
        )

        val project4 = createCodeProject(
            slug = "entry4",
            name = "ZZ Project",
            processorType = visualizationProcessorType,
            inputTypes = listOf(timeSeriesDataType, tabularDataType),
            outputTypes = listOf(modelDataType, timeSeriesDataType),
            tags = mutableSetOf(tag1, tag2),
            stars = (1..10).map { persons[it] }
        )

        val project5 = createDataProject(
            slug = "entry5",
            inputTypes = listOf(imageDataType, tabularDataType),
            tags = mutableSetOf(tag1, tag2)
        )

        val processor1 = createProcessor(project1, name = "operation1", slug = "op1", author = mainPerson3)
        val processor2 = createProcessor(project2, name = "operation2", slug = "op2", author = mainPerson3)
        val processor3 = createProcessor(project3, name = "model1", author = mainPerson3)
        val processor4 = createProcessor(project4, name = "visualization1", author = mainPerson3)

        marketplaceService.prepareEntry(project1, mainPerson3)
        marketplaceService.prepareEntry(project2, mainPerson3)

        return listOf(tag1, tag2, tag3)
    }
}
