package com.mlreef.rest.integration

import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.api.AbstractRestApiTest
import com.mlreef.rest.api.TestTags
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GroupAccessLevel
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.testcommons.TestGitlabContainer
import com.mlreef.rest.testcommons.TestPostgresContainer
import com.mlreef.rest.testcommons.TestRedisContainer
import com.ninjasquad.springmockk.SpykBean
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Tags
import org.junit.jupiter.api.extension.ExtendWith
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.restdocs.RestDocumentationContextProvider
import org.springframework.restdocs.RestDocumentationExtension
import org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration
import org.springframework.restdocs.operation.preprocess.Preprocessors
import org.springframework.restdocs.operation.preprocess.Preprocessors.removeHeaders
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.setup.DefaultMockMvcBuilder
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import java.util.regex.Pattern

@TestPropertySource("classpath:application.yml")
@ExtendWith(value = [RestDocumentationExtension::class, SpringExtension::class])
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles(ApplicationProfiles.TEST)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@ContextConfiguration(initializers = [
    TestRedisContainer.Initializer::class,
    TestPostgresContainer.Initializer::class,
    TestGitlabContainer.Initializer::class])
@Tags(value = [Tag(TestTags.SLOW), Tag(TestTags.INTEGRATION)])
abstract class IntegrationRestApiTest : AbstractRestApiTest() {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)

        lateinit var mockedGitlabUser1: GitlabUser
        lateinit var mockedGitlabUser2: GitlabUser

        @AfterAll
        @JvmStatic
        fun tearDownGlobal() {
            val usersNamesLine = GitlabHelper.allCreatedUsersNames.joinToString(separator = System.lineSeparator(), prefix = "${System.lineSeparator()}USERS:${System.lineSeparator()}")
            val projectsNamesLine = GitlabHelper.allCreatedProjectsNames.joinToString(separator = System.lineSeparator(), prefix = "${System.lineSeparator()}PROJECTS:${System.lineSeparator()}")
            log.info(usersNamesLine)
            log.info(projectsNamesLine)
        }
    }

    @SpykBean
    protected lateinit var restClient: GitlabRestClient

    @Autowired
    private lateinit var builder: RestTemplateBuilder

    @BeforeEach
    fun setUp(
        webApplicationContext: WebApplicationContext,
        restDocumentation: RestDocumentationContextProvider
    ) {
        val censoredSecretHash = testPrivateUserTokenMock1.substring(0, 5) + "**********"
        this.mockMvc = MockMvcBuilders
            .webAppContextSetup(webApplicationContext)
            .apply<DefaultMockMvcBuilder>(springSecurity())
            .apply<DefaultMockMvcBuilder>(documentationConfiguration(restDocumentation)
                .operationPreprocessors()
                .withRequestDefaults(
                    removeHeaders(HEADER_PRIVATE_TOKEN),
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock1), censoredSecretHash))
                .withResponseDefaults(
                    Preprocessors.prettyPrint(),
                    Preprocessors.replacePattern(Pattern.compile(testPrivateUserTokenMock1), censoredSecretHash))
            )
            .build()
    }

    protected fun addRealUserToProject(projectId: Long, userId: Long, accessLevel: GroupAccessLevel? = null) {
        restClient.adminAddUserToProject(projectId = projectId, userId = userId, accessLevel = accessLevel
            ?: GroupAccessLevel.DEVELOPER)
    }
}



