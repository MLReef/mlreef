package org.springframework.session.data.redis

import org.slf4j.LoggerFactory
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import java.util.HashMap

class MlReefSessionsRepository<T : Session>(
    val repository: FindByIndexNameSessionRepository<T>
) : FindByIndexNameSessionRepository<T> by repository {

    companion object {
        private val log = LoggerFactory.getLogger(MlReefSessionsRepository::class.java)
        const val USERNAME_INDEX_NAME = "username"
    }

    override fun save(session: T) {
        if (repository is RedisIndexedSessionRepository) {
            repository.save(session)
            val principalName = session.getAttribute<String>(USERNAME_INDEX_NAME)
            val principalRedisKey: String = getOriginalPrincipalKey(principalName)
            repository.sessionRedisOperations
                .boundSetOps(principalRedisKey).add(session.id)
        } else {
            return repository.save(session)
        }
    }

    override fun deleteById(id: String?) {
        if (repository is RedisIndexedSessionRepository) {
            val session = repository.findById(id) as Session?
            repository.deleteById(id)

            if (session != null) {
                val principalName = session.getAttribute<String>(USERNAME_INDEX_NAME)
                repository
                    .sessionRedisOperations
                    .boundSetOps(getOriginalPrincipalKey(principalName))
                    .remove(id)
            }
        } else {
            return repository.deleteById(id)
        }
    }

    @Suppress("UNCHECKED_CAST")
    override fun findByPrincipalName(principalName: String): Map<String, T> {
        if (repository is RedisIndexedSessionRepository) {
            val principalKey: String = this.getOriginalPrincipalKey(principalName)
            val sessionIds: Set<Any>? = repository.sessionRedisOperations.boundSetOps(principalKey).members()
            val sessions: MutableMap<String, T> = HashMap(sessionIds?.size ?: 0)
            for (id in sessionIds ?: setOf()) {
                val session: T? = repository.findById(id as String) as T?
                if (session != null) {
                    sessions[session.getId()] = session
                }
            }
            return sessions
        } else {
            return repository.findByPrincipalName(principalName)
        }
    }

    private fun getOriginalPrincipalKey(principalName: String): String {
        if (repository is RedisIndexedSessionRepository) {
            return "spring:session:index:$USERNAME_INDEX_NAME:$principalName"
        } else
            return principalName
    }
}
