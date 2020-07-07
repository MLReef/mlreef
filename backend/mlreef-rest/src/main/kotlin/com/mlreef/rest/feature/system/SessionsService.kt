package com.mlreef.rest.feature.system

import com.mlreef.rest.GroupRepository
import com.mlreef.rest.config.MessagingConfig
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.security.MlReefSessionRegistry
import org.slf4j.LoggerFactory
import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.core.session.SessionInformation
import org.springframework.stereotype.Service
import java.time.format.DateTimeFormatter
import java.util.UUID

interface SessionsService {
    fun getAllSessionsList(): List<SessionDto>
    fun getSessionsList(username: String? = null, token: String? = null): List<SessionDto>
    fun killAllSessions(username: String? = null, sessionId: String? = null): Int?
}

@Service
class MlReefSessionsService(
    private val sessionRegistry: MlReefSessionRegistry,
    private val groupRepository: GroupRepository,
    private val gitlabRestClient: GitlabRestClient
) : SessionsService, MessageListener {
    companion object {
        private val log = LoggerFactory.getLogger(MlReefSessionsService::class.java)
    }

    private val formatter = DateTimeFormatter.ISO_INSTANT

    override fun getAllSessionsList(): List<SessionDto> {
        return listOf()
    }

    override fun onMessage(message: Message, pattern: ByteArray) {
        val channel = String(message.channel)
        // WORKAROUND: Because we use Spring @EnableRedisHttpSession it puts 8byes of system information to the message
        val subject = String(message.body, Charsets.UTF_8).substring(7)

        when {
            channel == MessagingConfig.REFRESH_USER_INFORMATION_TOPIC -> {
                log.debug("User will be cleared from cache: $subject")
                killAllSessions(subject)
            }
            channel == MessagingConfig.REFRESH_GROUP_INFORMATION_TOPIC -> {
                log.debug("Users of group $subject will be cleared from cache")
                val groupGitlabId = groupRepository.findByIdOrNull(UUID.fromString(subject))?.gitlabId
                if (groupGitlabId != null) {
                    val usernames = gitlabRestClient.adminGetGroupMembers(groupGitlabId).map { it.username }
                    usernames.forEach { killAllSessions(it) }
                }
            }
        }
    }

    override fun getSessionsList(username: String?, token: String?): List<SessionDto> {
        val allSessions: List<SessionInformation>

        if (username != null)
            allSessions = sessionRegistry.getAllSessions(username, true)
        else if (token != null)
            allSessions = sessionRegistry.getAllSessionsForToken(token, true)
        else
            throw IllegalArgumentException("Either username or token must be present")

        return allSessions.map {
            SessionDto(
                it.sessionId,
                sessionRegistry.name(it.principal),
                formatter.format(it.lastRequest.toInstant()),
                it.isExpired
            )
        }
    }

    override fun killAllSessions(username: String?, sessionId: String?): Int? {
        if (username != null)
            return sessionRegistry.expireAllSessionsByUsername(username)
        else if (sessionId != null)
            return sessionRegistry.expireAllSessionsByToken(sessionId)
        else
            return null
    }
}

data class SessionDto(
    val sessionId: String,
    val username: String?,
    val lastRequest: String,
    val isExpired: Boolean
)
