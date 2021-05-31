package com.mlreef.rest

import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.BaseEnvironments
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.DataType
import com.mlreef.rest.domain.Experiment
import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.Parameter
import com.mlreef.rest.domain.ParameterInstance
import com.mlreef.rest.domain.ParameterType
import com.mlreef.rest.domain.Person
import com.mlreef.rest.domain.Pipeline
import com.mlreef.rest.domain.PipelineConfiguration
import com.mlreef.rest.domain.PipelineJobInfo
import com.mlreef.rest.domain.PipelineType
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.domain.ProcessorType
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.PublishStatus
import com.mlreef.rest.domain.RecentProject
import com.mlreef.rest.domain.UserRole
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.Star
import com.mlreef.rest.domain.repositories.DataTypesRepository
import com.mlreef.rest.domain.repositories.MetricTypesRepository
import com.mlreef.rest.domain.repositories.ParameterTypesRepository
import com.mlreef.rest.domain.repositories.PipelineTypesRepository
import com.mlreef.rest.domain.repositories.ProcessorTypeRepository
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.security.MlReefSessionRegistry
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.utils.Slugs
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Instant
import java.util.UUID
import java.util.concurrent.CopyOnWriteArrayList
import javax.persistence.EntityManager
import javax.persistence.EntityManagerFactory
import javax.persistence.PersistenceUnit
import kotlin.math.absoluteValue
import kotlin.random.Random

@SpringBootTest
class BaseTest {

    protected val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder()

    private val alwaysInTransaction = false
    private val neverInTransaction = true

    @Autowired
    protected lateinit var entityManager: EntityManager

    private val isolatedEntities = CopyOnWriteArrayList<Any>()

    @PersistenceUnit
    protected lateinit var entityManagerFactory: EntityManagerFactory

    @MockkBean(relaxed = true, relaxUnitFun = true)
    protected lateinit var sessionRegistry: MlReefSessionRegistry

    @Autowired
    protected lateinit var personRepository: PersonRepository

    @Autowired
    protected lateinit var subjectRepository: SubjectRepository

    @Autowired
    protected lateinit var accountRepository: AccountRepository

    @Autowired
    protected lateinit var projectRepository: ProjectRepository

    @Autowired
    protected lateinit var dataProjectRepository: DataProjectRepository

    @Autowired
    protected lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    protected lateinit var processorsRepository: ProcessorsRepository

    @Autowired
    protected lateinit var parametersRepository: ParametersRepository

    @Autowired
    protected lateinit var pipelineConfigurationRepository: PipelineConfigurationRepository

    @Autowired
    protected lateinit var processorInstancesRepository: ProcessorInstancesRepository

    @Autowired
    protected lateinit var pipelineRepository: PipelinesRepository

    @Autowired
    protected lateinit var parameterInstancesRepository: ParameterInstancesRepository

    @Autowired
    protected lateinit var experimentsRepository: ExperimentRepository

    @Autowired
    protected lateinit var marketplaceTagRepository: SearchableTagRepository

    @Autowired
    protected lateinit var baseEnvironmentsRepository: BaseEnvironmentsRepository

    @Autowired
    protected lateinit var tagRepository: SearchableTagRepository

    @Autowired
    protected lateinit var groupsRepository: GroupRepository

    @Autowired
    protected lateinit var metricTypesRepository: MetricTypesRepository

    @Autowired
    protected lateinit var recentProjectsRepository: RecentProjectsRepository

    @Autowired
    protected lateinit var processorsService: ProcessorsService

    //////////////////////////// LISTS

    @Autowired
    protected lateinit var processorTypeRepository: ProcessorTypeRepository

    @Autowired
    protected lateinit var dataTypesRepository: DataTypesRepository

    @Autowired
    protected lateinit var parameterTypesRepository: ParameterTypesRepository

    @Autowired
    protected lateinit var pipelineTypesRepository: PipelineTypesRepository


    /////////////////////////// ENTITIES

