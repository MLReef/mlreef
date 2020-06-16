@file:Suppress("UsePropertyAccessSyntax")

package com.mlreef.rest.integration

import com.mlreef.rest.Account
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.MarketplaceEntryRepository
import com.mlreef.rest.Person
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.api.AccountSubjectPreparationTrait
import com.mlreef.rest.api.v1.dto.MarketplaceEntryDto
import com.mlreef.rest.api.v1.dto.SearchableTagDto
import com.mlreef.rest.testcommons.EntityMocks
import com.mlreef.rest.testcommons.RestResponsePage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

class MarketplaceIntegrationTest : AbstractIntegrationTest() {

    val rootUrl = "/api/v1/explore"
    private lateinit var account: Account
    private lateinit var account2: Account
    private lateinit var subject: Person
    private lateinit var subject2: Person

    @Autowired private lateinit var marketplaceEntryRepository: MarketplaceEntryRepository
    @Autowired private lateinit var dataProjectRepository: DataProjectRepository
    @Autowired private lateinit var marketplaceTagRepository: SearchableTagRepository
    @Autowired private lateinit var accountSubjectPreparationTrait: AccountSubjectPreparationTrait

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

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
    @Disabled
    @Test fun `Can retrieve all public MarketplaceEntries`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)
        val (dataProject1, _) = testsHelper.createRealDataProject(account, slug = "slug1")
        val (dataProject2, _) = testsHelper.createRealDataProject(account, slug = "slug2")
        val (dataProject3, _) = testsHelper.createRealDataProject(account, slug = "slug3")

        val marketplaceEntry1 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject1)
        val marketplaceEntry2 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject2)
        val marketplaceEntry3 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject3)

        marketplaceEntryRepository.saveAll(listOf(marketplaceEntry1, marketplaceEntry2, marketplaceEntry3))

        val returnedResult = this.performGet("$rootUrl/entries", account)
            .checkStatus(HttpStatus.OK)
            .returnsList(MarketplaceEntryDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Disabled
    @Test fun `Can retrieve MarketplaceEntries per Slug`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)
        val (dataProject1, _) = testsHelper.createRealDataProject(account, slug = "slug1")

        val marketplaceEntry1 = EntityMocks.marketplaceEntry(searchable = dataProject1)

        personRepository.saveAll(listOf(EntityMocks.author))
        dataProjectRepository.saveAll(listOf(dataProject1))
        marketplaceEntryRepository.saveAll(listOf(marketplaceEntry1))

        val returnedResult = this.performGet("$rootUrl/entries/${marketplaceEntry1.globalSlug}", account)
            .checkStatus(HttpStatus.OK)
            .returns(MarketplaceEntryDto::class.java)

        assertThat(returnedResult).isNotNull()
    }

    @Transactional
    @Rollback
    @Disabled
    @Test fun `Can retrieve all public SearchableTags`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)

        val searchableTag1 = EntityMocks.searchableTag(name = "TAG1")
        val searchableTag2 = EntityMocks.searchableTag(name = "TAG2")
        val searchableTag3 = EntityMocks.searchableTag(name = "TAG3")

        personRepository.saveAll(listOf(EntityMocks.author))
        marketplaceTagRepository.saveAll(listOf(searchableTag1, searchableTag2, searchableTag3))

        val returnedResult = this.performGet("$rootUrl/tags", account)
            .checkStatus(HttpStatus.OK)
            .returnsList(SearchableTagDto::class.java)

        assertThat(returnedResult.size).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test fun `Can retrieve all public MarketplaceEntries as Visitor`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)
        val (dataProject1, _) = testsHelper.createRealDataProject(account, slug = "slug1")
        val (dataProject2, _) = testsHelper.createRealDataProject(account, slug = "slug2")
        val (dataProject3, _) = testsHelper.createRealDataProject(account, slug = "slug3")

        val marketplaceEntry1 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject1)
        val marketplaceEntry2 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject2)
        val marketplaceEntry3 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject3)

        marketplaceEntryRepository.saveAll(listOf(marketplaceEntry1, marketplaceEntry2, marketplaceEntry3))

        val returnedResult: RestResponsePage<MarketplaceEntryDto> = this.performGet("$rootUrl/entries/public")
            .expectOk()
            .andDo { log.info(it.response.contentAsString) }
            .returns()

        assertThat(returnedResult.numberOfElements).isEqualTo(3)
    }

    @Transactional
    @Rollback
    @Test fun `Cannot retrieve users' MarketplaceEntries as Visitor`() {
        val (account, _, _) = testsHelper.createRealUser(index = -1)
        val (dataProject1, _) = testsHelper.createRealDataProject(account, slug = "slug1")
        val (dataProject2, _) = testsHelper.createRealDataProject(account, slug = "slug2")
        val (dataProject3, _) = testsHelper.createRealDataProject(account, slug = "slug3")

        val marketplaceEntry1 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject1)
        val marketplaceEntry2 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject2)
        val marketplaceEntry3 = EntityMocks.marketplaceEntry(owner = account.person, searchable = dataProject3)

        marketplaceEntryRepository.saveAll(listOf(marketplaceEntry1, marketplaceEntry2, marketplaceEntry3))

        this.performGet("$rootUrl/entries")
            .expectForbidden()
    }
}
