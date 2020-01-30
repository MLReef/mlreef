package com.mlreef.rest.feature.auth

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.Group
import com.mlreef.rest.GroupRepository
import com.mlreef.rest.I18N
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.GitlabAlreadyExistingConflictException
import com.mlreef.rest.exceptions.GitlabConflictException
import com.mlreef.rest.exceptions.GitlabConnectException
import com.mlreef.rest.exceptions.UserAlreadyExistsException
import com.mlreef.rest.external_api.gitlab.GitlabGroup
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabUser
import com.mlreef.rest.external_api.gitlab.GitlabUserInGroup
import com.mlreef.rest.external_api.gitlab.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.GroupVariable
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.findById2
import com.mlreef.rest.utils.RandomUtils
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.client.ResourceAccessException
import java.util.UUID.randomUUID
import javax.transaction.Transactional


interface AuthService {
    fun createTokenDetails(token: String, account: Account, gitlabUser: GitlabUser): TokenDetails
    fun findAccountByToken(token: String): Account
    fun loginUser(plainPassword: String, username: String? = null, email: String? = null): Account
    fun registerUser(plainPassword: String, username: String, email: String): Account
    fun getBestToken(findAccount: Account?): AccountToken?
    fun findGitlabUserViaToken(token: String): GitlabUser
}