    protected lateinit var mainPerson: Person
    protected lateinit var mainAccount: Account
    protected lateinit var mainPerson2: Person
    protected lateinit var mainAccount2: Account
    protected lateinit var mainPerson3: Person
    protected lateinit var mainAccount3: Account

    protected val mainToken = "main-account-token"
    protected val mainToken2 = "main-account-token-2"
    protected val mainToken3 = "main-account-token-3"

    protected lateinit var operationProcessorType: ProcessorType
    protected lateinit var algorithmProcessorType: ProcessorType
    protected lateinit var visualizationProcessorType: ProcessorType

    protected lateinit var textDataType: DataType
    protected lateinit var imageDataType: DataType
    protected lateinit var videoDataType: DataType
    protected lateinit var noneDataType: DataType
    protected lateinit var timeSeriesDataType: DataType
    protected lateinit var modelDataType: DataType
    protected lateinit var tabularDataType: DataType
    protected lateinit var audioDataType: DataType
    protected lateinit var anyDataType: DataType
    protected lateinit var hierDataType: DataType
    protected lateinit var numberDataType: DataType

    protected lateinit var stringParamType: ParameterType
    protected lateinit var integerParamType: ParameterType
    protected lateinit var undefinedParamType: ParameterType
    protected lateinit var complexParamType: ParameterType
    protected lateinit var dictionaryParamType: ParameterType
    protected lateinit var tupleParamType: ParameterType
    protected lateinit var booleanParamType: ParameterType
    protected lateinit var floatParamType: ParameterType
    protected lateinit var listParamType: ParameterType
    protected lateinit var objectParamType: ParameterType

    protected lateinit var dataPipelineType: PipelineType
    protected lateinit var experimentPipelineType: PipelineType
    protected lateinit var visualizationPipelineType: PipelineType

    protected lateinit var baseEnv1: BaseEnvironments
    protected lateinit var baseEnv2: BaseEnvironments
    protected lateinit var baseEnv3: BaseEnvironments

    protected lateinit var codeProjectOperation: CodeProject
    protected lateinit var codeProjectAlgorithm: CodeProject
    protected lateinit var codeProjectVisualization: CodeProject

    protected lateinit var processorOperation1: Processor
    protected lateinit var processorOperation2: Processor

    protected lateinit var processorAlgorithm: Processor
    protected lateinit var processorVisualization: Processor

    protected lateinit var dataProjectImages: DataProject

    @BeforeEach
    fun baseTestSetUp() {
//        sessionRegistry = mockk()
//        customEntityManager = entityManagerFactory.createEntityManager()
        preparePredefinedEntities()

    }

    @AfterEach
    internal fun tearDown() {
//        cleanAll()
//        cleanAllInSeparateTransaction()
        cleanAllIsolatedEntities()
    }

    protected fun createDataProject(
        id: UUID? = null,
        slug: String? = null,
        name: String? = null,
        ownerId: UUID? = null,
        namespace: String? = null,
        path: String? = null,
        gitlabId: Long? = null,
        visibility: VisibilityScope? = null,
        inputTypes: Collection<DataType>? = null,
        tags: Collection<SearchableTag>? = null,
        stars: Collection<Person>? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
        url: String? = null,
        pathWithNamespace: String? = null,
        forksCount: Int = 0,
    ): DataProject {
        var projectInDb: DataProject? = if (name != null) dataProjectRepository.findByNameIgnoreCase(name) else null
        if (projectInDb != null) return projectInDb
        val currentId = id ?: UUID.randomUUID()
        projectInDb = DataProject(
            currentId,
            slug = slug ?: "slug-${RandomUtils.generateRandomUserName(10)}",
            ownerId = ownerId ?: mainPerson.id,
            url = url ?: "www.${RandomUtils.generateRandomUserName(10)}.xyz",
            name = name ?: "Data Project ${RandomUtils.generateRandomUserName(10)}",
            description = RandomUtils.generateRandomUserName(10),
            gitlabPath = path ?: RandomUtils.generateRandomUserName(10),
            gitlabNamespace = namespace ?: RandomUtils.generateRandomUserName(10),
            gitlabId = gitlabId ?: Random.nextLong(1, Int.MAX_VALUE.toLong()),
            visibilityScope = visibility ?: VisibilityScope.PUBLIC,
            inputDataTypes = inputTypes?.toMutableSet() ?: mutableSetOf(),
            tags = tags?.toMutableSet() ?: mutableSetOf(),
            stars = stars?.map { Star(currentId, it.id) }?.toMutableSet() ?: mutableSetOf(),
            gitlabPathWithNamespace = pathWithNamespace ?: RandomUtils.generateRandomUserName(15),
            forksCount = forksCount,
        )

        return if (persist) {
            saveEntity(projectInDb, projectInDb.id, dataProjectRepository, inTransaction)
        } else projectInDb
    }

