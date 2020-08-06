package com.mlreef.rest.feature.auth

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProject
import com.mlreef.rest.I18N
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabConnectException
import com.mlreef.rest.exceptions.IncorrectCredentialsException
import com.mlreef.rest.exceptions.NotConsistentInternalDb
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.exceptions.UnknownUserException
import com.mlreef.rest.exceptions.UserAlreadyExistsException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.external_api.gitlab.dto.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.feature.email.EmailMessageType
import com.mlreef.rest.feature.email.EmailService
import com.mlreef.rest.feature.email.EmailVariables
import com.mlreef.rest.feature.email.TemplateType
import com.mlreef.rest.feature.groups.GroupsService
import com.mlreef.rest.feature.project.ProjectService
import com.mlreef.rest.utils.RandomUtils
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.client.ResourceAccessException
import java.util.UUID
import java.util.UUID.randomUUID
import javax.transaction.Transactional


@Service("authService")
class AuthService(
    private val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository,
    private val personRepository: PersonRepository,
    private val accountTokenRepository: AccountTokenRepository,
    private val groupService: GroupsService,
    private val passwordEncoder: PasswordEncoder,
    private val dataProjectsService: ProjectService<DataProject>,
    private val codeProjectsService: ProjectService<CodeProject>,
    private val emailService: EmailService
) {

    @Value("\${mlreef.bot-management.epf-bot-email-domain:\"\"}")
    private val botEmailDomain: String = ""

    @Value("\${mlreef.bot-management.epf-bot-password-length}")
    private val botPasswordLength: Int = 0

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)

        private val GUEST_ACCOUNT_ID = UUID(0L, 0L)
        private val GUEST_PERSON_ID = UUID(0L, 0L)
        private val GITLAB_TOKEN_USER = "mlreef-user-token"
        private val GITLAB_TOKEN_BOT = "mlreef-bot-token"

        private const val WELCOME_MESSAGE_SUBJECT = "Welcome to MlReef"

        private val guestTokenDetails: TokenDetails by lazy {
            TokenDetails(
                username = "",
                accessToken = "",
                accountId = GUEST_ACCOUNT_ID,
                personId = GUEST_PERSON_ID,
                gitlabUser = null,
                valid = (true),
                isVisitor = true
            )
        }
    }

    fun loginUser(plainPassword: String, username: String?, email: String?): Pair<Account, OAuthToken> {
        val byUsername: Account? = if (username != null) accountRepository.findOneByUsername(username) else null
        val byEmail: Account? = if (email != null) accountRepository.findOneByEmail(email) else null

        val found: List<Account> = listOfNotNull(byUsername, byEmail).filter { account ->
            passwordEncoder.matches(plainPassword, account.passwordEncrypted)
        }

        val account = found.getOrNull(0) ?: throw IncorrectCredentialsException("username or password is incorrect")

        val oauthToken = gitlabRestClient.userLoginOAuthToGitlab(account.username, plainPassword)
        val accountUpdate = account.copy(lastLogin = I18N.dateTime())
        val loggedAccount = accountRepository.save(accountUpdate)

        return Pair(loggedAccount, oauthToken)
    }

    @Transactional
    fun registerUser(plainPassword: String, username: String, email: String): Pair<Account, OAuthToken?> {
        val encryptedPassword = passwordEncoder.encode(plainPassword)
        val byUsername: Account? = accountRepository.findOneByUsername(username)
        val byEmail: Account? = accountRepository.findOneByEmail(email)

        if (listOfNotNull(byUsername, byEmail).isNotEmpty()) {
            throw UserAlreadyExistsException(username, email)
        }

        val newGitlabUser = createOrFindGitlabUser(username = username, email = email, password = plainPassword)
        val newGitlabToken = createGitlabToken(newGitlabUser)

        val oauthToken = gitlabRestClient.userLoginOAuthToGitlab(username, plainPassword)
        val token = newGitlabToken.token

        val accountUuid = randomUUID()

        val person = Person(id = randomUUID(), slug = username, name = username, gitlabId = newGitlabUser.id)
        val newUser = Account(id = accountUuid, username = username, email = email, passwordEncrypted = encryptedPassword, person = person, gitlabId = null)

        accountRepository.save(newUser)

        sendWelcomeMessage(newUser)

        return Pair(newUser, oauthToken)
    }

    private fun sendWelcomeMessage(account: Account) {
        val variables = mapOf(
            EmailVariables.USER_NAME to account.username,
            EmailVariables.RECIPIENT_EMAIL to account.email,
            EmailVariables.SUBJECT to WELCOME_MESSAGE_SUBJECT
        )
        emailService.sendAsync(account.id, EmailMessageType.HTML, TemplateType.PASSWORD_RESET_TEMPLATE, variables)
    }

    fun checkUserInGitlab(token: String): GitlabUser {
        if (token.length < 30) {
            return gitlabRestClient.getUser(token)
        } else {
            val oauthTokenInfo = gitlabRestClient.userCheckOAuthTokenInGitlab(token)
            val account = accountRepository.findAccountByGitlabId(oauthTokenInfo.resourceOwnerId)
                ?: throw UserNotFoundException(gitlabId = oauthTokenInfo.resourceOwnerId)
            return gitlabRestClient.getUser(token)
        }
    }

    @Transactional
    fun changePasswordForUser(account: Account, newPassword: String): Boolean {
        gitlabRestClient.adminResetUserPassword(
            account.person.gitlabId ?: throw UnknownUserException("User is not connected to Gitlab"),
            newPassword)

        val passwordEncrypted = passwordEncoder.encode(newPassword)

        accountRepository.save(
            account.copy(passwordEncrypted = passwordEncrypted)
        )

        return true
    }

    fun findGitlabUserViaToken(token: String): GitlabUser {
        return try {
            gitlabRestClient.getUser(token)
        } catch (e: ResourceAccessException) {
            throw GitlabConnectException(e.message ?: "Cannot execute gitlabRestClient.getUser")
        } catch (e: Exception) {
            log.error(e.message, e)
            throw ConflictException(ErrorCode.GitlabUserNotExisting, "Cannot find Gitlab user with this token ${token.censor()}")
        }
    }

    fun findGitlabUserViaGitlabId(id: Long): GitlabUser {
        return try {
            gitlabRestClient.adminGetUserById(id)
        } catch (e: ResourceAccessException) {
            throw GitlabConnectException(e.message ?: "Cannot execute gitlabRestClient.getUser")
        } catch (e: Exception) {
            log.error(e.message, e)
            throw UserNotFoundException(gitlabId = id)
        }
    }

    fun createOrFindGitlabUser(username: String, email: String, password: String): GitlabUser {
        return try {
            val gitlabName = "mlreef-user-$username"
            log.info("Create user ${username}")
            gitlabRestClient.adminCreateUser(email = email, name = gitlabName, username = username, password = password)
        } catch (clientErrorException: RestException) {
            log.info("Already existing dev user. Error message: ${clientErrorException.message}")
            val adminGetUsers = gitlabRestClient.adminGetUsers()
            adminGetUsers.filter { it.username == username }.firstOrNull()
                ?: throw UnknownUserException("User not found!")
        }
    }

    private fun createGitlabToken(gitlabUser: GitlabUser): GitlabUserToken {
        val gitlabUserId = gitlabUser.id
        log.info("Create new Token for user ${gitlabUser.username}")
        return gitlabRestClient.adminCreateUserToken(gitlabUserId = gitlabUserId, tokenName = GITLAB_TOKEN_BOT)
    }

    fun ensureGitlabToken(account: Account, gitlabUser: GitlabUser): GitlabUserToken? {
        val gitlabUserId = gitlabUser.id
        val username = gitlabUser.username
        val gitlabTokens = gitlabRestClient.adminGetUserTokens(gitlabUserId = gitlabUserId)

        val savedTokens = accountTokenRepository.findAllByAccountId(account.id)
        var mustCreateNow = true
        val matchingGitlabTokens = gitlabTokens.filter { it.name == GITLAB_TOKEN_BOT }

        if (matchingGitlabTokens.isNotEmpty()) {
            val first = matchingGitlabTokens.first()
            val matchingSavedTokens = savedTokens.filter { it.gitlabId == first.id }
            if (matchingSavedTokens.isNotEmpty()) {
                mustCreateNow = false
            }
        }
        return if (mustCreateNow) {
            val token = createGitlabToken(gitlabUser)
            token
        } else {
            log.debug("Gitlab user $username already has a token: secret  ${matchingGitlabTokens.first().token}")
            log.warn("Token not freshly created, so no secret token will be available!")
            null
        }
    }

    fun createTokenDetails(token: String, account: Account, gitlabUser: GitlabUser): TokenDetails {
        var tokenDetails = TokenDetails(
            username = account.username,
            accessToken = token,
            accountId = account.id,
            personId = account.person.id,
            gitlabUser = gitlabUser,
            valid = true,
            isVisitor = false
        )

        tokenDetails = injectGitlabInfoIntoTokenDetails(tokenDetails, account)

        return tokenDetails
    }

    private fun injectGitlabInfoIntoTokenDetails(tokenDetails: TokenDetails, account: Account): TokenDetails {
        tokenDetails.groups.putAll(groupService.getUserGroupsList(tokenDetails.accessToken, account.person.id).map { Pair(it.id, it.accessLevel) })
        tokenDetails.projects.putAll(dataProjectsService.getUserProjectsList(tokenDetails.accessToken, account.id).map { Pair(it.id, it.accessLevel) })
        tokenDetails.projects.putAll(codeProjectsService.getUserProjectsList(tokenDetails.accessToken, account.id).map { Pair(it.id, it.accessLevel) })
        return tokenDetails
    }

    fun createGuestDetails() = guestTokenDetails

    fun findAccountByToken(token: String): Account {
        val tokenInDb = accountTokenRepository.findOneByToken(token)

        if (tokenInDb != null) {
            return accountRepository.findByIdOrNull(tokenInDb.accountId)
                ?: throw BadCredentialsException("Token not attached to a Account in Database")
        } else {
            return findUserInGitlabAndCreateInternally(token)
        }
    }

    fun findAccountByGitlabId(gitlabId: Long): Account? {
        return accountRepository.findAccountByGitlabId(gitlabId)
    }

    fun findAccountById(id: UUID): Account? {
        return accountRepository.findByIdOrNull(id)
    }

    fun findAccountByUsername(username: String): Account? {
        return accountRepository.findOneByUsername(username)
    }

    @Transactional
    fun findUserInGitlabAndCreateInternally(permanentToken: String): Account {
        val gitlabUser = findGitlabUserViaToken(permanentToken)
        var person = personRepository.findByName(gitlabUser.username)
        var accountToken = accountTokenRepository.findOneByToken(permanentToken)
        var account = accountRepository.findOneByUsername(gitlabUser.username)
            ?: accountRepository.findOneByEmail(gitlabUser.email)
            ?: accountRepository.findAccountByGitlabId(gitlabUser.id)

        if (person != null || accountToken != null || account != null)
            throw NotConsistentInternalDb("Inconsistent state for Gitlab user[${gitlabUser.id}] ${gitlabUser.name} ${gitlabUser.email}. Possible it already exists locally")

        val password = passwordEncoder.encode(RandomUtils.generateRandomPassword(botPasswordLength))

        val accountUuid = randomUUID()

        person = Person(id = randomUUID(), slug = gitlabUser.username, name = gitlabUser.username, gitlabId = gitlabUser.id)
        accountToken = AccountToken(id = randomUUID(), accountId = accountUuid, token = permanentToken, gitlabId = null)
        account = Account(
            id = accountUuid,
            username = gitlabUser.username,
            email = gitlabUser.email,
            passwordEncrypted = password,
            person = person,
            gitlabId = gitlabUser.id
        )

        accountRepository.save(account)

        return account
    }

    @Transactional
    fun ensureBotExistsOrCreateAccount(gitlabUser: GitlabUser, botPassword: String): Account {
        var account = accountRepository.findOneByUsername(gitlabUser.username)
            ?: accountRepository.findOneByEmail(gitlabUser.email)
            ?: accountRepository.findAccountByGitlabId(gitlabUser.id)

        if (account != null) {
            return account
        }

        var person = personRepository.findByName(gitlabUser.username)
        if (person == null) {
            person = Person(id = randomUUID(), slug = gitlabUser.username, name = gitlabUser.username, gitlabId = gitlabUser.id)
        }

        val accountUuid = randomUUID()
        account = Account(
            id = accountUuid,
            username = gitlabUser.username,
            email = gitlabUser.email,
            passwordEncrypted = botPassword,
            person = person,
            gitlabId = gitlabUser.id
        )

        return accountRepository.save(account)
    }

    fun ensureBotExistsWithToken(botName: String, botEmail: String, botPassword: String): Pair<GitlabUser, GitlabUserToken?> {
        val gitlabUser = createOrFindGitlabUser(botName, botEmail, botPassword)
        // save or find bot in local DB
        val account = ensureBotExistsOrCreateAccount(gitlabUser, botPassword)
        // create token ONCE on first try, otherwise return a optional null (no harm) of fail in pain
        val newToken = ensureGitlabToken(account, gitlabUser)
        return Pair(gitlabUser, newToken)
    }
}
