package com.mlreef.rest

import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.feature.data_processors.InitialDataLoader
import com.mlreef.rest.feature.marketplace.MarketplaceService
import com.mlreef.rest.feature.project.ProjectService
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.Arrays
import java.util.UUID
import java.util.UUID.fromString

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
    val marketplaceService: MarketplaceService,
    val initialDataLoader: InitialDataLoader
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

            //
            log.info("2. ENSURE COMMON DATA EXISTS")
            initialMLData(author, token)


            val augment = processorVersionRepository.findByIdOrNull(fromString("1000000-0000-0001-0002-000000000000"))
                ?: throw IllegalStateException("Operation augment does not exist!")
            val augment2 = dataProcessorRepository.findByIdOrNull(fromString("1000000-0000-0001-0002-000000000000"))
            val augment_param1 = processorParameterRepository.findByIdOrNull(fromString("1000000-0000-0001-0011-000000000000"))
                ?: throw IllegalStateException("Operation augment does not have param 1!")

            val augment_param2 = processorParameterRepository.findByIdOrNull(fromString("1000000-0000-0001-0012-000000000000"))
                ?: throw IllegalStateException("Operation augment does not have param 2!")

            val randomCrop = processorVersionRepository.findByIdOrNull(fromString("1000000-0000-0002-0002-000000000000"))
                ?: throw IllegalStateException("Operation randomCrop does not exist!")
            val randomCrop2 = dataProcessorRepository.findByIdOrNull(fromString("1000000-0000-0001-0002-000000000000"))
            val randomCrop_param1 = processorParameterRepository.findByIdOrNull(fromString("1000000-0000-0002-0011-000000000000"))
                ?: throw IllegalStateException("Operation randomCrop does not have param 1!")

            val randomCrop_param2 = processorParameterRepository.findByIdOrNull(fromString("1000000-0000-0002-0012-000000000000"))
                ?: throw IllegalStateException("Operation randomCrop does not have param 2!")


            // Create DEMO DATA
            executeLoggedOptional("4. DEMO DATA: Create example DataProject & Experiment") {
                createDataProject(token)
            }

            executeLoggedOptional("5. DEMO DATA:  Create example Experiment") {
                createExperiment(
                    augment, augment_param1, augment_param2,
                    randomCrop, randomCrop_param1, randomCrop_param2)
            }
        } catch (e: Exception) {
            log.error("####################################################")
            log.error("Could not run Initial Dev/Docker Test Setup properly")
            log.error("####################################################", e)
        }
    }

    fun initialMLData(author: Subject, token: String) {
        val buildContext = initialDataLoader.prepare(author, token)
        buildContext.mergeSaveEverything(
            restClient = gitlabRestClient,
            codeProjectRepository = codeProjectRepository,
            dataProcessorRepository = dataProcessorRepository,
            processorVersionRepository = processorVersionRepository
        )
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
            val projects = gitlabRestClient.adminGetProjects()
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


