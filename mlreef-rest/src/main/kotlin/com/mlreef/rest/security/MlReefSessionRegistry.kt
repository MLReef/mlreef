package com.mlreef.rest.security

import com.mlreef.rest.config.censor
import com.mlreef.rest.config.security.AuthenticationProvider
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.security.core.session.SessionInformation
import org.springframework.security.core.session.SessionRegistry
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import org.springframework.session.data.redis.MlReefSessionsRepository.Companion.USERNAME_INDEX_NAME
import org.springframework.stereotype.Component
import java.security.Principal


@Component
class MlReefSessionRegistry(
    @Qualifier("mlreefSessionRepository") private val sessionRepository: FindByIndexNameSessionRepository<out Session>
) : SessionRegistry {
    companion object {
        private val log = LoggerFactory.getLogger(AuthenticationProvider::class.java)
    }

    private val REDIS_SESSION_PREFIX = "spring:session:sessions:"

    init {
        log.debug("Session management service is being created...")
    }

    override fun registerNewSession(token: String?, principal: Any?) {
        log.info("createSession: Create session for token:${token.censor()}")
        val session = sessionRepository.createSession()
        val userDetails = principal as UserDetails
        session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
        session.setAttribute("user", userDetails)
        session.setAttribute(USERNAME_INDEX_NAME, userDetails.username)
    }

    fun retrieveFromSession(token: String): UserDetails? {
        val findByTokenNameMap =
            sessionRepository.findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)

        if (findByTokenNameMap.isNotEmpty()) {
            log.info("retrieveFromSession token:${token.censor()}")
            val first = findByTokenNameMap.values.first()
            val userDetails = first.getAttribute<UserDetails>("user")
            if (userDetails == null) {
                log.debug("User not cached")
            }
            return userDetails
        }

        return null
    }

    fun expireAllSessionsByUsername(userName: String): Int {
        val sessions = sessionRepository
            .findByPrincipalName(userName)
            .map { MlReefSessionInformation(it.value, sessionRepository) }

        log.warn("Session number for killing: ${sessions.size}")

        sessions.forEach { it.expireNow(); sessionRepository.deleteById(it.sessionId) }

        return sessions.size
    }

    fun expireAllSessionsByToken(token: String?): Int {
        val sessions = sessionRepository
            .findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
            .map { MlReefSessionInformation(it.value, sessionRepository) }
        log.warn("Session number for killing: ${sessions.size}")

        sessions.forEach { it.expireNow(); sessionRepository.deleteById(it.sessionId) }

        return sessions.size
    }

    override fun getAllPrincipals(): List<Any> {
        throw UnsupportedOperationException("The functionality is not implemented in Spring yet")
    }

    override fun removeSessionInformation(sessionId: String?) = Unit
    override fun refreshLastRequest(sessionId: String?) = Unit

    override fun getAllSessions(principal: Any, includeExpiredSessions: Boolean): List<SessionInformation> {
        val username = name(principal)

        val sessions = sessionRepository
            .findByPrincipalName(username)
            .filterValues { includeExpiredSessions || !it.isExpired }
            .values

        log.debug("Requested sessions number for principal $username: ${sessions.size}")

        return sessions.map { MlReefSessionInformation(it, sessionRepository) }
    }

    fun getAllSessionsForToken(token: String, includeExpiredSessions: Boolean): List<SessionInformation> {
        val sessions = sessionRepository
            .findByIndexNameAndIndexValue(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, token)
            .filterValues { includeExpiredSessions || !it.isExpired }
            .values

        log.debug("Requested sessions number for token ${token.censor()}: ${sessions.size}")

        return sessions.map { MlReefSessionInformation(it, sessionRepository) }
    }


    override fun getSessionInformation(sessionId: String?): SessionInformation? {
        val session: Session = sessionRepository.findById(sessionId)
        return MlReefSessionInformation(session, sessionRepository)
    }

    fun name(principal: Any?): String? {
        if (principal == null)
            return null

        if (principal is UserDetails) {
            return principal.username
        }

        return if (principal is Principal) {
            principal.name
        } else
            principal.toString()
    }
}
