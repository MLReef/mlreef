package com.mlreef.rest.feature.auth

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.AccountToken
import com.mlreef.rest.AccountTokenRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.exceptions.UserAlreadyExistsException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.findById2
import lombok.extern.slf4j.Slf4j
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.util.UUID.randomUUID
import javax.transaction.Transactional


interface AuthService {
    fun findByToken(token: String): TokenDetails?
    fun loginUser(plainPassword: String, username: String? = null, email: String? = null): Account?
    fun registerUser(plainPassword: String, username: String, email: String): Account?
    fun getBestToken(findAccount: Account?): AccountToken?
}


@Slf4j
@Service("authService")
class GitlabAuthService(
    private val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository,
    private val personRepository: PersonRepository,
    private val accountTokenRepository: AccountTokenRepository,
    private val passwordEncoder: PasswordEncoder
) : AuthService {

    @Value("\${mlreef.gitlab.mockUserToken}")
    private val secretPrivateTokenMock: String? = null

    override fun loginUser(plainPassword: String, username: String?, email: String?): Account? {
        val byUsername: Account? = if (username != null) accountRepository.findOneByUsername(username) else null
        val byEmail: Account? = if (email != null) accountRepository.findOneByEmail(email) else null

        val found: List<Account> = listOfNotNull(byUsername, byEmail).filter { account ->
            passwordEncoder.matches(plainPassword, account.passwordEncrypted)
        }
        return found.getOrNull(0)
    }

    override fun getBestToken(findAccount: Account?): AccountToken? {
        val findAllByUserId = accountTokenRepository.findAllByAccountId(findAccount!!.id)
        val sortedBy = findAllByUserId.filter { it.active && !it.revoked }.sortedBy { it.expiresAt }
        return sortedBy.getOrNull(0)
    }

    @Transactional
    override fun registerUser(plainPassword: String, username: String, email: String): Account? {
        val encryptedPassword = passwordEncoder.encode(plainPassword)
        val byUsername: Account? = accountRepository.findOneByUsername(username)
        val byEmail: Account? = accountRepository.findOneByEmail(email)

        if (listOfNotNull(byUsername, byEmail).isNotEmpty()) {
            throw UserAlreadyExistsException(username, email)
        }

        val person = Person(id = randomUUID(), slug = username, name = username)
        val newUser = Account(id = randomUUID(), username = username, email = email, passwordEncrypted = encryptedPassword, person = person)

        personRepository.save(person)
        val savedUser = accountRepository.save(newUser)

        val newToken = AccountToken(id = randomUUID(), accountId = newUser.id, token = secretPrivateTokenMock!!, gitlabId = 0)
        accountTokenRepository.save(newToken)

        return savedUser
    }

    override fun findByToken(token: String): TokenDetails? {


        val findOneByToken = accountTokenRepository.findOneByToken(token) ?: return null

        val account = accountRepository.findById2(findOneByToken.accountId)!!
        val person = personRepository.findById2(account.person.id)!!

        val gitlabUser = try {
            gitlabRestClient.getUser(token)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
        return TokenDetails(
            token = token,
            accountId = account.id,
            personId = person.id,
            gitlabUser = gitlabUser,
            valid = (gitlabUser != null)
        )
    }
}