    protected fun createCodeProject(
        id: UUID? = null,
        slug: String? = null,
        name: String? = null,
        ownerId: UUID? = null,
        namespace: String? = null,
        path: String? = null,
        gitlabId: Long? = null,
        visibility: VisibilityScope? = null,
        processorType: ProcessorType? = null,
        inputTypes: Collection<DataType>? = null,
        outputTypes: Collection<DataType>? = null,
        tags: Collection<SearchableTag>? = null,
        stars: Collection<Person>? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
        url: String? = null,
        pathWithNamespace: String? = null,
        modelType: String? = null,
        mlCategory: String? = null,
        forksCount: Int = 0,
    ): CodeProject {
        var codeProject = if (name != null) codeProjectRepository.findByNameIgnoreCase(name) else null
        if (codeProject != null) return codeProject
        val currentId = id ?: UUID.randomUUID()
        codeProject = CodeProject(
            currentId,
            slug ?: "slug-${RandomUtils.generateRandomUserName(10)}",
            url ?: "www.${RandomUtils.generateRandomUserName(10)}.xyz",
            name ?: "Code Project ${RandomUtils.generateRandomUserName(10)}",
            RandomUtils.generateRandomUserName(10),
            ownerId ?: mainPerson.id,
            namespace ?: RandomUtils.generateRandomUserName(10),
            path ?: RandomUtils.generateRandomUserName(10),
            gitlabId ?: Random.nextLong(1, Int.MAX_VALUE.toLong()),
            visibility ?: VisibilityScope.PUBLIC,
            processorType = processorType ?: operationProcessorType,
            inputDataTypes = inputTypes?.toMutableSet() ?: mutableSetOf(),
            outputDataTypes = outputTypes?.toMutableSet() ?: mutableSetOf(),
            tags = tags?.toMutableSet() ?: mutableSetOf(),
            stars = stars?.map { Star(currentId, it.id) }?.toMutableSet() ?: mutableSetOf(),
            gitlabPathWithNamespace = pathWithNamespace ?: RandomUtils.generateRandomUserName(15),
            modelType = modelType,
            mlCategory = mlCategory,
            forksCount = forksCount,
        )

        return if (persist) {
            saveEntity(codeProject, codeProject.id, codeProjectRepository, inTransaction)
        } else codeProject
    }

