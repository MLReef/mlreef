package com.mlreef.rest.integration

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.api.TestTags
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.caches.repositories.PublicProjectsRepository
import com.mlreef.rest.testcommons.AbstractRestTest
import com.mlreef.rest.testcommons.TestGitlabContainer
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import com.ninjasquad.springmockk.MockkClear
import com.ninjasquad.springmockk.SpykBean
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Tags
import org.junit.jupiter.api.extension.ExtendWith
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext

@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.INTEGRATION_TEST)
@ContextConfiguration(initializers = [
    TestRedisContainer.Initializer::class,
    TestPostgresContainer.Initializer::class,
    TestGitlabContainer.Initializer::class])
@Tags(value = [Tag(TestTags.SLOW), Tag(TestTags.INTEGRATION)])
abstract class AbstractIntegrationTest : AbstractRestTest() {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    @SpykBean
    protected lateinit var restClient: GitlabRestClient

    @Autowired
    private lateinit var builder: RestTemplateBuilder

    @SpykBean(clear = MockkClear.BEFORE)
    protected lateinit var publicProjectRepository: PublicProjectsRepository

    @SpykBean
    protected lateinit var publicProjectsCacheService: PublicProjectsCacheService

    @Autowired
    protected lateinit var testsHelper: IntegrationTestsHelper

    @Autowired
    protected lateinit var accountTokenRepository: AccountTokenRepository

    @Autowired
    protected lateinit var personRepository: PersonRepository

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .build()
    }
}



