package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.external_api.gitlab.TokenDetails
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

interface CurrentUserService {
    fun authentication(): Authentication
    fun person(): Person
    fun account(): Account
    fun permanentToken(): String
    fun accessToken(): String?
    fun anyValidToken(): String
}

@Component
class SimpleCurrentUserService(
    val accountRepository: AccountRepository,
    val personRepository: PersonRepository
) : CurrentUserService {

    override fun authentication(): Authentication {
        return SecurityContextHolder.getContext().authentication
    }

    override fun person(): Person {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return personRepository.findByIdOrNull(tokenDetails.personId)!!
    }

    override fun permanentToken(): String {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return tokenDetails.permanentToken
    }

    override fun accessToken(): String? {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return tokenDetails.accessToken
    }

    override fun anyValidToken(): String {
        return accessToken() ?: permanentToken()
    }

    override fun account(): Account {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return accountRepository.findByIdOrNull(tokenDetails.accountId)!!
    }
}