    protected fun createProcessor(
        project: CodeProject,
        name: String? = null,
        slug: String? = null,
        mainScript: String = "main.py",
        author: Person? = null,
        branch: String? = null,
        version: String? = null,
        environment: BaseEnvironments? = null,
        published: Boolean = true,
        publishFailed: Boolean = false,
        publishInProgress: Boolean = false,
        commitSha: String? = null,
        status: PublishStatus? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): Processor {
        var processor = if (slug != null) processorsRepository.getByCodeProjectAndSlug(project, slug) else null

        if (processor != null) return processor

        processor = project.createProcessor(
            name,
            slug = slug ?: Slugs.toSlug(UUID.randomUUID().toString()),
            mainScript = mainScript,
            imageName = "${project.name}:master",
            publisher = author,
            branch = branch,
            version = version,
        )

        val publishDate = Instant.now()

        processor.publishedAt = publishDate.minusSeconds(60)
        processor.jobStartedAt = if (published || publishInProgress) publishDate.minusSeconds(30) else null
        processor.jobFinishedAt = if (published || publishFailed) publishDate.minusSeconds(10) else null
        environment?.let { processor.baseEnvironment = it }
        processor.secret = RandomUtils.generateRandomUserName(35)
        processor.commitSha = commitSha

        processor.status = status ?: when {
            published -> PublishStatus.PUBLISHED
            publishFailed -> PublishStatus.PUBLISH_FAILED
            publishInProgress -> PublishStatus.PUBLISH_STARTED
            else -> PublishStatus.PUBLISH_CREATED
        }

        return if (persist) {
            saveEntity(processor, processor.id, processorsRepository, inTransaction)
        } else processor
    }


    protected fun createPipelineConfiguration(
        dataProject: DataProject,
        slug: String,
        name: String? = null,
        sourceBranch: String? = null,
        targetBranchPattern: String? = null,
        type: PipelineType? = null,
        inputFiles: Collection<FileLocation>? = null,
        processorInstance: ProcessorInstance? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): PipelineConfiguration {
        val configuration = dataProject.createPipelineConfiguration(
            type = type ?: dataPipelineType,
            slug = slug,
            name = name ?: "pipeline-name",
            sourceBranch = sourceBranch ?: "sourceBranch",
            targetBranchPattern = targetBranchPattern ?: "targetBranch",
            processorInstances = if (processorInstance != null) arrayListOf(processorInstance) else arrayListOf(),
            inputFiles = inputFiles ?: arrayListOf()
        )

        return if (persist) {
            saveEntity(configuration, configuration.id, pipelineConfigurationRepository, inTransaction)
        } else configuration
    }

    protected fun createProcessorInstance(
        processor: Processor,
        pipelineConfiguration: PipelineConfiguration? = null,
        name: String? = null,
        slug: String? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): ProcessorInstance {
        val processorInstance = processor.addInstance(
            name = name,
            slug = slug,
            pipelineConfiguration = pipelineConfiguration
        )

        return if (persist) {
            saveEntity(processorInstance, processorInstance.id, processorInstancesRepository, inTransaction)
        } else processorInstance
    }

    protected fun createPipeline(
        pipelineConfiguration: PipelineConfiguration,
        person: Person,
        slug: String? = null,
        number: Int? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): Pipeline {
        val pipeline = pipelineConfiguration.createPipeline(person, number ?: 1, slug = slug)

        return if (persist) {
            saveEntity(pipeline, pipeline.id, pipelineRepository, inTransaction)
        } else pipeline
    }


    //    @Transactional(propagation = Propagation.NESTED) //, isolation = Isolation.READ_UNCOMMITTED)
    protected fun createParameter(
        processor: Processor,
        name: String? = null,
        parameterType: ParameterType? = null,
        defaultValue: String? = null,
        order: Int = 1,
        required: Boolean = true,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): Parameter {
        var processorParameter =
            if (name != null) parametersRepository.findByProcessorAndName(processor, name) else null

        if (processorParameter != null) return processorParameter

        processorParameter = processor.addParameter(
            name = name,
            type = parameterType ?: stringParamType,
            defaultValue = defaultValue,
            order = order,
            required = required,
        )

        return if (persist) {
            saveEntity(processorParameter, processorParameter.id, parametersRepository, inTransaction)
        } else processorParameter
    }

    protected fun createParameterInstance(
        parameter: Parameter,
        processorInstance: ProcessorInstance,
        value: String? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): ParameterInstance {
        val paramInstance = processorInstance.createParameterInstances(parameter, value ?: "")

        return if (persist) {
            saveEntity(paramInstance, paramInstance.id, parameterInstancesRepository, inTransaction)
        } else paramInstance
    }

