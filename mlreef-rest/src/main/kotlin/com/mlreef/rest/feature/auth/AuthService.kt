package com.mlreef.rest.feature.auth

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.config.RedisSessionStrategy
import com.mlreef.rest.config.censor
import com.mlreef.rest.exceptions.Error
import com.mlreef.rest.exceptions.GitlabException
import com.mlreef.rest.exceptions.UserAlreadyExistsException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabUser
import com.mlreef.rest.external_api.gitlab.GitlabUserToken
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.findById2
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
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
    private val passwordEncoder: PasswordEncoder
) : AuthService {

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

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
        return account
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

        return newUser
    }

    override fun findGitlabUserViaToken(token: String): GitlabUser {
        return try {
            gitlabRestClient.getUser(token)
        } catch (e: Exception) {
            log.error(e.message, e)
            throw GitlabException(Error.GitlabUserNotExisting, "Cannot find Gitlab user with this token ${token.censor()}")
        }
    }

    private fun createGitlabUser(username: String, email: String, password: String): GitlabUser {
        return try {
            val gitlabName = "mlreef-user-$username"
            gitlabRestClient.adminCreateUser(email = email, name = gitlabName, username = username, password = password)
        } catch (e: Exception) {
            log.error(e.message, e)
            throw GitlabException(Error.GitlabUserCreationFailed, "Cannot create user for $username")
        }
    }

    private fun createGitlabToken(username: String, gitlabUser: GitlabUser): GitlabUserToken {
        return try {
            val gitlabUserId = gitlabUser.id.toInt()
            val tokenName = "mlreef-user-token"
            gitlabRestClient.adminCreateUserToken(gitlabUserId = gitlabUserId, tokenName = tokenName)
        } catch (e: Exception) {
            log.error(e.message, e)
            throw GitlabException(Error.GitlabUserTokenCreationFailed, "Cannot create user token for $username")
        }
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
