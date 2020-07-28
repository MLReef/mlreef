package com.mlreef.rest

import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.marketplace.SearchableTag
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.Arrays
import java.util.UUID

@Profile(value = [ApplicationProfiles.DEV, ApplicationProfiles.DOCKER])
@Component
internal class CommandLineAppStartupRunner(
    val dataPopulator: DataPopulator
) : CommandLineRunner {

    @Throws(Exception::class)
    override fun run(vararg args: String) {
        logger.info("Application started with command-line arguments: {} . \n To kill this application, press Ctrl + C.", Arrays.toString(args))
        dataPopulator.init()
    }

    companion object {
        private val logger = LoggerFactory.getLogger(CommandLineAppStartupRunner::class.java)
    }
}

@Profile(value = [ApplicationProfiles.DEV, ApplicationProfiles.DOCKER])
@Component
internal class DataPopulator(
    private val gitlabRestClient: GitlabRestClient,
    val dataProjectRepository: DataProjectRepository,
    val dataProjectService: ProjectService<DataProject>,
    val personRepository: PersonRepository,
    val accountTokenRepository: AccountTokenRepository,
    val accountRepository: AccountRepository,
    val codeProjectRepository: CodeProjectRepository,
    val dataProcessorRepository: DataProcessorRepository,
    val processorVersionRepository: ProcessorVersionRepository,
    val dataAlgorithmRepository: DataAlgorithmRepository,
    val processorParameterRepository: ProcessorParameterRepository,
    val experimentRepository: ExperimentRepository,
    val searchableTagRepository: SearchableTagRepository,
    val marketplaceService: MarketplaceService
) {

    val username = "mlreef"
    val email = "mlreef@example.org"
    val encryptedPassword = "$2a$10\$YYeURJweLZlrCHKyitID6ewdQlyK4rWwRTutvtcRMgvU8DMy6rab."
    val subjectId = UUID.fromString("aaaa0000-0001-0000-0000-cccccccccccc")
    val accountId = UUID.fromString("aaaa0000-0002-0000-0000-aaaaaaaaaaaa")
    val accountTokenId = UUID.fromString("aaaa0000-0003-0000-0000-adadadadadad")

    val dataProjectId = UUID.fromString("5d005488-afb6-4a0c-852a-f471153a04b5")
    val experimentId = UUID.fromString("77481b71-8d40-4a48-9117-8d0c5129d6ec")

    val tag1 = SearchableTag(UUID.fromString("cccc0000-0101-0000-1000-cccccccccccc"), "tag1")
    val tag2 = SearchableTag(UUID.fromString("cccc0000-0101-0000-2000-cccccccccccc"), "tag2")
    val tag3 = SearchableTag(UUID.fromString("cccc0000-0101-0000-3000-cccccccccccc"), "tag3")
    val tag4 = SearchableTag(UUID.fromString("cccc0000-0101-0000-4000-cccccccccccc"), "tag4")

    val log = LoggerFactory.getLogger(this::class.java)

    fun init() {
        try {
            lateinit var createUserToken: AccountToken
            lateinit var gitlabUser: GitlabUser
            executeLogged("1. Create Demo-User and Token in Gitlab") {
                gitlabUser = createUserAndTokenInGitlab()
                executeLogged("1b. Create Token in Gitlab") {
                    createUserToken = createUserToken(gitlabUser)
                    log.info("Create user with token: ${gitlabUser.username} -> ${createUserToken.token}")
                }
            }

            val token = createUserToken.token

            val entity = Person(id = subjectId, slug = "user-demo", name = "Author1", gitlabId = gitlabUser.id)
            val author = personRepository.findByIdOrNull(entity.id) ?: personRepository.save(entity)

            executeLogged("1c. Create some marketplace Tags") {
                createTags()
            }
            val (dataOp1,
                dataOp1processorParameter1,
                dataOp1processorParameter2) = executeLogged("2a. Create DataOperation: Augment") {
                createDataOperation_augment(token, author)
            }

            val (dataOp2,
                dataOp2processorParameter1,
                dataOp2processorParameter2) = executeLogged("2b. Create DataOperation: Random crop") {
                createDataOperation2(token, author)
            }
            executeLoggedOptional("2c. Create DataOperation: Lee Filter") {
                createDataOperation3(token, author)
            }

            executeLoggedOptional("3a. Create DataAlgorithm: Resnet50") {
                createDataAlgorithmResnet50(token, author)
            }

            executeLoggedOptional("3b. Create DataAlgorithm: Dummy") {
                createDataAlgorithmDummy(token, author)
            }

            executeLoggedOptional("4. Create example DataProject & Experiment") {
                createDataProject(token)
            }

            executeLoggedOptional("5. Create example Experiment") {
                createExperiment(
                    dataOp1, dataOp1processorParameter1, dataOp1processorParameter2,
                    dataOp2, dataOp2processorParameter1, dataOp2processorParameter2)
            }
        } catch (e: Exception) {
            log.error("####################################################")
            log.error("Could not run Initial Dev/Docker Test Setup properly")
            log.error("####################################################", e)
        }
    }

    @Transactional
    fun createTags() {
        searchableTagRepository.findByIdOrNull(tag1.id) ?: searchableTagRepository.save(tag1)
        searchableTagRepository.findByIdOrNull(tag2.id) ?: searchableTagRepository.save(tag2)
        searchableTagRepository.findByIdOrNull(tag3.id) ?: searchableTagRepository.save(tag3)
        searchableTagRepository.findByIdOrNull(tag4.id) ?: searchableTagRepository.save(tag4)
    }

    @Transactional
    fun createExperiment(dataOp1: ProcessorVersion, dataOp1processorParameter1: ProcessorParameter, dataOp1processorParameter2: ProcessorParameter,
                         dataOp2: ProcessorVersion, dataOp2processorParameter1: ProcessorParameter, dataOp2processorParameter2: ProcessorParameter): Experiment {
        val processorInstance = DataProcessorInstance(id = UUID.fromString("5d005488-afb6-4a0c-0031-f471153a04b5"), processorVersion = dataOp1)
        processorInstance.addParameterInstances(dataOp1processorParameter1, ".")
        processorInstance.addParameterInstances(dataOp1processorParameter2, ".")

        val processorInstance2 = DataProcessorInstance(id = UUID.fromString("5d005488-afb6-4a0c-0032-f471153a04b5"), processorVersion = dataOp2)
        processorInstance2.addParameterInstances(dataOp2processorParameter1, ".")
        processorInstance2.addParameterInstances(dataOp2processorParameter2, ".")

        val experiment = Experiment(
            id = experimentId,
            dataProjectId = dataProjectId,
            dataInstanceId = null,
            processing = processorInstance,
            name = "Experiment Name",
            slug = "experiment-slug",
            sourceBranch = "source",
            targetBranch = "target",
            inputFiles = listOf(FileLocation.fromPath("folder"))
        )
        return experimentRepository.findByIdOrNull(experiment.id) ?: experimentRepository.save(experiment)
    }

    @Transactional
    fun createDataProject(userToken: String) {
        val projectSlug = "sign-language-classifier"
        val gitLabProject: GitlabProject = try {
            gitlabRestClient.createProject(
                token = userToken,
                slug = projectSlug,
                name = "Sign Language Classifier Repo",
                defaultBranch = "master",
                nameSpaceId = null,
                initializeWithReadme = true,
                description = "Description",
                visibility = "public"
            )

        } catch (e: Exception) {
            log.info("Already existing dev user")
            val projects = gitlabRestClient.getProjects(userToken)
            projects.first { it.path == projectSlug }
        }

        val pathWithNamespace = gitLabProject.pathWithNamespace
        val group = pathWithNamespace.split("/")[0]
        val dataProject = DataProject(
            id = dataProjectId,
            slug = gitLabProject.path,
            ownerId = subjectId,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            description = gitLabProject.description ?: "",
            gitlabPath = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabNamespace = group,
            gitlabId = gitLabProject.id
        )

        dataProjectRepository.findByIdOrNull(dataProject.id) ?: dataProjectRepository.save(dataProject)
    }

    @Transactional
    fun createCodeProject(userToken: String, codeProjectId: UUID, projectSlug: String, name: String, gitlabId: Int): CodeProject? {
        val findByIdOrNull = codeProjectRepository.findByIdOrNull(codeProjectId)

        if (findByIdOrNull != null) {
            return findByIdOrNull
        }

        val gitLabProject: GitlabProject? = try {
            gitlabRestClient.createProject(
                token = userToken,
                slug = projectSlug,
                name = "Testproject $projectSlug",
                defaultBranch = "master",
                nameSpaceId = null,
                initializeWithReadme = true,
                description = "Description",
                visibility = "public")

        } catch (e: Exception) {
            val projects = gitlabRestClient.getProjects(userToken)
            val candidates = projects.filter { it.path == projectSlug }
            if (candidates.isNotEmpty()) {
                candidates.first()
            } else {
                log.error("Cannot create project and did also not find one with slug $projectSlug")
                null
            }
        }

        return if (gitLabProject != null) {
            val pathWithNamespace = gitLabProject.pathWithNamespace
            val group = pathWithNamespace.split("/")[0]
            val codeProject = CodeProject(
                id = codeProjectId,
                slug = gitLabProject.path,
                ownerId = subjectId,
                url = gitLabProject.webUrl,
                name = gitLabProject.name,
                description = gitLabProject.description ?: "",
                gitlabPath = gitLabProject.path,
                gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
                gitlabNamespace = group,
                gitlabId = gitLabProject.id
            )
            codeProjectRepository.findByIdOrNull(codeProjectId) ?: codeProjectRepository.save(codeProject)
        } else {
            codeProjectRepository.findByIdOrNull(codeProjectId)
        }

    }

    @Transactional
    fun createDataOperation_augment(userToken: String, author: Subject): Triple<ProcessorVersion, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = UUID.fromString("1000000-0000-0001-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-0000-0001-0002-000000000000")

        val createCodeProject = createCodeProject(userToken, codeProjectId, "code-project-augment", "Test DataProject 2", 0)

        val _dataOp1 = dataProcessorRepository.findByIdOrNull(dataOperationId)
            ?: dataProcessorRepository.save(DataOperation(
                id = dataOperationId, slug = "commons-augment", name = "Augment",
                inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC, author = author,
                description = "Data augmentation multiplies and tweakes the data by changing angle of rotation, flipping the images, zooming in, etc.",
                codeProjectId = codeProjectId))

        val dataOp1 = processorVersionRepository.findByIdOrNull(dataOperationId)
            ?: processorVersionRepository.save(ProcessorVersion(
                id = dataOperationId, dataProcessor = _dataOp1, publisher = author,
                command = "augment", number = 1, baseEnvironment = BaseEnvironment.default()))

        val parameter1 = addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0011-000000000000"), dataOp1.id,
            "input-path", ParameterType.STRING, 0, ".", true
        ))
        val parameter2 = addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0012-000000000000"), dataOp1.id,
            "output-path", ParameterType.STRING, 1, "./output", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0013-000000000000"), dataOp1.id,
            "iterations", ParameterType.INTEGER, 2, "5", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0014-000000000000"), dataOp1.id,
            "rotation-range", ParameterType.INTEGER, 3, "15", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0015-000000000000"), dataOp1.id,
            "width-shift-range", ParameterType.INTEGER, 4, "0", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0016-000000000000"), dataOp1.id,
            "height-shift-range", ParameterType.INTEGER, 5, "0", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0017-000000000000"), dataOp1.id,
            "shear-range", ParameterType.FLOAT, 6, "0", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0018-000000000000"), dataOp1.id,
            "zoom-range", ParameterType.FLOAT, 7, "0", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0019-000000000000"), dataOp1.id,
            "horizontal-flip", ParameterType.BOOLEAN, 8, "TRUE", true
        ))
        addParam(ProcessorParameter(
            UUID.fromString("1000000-0000-0001-0020-000000000000"), dataOp1.id,
            "vertical-flip", ParameterType.BOOLEAN, 9, "TRUE", true
        ))
        createMarketplaceEntry(createCodeProject, dataOp1, listOf(tag1, tag2))

        return Triple(dataOp1 as ProcessorVersion, parameter1, parameter2)
    }

    @Transactional
    fun createDataOperation2(userToken: String, author: Subject): Triple<ProcessorVersion, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = UUID.fromString("1000000-0000-0002-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-0000-0002-0002-000000000000")
        val processorParameter1Id = UUID.fromString("1000000-0000-0002-0011-000000000000")
        val processorParameter2Id = UUID.fromString("1000000-0000-0002-0012-000000000000")
        val processorParameter3Id = UUID.fromString("1000000-0000-0002-0013-000000000000")
        val processorParameter4Id = UUID.fromString("1000000-0000-0002-0014-000000000000")

        val createCodeProject = createCodeProject(userToken, codeProjectId, "code-project-random-crop", "Test DataProject", 0)

        val _dataOp2 = dataProcessorRepository.findByIdOrNull(dataOperationId)
            ?: dataProcessorRepository.save(DataOperation(
                id = dataOperationId, slug = "commons-random-crop", name = "Random crop",
                inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC, author = author,
                description = """
                    This pipeline operation randomly crops a NxM (height x width) portion of the given dataset.
                    This is used to randomly extract parts of the image incase we need to remove bias present in image data.
                """.trimMargin(),
                codeProjectId = codeProjectId))

        val dataOp2 = processorVersionRepository.findByIdOrNull(dataOperationId)
            ?: processorVersionRepository.save(ProcessorVersion(
                id = dataOperationId, dataProcessor = _dataOp2, publisher = author,
                command = "random_crop", number = 1, baseEnvironment = BaseEnvironment.default()))

        val parameter1 = addParam(processorParameter1Id, ProcessorParameter(processorParameter1Id, dataOp2.id, "height", ParameterType.INTEGER, 0, "35"))
        val parameter2 = addParam(processorParameter2Id, ProcessorParameter(processorParameter2Id, dataOp2.id, "width", ParameterType.INTEGER, 1, "35"))
        addParam(processorParameter3Id, ProcessorParameter(processorParameter3Id, dataOp2.id, "channels", ParameterType.INTEGER, 0, "3", false))
        addParam(processorParameter4Id, ProcessorParameter(processorParameter4Id, dataOp2.id, "seed", ParameterType.INTEGER, 1, "3", false, "advanced"))

        createMarketplaceEntry(createCodeProject, dataOp2, listOf(tag2, tag4))
        return Triple(dataOp2, parameter1, parameter2)
    }

    @Transactional
    fun createMarketplaceEntry(codeProject: CodeProject?, processor: ProcessorVersion, tags: List<SearchableTag>) {
        if (codeProject != null) {
            val marketplaceEntry = marketplaceService.assertEntry(codeProject, processor.dataProcessor.author!!)
            marketplaceService.save(marketplaceEntry
                .addTags(tags)
                .addInputDataTypes(listOf(processor.dataProcessor.inputDataType))
                .addOutputDataTypes(listOf(processor.dataProcessor.outputDataType)))
        }
    }

    fun createDataOperation3(userToken: String, author: Subject): Triple<ProcessorVersion, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = UUID.fromString("1000000-0000-0003-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-0000-0003-0002-000000000000")
        val processorParameter1Id = UUID.fromString("1000000-0000-0003-0011-000000000000")
        val processorParameter2Id = UUID.fromString("1000000-0000-0003-0012-000000000000")

        val createCodeProject = createCodeProject(userToken, codeProjectId, "code-project-visualisation", "Test DataProject", 0)

        val _dataOp = dataProcessorRepository.findByIdOrNull(dataOperationId)
            ?: dataProcessorRepository.save(DataOperation(
                id = dataOperationId, slug = "commons-lee-filter", name = "Lee filter",
                inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC, author = author,
                description = "The presence of speckle noise in Synthetic Aperture Radar (SAR) images makes the interpretation of the contents difficult, \n" +
                    "thereby degrading the quality of the image. Therefore an efficient speckle noise removal technique, the Lee Filter is used to \n" +
                    "smoothen the static-like noise present in these images",
                codeProjectId = codeProjectId))

        val dataOp = processorVersionRepository.findByIdOrNull(dataOperationId)
            ?: processorVersionRepository.save(ProcessorVersion(
                id = dataOperationId, dataProcessor = _dataOp, publisher = author,
                command = "lee_filter", number = 1, baseEnvironment = BaseEnvironment.default()))


        createMarketplaceEntry(createCodeProject, dataOp, listOf(tag2, tag3))

        val dataOp1processorParameter1 = addParam(processorParameter1Id, ProcessorParameter(processorParameter1Id, dataOp.id, "tupleParam", ParameterType.TUPLE, 0, "(1,2)"))
        val dataOp1processorParameter2 = addParam(processorParameter2Id, ProcessorParameter(processorParameter2Id, dataOp.id, "hashParam", ParameterType.DICTIONARY, 1, "{a:b}"))
        return Triple(dataOp, dataOp1processorParameter1, dataOp1processorParameter2)
    }

    @Transactional
    fun createDataAlgorithmResnet50(userToken: String, author: Subject) {
        val codeProjectId = UUID.fromString("1000000-1000-0003-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-1000-0003-0002-000000000000")
        val id1 = UUID.fromString("1000000-1000-0003-0011-000000000000")
        val id2 = UUID.fromString("1000000-1000-0003-0012-000000000000")
        val id3 = UUID.fromString("1000000-1000-0003-0013-000000000000")
        val id4 = UUID.fromString("1000000-1000-0003-0014-000000000000")
        val id5 = UUID.fromString("1000000-1000-0003-0015-000000000000")
        val id6 = UUID.fromString("1000000-1000-0003-0016-000000000000")
        val id7 = UUID.fromString("1000000-1000-0003-0017-000000000000")
        val id8 = UUID.fromString("1000000-1000-0003-0018-000000000000")
        val id9 = UUID.fromString("1000000-1000-0003-0019-000000000000")
        val id10 = UUID.fromString("1000000-1000-0003-0020-000000000000")
        val id11 = UUID.fromString("1000000-1000-0003-0021-000000000000")

        val createCodeProject = createCodeProject(userToken, codeProjectId, "code-project-resnet-50", "Resnet 50", 10)

        val _dataOp = dataAlgorithmRepository.findByIdOrNull(dataOperationId)
            ?: dataAlgorithmRepository.save(DataAlgorithm(
                id = dataOperationId,
                slug = "resnet50",
                name = "Resnet 50",
                inputDataType = DataType.IMAGE,
                outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC,
                author = author,
                description = "ResNet50 is a 50 layer Residual Network.",
                codeProjectId = codeProjectId
            ))

        val model = processorVersionRepository.findByIdOrNull(dataOperationId)
            ?: processorVersionRepository.save(ProcessorVersion(
                id = dataOperationId, dataProcessor = _dataOp, publisher = author,
                command = "resnet50", number = 1, baseEnvironment = BaseEnvironment.default()))

        createMarketplaceEntry(createCodeProject, model, listOf(tag3, tag4))

        //standard
        addParam(id1, ProcessorParameter(id1, model.id, "output-path", ParameterType.STRING, 0, ".", true))
        addParam(id2, ProcessorParameter(id2, model.id, "height", ParameterType.INTEGER, 1, "36", true))
        addParam(id3, ProcessorParameter(id3, model.id, "width", ParameterType.INTEGER, 2, "36", true))
        addParam(id4, ProcessorParameter(id4, model.id, "epochs", ParameterType.FLOAT, 3, "35", true))

        //advanced
        addParam(id5, ProcessorParameter(id5, model.id, "channels", ParameterType.INTEGER, 4, "3", false))
        addParam(id6, ProcessorParameter(id6, model.id, "use-pretrained", ParameterType.BOOLEAN, 5, "true", false))
        addParam(id7, ProcessorParameter(id7, model.id, "batch-size", ParameterType.FLOAT, 6, "0.25", false))
        addParam(id8, ProcessorParameter(id8, model.id, "validation-split", ParameterType.INTEGER, 7, "3", false))
        addParam(id9, ProcessorParameter(id9, model.id, "class_mode", ParameterType.STRING, 8, "categorical", false))
        addParam(id10, ProcessorParameter(id10, model.id, "learning-rate", ParameterType.FLOAT, 9, "0.0001", false))
        addParam(id11, ProcessorParameter(id11, model.id, "loss", ParameterType.FLOAT, 10, "0.1", false))
    }

    private fun addParam(id4: UUID, processorParameter: ProcessorParameter): ProcessorParameter {
        val findByIdOrNull = processorParameterRepository.findByIdOrNull(id4)
        return if (findByIdOrNull == null) {
            processorParameterRepository.save(processorParameter)
        } else {
            processorParameterRepository.save(processorParameter)
        }
    }

    private fun addParam(processorParameter: ProcessorParameter): ProcessorParameter {
        val findByIdOrNull = processorParameterRepository.findByIdOrNull(processorParameter.id)
        return if (findByIdOrNull == null) {
            processorParameterRepository.save(processorParameter)
        } else {
            processorParameterRepository.save(processorParameter)
        }
    }

    fun createDataAlgorithmDummy(userToken: String, author: Subject) {
        val codeProjectId = UUID.fromString("1000000-2000-0003-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-2000-0003-0002-000000000000")
        val id1 = UUID.fromString("1000000-2000-0003-0011-000000000000")
        val id2 = UUID.fromString("1000000-2000-0003-0012-000000000000")

        val createCodeProject = createCodeProject(userToken, codeProjectId, "code-project-dummy", "Dummy Pipeline Project", 11)

        val _model = dataAlgorithmRepository.findByIdOrNull(dataOperationId)
            ?: dataAlgorithmRepository.save(DataAlgorithm(
                id = dataOperationId, slug = "debug-dataprocessor", name = "Dummy debug_dataprocessor",
                inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC, author = author,
                description = "Dummy Pipeline.",
                codeProjectId = codeProjectId))

        val model = processorVersionRepository.findByIdOrNull(dataOperationId)
            ?: processorVersionRepository.save(ProcessorVersion(
                id = dataOperationId, dataProcessor = _model, publisher = author,
                command = "debug_dataprocessor", number = 1, baseEnvironment = BaseEnvironment.default()))

        createMarketplaceEntry(createCodeProject!!, model, listOf(tag1, tag4))

        addParam(id1, ProcessorParameter(id1, model.id, "epochs", ParameterType.INTEGER, 1, "10"))
        addParam(id2, ProcessorParameter(id2, model.id, "batch_size", ParameterType.INTEGER, 2, "10"))
    }

    fun createUserAndTokenInGitlab(): GitlabUser {
        val gitlabUser = try {
            gitlabRestClient.adminCreateUser(email = email, name = username, username = username, password = "password")
        } catch (clientErrorException: GitlabConflictException) {
            log.info("Already existing dev user")
            val adminGetUsers = gitlabRestClient.adminGetUsers()
            adminGetUsers.first { it.username == username }
        }

        val person = Person(subjectId, username, username, gitlabUser.id)
        val account = Account(
            id = accountId, username = username, email = email,
            gitlabId = gitlabUser.id, person = person,
            passwordEncrypted = encryptedPassword)
        accountRepository.findByIdOrNull(accountId) ?: accountRepository.save(account)
        personRepository.findByIdOrNull(person.id) ?: personRepository.save(person)

        return gitlabUser
    }

    fun createUserToken(gitlabUser: GitlabUser): AccountToken {
        val gitlabUserToken = gitlabRestClient.adminCreateUserToken(gitlabUserId = gitlabUser.id, tokenName = "user-token")
        val accountToken = AccountToken(
            id = accountTokenId, accountId = accountId,
            token = gitlabUserToken.token, gitlabId = gitlabUserToken.id,
            active = true, revoked = false)

        accountTokenRepository.findByIdOrNull(accountToken.id) ?: accountTokenRepository.save(accountToken)
        return accountToken
    }

    internal fun <T> executeLogged(message: String, f: () -> T): T {
        try {
            log.info("DataLoading: $message")
            val result = f.invoke()
            log.info("DataLoading: $message -> DONE")
            return result
        } catch (e: Exception) {
            log.error("DataLoading: $message -> FAIL (${e.message})")
            throw e
        }
    }

    internal fun <T> executeLoggedOptional(message: String, f: () -> T) {
        try {
            log.info("DataLoading: $message")
            val result = f.invoke()
            log.info("DataLoading: $message -> DONE")
            log.info("Result: $result")
        } catch (e: Exception) {
            log.warn("DataLoading: $message -> FAIL (${e.message})")
        }
    }
}


