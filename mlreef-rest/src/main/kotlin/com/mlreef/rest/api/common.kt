package com.mlreef.rest.api

import com.mlreef.rest.AccessLevel
import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.exceptions.MissingAccessTokenForUser
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import java.util.UUID

interface CurrentUserService {
    fun authentication(): Authentication
    fun authenticationOrNull(): Authentication?
    fun person(): Person
    fun personOrNull(): Person?
    fun account(): Account
    fun accountOrNull(): Account?
    fun permanentToken(): String
    fun permanentTokenOrNull(): String?
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
    val personRepository: PersonRepository
) : CurrentUserService {

    override fun authentication(): Authentication {
        return SecurityContextHolder.getContext().authentication
    }

    override fun authenticationOrNull(): Authentication? {
        return SecurityContextHolder.getContext().authentication
    }

    override fun person(): Person {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return personRepository.findByIdOrNull(tokenDetails.personId)
            ?: throw UserNotFoundException(personId = tokenDetails.personId)
    }

    override fun personOrNull(): Person? {
        val tokenDetails: TokenDetails? = authenticationOrNull()?.principal as? TokenDetails
        return tokenDetails?.let {
            personRepository.findByIdOrNull(tokenDetails.personId)
        }
    }

    override fun permanentToken(): String {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return tokenDetails.permanentToken
    }

    override fun permanentTokenOrNull(): String? {
        val tokenDetails: TokenDetails? = authenticationOrNull()?.principal as? TokenDetails
        return tokenDetails?.permanentToken
    }

    override fun accessToken(): String {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return tokenDetails.accessToken ?: throw MissingAccessTokenForUser(tokenDetails.accountId)
    }

    override fun accessTokenOrNull(): String? {
        val tokenDetails: TokenDetails? = authenticationOrNull()?.principal as? TokenDetails
        return tokenDetails?.accessToken
    }

    override fun anyValidToken(): String? {
        return accessTokenOrNull() ?: permanentTokenOrNull()
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

    override fun projectsMap(): Map<UUID, AccessLevel?> {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return tokenDetails.projects
    }

    override fun groupsMap(): Map<UUID, AccessLevel?> {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return tokenDetails.groups
    }

    override fun projectsMap(minimumLevel: AccessLevel): Map<UUID, AccessLevel?> = filterMap(minimumLevel, projectsMap())
    override fun groupsMap(minimumLevel: AccessLevel): Map<UUID, AccessLevel?> = filterMap(minimumLevel, groupsMap())

    private fun filterMap(minimumLevel: AccessLevel, map: Map<UUID, AccessLevel?>): Map<UUID, AccessLevel?> {
        return map.filterValues { accessLevel ->
            AccessLevel.isSufficientFor(accessLevel, minimumLevel)
        }
    }
}
