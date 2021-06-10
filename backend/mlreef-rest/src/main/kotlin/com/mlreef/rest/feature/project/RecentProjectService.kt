package com.mlreef.rest.feature.project

import com.mlreef.rest.ProjectRepository
import com.mlreef.rest.ProjectsConfiguration
import com.mlreef.rest.RecentProjectsRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.config.MessagingConfig
import com.mlreef.rest.config.MessagingConfig.Companion.PUB_SUB_FIELD_SEPARATOR
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.ProjectType
import com.mlreef.rest.domain.RecentProject
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.utils.too
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Component
class RecentProjectService(
    private val recentProjectsRepository: RecentProjectsRepository,
    private val subjectRepository: SubjectRepository,
    private val projectRepository: ProjectRepository,
    private val projectsConfiguration: ProjectsConfiguration,
) : MessageListener {
    private val log = LoggerFactory.getLogger(this::class.java)

    fun getRecentProjectsForUser(subjectId: UUID, pageable: Pageable, type: ProjectType? = null): Page<RecentProject> {
        val subject = subjectRepository.findByIdOrNull(subjectId)
            ?: throw UserNotFoundException(personId = subjectId)

        return when {
            type != null -> recentProjectsRepository.findRecentDataProjectsByUserAndType(subject, type, pageable)
            else -> recentProjectsRepository.findByUserOrderByUpdateDateDesc(subject, pageable)
        }
    }

    override fun onMessage(message: Message, pattern: ByteArray?) {
        val channel = String(message.channel)
        val (projectId, userId, operation) = String(message.body, Charsets.UTF_8).substring(7).split(PUB_SUB_FIELD_SEPARATOR)

        when {
            channel == MessagingConfig.RECENT_PROJECT_TOPIC -> {
                handleMessage(projectId to userId too operation)
            }
        }
    }

    @Transactional
    fun handleMessage(message: Triple<String, String, String>) {
        log.debug("Received redis message: project = ${message.first} subject = ${message.second} operation = ${message.third}")
        val user = message.second.tryToUUID()?.let {
            subjectRepository.findByIdOrNull(it)
        }

        val project = message.first.tryToUUID()?.let {
            projectRepository.findByIdOrNull(it)
        } ?: return

        //Insert
        user?.let {
            val recentProject = (
                recentProjectsRepository.findByProjectAndUser(project, it)
                    ?: RecentProject(UUID.randomUUID(), it, project, Instant.now(), message.third)
                ).copy(updateDate = Instant.now(), operation = message.third)
            recentProjectsRepository.save(recentProject)
        }

        //Clean
        user?.let {
            val recentProjects = recentProjectsRepository.findByUserOrderByUpdateDateDesc(it)
            val projectsToClean = if (recentProjects.size > projectsConfiguration.maxRecentProjectsHistorySize) {
                recentProjects.takeLast(recentProjects.size - projectsConfiguration.maxRecentProjectsHistorySize)
            } else null
            projectsToClean?.let { recentProjectsRepository.deleteAll(it) }
        }
    }
}