    protected fun createRecentProject(
        project: Project,
        person: Person,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): RecentProject {
        val recent = RecentProject(UUID.randomUUID(), person, project, Instant.now().minusSeconds(Random.nextInt(1, 999999).toLong()), "operation")

        return if (persist) {
            saveEntity(recent, recent.id, recentProjectsRepository, inTransaction)
        } else recent
    }

    fun createPerson(
        name: String? = null,
        slug: String? = null,
        gitlabId: Long? = null,
        role: UserRole? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): Person {
        val finalName = name ?: RandomUtils.generateRandomUserName(15)
        var person = personRepository.findByName(finalName)

        if (person != null) return person

        person = Person(
            id = UUID.randomUUID(),
            slug = slug ?: "person-slug-${finalName.toLowerCase()}",
            name = finalName,
            gitlabId = gitlabId ?: Random.nextLong().absoluteValue,
            userRole = role ?: UserRole.DEVELOPER,
            hasNewsletters = true,
        )

        return if (persist) {
            saveEntity(person, person.id, personRepository, inTransaction)
        } else person
    }

    fun createAccount(
        username: String? = null,
        person: Person? = null,
        email: String? = null,
        plainPassword: String? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): Account {
        val finalName = username ?: RandomUtils.generateRandomUserName(10)

        var account = accountRepository.findOneByUsername(finalName)

        if (account != null) return account

        val finalPerson = person ?: mainPerson

        account = Account(
            id = UUID.randomUUID(),
            username = finalName,
            email = email ?: "$finalName@mlreef.com",
            passwordEncrypted = passwordEncoder.encode(plainPassword ?: "password"),
            person = finalPerson
        )

        return if (persist) {
            finalPerson.account = saveEntity(account, account.id, accountRepository, inTransaction)
            finalPerson.account!!
        } else {
            finalPerson.account = account
            account
        }
    }

    protected fun createExperiment(
        pipeline: Pipeline,
        slug: String? = null,
        name: String? = null,
        processorInstance: ProcessorInstance? = null,
        dataProject: DataProject? = null,
        inputFiles: Collection<FileLocation>? = null,
        testPipelineJobInfo: PipelineJobInfo? = null,
        creator: Person? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): Experiment {
        val experiment = pipeline.createExperiment(
            dataProject = dataProject,
            slug = slug,
            inputFiles = inputFiles,
            processorInstance = processorInstance
        )

        return if (persist) {
            saveEntity(
                experiment.copy(pipelineJobInfo = testPipelineJobInfo, creator = creator ?: mainPerson),
                experiment.id,
                experimentsRepository,
                inTransaction
            )
        } else experiment.copy(pipelineJobInfo = testPipelineJobInfo, creator = creator ?: mainPerson)
    }

    protected fun createTestPipelineInfo() = PipelineJobInfo(
        Random.nextLong().absoluteValue,
        "lksdjslkdfs",
        "ref",
        "secret",
        Instant.now(),
        Instant.now(),
        Instant.now(),
        Instant.now(),
        Instant.now()
    )

    protected fun createBaseEnvironment(
        name: String? = null,
        image: String? = null,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): BaseEnvironments {
        val finalName = name ?: "Base environment ${UUID.randomUUID()}"
        var baseEnv = baseEnvironmentsRepository.findByTitle(finalName)

        if (baseEnv != null) return baseEnv

        baseEnv = BaseEnvironments(
            UUID.randomUUID(),
            finalName,
            image ?: "alpine:latest",
            "Description",
        )

        return if (persist) {
            saveEntity(baseEnv, baseEnv.id, baseEnvironmentsRepository, inTransaction)
        } else baseEnv
    }

    protected fun createTag(
        tag: String,
        persist: Boolean = true,
        inTransaction: Boolean = false,
    ): SearchableTag {
        return marketplaceTagRepository.save(SearchableTag(UUID.randomUUID(), tag, true))
    }

