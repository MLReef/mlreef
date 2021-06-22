package org.springframework.session.data.redis

import org.slf4j.LoggerFactory
import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import java.util.HashMap
import javax.annotation.PostConstruct

class MlReefSessionsRepository<T : Session>(
    val repository: FindByIndexNameSessionRepository<T>,
    private val sessionExpiration: Int,
    private val redisMessageListenerContainer: RedisMessageListenerContainer,
) : FindByIndexNameSessionRepository<T> by repository, MessageListener {

    companion object {
        private val log = LoggerFactory.getLogger(MlReefSessionsRepository::class.java)
        const val USERNAME_INDEX_NAME = "username"
        const val expireKeyPrefix = "spring:session:sessions:expires:";
    }

    private val redisRepository: RedisIndexedSessionRepository?
        get() = repository as? RedisIndexedSessionRepository

    @PostConstruct
    fun init() {
        redisRepository?.let {
            it.setDefaultMaxInactiveInterval(sessionExpiration)
            redisMessageListenerContainer.addMessageListener(
                this,
                listOf(ChannelTopic(it.sessionDeletedChannel), ChannelTopic(it.sessionExpiredChannel))
            )
        }
    }

    override fun onMessage(message: Message, pattern: ByteArray?) {
        val messageChannel = message.channel
        val messageBody = message.body

        val channel = String(messageChannel)
        val isDeleted = redisRepository?.sessionDeletedChannel?.let { channel == it } ?: false

        val body = String(messageBody)
        if (!body.startsWith(expireKeyPrefix)) {
            return
        }

        if (isDeleted || channel == redisRepository?.sessionExpiredChannel) {
            val beginIndex: Int = body.lastIndexOf(":") + 1
            val endIndex: Int = body.length
            val sessionId: String = body.substring(beginIndex, endIndex)
            cleanupUsernameIndex(sessionId)
        }
    }

    override fun save(session: T) {
        redisRepository?.let {
            repository.save(session)
            val principalName = session.getAttribute<String>(USERNAME_INDEX_NAME)
            val principalRedisKey: String = getOriginalPrincipalKey(principalName)
            val sessionRedisKey: String = getOriginalPrincipalKey(session.id)
            it.sessionRedisOperations.boundSetOps(principalRedisKey).add(session.id)
            it.sessionRedisOperations.boundSetOps(sessionRedisKey).add(principalName)
        } ?: repository.save(session)
    }

    override fun deleteById(id: String?) {
        redisRepository?.let {
            val session = repository.findById(id) as Session?
            repository.deleteById(id)

            if (session != null) {
                val principalName = session.getAttribute<String>(USERNAME_INDEX_NAME)
                it.sessionRedisOperations
                    .boundSetOps(getOriginalPrincipalKey(principalName))
                    .remove(id)
            }
        } ?: repository.deleteById(id)
    }

    @Suppress("UNCHECKED_CAST")
    override fun findByPrincipalName(principalName: String): Map<String, T> {
        return redisRepository?.let {
            val principalKey: String = this.getOriginalPrincipalKey(principalName)
            val sessionIds = it.sessionRedisOperations.boundSetOps(principalKey).members() ?: setOf()
            val sessions: MutableMap<String, T> = HashMap(sessionIds.size)
            for (id in sessionIds) {
                val session: T? = repository.findById(id as String) as T?
                if (session != null) {
                    sessions[session.getId()] = session
                }
            }
            return sessions
        } ?: repository.findByPrincipalName(principalName)
    }

    private fun getOriginalPrincipalKey(principalName: String): String {
        return redisRepository?.let {
            "spring:session:index:$USERNAME_INDEX_NAME:$principalName"
        } ?: principalName
    }

    private fun cleanupUsernameIndex(sessionId: String) {
        redisRepository?.let {
            val sessionIndexKey = getOriginalPrincipalKey(sessionId)
            val username = it.sessionRedisOperations.boundSetOps(sessionIndexKey).pop() as? String
            username?.let { user ->
                it.sessionRedisOperations.boundSetOps(getOriginalPrincipalKey(user)).remove(sessionId)
            }
        }
    }

    //TODO: Create a scheduler cleaning outdated sessions and indexes
}
