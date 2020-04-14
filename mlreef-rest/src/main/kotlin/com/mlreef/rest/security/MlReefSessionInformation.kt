package com.mlreef.rest.security

import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.session.SessionInformation
import org.springframework.session.FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME
import org.springframework.session.Session
import org.springframework.session.SessionRepository
import org.springframework.session.data.redis.MlReefSessionsRepository.Companion.USERNAME_INDEX_NAME
import java.util.Date


class MlReefSessionInformation(session: Session, private val sessionRepository: SessionRepository<out Session>)
    : SessionInformation(resolvePrincipal(session), session.id, Date.from(session.lastAccessedTime)) {
    companion object {
        private val log = LoggerFactory.getLogger(MlReefSessionInformation::class.java)

        private fun resolvePrincipal(session: Session): String? {
            val principalName = session.getAttribute<String>(USERNAME_INDEX_NAME)
                ?: session.getAttribute<String>(PRINCIPAL_NAME_INDEX_NAME)
            if (principalName != null) {
                return principalName
            }
            val securityContext: SecurityContext = session.getAttribute("SPRING_SECURITY_CONTEXT")
            return if (securityContext.authentication != null) {
                securityContext.authentication.name
            } else ""
        }
    }

    init {
        if (session.isExpired)
            super.expireNow()
    }

    override fun expireNow() {
        log.debug("Deleting session $sessionId for user $principal, presumably because max concurrent sessions was reached")
        super.expireNow()
        sessionRepository.deleteById(sessionId)
    }
}