    //    @Transactional
    fun preparePredefinedEntities() {
//        insideTransaction {
        mainPerson = createPerson("Main Person", "main-person-slug", inTransaction = true)
        mainAccount = createAccount("mainAccount", mainPerson, inTransaction = true)
//        mainPerson = mainPerson.copy(account = mainAccount)

        mainPerson2 = createPerson("Main Person 2", "main-person-slug-2", inTransaction = true)
        mainAccount2 = createAccount("mainAccount2", mainPerson2, inTransaction = true)
//        mainPerson2 = mainPerson2.copy(account = mainAccount2)

        mainPerson3 = createPerson("Main Person 3", "main-person-slug-3", inTransaction = true)
        mainAccount3 = createAccount("mainAccount3", mainPerson3, inTransaction = true)
//        mainPerson3 = mainPerson3.copy(account = mainAccount3)

        //}

        // Processor types

        algorithmProcessorType = createProcessorType("ALGORITHM", inTransaction = true)
        operationProcessorType = createProcessorType("OPERATION", inTransaction = true)
        visualizationProcessorType = createProcessorType("VISUALIZATION", inTransaction = true)

        // Data types

        textDataType = createDataType("TEXT", inTransaction = true)
        imageDataType = createDataType("IMAGE", inTransaction = true)
        videoDataType = createDataType("VIDEO", inTransaction = true)
        noneDataType = createDataType("NONE", inTransaction = true)
        timeSeriesDataType = createDataType("TIME_SERIES", inTransaction = true)
        modelDataType = createDataType("MODEL", inTransaction = true)
        tabularDataType = createDataType("TABULAR", inTransaction = true)
        audioDataType = createDataType("AUDIO", inTransaction = true)
        anyDataType = createDataType("ANY", inTransaction = true)
        hierDataType = createDataType("HIERARCHICAL", inTransaction = true)
        numberDataType = createDataType("NUMBER", inTransaction = true)

        // Parameters types

        stringParamType = createParameterType("STRING", inTransaction = true)
        integerParamType = createParameterType("INTEGER", inTransaction = true)
        undefinedParamType = createParameterType("UNDEFINED", inTransaction = true)
        complexParamType = createParameterType("COMPLEX", inTransaction = true)
        dictionaryParamType = createParameterType("DICTIONARY", inTransaction = true)
        tupleParamType = createParameterType("TUPLE", inTransaction = true)
        booleanParamType = createParameterType("BOOLEAN", inTransaction = true)
        floatParamType = createParameterType("FLOAT", inTransaction = true)
        listParamType = createParameterType("LIST", inTransaction = true)
        objectParamType = createParameterType("OBJECT", inTransaction = true)

        //Pipeline types
        dataPipelineType = createPipelineType("DATA", inTransaction = true)
        experimentPipelineType = createPipelineType("EXPERIMENT", inTransaction = true)
        visualizationPipelineType = createPipelineType("VISUALIZATION", inTransaction = true)

        //Base environments

        baseEnv1 = createBaseEnvironment("Base environment 1", inTransaction = true)
        baseEnv2 = createBaseEnvironment("Base environment 2", inTransaction = true)
        baseEnv3 = createBaseEnvironment("Base environment 3", inTransaction = true)

        // Code projects

        codeProjectOperation =
            createCodeProject(
                slug = "commons-data-operation",
                name = "Commons data operation",
                processorType = operationProcessorType,
                inTransaction = true,
            )
        codeProjectAlgorithm =
            createCodeProject(
                slug = "commons-algorithm",
                name = "Commons algorithm",
                processorType = algorithmProcessorType,
                inTransaction = true,
            )
        codeProjectVisualization =
            createCodeProject(
                slug = "commons-data-visualisation",
                name = "Commons data visualisation",
                processorType = visualizationProcessorType,
                inTransaction = true,
            )

        processorOperation1 = createProcessor(
            codeProjectOperation,
            name = "Commons data operation processor",
            slug = "commons-data-operation",
            inTransaction = true,
            branch = "master",
            version = "1",
        )

        processorOperation2 = createProcessor(
            codeProjectOperation,
            name = "Commons data operation processor 2",
            slug = "commons-data-operation-2",
            inTransaction = true,
            branch = "master",
            version = "2",
        )

        processorAlgorithm = createProcessor(
            codeProjectAlgorithm,
            name = "Commons data algorithm processor",
            slug = "commons-algorithm",
            inTransaction = true,
            branch = "master",
            version = "1",
        )

        processorVisualization = createProcessor(
            codeProjectVisualization,
            name = "Commons data visualisation processor",
            slug = "commons-data-visualisation",
            inTransaction = true,
            branch = "master",
            version = "1",
        )

        createParameter(processorOperation1, "stringParam", stringParamType, persist = true, inTransaction = true, order = 1)
        createParameter(processorOperation1, "floatParam", floatParamType, persist = true, inTransaction = true, order = 2)
        createParameter(processorOperation1, "integerParam", integerParamType, persist = true, inTransaction = true, order = 3)
        createParameter(processorOperation1, "stringList", listParamType, persist = true, inTransaction = true, order = 4)

        createParameter(processorAlgorithm, "booleanParam", booleanParamType, persist = true, inTransaction = true, order = 1)
        createParameter(processorAlgorithm, "complexName", complexParamType, persist = true, inTransaction = true, order = 2)

        createParameter(processorVisualization, "tupleParam", tupleParamType, persist = true, inTransaction = true, order = 1)
        createParameter(processorVisualization, "hashParam", dictionaryParamType, persist = true, inTransaction = true, order = 2)

        // Data project

        dataProjectImages =
            createDataProject(name = "Data project images", inTransaction = true, slug = "data-project-images")
    }

