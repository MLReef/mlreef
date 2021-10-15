package com.mlreef.rest.api

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.Account
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.util.*

interface CurrentUserService {
    fun authentication(): Authentication
    fun authenticationOrNull(): Authentication?
    fun account(): Account
    fun accountOrNull(): Account?
    fun visitorAccount(): Account
    fun accessToken(): String
    fun accessTokenOrNull(): String?
    fun anyValidToken(): String?
    fun projectsMap(): Map<UUID, AccessLevel?>
    fun projectsMap(minimumLevel: AccessLevel): Map<UUID, AccessLevel?>
    fun groupsMap(): Map<UUID, AccessLevel?>
    fun groupsMap(minimumLevel: AccessLevel): Map<UUID, AccessLevel?>
}

@Component
class SimpleCurrentUserService(
    val accountRepository: AccountRepository,
) : CurrentUserService {

    override fun authentication(): Authentication {
        return SecurityContextHolder.getContext().authentication
    }

    override fun authenticationOrNull(): Authentication? {
        return SecurityContextHolder.getContext().authentication
    }

    override fun accessToken(): String {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return tokenDetails.accessToken
    }

    override fun accessTokenOrNull(): String? {
        val tokenDetails: TokenDetails? = authenticationOrNull()?.principal as? TokenDetails
        return tokenDetails?.accessToken
    }

    override fun anyValidToken(): String? {
        return accessTokenOrNull()
    }

    override fun account(): Account {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return accountRepository.findByIdOrNull(tokenDetails.accountId)
            ?: throw UserNotFoundException(userId = tokenDetails.accountId)
    }

    override fun accountOrNull(): Account? {
        val tokenDetails: TokenDetails? = authenticationOrNull()?.principal as? TokenDetails
        return tokenDetails?.let {
            accountRepository.findByIdOrNull(tokenDetails.accountId)
        }
    }

    override fun visitorAccount(): Account {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return Account(
            tokenDetails.accountId,
            "Visitor",
            "",
            "",
            "",
            "Visitor",
            gitlabId = null,
        )
    }

    override fun projectsMap(): Map<UUID, AccessLevel?> {
        val tokenDetails: TokenDetails? = authenticationOrNull()?.principal as TokenDetails?
        return tokenDetails?.projects ?: emptyMap()
    }

    override fun groupsMap(): Map<UUID, AccessLevel?> {
        val tokenDetails: TokenDetails? = authenticationOrNull()?.principal as TokenDetails?
        return tokenDetails?.groups ?: emptyMap()
    }

    override fun projectsMap(minimumLevel: AccessLevel): Map<UUID, AccessLevel?> = filterMap(minimumLevel, projectsMap())
    override fun groupsMap(minimumLevel: AccessLevel): Map<UUID, AccessLevel?> = filterMap(minimumLevel, groupsMap())

    private fun filterMap(minimumLevel: AccessLevel, map: Map<UUID, AccessLevel?>): Map<UUID, AccessLevel?> {
        return map.filterValues { accessLevel ->
            AccessLevel.isSufficientFor(accessLevel, minimumLevel)
        }
    }
}
