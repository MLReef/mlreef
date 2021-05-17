package com.mlreef.rest.feature.auth

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.domain.Account
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.web.client.ResourceAccessException
import java.util.UUID

@Service
class UserResolverService(
    private val accountRepository: AccountRepository,
    private val gitlabRestClient: GitlabRestClient,
) {
    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    fun resolveAccount(
        userName: String? = null,
        userId: UUID? = null,
        gitlabId: Long? = null,
        userToken: String? = null,
        personId: UUID? = null,
        email: String? = null,
    ): Account? = findAccountByUserId(userId)
        ?: findAccountByUserName(userName)
        ?: findAccountByGitlabId(gitlabId)
        ?: findAccountByToken(userToken)
        ?: findAccountByPersonId(personId)
        ?: findAccountByEmail(email)

    private fun findAccountByUserName(userName: String?) = userName?.let { accountRepository.findOneByUsername(it) }
    private fun findAccountByUserId(userId: UUID?) = userId?.let { accountRepository.findByIdOrNull(it) }
    private fun findAccountByGitlabId(gitlabId: Long?) = gitlabId?.let { accountRepository.findAccountByGitlabId(it) }
    private fun findAccountByToken(token: String?) = token?.let { gitlabRestClient.getUser(it).let { accountRepository.findAccountByGitlabId(it.id) } }
    private fun findAccountByPersonId(personId: UUID?) = personId?.let { accountRepository.findAccountByPersonId(it) }
    private fun findAccountByEmail(email: String?) = email?.let { accountRepository.findOneByEmail(it) }

    fun findGitlabUserViaGitlabId(id: Long): GitlabUser? {
        return try {
            gitlabRestClient.adminGetUserById(id)
        } catch (e: ResourceAccessException) {
            log.error(e.message ?: "Cannot execute gitlabRestClient.getUser")
            null
        } catch (e: Exception) {
            log.error(e.message, e)
            null
        }
    }
}