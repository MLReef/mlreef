package com.mlreef.rest.feature.processors

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.api.v1.ProjectCreateRequest
import com.mlreef.rest.api.v1.ProjectUpdateRequest
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Person
import com.mlreef.rest.domain.UserRole
import com.mlreef.rest.exceptions.BadParametersException
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.utils.RandomUtils
import com.mlreef.rest.utils.too
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.core.io.support.ResourcePatternResolver
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.concurrent.atomic.AtomicBoolean
import javax.annotation.PostConstruct
import javax.persistence.EntityManagerFactory

@Service
class DataSetup(
    private val gitlabRestClient: GitlabRestClient,
    private val patternResolver: ResourcePatternResolver,
    @Value("\${mlreef.init-data.enabled:false}")
    private val enabled: Boolean,
    @Value("\${mlreef.init-data.path:/}")
    private val path: String,
    @Value("\${mlreef.init-data.command-separators}")
    private val separator: String,
    @Value("\${mlreef.init-data.owner-username:\"\"}")
    private val username: String,
    @Value("\${mlreef.init-data.owner-email:\"\"}")
    private val email: String,
    @Value("\${mlreef.init-data.owner-password:\"\"}")
    private val password: String,
    @Value("\${mlreef.init-data.owner-subject-id:\"\"}")
    private val subjectIdStr: String,
    @Value("\${mlreef.init-data.owner-account-id:\"\"}")
    private val accountIdStr: String,
    val emf: EntityManagerFactory,
    val objectMapper: ObjectMapper,
    private val dataProjectService: ProjectService<DataProject>,
    private val codeProjectService: ProjectService<CodeProject>,
    private val personRepository: PersonRepository,
    private val accountRepository: AccountRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    private lateinit var resourcesToLoad: Array<Resource>

    private val DATA_PROJECTS_FILE_NAME = "data_project"
    private val CODE_PROJECTS_FILE_NAME = "code_project"
    private val CREATE_SCRIPT_PREFIX = "create"
    private val UPDATE_SCRIPT_PREFIX = "update"
    private val DELETE_SCRIPT_PREFIX = "delete"

    private lateinit var gitlabUser: GitlabUser
    private lateinit var devPerson: Person
    private var gitlabToken: OAuthToken? = null
    private val needToDeleteUser: AtomicBoolean = AtomicBoolean(false)

    val logger: Logger = LoggerFactory.getLogger(this::class.java)

    @PostConstruct
    fun init() {
        if (enabled) {
            resourcesToLoad = patternResolver.getResources(path)
            executeInitDataLoad()
        }
    }

    fun executeInitDataLoad() {
        val (user, person, userPassword) = findOrCreateUserInGitlab()

        gitlabUser = user
        devPerson = person

        gitlabToken = try {
            createUserTokenInGitlab(gitlabUser.username, userPassword)
        } catch (ex: Exception) {
            logger.error("Cannot get token in Gitlab. Possible password of user $username is incorrect. Exception: ${ex.message}")
            null
        }

        val loadedScripts = resourcesToLoad
            .filter { it.exists() && it.isFile }
            .map { (it.filename ?: UUID.randomUUID().toString()).trim() to String(it.inputStream.readBytes()) }
            .toMap()

        val sortedFileNames = loadedScripts.keys.sortedBy {
            val idx = it.indexOf("_")
            val num = it.substring(0, idx)
            num.substring(1).toInt()
        }

        sortedFileNames.forEach {
            val scriptCode = loadedScripts[it]!!
            if (it.endsWith(".sql")) {
                try {
                    processSqlScript(scriptCode)
                } catch (ex: Exception) {
                    logger.error("Cannot process sql file ${it}: $ex")
                }
            } else if (it.endsWith(".json")) {
                try {
                    processJsonScript(it, scriptCode)
                } catch (ex: Exception) {
                    logger.error("Cannot process json file $it: $ex")
                }
            }
        }
    }

    private fun processSqlScript(script: String) {
        val splitedCommands = script
            .split(separator ?: System.lineSeparator())
            .map { it.trim() }
            .filter { it.isNotEmpty() }

        val em = emf.createEntityManager()

        splitedCommands.forEach {
            try {
                em.transaction.begin()
                val query = em.createNativeQuery(it.replace(":", "\\:"))
                query.executeUpdate()
                em.transaction.commit()
            } catch (ex: Exception) {
                logger.error("Cannot update DB: $ex")
                if (em.transaction.isActive)
                    em.transaction.rollback()
            }
        }
    }

    private fun processJsonScript(fileName: String, script: String) {
        if (gitlabToken == null) {
            logger.warn("OAuth token for user $username was not optained from Gitlab. No json files can be processed and loaded. Skipping $fileName")
            return
        }
        if (fileName.contains(DATA_PROJECTS_FILE_NAME)) {
            if (fileName.contains(CREATE_SCRIPT_PREFIX)) {
                createDataProjects(script)
            } else if (fileName.contains(UPDATE_SCRIPT_PREFIX)) {
                updateDataProjects(script)
            } else if (fileName.contains(DELETE_SCRIPT_PREFIX)) {
                deleteDataProjects(script)
            }
        } else if (fileName.contains(CODE_PROJECTS_FILE_NAME)) {
            if (fileName.contains(CREATE_SCRIPT_PREFIX)) {
                createCodeProjects(script)
            } else if (fileName.contains(UPDATE_SCRIPT_PREFIX)) {
                updateCodeProjects(script)
            } else if (fileName.contains(DELETE_SCRIPT_PREFIX)) {
                deleteCodeProjects(script)
            }
        }
    }

    private fun createDataProjects(script: String) {
        val dataProjects = objectMapper.readValue(script, object : TypeReference<List<ProjectCreateRequest>>() {})
        logger.info("${dataProjects?.size ?: 0} data projects loaded for creation")
        dataProjects.forEach {
            try {
                dataProjectService.createProject(
                    gitlabToken!!.accessToken,
                    devPerson.id,
                    it.slug,
                    it.name,
                    it.namespace,
                    it.description,
                    it.visibility,
                    it.initializeWithReadme,
                    it.inputDataTypes,
                    id = it.id,
                )
            } catch (ex: Exception) {
                logger.error("Cannot create data project.Exception: $ex")
            }
        }
    }

    private fun updateDataProjects(script: String) {
        val dataProjects = objectMapper.readValue(script, object : TypeReference<List<ProjectUpdateRequest>>() {})
        logger.info("${dataProjects?.size ?: 0} data projects loaded for update")
        dataProjects.forEach {
            try {
                dataProjectService.updateProject(
                    gitlabToken!!.accessToken,
                    devPerson.id,
                    it.id ?: throw BadParametersException("Incorrect script for project ${it.name}. No id is provided"),
                    it.name,
                    it.description,
                    it.visibility,
                    it.inputDataTypes,
                    null,
                    it.tags
                )
            } catch (ex: Exception) {
                logger.error("Cannot create data project.Exception: $ex")
            }
        }
    }

    private fun deleteDataProjects(script: String) {
        val splitedIds = script
            .split(System.lineSeparator())
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .filterNot { it.startsWith("//") }

        splitedIds.forEach {
            try {
                val currentId = it.tryToUUID()
                val currentName = if (currentId != null) null else it
                dataProjectService.deleteProject(
                    gitlabToken!!.accessToken,
                    devPerson.id,
                    currentId,
                    currentName,
                )
            } catch (ex: Exception) {
                logger.error("Cannot create data project.Exception: $ex")
            }
        }
    }

    private fun createCodeProjects(script: String) {
        val codeProjects = objectMapper.readValue(script, object : TypeReference<List<ProjectCreateRequest>>() {})
        logger.info("${codeProjects?.size ?: 0} code projects loaded")
        codeProjects.forEach {
            try {
                codeProjectService.createProject(
                    gitlabToken!!.accessToken,
                    devPerson.id,
                    it.slug,
                    it.name,
                    it.namespace,
                    it.description,
                    it.visibility,
                    it.initializeWithReadme,
                    it.inputDataTypes,
                    it.outputDataTypes,
                    it.dataProcessorType,
                    id = it.id
                )
            } catch (ex: Exception) {
                logger.error("Cannot create code project.Exception: $ex")
            }
        }
    }

    private fun updateCodeProjects(script: String) {
        val codeProjects = objectMapper.readValue(script, object : TypeReference<List<ProjectUpdateRequest>>() {})
        logger.info("${codeProjects?.size ?: 0} code projects loaded")
        codeProjects.forEach {
            try {
                codeProjectService.updateProject(
                    gitlabToken!!.accessToken,
                    devPerson.id,
                    it.id ?: throw BadParametersException("Incorrect script for project ${it.name}. No id is provided"),
                    it.name,
                    it.description,
                    it.visibility,
                    it.inputDataTypes,
                    it.outputDataTypes,
                    it.tags,
                )
            } catch (ex: Exception) {
                logger.error("Cannot create code project.Exception: $ex")
            }
        }
    }

    private fun deleteCodeProjects(script: String) {
        val splitedIds = script
            .split(System.lineSeparator())
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .filterNot { it.startsWith("//") }

        splitedIds.forEach {
            try {
                val currentId = it.tryToUUID()
                val currentName = if (currentId != null) null else it
                codeProjectService.deleteProject(
                    gitlabToken!!.accessToken,
                    devPerson.id,
                    currentId,
                    currentName,
                )
            } catch (ex: Exception) {
                logger.error("Cannot create data project.Exception: $ex")
            }
        }
    }

    private fun findOrCreateUserInGitlab(): Triple<GitlabUser, Person, String> {
        val finalUserName = if (username.isBlank()) {
            needToDeleteUser.set(true)
            RandomUtils.generateRandomUserName(10)
        } else {
            needToDeleteUser.set(false)
            username
        }

        val finalEmail = if (email.isBlank()) "$finalUserName@mlreef.com" else email
        val finalPassword = if (password.isBlank()) RandomUtils.generateRandomPassword(25, true) else password

        val encryptedPassword = passwordEncoder.encode(finalPassword)
        val subjectId = subjectIdStr.tryToUUID() ?: UUID.randomUUID()
        val accountId = accountIdStr.tryToUUID() ?: UUID.randomUUID()

        val gitlabUser = try {
            gitlabRestClient.adminCreateUser(email = finalEmail, name = finalUserName, username = finalUserName, password = finalPassword)
        } catch (clientErrorException: ConflictException) {
            logger.info("Already existing user $finalUserName")
            gitlabRestClient.adminGetUsers(username = finalUserName).firstOrNull { it.username == finalUserName }
                ?: gitlabRestClient.adminGetUsers(searchNameEmail = finalEmail).firstOrNull { it.username == finalUserName }
                ?: throw IllegalStateException("Cannot create AND cannot find user $finalUserName!")
        }

        val person = personRepository.findByName(finalUserName)
            ?: personRepository.save(
                Person(
                    subjectId,
                    finalUserName,
                    finalUserName,
                    gitlabUser.id,
                    hasNewsletters = false, userRole = UserRole.ML_ENGINEER, termsAcceptedAt = null
                )
            )

        accountRepository.findOneByUsername(finalUserName)
            ?: accountRepository.save(
                Account(
                    id = accountId,
                    username = finalUserName,
                    email = finalEmail,
                    person = person,
                    passwordEncrypted = encryptedPassword
                )
            )

        return gitlabUser to person too finalPassword
    }

    fun createUserTokenInGitlab(userName: String, userPassword: String): OAuthToken {
        return gitlabRestClient.userLoginOAuthToGitlab(userName, userPassword)
    }
}