@Service("authService")
class GitlabAuthService(
    private val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository,
    private val personRepository: PersonRepository,
    private val accountTokenRepository: AccountTokenRepository,
    private val groupRepository: GroupRepository,
    private val passwordEncoder: PasswordEncoder
) : AuthService {

    @Value("\${mlreef.bot-management.epf-bot-email-domain:\"\"}")
    private val botEmailDomain: String = ""

    @Value("\${mlreef.bot-management.epf-bot-password-length}")
    private val botPasswordLength: Int = 0

    private val GITLAB_GROUP_VARIABLE_NAME_FOR_BOT_TOKEN = "EPF_BOT_TOKEN"

    val log = LoggerFactory.getLogger(this::class.java)

    override fun loginUser(plainPassword: String, username: String?, email: String?): Account {
        val byUsername: Account? = if (username != null) accountRepository.findOneByUsername(username) else null
        val byEmail: Account? = if (email != null) accountRepository.findOneByEmail(email) else null

        val found: List<Account> = listOfNotNull(byUsername, byEmail).filter { account ->
            passwordEncoder.matches(plainPassword, account.passwordEncrypted)
        }

        val account = found.getOrNull(0)
            ?: throw BadCredentialsException("user not found")

        val accountToken = getBestToken(account)
            ?: throw BadCredentialsException("user token not found")

        // assert that user is found in gitlab
        findGitlabUserViaToken(accountToken.token)

        val accountUpdate = account.copy(lastLogin = I18N.dateTime())
        return accountRepository.save(accountUpdate)
    }

    override fun getBestToken(findAccount: Account?): AccountToken? {
        val findAllByUserId = accountTokenRepository.findAllByAccountId(findAccount!!.id)
        val sortedBy = findAllByUserId.filter { it.active && !it.revoked }.sortedBy { it.expiresAt }
        return sortedBy.getOrNull(0)
    }

    @Transactional
    override fun registerUser(plainPassword: String, username: String, email: String): Account {
        val encryptedPassword = passwordEncoder.encode(plainPassword)
        val byUsername: Account? = accountRepository.findOneByUsername(username)
        val byEmail: Account? = accountRepository.findOneByEmail(email)

        if (listOfNotNull(byUsername, byEmail).isNotEmpty()) {
            throw UserAlreadyExistsException(username, email)
        }

        val newGitlabUser = createGitlabUser(username = username, email = email, password = plainPassword)
        val newGitlabToken = createGitlabToken(username, newGitlabUser)

        val token = newGitlabToken.token

        val person = Person(id = randomUUID(), slug = username, name = username)
        val newUser = Account(id = randomUUID(), username = username, email = email, passwordEncrypted = encryptedPassword, person = person, gitlabId = newGitlabUser.id)
        val newToken = AccountToken(id = randomUUID(), accountId = newUser.id, token = token, gitlabId = newGitlabToken.id)

        personRepository.save(person)
        accountRepository.save(newUser)
        accountTokenRepository.save(newToken)

        val newGitlabGroup = createGitlabGroup(token, username) //User is being added to group automatically

        val group = Group(id = randomUUID(), slug = newGitlabGroup.name, name = newGitlabGroup.name)
        groupRepository.save(group)

        //Create EPF-Bot and add it to user's group
        val botName = "$username-bot"
        val botEmail = "$botName@$botEmailDomain" //we have to use unique email for user creation
        val botPassword = RandomUtils.generateRandomPassword(botPasswordLength)
        val newGitlabEPFBot = createGitlabUser(username = botName, email = botEmail, password = botPassword)
        val newGitlabEPFBotToken = createGitlabToken(botName, newGitlabEPFBot)

        addGitlabUserToGroup(newGitlabEPFBot, newGitlabGroup)

        //Create variable in group with bot token
        createGitlabVariable(token, newGitlabGroup.id, GITLAB_GROUP_VARIABLE_NAME_FOR_BOT_TOKEN, newGitlabEPFBotToken.token)

        return newUser
    }

    override fun findGitlabUserViaToken(token: String): GitlabUser {
        return try {
            gitlabRestClient.getUser(token)
        } catch (e: ResourceAccessException) {
            throw GitlabConnectException(e.message ?: "Cannot execute gitlabRestClient.getUser")
        } catch (e: Exception) {
            log.error(e.message, e)
            throw GitlabAlreadyExistingConflictException(ErrorCode.GitlabUserNotExisting, "Cannot find Gitlab user with this token ${token.censor()}")
        }
    }

    private fun createGitlabUser(username: String, email: String, password: String): GitlabUser {
        return try {
            val gitlabName = "mlreef-user-$username"
            return gitlabRestClient.adminCreateUser(email = email, name = gitlabName, username = username, password = password)
        } catch (clientErrorException: GitlabConflictException) {
            log.info("Already existing dev user. Error message: ${clientErrorException.message}")
            val adminGetUsers = gitlabRestClient.adminGetUsers()
            return adminGetUsers.first { it.username == username }
        }
    }

    private fun createGitlabToken(username: String, gitlabUser: GitlabUser): GitlabUserToken {
        val gitlabUserId = gitlabUser.id
        val tokenName = "mlreef-user-token"
        return gitlabRestClient.adminCreateUserToken(gitlabUserId = gitlabUserId, tokenName = tokenName)
    }

    private fun addGitlabUserToGroup(user: GitlabUser, group: GitlabGroup): GitlabUserInGroup {
        val userId = user.id
        val groupId = group.id
        return gitlabRestClient.adminAddUserToGroup(groupId = groupId, userId = userId.toLong())
    }

    private fun createGitlabGroup(token: String, groupName: String, path: String? = null): GitlabGroup {
        val gitlabName = "mlreef-group-$groupName"
        val gitlabPath = path ?: "$groupName-path"
        return gitlabRestClient.userCreateGroup(token = token, groupName = gitlabName, path = gitlabPath)
    }

    private fun createGitlabVariable(token: String, groupId: Int, variableName: String, value: String): GroupVariable {
        return gitlabRestClient.userCreateGroupVariable(token = token, groupId = groupId, name = variableName, value = value)
    }

    override fun createTokenDetails(token: String, account: Account, gitlabUser: GitlabUser): TokenDetails {
        return TokenDetails(
            token = token,
            accountId = account.id,
            personId = account.person.id,
            gitlabUser = gitlabUser,
            valid = (true)
        )
    }

    override fun findAccountByToken(token: String): Account {
        val findOneByToken = accountTokenRepository.findOneByToken(token)
            ?: throw BadCredentialsException("Token not found in Database")

        return accountRepository.findById2(findOneByToken.accountId)
            ?: throw BadCredentialsException("Token not attached to a Account in Database")
    }
}
