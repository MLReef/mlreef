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
import lombok.extern.slf4j.Slf4j
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.PropertySource
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
@PropertySource("classpath:secrets.properties")
open class GitlabAuthService(
    private val gitlabRestClient: GitlabRestClient,
    private val accountRepository: AccountRepository,
    private val personRepository: PersonRepository,
    private val accountTokenRepository: AccountTokenRepository,
    private val passwordEncoder: PasswordEncoder
) : AuthService {

    @Value("\${JAVA_TEST_PRIVATE_TOKEN}")
    private val secretPrivateToken: String? = null

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

        val person = Person(randomUUID(), username, username)
        val newUser = Account(randomUUID(), username, email, encryptedPassword, person)

        personRepository.save(person)
        val savedUser = accountRepository.save(newUser)

        val newToken = AccountToken(randomUUID(), newUser, secretPrivateToken!!, 0)
        accountTokenRepository.save(newToken)

        return savedUser
    }

    override fun findByToken(token: String): TokenDetails? {
        val user = try {
            gitlabRestClient.getUser(token)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
        return TokenDetails(
            token = token,
            gitlabUser = user,
            valid = (user != null)
        )
    }
}