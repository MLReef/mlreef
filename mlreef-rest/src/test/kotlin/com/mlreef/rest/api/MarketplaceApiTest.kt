@file:Suppress("UsePropertyAccessSyntax")

package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.MarketplaceEntryRepository
import com.mlreef.rest.Person
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.api.v1.dto.MarketplaceEntryDto
import com.mlreef.rest.api.v1.dto.SearchableTagDto
import com.mlreef.rest.testcommons.EntityMocks
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.restdocs.payload.FieldDescriptor
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

class MarketplaceApiTest : RestApiTest() {

    val rootUrl = "/api/v1/explore"
    private lateinit var account: Account
    private lateinit var account2: Account
    private lateinit var subject: Person
    private lateinit var subject2: Person

    @Autowired private lateinit var marketplaceEntryRepository: MarketplaceEntryRepository
    @Autowired private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired private lateinit var marketplaceTagRepository: SearchableTagRepository
    @Autowired private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    @Autowired
    private lateinit var gitlabHelper: GitlabHelper

    @BeforeEach
    @AfterEach
    fun setUp() {
        marketplaceEntryRepository.deleteAll()
        marketplaceTagRepository.deleteAll()

        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()

        accountSubjectPreparationTrait.apply()

        account = accountSubjectPreparationTrait.account
        account2 = accountSubjectPreparationTrait.account2

        subject = accountSubjectPreparationTrait.subject
        subject2 = accountSubjectPreparationTrait.subject2
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all public MarketplaceEntries`() {
        val (account, _, _) = gitlabHelper.createRealUser(index = -1)
        val (dataProject1, _) = gitlabHelper.createRealDataProject(account, slug = "slug1")
        val (dataProject2, _) = gitlabHelper.createRealDataProject(account, slug = "slug2")
        val (dataProject3, _) = gitlabHelper.createRealDataProject(account, slug = "slug3")

        val marketplaceEntry1 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject1)
        val marketplaceEntry2 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject2)
        val marketplaceEntry3 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject3)

        marketplaceEntryRepository.saveAll(listOf(marketplaceEntry1, marketplaceEntry2, marketplaceEntry3))

        val returnedResult = this.performGet("$rootUrl/entries", account)
            .checkStatus(HttpStatus.OK)
            .document(
                "marketplace-entries-retrieve-all",
                responseFields(marketplaceEntriesResponseFields("[].")))
            .returnsList(MarketplaceEntryDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve MarketplaceEntries per Slug`() {
        val (account, _, _) = gitlabHelper.createRealUser(index = -1)
        val (dataProject1, _) = gitlabHelper.createRealDataProject(account, slug = "slug1")

        val marketplaceEntry1 = EntityMocks.marketplaceEntry(searchable = dataProject1)

        personRepository.saveAll(listOf(EntityMocks.author))
        dataProjectRepository.saveAll(listOf(dataProject1))
        marketplaceEntryRepository.saveAll(listOf(marketplaceEntry1))

        val returnedResult = this.performGet("$rootUrl/entries/${marketplaceEntry1.globalSlug}", account)
            .checkStatus(HttpStatus.OK)
            .document(
                "marketplace-entries-retrieve-one",
                responseFields(marketplaceEntriesResponseFields("")))
            .returns(MarketplaceEntryDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all public SearchableTags`() {
        val (account, _, _) = gitlabHelper.createRealUser(index=-1)

        val searchableTag1 = EntityMocks.searchableTag(name = "TAG1")
        val searchableTag2 = EntityMocks.searchableTag(name = "TAG2")
        val searchableTag3 = EntityMocks.searchableTag(name = "TAG3")

        personRepository.saveAll(listOf(EntityMocks.author))
        marketplaceTagRepository.saveAll(listOf(searchableTag1, searchableTag2, searchableTag3))

        val returnedResult = this.performGet("$rootUrl/tags", account)
            .checkStatus(HttpStatus.OK)
            .document(
                "marketplace-tags-retrieve-all",
                responseFields(searchableTags("[].")))
            .returnsList(SearchableTagDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    private fun marketplaceEntriesResponseFields(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).description("Generic MarketplaceEntry Id"),
            fieldWithPath(prefix + "global_slug").type(JsonFieldType.STRING).description("Global Slug must be unique for the whole platform"),
            fieldWithPath(prefix + "visibility_scope").type(JsonFieldType.STRING).description("Visibility scope"),
            fieldWithPath(prefix + "name").type(JsonFieldType.STRING).description("A Name which is unique per scope (owner's domain)"),
            fieldWithPath(prefix + "description").type(JsonFieldType.STRING).description("Text for description"),
            fieldWithPath(prefix + "tags").type(JsonFieldType.ARRAY).description("All Tags for this Entry"),
            fieldWithPath(prefix + "owner_id").type(JsonFieldType.STRING).description("UUID of Subject"),
            fieldWithPath(prefix + "owner_name").type(JsonFieldType.STRING).description("Name of Owner"),
            fieldWithPath(prefix + "stars_count").type(JsonFieldType.NUMBER).description("Number of Stars"),
            fieldWithPath(prefix + "input_data_types").type(JsonFieldType.ARRAY).description("List of DataTypes used for Input"),
            fieldWithPath(prefix + "output_data_types").type(JsonFieldType.ARRAY).description("List of DataTypes used for Output"),
            fieldWithPath(prefix + "searchable_id").type(JsonFieldType.STRING).description("UUID of connected Searchable Entity"),
            fieldWithPath(prefix + "searchable_type").type(JsonFieldType.STRING).description("Type of connected Searchable Entity")
        ).apply {
            searchableTags(prefix + "tags[].")
        }
    }

    internal fun searchableTags(prefix: String = ""): List<FieldDescriptor> {
        return listOf(
            fieldWithPath(prefix + "id").type(JsonFieldType.STRING).optional().description("Unique UUID"),
            fieldWithPath(prefix + "name").optional().type(JsonFieldType.STRING).optional().description("Name of Tag, unique, useful and readable"),
            fieldWithPath(prefix + "type").type(JsonFieldType.STRING).optional().description("Type or Family of this Tag"),
            fieldWithPath(prefix + "public").type(JsonFieldType.BOOLEAN).optional().description("Flag indicating whether this is public or not")
        )
    }
}
