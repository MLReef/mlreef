package com.mlreef.rest

import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
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

    private val userToken: String = "ysfd"
    private lateinit var author: Person
    private lateinit var dataPopulator: DataPopulator

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
//    @Mock private lateinit var restClient: GitlabRestClient

    private var ownerId: UUID = randomUUID()
    private var dataRepositoryId: UUID = randomUUID()

    @BeforeEach
    fun prepare() {
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
            processorVersionRepository = processorVersionRepository
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
        author = personRepository.save(Person(id = randomUUID(), slug = "user-demo", name = "Author1", gitlabId = RandomUtils.randomGitlabId()))
    }

    @Test
    @Transactional
    @Rollback
    fun `works on empty database`() {

        assertThat(accountTokenRepository.findAll().toList()).isEmpty()
        assertThat(accountRepository.findAll().toList()).isEmpty()
        dataPopulator.init()

        assertThat(accountTokenRepository.findAll().toList()).isNotEmpty()
        assertThat(accountRepository.findAll().toList()).isNotEmpty()
    }

    @Test
    fun `create user`() {
        assertThat(accountRepository.findAll().toList()).isEmpty()

        val result = dataPopulator.createUserAndTokenInGitlab()

        assertThat(result).isNotNull()
        assertThat(accountRepository.findAll().toList()).isNotEmpty()
    }

    @Test
    @Transactional
    @Rollback
    fun `create token`() {
        assertThat(accountTokenRepository.findAll().toList()).isEmpty()

        val accountId = UUID.fromString("aaaa0000-0002-0000-0000-aaaaaaaaaaaa")

        accountRepository.save(Account(
            id = accountId, gitlabId = RandomUtils.randomGitlabId(), email = "",
            username = "", passwordEncrypted = "", person = author
        ))

        val result = dataPopulator.createUserToken(
            GitlabUser(1, "user", "name", "email"))
        assertThat(result).isNotNull()
        assertThat(accountTokenRepository.findAll().toList()).isNotEmpty()
    }

    @Test
    @Transactional
    @Rollback
    fun `create createDataOperation1`() {

        assertThat(dataProcessorRepository.findAll().toList()).isEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isEmpty()

        val (dataOp, param1, param2) = dataPopulator.createDataOperation_augment(userToken, author)
        assertThat(dataOp).isNotNull()
        assertThat(param1).isNotNull()
        assertThat(param2).isNotNull()
        assertThat(param1.processorVersionId).isEqualTo(dataOp.id)
        assertThat(param2.processorVersionId).isEqualTo(dataOp.id)

        assertThat(dataProcessorRepository.findAll().toList()).isNotEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isNotEmpty()
    }

    @Test
    @Transactional
    @Rollback
    fun `create createDataOperation2`() {
        assertThat(dataProcessorRepository.findAll().toList()).isEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isEmpty()

        val (dataOp, param1, param2) = dataPopulator.createDataOperation2(userToken, author)
        assertThat(dataOp).isNotNull()
        assertThat(param1).isNotNull()
        assertThat(param2).isNotNull()
        assertThat(param1.processorVersionId).isEqualTo(dataOp.id)
        assertThat(param2.processorVersionId).isEqualTo(dataOp.id)

        assertThat(dataProcessorRepository.findAll().toList()).isNotEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isNotEmpty()
    }

    @Test
    @Transactional
    @Rollback
    fun `create createDataOperation3`() {
        assertThat(dataProcessorRepository.findAll().toList()).isEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isEmpty()

        val (dataOp, param1, param2) = dataPopulator.createDataOperation3(userToken, author)
        assertThat(dataOp).isNotNull()
        assertThat(param1).isNotNull()
        assertThat(param2).isNotNull()
        assertThat(param1.processorVersionId).isEqualTo(dataOp.id)
        assertThat(param2.processorVersionId).isEqualTo(dataOp.id)

        assertThat(dataProcessorRepository.findAll().toList()).isNotEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isNotEmpty()
    }

    @Test
    @Transactional
    @Rollback
    fun `create DataProject`() {
        assertThat(dataProjectRepository.findAll().toList()).isEmpty()
        val createUserAndTokenInGitlab = dataPopulator.createUserAndTokenInGitlab()
        val createUserToken = dataPopulator.createUserToken(createUserAndTokenInGitlab)
        dataPopulator.createDataProject(userToken = createUserToken.token)
        assertThat(dataProjectRepository.findAll().toList()).isNotEmpty()
    }

    @Test
    @Transactional
    @Rollback
    fun `create experiment with dataOperations`() {
        val createUserAndTokenInGitlab = dataPopulator.createUserAndTokenInGitlab()
        val createUserToken = dataPopulator.createUserToken(createUserAndTokenInGitlab)
        dataPopulator.createDataProject(userToken = createUserToken.token)
        assertThat(experimentRepository.findAll().toList()).isEmpty()
        assertThat(dataProcessorRepository.findAll().toList()).isEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isEmpty()


        val (dataOp1, param11, param12) = dataPopulator.createDataOperation_augment(userToken, author)

        val (dataOp2, param21, param22) = dataPopulator.createDataOperation2(userToken, author)

        val experiment = dataPopulator.createExperiment(
            dataOp1, param11, param12,
            dataOp2, param21, param22
        )
        assertThat(experiment).isNotNull()
        assertThat(experimentRepository.findAll().toList()).isNotEmpty()
        assertThat(dataProcessorRepository.findAll().toList()).isNotEmpty()
        assertThat(processorParameterRepository.findAll().toList()).isNotEmpty()
    }
}
