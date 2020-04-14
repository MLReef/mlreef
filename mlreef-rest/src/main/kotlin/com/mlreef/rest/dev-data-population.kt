package com.mlreef.rest

import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.project.DataProjectService
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import java.util.Arrays
import java.util.UUID
import javax.transaction.Transactional

@Profile(value = ["!" + ApplicationProfiles.TEST])
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

@Profile(value = ["!" + ApplicationProfiles.TEST])
@Component
internal class DataPopulator(
    private val gitlabRestClient: GitlabRestClient,
    val dataProjectRepository: DataProjectRepository,
    val dataProjectService: DataProjectService,
    val personRepository: PersonRepository,
    val accountTokenRepository: AccountTokenRepository,
    val accountRepository: AccountRepository,
    val codeProjectRepository: CodeProjectRepository,
    val dataProcessorRepository: DataProcessorRepository,
    val processorParameterRepository: ProcessorParameterRepository,
    val experimentRepository: ExperimentRepository
) {

    val username = "mlreef"
    val email = "mlreef@example.org"
    val encryptedPassword = "$2a$10\$YYeURJweLZlrCHKyitID6ewdQlyK4rWwRTutvtcRMgvU8DMy6rab."
    val subjectId = UUID.fromString("aaaa0000-0001-0000-0000-cccccccccccc")
    val accountId = UUID.fromString("aaaa0000-0002-0000-0000-aaaaaaaaaaaa")
    val accountTokenId = UUID.fromString("aaaa0000-0003-0000-0000-adadadadadad")

    val authorId = UUID.fromString("5d005488-afb6-4a0c-852a-f471153a1234")
    val dataProjectId = UUID.fromString("5d005488-afb6-4a0c-852a-f471153a04b5")
    val experimentId = UUID.fromString("77481b71-8d40-4a48-9117-8d0c5129d6ec")

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

            val entity = Person(id = authorId, slug = "user-demo", name = "Author1", gitlabId = gitlabUser.id)
            val author = personRepository.findByIdOrNull(entity.id) ?: personRepository.save(entity)

            val (dataOp1,
                dataOp1processorParameter1,
                dataOp1processorParameter2) = executeLogged("2a. Create DataOperation: Augment") {
                createDataOperation1(token, author)
            }
            val (dataOp2,
                dataOp2processorParameter1,
                dataOp2processorParameter2) = executeLogged("2b. Create DataOperation: Random crop") {
                createDataOperation2(token, author)
            }
            executeLogged("2c. Create DataOperation: Lee Filter") {
                createDataOperation3(token, author)
            }

            executeLogged("3. Create example DataProject & Experiment") {
                createDataProject(token)
            }

            executeLogged("4. Create example Experiment") {
                createExperiment(dataOp1, dataOp1processorParameter1, dataOp1processorParameter2, dataOp2, dataOp2processorParameter1, dataOp2processorParameter2)
            }
        } catch (e: Exception) {
            log.error("####################################################")
            log.error("Could not run Initial Dev/Docker Test Setup properly")
            log.error("####################################################", e)
        }
    }

    @Transactional
    fun createExperiment(dataOp1: DataOperation, dataOp1processorParameter1: ProcessorParameter, dataOp1processorParameter2: ProcessorParameter, dataOp2: DataOperation, dataOp2processorParameter1: ProcessorParameter, dataOp2processorParameter2: ProcessorParameter): Experiment {
        val processorInstance = DataProcessorInstance(id = UUID.fromString("5d005488-afb6-4a0c-0031-f471153a04b5"), dataProcessor = dataOp1)
        processorInstance.addParameterInstances(dataOp1processorParameter1, "value")
        processorInstance.addParameterInstances(dataOp1processorParameter2, "0.2")

        val processorInstance2 = DataProcessorInstance(id = UUID.fromString("5d005488-afb6-4a0c-0032-f471153a04b5"), dataProcessor = dataOp2)
        processorInstance2.addParameterInstances(dataOp2processorParameter1, "value")
        processorInstance2.addParameterInstances(dataOp2processorParameter2, "0.2")

        val experiment = Experiment(
            id = experimentId, dataProjectId = dataProjectId,
            sourceBranch = "source", targetBranch = "target",
            preProcessing = arrayListOf(processorInstance, processorInstance2))
        return experimentRepository.findByIdOrNull(experiment.id) ?: experimentRepository.save(experiment)
    }

    fun createDataProject(userToken: String) {
        val projectSlug = "sign-language-classifier"
        val gitLabProject: GitlabProject = try {
            gitlabRestClient.createProject(
                token = userToken,
                slug = projectSlug,
                name = "Sign Language Classifier Repo",
                defaultBranch = "master",
                nameSpaceId = null)

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
            ownerId = accountId,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabGroup = group,
            gitlabId = gitLabProject.id
        )

        dataProjectRepository.findByIdOrNull(dataProject.id) ?: dataProjectRepository.save(dataProject)
    }

    fun createCodeProject(userToken: String, codeProjectId: UUID, projectSlug: String, name: String, gitlabId: Int): CodeProject {
        val findByIdOrNull = codeProjectRepository.findByIdOrNull(codeProjectId)

        if (findByIdOrNull != null) {
            return findByIdOrNull
        }

        val gitLabProject: GitlabProject = try {
            gitlabRestClient.createProject(
                token = userToken,
                slug = projectSlug,
                name = "Testproject $projectSlug",
                defaultBranch = "master",
                nameSpaceId = null)

        } catch (e: Exception) {
            val projects = gitlabRestClient.getProjects(userToken)
            projects.first { it.path == projectSlug }
        }

        val pathWithNamespace = gitLabProject.pathWithNamespace
        val group = pathWithNamespace.split("/")[0]
        val codeProject = CodeProject(
            id = dataProjectId,
            slug = gitLabProject.path,
            ownerId = subjectId,
            url = gitLabProject.webUrl,
            name = gitLabProject.name,
            gitlabProject = gitLabProject.path,
            gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
            gitlabGroup = group,
            gitlabId = gitLabProject.id
        )

        return codeProjectRepository.findByIdOrNull(codeProject.id) ?: codeProjectRepository.save(codeProject)
    }

    fun createDataOperation1(userToken: String, author: Subject): Triple<DataOperation, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = UUID.fromString("1000000-0000-0001-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-0000-0001-0002-000000000000")
        val processorParameter1Id = UUID.fromString("1000000-0000-0001-0011-000000000000")
        val processorParameter2Id = UUID.fromString("1000000-0000-0001-0012-000000000000")

        createCodeProject(userToken, codeProjectId, "code-project-augment", "Test DataProject 2", 0)

        val dataOp1 = dataProcessorRepository.findByIdOrNull(dataOperationId)
            ?: dataProcessorRepository.save(DataOperation(
                id = dataOperationId, slug = "commons-augment", name = "Augment",
                command = "augment", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC, author = author,
                description = "Data augmentation multiplies and tweakes the data by changing angle of rotation, flipping the images, zooming in, etc.",
                codeProjectId = codeProjectId))

        val parameter1 = processorParameterRepository.findByIdOrNull(processorParameter1Id)
            ?: processorParameterRepository.save(ProcessorParameter(UUID.fromString("5d005488-afb6-4a0c-0002-f471153a04b5"), dataOp1.id, "stringParam", ParameterType.STRING, 0, ""))
        val parameter2 = processorParameterRepository.findByIdOrNull(processorParameter2Id)
            ?: processorParameterRepository.save(ProcessorParameter(UUID.fromString("5d005488-afb6-4a0c-0003-f471153a04b5"), dataOp1.id, "floatParam", ParameterType.FLOAT, 1, "0.1"))

        return Triple(dataOp1 as DataOperation, parameter1, parameter2)
    }

    fun createDataOperation2(userToken: String, author: Subject): Triple<DataOperation, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = UUID.fromString("1000000-0000-0002-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-0000-0002-0002-000000000000")
        val processorParameter1Id = UUID.fromString("1000000-0000-0002-0011-000000000000")
        val processorParameter2Id = UUID.fromString("1000000-0000-0002-0012-000000000000")
        val processorParameter3Id = UUID.fromString("1000000-0000-0002-0013-000000000000")
        val processorParameter4Id = UUID.fromString("1000000-0000-0002-0014-000000000000")

        createCodeProject(userToken, codeProjectId, "code-project-random-crop", "Test DataProject", 0)

        val dataOp2 = dataProcessorRepository.findByIdOrNull(dataOperationId)
            ?: dataProcessorRepository.save(DataOperation(
                id = dataOperationId, slug = "commons-random-crop", name = "Random crop",
                command = "random_crop", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC, author = author,
                description = "This pipeline operation randomly crops a NxM (height x width) portion of the given dataset. \n" +
                    "      This is used to randomly extract parts of the image incase we need to remove bias present in image data.",
                codeProjectId = codeProjectId))

        val parameter1 = processorParameterRepository.findByIdOrNull(processorParameter1Id)
            ?: processorParameterRepository.save(ProcessorParameter(processorParameter1Id, dataOp2.id, "height", ParameterType.INTEGER, 0, "35"))
        val parameter2 = processorParameterRepository.findByIdOrNull(processorParameter2Id)
            ?: processorParameterRepository.save(ProcessorParameter(processorParameter2Id, dataOp2.id, "width", ParameterType.INTEGER, 1, "35"))
        processorParameterRepository.findByIdOrNull(processorParameter3Id)
            ?: processorParameterRepository.save(ProcessorParameter(processorParameter3Id, dataOp2.id, "channels", ParameterType.INTEGER, 0, "3", false))
        processorParameterRepository.findByIdOrNull(processorParameter4Id)
            ?: processorParameterRepository.save(ProcessorParameter(processorParameter4Id, dataOp2.id, "seed", ParameterType.INTEGER, 1, "3", false, "advanced"))

        return Triple(dataOp2 as DataOperation, parameter1, parameter2)
    }

    fun createDataOperation3(userToken: String, author: Subject): Triple<DataOperation, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = UUID.fromString("1000000-0000-0003-0001-000000000000")
        val dataOperationId = UUID.fromString("1000000-0000-0003-0002-000000000000")
        val processorParameter1Id = UUID.fromString("1000000-0000-0003-0011-000000000000")
        val processorParameter2Id = UUID.fromString("1000000-0000-0003-0012-000000000000")

        createCodeProject(userToken, codeProjectId, "code-project-visualisation", "Test DataProject", 0)

        val dataOp3 = dataProcessorRepository.findByIdOrNull(dataOperationId)
            ?: dataProcessorRepository.save(DataOperation(
                id = dataOperationId, slug = "commons-lee-filter", name = "Lee filter",
                command = "lee_filter", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
                visibilityScope = VisibilityScope.PUBLIC, author = author,
                description = "The presence of speckle noise in Synthetic Aperture Radar (SAR) images makes the interpretation of the contents difficult, \n" +
                    "thereby degrading the quality of the image. Therefore an efficient speckle noise removal technique, the Lee Filter is used to \n" +
                    "smoothen the static-like noise present in these images",
                codeProjectId = codeProjectId))

        val dataOp1processorParameter1 = processorParameterRepository.findByIdOrNull(processorParameter1Id)
            ?: processorParameterRepository.save(ProcessorParameter(processorParameter1Id, dataOp3.id, "tupleParam", ParameterType.TUPLE, 0, "(1,2)"))
        val dataOp1processorParameter2 = processorParameterRepository.findByIdOrNull(processorParameter2Id)
            ?: processorParameterRepository.save(ProcessorParameter(processorParameter2Id, dataOp3.id, "hashParam", ParameterType.DICTIONARY, 1, "{a:b}"))
        return Triple(dataOp3 as DataOperation, dataOp1processorParameter1, dataOp1processorParameter2)
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
            passwordEncrypted = encryptedPassword, tokens = arrayListOf())
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
            log.warn("DataLoading: $message -> FAIL (${e.message})")
            throw e
        }
    }
}


