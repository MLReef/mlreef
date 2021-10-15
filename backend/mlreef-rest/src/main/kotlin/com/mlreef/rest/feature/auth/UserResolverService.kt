package com.mlreef.rest.feature.auth

import com.mlreef.rest.AccountExternalRepository
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.AccountExternal
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.web.client.ResourceAccessException
import java.util.*

@Service
class UserResolverService(
    private val accountRepository: AccountRepository,
    private val gitlabRestClient: GitlabRestClient,
    private val accountExternalRepository: AccountExternalRepository,
) {
    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    fun resolveAccount(
        userName: String? = null,
        userId: UUID? = null,
        gitlabId: Long? = null,
        userToken: String? = null,
        email: String? = null,
        slug: String? = null,
    ): Account? = findAccountByUserId(userId)
        ?: findAccountByUserName(userName)
        ?: findAccountByGitlabId(gitlabId)
        ?: findAccountByToken(userToken)
        ?: findAccountByEmail(email)
        ?: findAccountBySlug(slug)

    fun resolveExternalAccount(oauthClient: String, username: String? = null, email: String? = null, externalId: String? = null): AccountExternal? =
        findExternalAccountByExternalId(externalId, oauthClient)
            ?: findExternalAccountByUsername(username, oauthClient)
            ?: findExternalAccountByEmail(email, oauthClient)


    private fun findAccountByUserName(userName: String?) = userName?.let { accountRepository.findOneByUsername(it) }
    private fun findAccountByUserId(userId: UUID?) = userId?.let { accountRepository.findByIdOrNull(it) }
    private fun findAccountByGitlabId(gitlabId: Long?) = gitlabId?.let { accountRepository.findAccountByGitlabId(it) }
    private fun findAccountByToken(token: String?) = token?.let { gitlabRestClient.getUser(it).let { accountRepository.findAccountByGitlabId(it.id) } }
    private fun findAccountByEmail(email: String?) = email?.let { accountRepository.findOneByEmail(it) }
    private fun findAccountBySlug(slug: String?) = slug?.let { accountRepository.findBySlug(it) }

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

    private fun findExternalAccountByUsername(username: String?, oauthClient: String) =
        username?.takeIf { it.isNotBlank() }?.let { accountExternalRepository.findByUsernameAndOauthClient(it, oauthClient) }

    private fun findExternalAccountByEmail(email: String?, oauthClient: String) =
        email?.takeIf { it.isNotBlank() }?.let { accountExternalRepository.findByEmailAndOauthClient(it, oauthClient) }

    private fun findExternalAccountByExternalId(externalId: String?, oauthClient: String) =
        externalId?.takeIf { it.isNotBlank() }?.let { accountExternalRepository.findByExternalIdAndOauthClient(it, oauthClient) }

}