package com.mlreef.rest.feature.auth

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.I18N
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabConnectException
import com.mlreef.rest.exceptions.GitlabNoValidTokenException
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
import com.mlreef.rest.external_api.gitlab.dto.GroupVariable
import com.mlreef.rest.external_api.gitlab.dto.OAuthToken
import com.mlreef.rest.feature.groups.GroupsService
import com.mlreef.rest.feature.project.GitlabCodeProjectService
import com.mlreef.rest.feature.project.GitlabDataProjectService
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
import javax.security.auth.login.CredentialException
import javax.transaction.Transactional


@Service("authService")
class AuthService(
    private val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository,
    private val personRepository: PersonRepository,
    private val accountTokenRepository: AccountTokenRepository,
    private val groupService: GroupsService,
    private val passwordEncoder: PasswordEncoder,
    private val dataProjectsService: GitlabDataProjectService,
    private val codeProjectsService: GitlabCodeProjectService
) {

    @Value("\${mlreef.bot-management.epf-bot-email-domain:\"\"}")
    private val botEmailDomain: String = ""

    @Value("\${mlreef.bot-management.epf-bot-password-length}")
    private val botPasswordLength: Int = 0

    private val GITLAB_GROUP_VARIABLE_NAME_FOR_BOT_TOKEN = "EPF_BOT_TOKEN"

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)

        private val GUEST_ACCOUNT_ID = UUID(0L, 0L)
        private val GUEST_PERSON_ID = UUID(0L, 0L)

        private val guestTokenDetails: TokenDetails by lazy {
            TokenDetails(
                username = "",
                permanentToken = "",
                accessToken = null,
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

        val accountToken = getBestToken(account) ?: throw GitlabNoValidTokenException("user token not found")

        // assert that user is found in gitlab
        findGitlabUserViaToken(accountToken.token)

        val oauthToken = gitlabRestClient.userLoginOAuthToGitlab(account.username, plainPassword)
        val accountUpdate = account.copy(lastLogin = I18N.dateTime())
        val loggedAccount = accountRepository.save(accountUpdate)

        return Pair(loggedAccount, oauthToken)
    }

    fun getBestToken(findAccount: Account?): AccountToken? {
        val findAllByUserId = accountTokenRepository.findAllByAccountId(findAccount!!.id)
        val sortedBy = findAllByUserId.filter { it.active && !it.revoked }.sortedBy { it.expiresAt }
        return sortedBy.getOrNull(0)
    }

    @Transactional
    fun registerUser(plainPassword: String, username: String, email: String): Pair<Account, OAuthToken?> {
        val encryptedPassword = passwordEncoder.encode(plainPassword)
        val byUsername: Account? = accountRepository.findOneByUsername(username)
        val byEmail: Account? = accountRepository.findOneByEmail(email)

        if (listOfNotNull(byUsername, byEmail).isNotEmpty()) {
            throw UserAlreadyExistsException(username, email)
        }

        val newGitlabUser = createGitlabUser(username = username, email = email, password = plainPassword)
        val newGitlabToken = createGitlabToken(newGitlabUser)

        val oauthToken = gitlabRestClient.userLoginOAuthToGitlab(username, plainPassword)
        val token = newGitlabToken.token

        val accountUuid = randomUUID()

        val person = Person(id = randomUUID(), slug = username, name = username, gitlabId = newGitlabUser.id)
        val newToken = AccountToken(id = randomUUID(), accountId = accountUuid, token = token, gitlabId = newGitlabToken.id)
        val newUser = Account(id = accountUuid, username = username, email = email, passwordEncrypted = encryptedPassword, person = person, gitlabId = null, tokens = mutableListOf(newToken))

        accountRepository.save(newUser)

        val groupName = "mlreef-group-$username"

        val group = groupService.createGroup(token, groupName)

        //Create EPF-Bot and add it to user's group
        val botName = "$username-bot"
        val botEmail = "$botName@$botEmailDomain" //we have to use unique email for user creation
        val botPassword = RandomUtils.generateRandomPassword(botPasswordLength)
        val newGitlabEPFBot = createGitlabUser(username = botName, email = botEmail, password = botPassword)
        val newGitlabEPFBotToken = createGitlabToken(newGitlabEPFBot)

        groupService.addEPFBotToGroup(group.id, newGitlabEPFBot.id)

        //Create variable in group with bot token
        createGitlabVariable(token, group.gitlabId!!, GITLAB_GROUP_VARIABLE_NAME_FOR_BOT_TOKEN, newGitlabEPFBotToken.token)

        return Pair(newUser, oauthToken)
    }

    fun checkUserInGitlab(token: String): GitlabUser {
        if (token.length < 30) {
            return gitlabRestClient.getUser(token)
        } else {
            val oauthTokenInfo = gitlabRestClient.userCheckOAuthTokenInGitlab(token)
            val account = accountRepository.findAccountByGitlabId(oauthTokenInfo.resourceOwnerId)
                ?: throw UserNotFoundException(gitlabId = oauthTokenInfo.resourceOwnerId)
            return gitlabRestClient.getUser(account.bestToken?.token
                ?: throw CredentialException("No valid token for user"))
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

    private fun createGitlabUser(username: String, email: String, password: String): GitlabUser {
        return try {
            val gitlabName = "mlreef-user-$username"
            gitlabRestClient.adminCreateUser(email = email, name = gitlabName, username = username, password = password)
        } catch (clientErrorException: RestException) {
            log.info("Already existing dev user. Error message: ${clientErrorException.message}")
            val adminGetUsers = gitlabRestClient.adminGetUsers()
            adminGetUsers.first { it.username == username }
        }
    }

    private fun createGitlabToken(gitlabUser: GitlabUser): GitlabUserToken {
        val gitlabUserId = gitlabUser.id
        val tokenName = "mlreef-user-token"
        return gitlabRestClient.adminCreateUserToken(gitlabUserId = gitlabUserId, tokenName = tokenName)
    }

    private fun createGitlabVariable(token: String, groupId: Long, variableName: String, value: String): GroupVariable {
        return gitlabRestClient.userCreateGroupVariable(token = token, groupId = groupId, name = variableName, value = value)
    }

    fun createTokenDetails(token: String, account: Account, gitlabUser: GitlabUser): TokenDetails {
        var tokenDetails = TokenDetails(
            username = account.username,
            permanentToken = account.bestToken?.token
                ?: throw GitlabNoValidTokenException("No valid token found for user"),
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
        tokenDetails.groups.putAll(groupService.getUserGroupsList(account.person.id).map { Pair(it.id, it.accessLevel) })
        tokenDetails.projects.putAll(dataProjectsService.getUserProjectsList(account.id).map { Pair(it.id, it.accessLevel) })
        tokenDetails.projects.putAll(codeProjectsService.getUserProjectsList(account.id).map { Pair(it.id, it.accessLevel) })
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
        account = Account(id = accountUuid, username = gitlabUser.username, email = gitlabUser.email, passwordEncrypted = password, person = person, gitlabId = gitlabUser.id, tokens = mutableListOf(accountToken))

        accountRepository.save(account)

        return account
    }

}