    fun mockUserAuthentication(
        projectIds: List<UUID>? = null,
        forAccount: Account? = null,
        level: AccessLevel = AccessLevel.MAINTAINER,
        forToken: String? = null,
        groupIdLevelMap: MutableMap<UUID, AccessLevel?>? = null
    ) {
        val toMutableMap = projectIds?.map { Pair<UUID, AccessLevel?>(it, level) }?.toMap()?.toMutableMap() ?: mutableMapOf()
        val actualAccount = forAccount ?: mainAccount
        val actualToken = forToken ?: mainToken

        every { sessionRegistry.retrieveFromSession(forToken?.let { eq(it) } ?: any()) } answers {
            val token = this.args[0] as String
            tokenDetails(actualAccount, actualToken, toMutableMap, groupIdLevelMap ?: mutableMapOf())
        }
    }

    private fun tokenDetails(
        actualAccount: Account,
        token: String,
        projectIdLevelMap: MutableMap<UUID, AccessLevel?>,
        groupIdLevelMap: MutableMap<UUID, AccessLevel?>
    ): TokenDetails {
        return TokenDetails(
            username = actualAccount.username,
            accessToken = token,
            accountId = actualAccount.id,
            personId = actualAccount.person.id,
            gitlabUser = GitlabUser(actualAccount.person.gitlabId!!, "testuser", "Test User", "test@example.com"),
            valid = true,
            projects = projectIdLevelMap,
            groups = groupIdLevelMap,
            authorities = listOf(SimpleGrantedAuthority("USER"))
        )
    }

    //    @Transactional()
    fun cleanAll() {
        println("BASE TEST CLEAN UP")
        experimentsRepository.deleteAll()
        parameterInstancesRepository.deleteAll()
        processorInstancesRepository.deleteAll()
        pipelineRepository.deleteAll()
        pipelineConfigurationRepository.deleteAll()
        parametersRepository.deleteAll()
        processorsRepository.deleteAll()
        dataProjectRepository.deleteAll()
        codeProjectRepository.deleteAll()

        personRepository.deleteAll()
        accountRepository.deleteAll()

        baseEnvironmentsRepository.deleteAll()
        processorTypeRepository.deleteAll()
        dataTypesRepository.deleteAll()
        processorsRepository.deleteAll()
        parameterTypesRepository.deleteAll()
    }

