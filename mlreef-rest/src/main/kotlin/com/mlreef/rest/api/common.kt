package com.mlreef.rest.api

import com.mlreef.rest.Account
import com.mlreef.rest.AccountRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.findById2
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component


interface CurrentUserService {
    fun authentication(): Authentication
    fun person(): Person
    fun account(): Account
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
        val findAll = personRepository.findAll()
        return personRepository.findById2(tokenDetails.personId)!!
    }

    override fun account(): Account {
        val tokenDetails: TokenDetails = authentication().principal as TokenDetails
        return accountRepository.findById2(tokenDetails.accountId)!!
    }
}
