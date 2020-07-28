package com.mlreef.rest.config.http

import com.mlreef.rest.config.censor
import com.mlreef.rest.external_api.gitlab.TokenDetails
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class RedisSessionStrategy<T : Session>(private val sessionRepo: FindByIndexNameSessionRepository<T>) : SessionAuthenticationStrategy {

    val log = LoggerFactory.getLogger(RedisSessionStrategy::class.java)

    override fun onAuthentication(authentication: Authentication?, request: HttpServletRequest?, response: HttpServletResponse?) {
        val userDetails = authentication?.principal as TokenDetails
        val token = userDetails.accessToken

        val findByTokenNameMap = sessionRepo.findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)

        if (findByTokenNameMap.isNotEmpty()) {
            log.debug("Reuse session for token:${token.censor()}")
        } else {
            log.debug("Create session for token:${token.censor()}")
            val session = sessionRepo.createSession()
            session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
            session.setAttribute("user", userDetails)
            session.setAttribute("username", userDetails.username)
            sessionRepo.save(session)
        }
    }
}
