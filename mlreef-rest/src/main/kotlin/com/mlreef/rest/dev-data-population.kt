package com.mlreef.rest

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabUser
import com.mlreef.rest.feature.auth.AuthService
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import org.springframework.web.client.HttpClientErrorException
import java.util.*
import java.util.UUID.randomUUID


@Profile(ApplicationProfiles.DEV)
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

@Profile(ApplicationProfiles.DEV)
@Component
internal class DataPopulator(
    private val authService: AuthService,
    private val gitlabRestClient: GitlabRestClient,
    val dataProjectRepository: DataProjectRepository,
    val personRepository: PersonRepository,
    val accountTokenRepository: AccountTokenRepository,
    val accountRepository: AccountRepository,
    val codeProjectRepository: CodeProjectRepository,
    val dataProcessorRepository: DataProcessorRepository,
    val dataProcessorInstanceRepository: DataProcessorInstanceRepository,
    val processorParameterRepository: ProcessorParameterRepository,
    val parameterInstanceRepository: ParameterInstanceRepository,
    val experimentRepository: ExperimentRepository
) {

    val username = "mlreef"
    val email = "mlreef@example.org"
    val encryptedPassword = "$2a$10\$YYeURJweLZlrCHKyitID6ewdQlyK4rWwRTutvtcRMgvU8DMy6rab."
    val subjectId = UUID.fromString("aaaa0000-0001-0000-0000-cccccccccccc")
    val accountId = UUID.fromString("aaaa0000-0002-0000-0000-aaaaaaaaaaaa")
    val accountTokenId = UUID.fromString("aaaa0000-0003-0000-0000-adadadadadad")

    val dataProjectId = UUID.fromString("5d005488-afb6-4a0c-852a-f471153a04b5")
    val experimentId = UUID.fromString("77481b71-8d40-4a48-9117-8d0c5129d6ec")

    val log = LoggerFactory.getLogger(this::class.java)

    fun init() {
        createUserAndTokenInGitlab()
        try {
            createDataProject()
            createCodeRepo()

            val author = personRepository.save(Person(id = randomUUID(), slug = "user-demo", name = "Author1"))

            val (dataOp1, dataOp1processorParameter1, dataOp1processorParameter2) = createDataOperation1(author)

            val (dataOp2, dataOp2processorParameter1, dataOp2processorParameter2) = createDataOperation2(author)
            createDataOperation3(author)

            val processorInstance = DataProcessorInstance(id = randomUUID(), dataProcessor = dataOp1)
            processorInstance.addParameterInstances(dataOp1processorParameter1, "value")
            processorInstance.addParameterInstances(dataOp1processorParameter2, "0.2")

            val processorInstance2 = DataProcessorInstance(id = randomUUID(), dataProcessor = dataOp2)
            processorInstance2.addParameterInstances(dataOp2processorParameter1, "value")
            processorInstance2.addParameterInstances(dataOp2processorParameter2, "0.2")

            val experiment = Experiment(
                id = experimentId, dataProjectId = dataProjectId,
                sourceBranch = "source", targetBranch = "target",

                preProcessing = arrayListOf(processorInstance, processorInstance2))

            safeSave { experimentRepository.save(experiment) }
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }

    private fun createDataProject() {
        val dataProject = DataProject(
            id = dataProjectId, slug = "test-data-project", name = "Test DataProject", ownerId = subjectId,
            url = "https://gitlab.com/mlreef/sign-language-classifier",
            gitlabProject = "sign-language-classifier", gitlabGroup = "mlreef", gitlabId = 1)
        safeSave { dataProjectRepository.save(dataProject) }
    }

    private fun createDataOperation1(author: Subject): Triple<DataOperation, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = randomUUID()
        codeProjectRepository.save(CodeProject(
            id = codeProjectId, slug = "code-project-augment", name = "Test DataProject",
            ownerId = author.id, url = "url",
            gitlabGroup = "", gitlabId = 0, gitlabProject = ""))
        val dataOp1 = DataOperation(
            id = randomUUID(), slug = "commons-augment", name = "Augment",
            command = "augment", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "Data augmentation multiplies and tweakes the data by changing angle of rotation, flipping the images, zooming in, etc.",
            codeProjectId = codeProjectId)
        dataProcessorRepository.save(dataOp1)
        val parameter1 = processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "stringParam", ParameterType.STRING))
        val parameter2 = processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp1.id, "floatParam", ParameterType.FLOAT))
        return Triple(dataOp1, parameter1, parameter2)
    }

    private fun createDataOperation2(author: Subject): Triple<DataOperation, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = randomUUID()
        codeProjectRepository.save(CodeProject(
            id = codeProjectId, slug = "code-project-random-crop", name = "Test DataProject",
            ownerId = author.id, url = "url",
            gitlabGroup = "", gitlabId = 0, gitlabProject = ""))
        val dataOp2 = DataOperation(
            id = randomUUID(), slug = "commons-random-crop", name = "Random crop",
            command = "random_crop", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "This pipeline operation randomly crops a NxM (height x width) portion of the given dataset. \n" +
                "      This is used to randomly extract parts of the image incase we need to remove bias present in image data.",
            codeProjectId = codeProjectId)

        dataProcessorRepository.save(dataOp2)
        val parameter1 = processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "height", ParameterType.INTEGER))
        val parameter2 = processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "width", ParameterType.INTEGER))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "channels", ParameterType.INTEGER, false, "3"))
        processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp2.id, "seed", ParameterType.INTEGER, false, null, "advanced"))
        return Triple(dataOp2, parameter1, parameter2)
    }

    private fun createDataOperation3(author: Subject): Triple<DataOperation, ProcessorParameter, ProcessorParameter> {
        val codeProjectId = randomUUID()
        codeProjectRepository.save(CodeProject(
            id = codeProjectId, slug = "code-project-visualisation", name = "Test DataProject",
            ownerId = author.id, url = "url",
            gitlabGroup = "", gitlabId = 0, gitlabProject = ""))
        val dataOp3 = DataOperation(
            id = randomUUID(), slug = "commons-lee-filter", name = "Lee filter",
            command = "lee_filter", inputDataType = DataType.IMAGE, outputDataType = DataType.IMAGE,
            visibilityScope = VisibilityScope.PUBLIC, author = author,
            description = "The presence of speckle noise in Synthetic Aperture Radar (SAR) images makes the interpretation of the contents difficult, \n" +
                "thereby degrading the quality of the image. Therefore an efficient speckle noise removal technique, the Lee Filter is used to \n" +
                "smoothen the static-like noise present in these images",
            codeProjectId = codeProjectId)

        dataProcessorRepository.save(dataOp3)
        val dataOp1processorParameter1 = processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "tupleParam", ParameterType.TUPLE))
        val dataOp1processorParameter2 = processorParameterRepository.save(ProcessorParameter(randomUUID(), dataOp3.id, "hashParam", ParameterType.DICTIONARY))
        return Triple(dataOp3, dataOp1processorParameter1, dataOp1processorParameter2)
    }

    private fun createCodeRepo() {
        val codeRepoId = randomUUID()
        val codeProject = CodeProject(codeRepoId, "slug", "url", ownerId = subjectId, name = "Test DataProject", gitlabGroup = "", gitlabId = 0, gitlabProject = "")
        safeSave { codeProjectRepository.save(codeProject) }
    }

    private fun createUserAndTokenInGitlab() {
        val gitlabUser = try {
            gitlabRestClient.adminCreateUser(email = email, name = username, username = username, password = "password")
        } catch (clientErrorException: HttpClientErrorException) {
            if (clientErrorException.rawStatusCode == 409) {
                log.info("Already existing dev user")
                val adminGetUsers = gitlabRestClient.adminGetUsers()
                adminGetUsers.first { it.username == username }
            } else {
                log.error("Major Gitlab issues:", clientErrorException)
                throw clientErrorException
            }
        }

        val person = Person(subjectId, username, username)
        val account = Account(
            id = accountId, username = username, email = email,
            gitlabId = gitlabUser.id, person = person,
            passwordEncrypted = encryptedPassword, tokens = arrayListOf())
        safeSave { accountRepository.save(account) }
        safeSave { personRepository.save(person) }

        createUserToken(gitlabUser)

    }

    private fun createUserToken(gitlabUser: GitlabUser) {
        val gitlabUserToken = gitlabRestClient.adminCreateUserToken(gitlabUserId = gitlabUser.id, tokenName = "user-token")
        val accountToken = AccountToken(
            id = accountTokenId, accountId = accountId,
            token = gitlabUserToken.token, gitlabId = gitlabUserToken.id,
            active = true, revoked = false)

        safeSave { accountTokenRepository.save(accountToken) }
    }

    internal fun safeSave(f: () -> Unit) {
        try {
            f.invoke()
        } catch (e: Exception) {
            log.warn("Savely catched error: ${e}")
            e.printStackTrace()
        }
    }
}


