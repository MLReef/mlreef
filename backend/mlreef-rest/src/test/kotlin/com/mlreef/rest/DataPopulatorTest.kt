package com.mlreef.rest

import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.data_processors.InitialDataLoader
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.integration.AbstractIntegrationTest
import com.mlreef.rest.utils.RandomUtils
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.annotation.Rollback
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional

/**
 * Should actually be an integrationtest against a real Gitlab instance
 */
class DataPopulatorTest : AbstractIntegrationTest() {

    private lateinit var author: Person
    private lateinit var dataPopulator: DataPopulator
    private lateinit var initialDataLoader: InitialDataLoader

    @Autowired
    private lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var experimentRepository: ExperimentRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var pipelineInstanceRepository: PipelineInstanceRepository

    @Autowired
    private lateinit var pipelineConfigRepository: PipelineConfigRepository

    @Autowired
    private lateinit var dataProjectService: ProjectService<DataProject>

    @Autowired
    private lateinit var processorParameterRepository: ProcessorParameterRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository

    @Autowired
    private lateinit var processorInstanceRepository: DataProcessorInstanceRepository

    @Autowired
    private lateinit var parameterInstanceRepository: ParameterInstanceRepository

    @Autowired
    private lateinit var dataAlgorithmRepository: DataAlgorithmRepository

    @Autowired
    private lateinit var searchableTagRepository: SearchableTagRepository

    @Autowired
    private lateinit var marketplaceService: MarketplaceService

    @BeforeEach
    fun prepare() {
        initialDataLoader = InitialDataLoader()
        dataPopulator = DataPopulator(
            experimentRepository = experimentRepository,
            dataProjectRepository = dataProjectRepository,
            dataProcessorRepository = dataProcessorRepository,
            dataProjectService = dataProjectService,
            processorParameterRepository = processorParameterRepository,
            gitlabRestClient = restClient,
            personRepository = personRepository,
            accountTokenRepository = accountTokenRepository,
            accountRepository = accountRepository,
            codeProjectRepository = codeProjectRepository,
            dataAlgorithmRepository = dataAlgorithmRepository,
            marketplaceService = marketplaceService,
            searchableTagRepository = searchableTagRepository,
            processorVersionRepository = processorVersionRepository,
            initialDataLoader = initialDataLoader
        )

        searchableTagRepository.deleteAll()
        parameterInstanceRepository.deleteAll()
        experimentRepository.deleteAll()
        processorInstanceRepository.deleteAll()
        pipelineInstanceRepository.deleteAll()
        pipelineConfigRepository.deleteAll()
        processorParameterRepository.deleteAll()
        dataProjectRepository.deleteAll()
        dataProcessorRepository.deleteAll()
        codeProjectRepository.deleteAll()
        accountTokenRepository.deleteAll()
        accountRepository.deleteAll()
        personRepository.deleteAll()
        author = personRepository.save(Person(id = randomUUID(), slug = "user-demo" + RandomUtils.generateRandomUserName(20), name = RandomUtils.generateRandomUserName(20), gitlabId = RandomUtils.randomGitlabId()))
    }

    @Test
    @Transactional
    @Rollback
    fun `works on empty database`() {

        assertThat(accountTokenRepository.findAll().toList()).isEmpty()
        assertThat(accountRepository.findAll().toList()).isEmpty()
        dataPopulator.init()

        assertThat(accountTokenRepository.findAll().toList()).isNotEmpty
        assertThat(accountRepository.findAll().toList()).isNotEmpty
    }

    @Test
    fun `create user`() {
        assertThat(accountRepository.findAll().toList()).isEmpty()

        val result = dataPopulator.createUserAndTokenInGitlab()

        assertThat(result).isNotNull
        assertThat(accountRepository.findAll().toList()).isNotEmpty
    }

    @Test
    @Transactional
    @Rollback
    fun `create token`() {
        assertThat(accountTokenRepository.findAll().toList()).isEmpty()

        val accountId = UUID.fromString("aaaa0000-0002-0000-0000-aaaaaaaaaaaa")

        accountRepository.save(Account(
            id = accountId, email = "",
            username = "", passwordEncrypted = "", person = author
        ))

        val result = dataPopulator.createUserToken(
            GitlabUser(1, "test-user", "test-name", "email"))
        assertThat(result).isNotNull
        assertThat(accountTokenRepository.findAll().toList()).isNotEmpty
    }

    @Test
    @Transactional
    @Rollback
    fun `create DataProject`() {
        assertThat(dataProjectRepository.findAll().toList()).isEmpty()
        val createUserAndTokenInGitlab = dataPopulator.createUserAndTokenInGitlab()
        val createUserToken = dataPopulator.createUserToken(createUserAndTokenInGitlab)
        dataPopulator.createDataProject(userToken = createUserToken.token)
        assertThat(dataProjectRepository.findAll().toList()).isNotEmpty
    }

    @Test
    @Transactional
    @Rollback
    fun `Loading initial data succeeds`() {
        assertThat(accountTokenRepository.findAll().toList()).isEmpty()
        assertThat(accountRepository.findAll().toList()).isEmpty()

        val createUserAndTokenInGitlab = dataPopulator.createUserAndTokenInGitlab()
        val createUserToken = dataPopulator.createUserToken(createUserAndTokenInGitlab)
        val author = personRepository.save(Person(id = randomUUID(), slug = "user-demo", name = "Author1", gitlabId = 1))

        personRepository.save(author)
        dataPopulator.initialMLData(author, createUserToken.token)

        assertThat(accountTokenRepository.findAll().toList()).isNotEmpty
        assertThat(accountRepository.findAll().toList()).isNotEmpty
    }
}