    fun cleanAllInSeparateTransaction() {
//        insideTransaction {
//            it.createQuery("DELETE FROM Experiment").executeUpdate()
//            it.createQuery("DELETE FROM ParameterInstance").executeUpdate()
//            it.createQuery("DELETE FROM ProcessorInstance").executeUpdate()
//            it.createQuery("DELETE FROM Pipeline").executeUpdate()
//            it.createQuery("DELETE FROM PipelineConfiguration").executeUpdate()
//            it.createQuery("DELETE FROM Parameter").executeUpdate()
//            it.createQuery("DELETE FROM Processor").executeUpdate()
//            it.createQuery("DELETE FROM DataProject").executeUpdate()
//            it.createQuery("DELETE FROM CodeProject").executeUpdate()
//            it.createQuery("DELETE FROM Star").executeUpdate()
//            it.createQuery("DELETE FROM Person").executeUpdate()
//            it.createQuery("DELETE FROM Account").executeUpdate()
//        }
    }

    fun cleanAllIsolatedEntities() {
        insideTransaction { em ->
            isolatedEntities.reversed().forEach {
                em.remove(em.merge(it))
            }
        }
    }

    private fun createProcessorType(
        name: String,
        persist: Boolean = true,
        inTransaction: Boolean = false
    ): ProcessorType {
        var type = processorTypeRepository.findByNameIgnoreCase(name)
        if (type != null) return type
        type = ProcessorType(UUID.randomUUID(), name)

        return if (persist) {
            saveEntity(type, type.id, processorTypeRepository, inTransaction)
        } else type
    }

    private fun createParameterType(
        name: String,
        persist: Boolean = true,
        inTransaction: Boolean = false
    ): ParameterType {
        var type = parameterTypesRepository.findByNameIgnoreCase(name)
        if (type != null) return type
        type = ParameterType(UUID.randomUUID(), name)

        return if (persist) {
            saveEntity(type, type.id, parameterTypesRepository, inTransaction)
        } else type
    }

    private fun createDataType(name: String, persist: Boolean = true, inTransaction: Boolean = false): DataType {
        var type = dataTypesRepository.findByNameIgnoreCase(name)
        if (type != null) return type
        type = DataType(UUID.randomUUID(), name)

        return if (persist) {
            saveEntity(type, type.id, dataTypesRepository, inTransaction)
        } else type
    }

    private fun createPipelineType(
        name: String,
        persist: Boolean = true,
        inTransaction: Boolean = false
    ): PipelineType {
        var type = pipelineTypesRepository.findByNameIgnoreCase(name)
        if (type != null) return type
        type = PipelineType(UUID.randomUUID(), name)

        return if (persist) {
            saveEntity(type, type.id, pipelineTypesRepository, inTransaction)
        } else type
    }

    protected fun <T> saveEntity(
        entity: T,
        id: UUID,
        repo: CrudRepository<T, UUID>,
        inTransaction: Boolean = false
    ): T {
        return if (alwaysInTransaction || (!neverInTransaction && inTransaction)) insideTransaction {
            it.persist(entity)
            it.flush()
            isolatedEntities.add(entity as Any)
            entity
        }?.let {
            repo.findByIdOrNull(id)
        }!! else repo.save(entity)
    }

    private fun <T> saveInSeparateTransaction(entity: T): T {
        val customEntityManager = entityManagerFactory.createEntityManager()
        customEntityManager.transaction.begin()
        customEntityManager.persist(entity)
        customEntityManager.flush()
        customEntityManager.transaction.commit()
        customEntityManager.close()
        return entity
    }

    fun <T> insideTransaction(commit: Boolean = true, func: (em: EntityManager) -> T): T? {
        val em = entityManagerFactory.createEntityManager()
        em.transaction.begin()
        val result = try {
            val res = func.invoke(em)
            if (commit) {
                em.transaction.commit()
            } else {
                em.transaction.rollback()
            }
            res
        } catch (ex: Exception) {
            em.transaction.rollback()
            throw ex
        } finally {
            em.close()
        }
        return result
    }
}