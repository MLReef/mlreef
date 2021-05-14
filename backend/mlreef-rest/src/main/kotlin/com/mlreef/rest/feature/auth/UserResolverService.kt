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
        userName: String?,
        userId: UUID?,
        gitlabId: Long?
    ): Account? {
        return findAccountByUserId(userId)
            ?: findAccountByUserName(userName)
            ?: findAccountByGitlabId(gitlabId)
    }

    private fun findAccountByUserName(userName: String?): Account? {
        return userName?.let { accountRepository.findOneByUsername(it) }
    }

    private fun findAccountByUserId(userId: UUID?): Account? {
        return userId?.let { accountRepository.findByIdOrNull(it) }
    }

    private fun findAccountByGitlabId(gitlabId: Long?): Account? {
        return gitlabId?.let { accountRepository.findAccountByGitlabId(it) }
    }

    fun findGitlabUserViaToken(token: String): GitlabUser? {
        return try {
            gitlabRestClient.getUser(token)
        } catch (e: ResourceAccessException) {
            log.error(e.message ?: "Cannot execute gitlabRestClient.getUser")
            null
        } catch (e: Exception) {
            log.error(e.message, e)
            null
        }
    }

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