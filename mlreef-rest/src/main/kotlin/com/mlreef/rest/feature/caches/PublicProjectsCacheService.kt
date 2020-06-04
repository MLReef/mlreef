package com.mlreef.rest.feature.caches

import com.mlreef.rest.AuditEntity
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.MLProject
import com.mlreef.rest.exceptions.GitlabNotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.feature.caches.repositories.PublicProjectsRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import javax.annotation.PostConstruct


interface PublicProjectsCacheService : MessageListener {
    fun isProjectPublic(projectId: UUID): Boolean
    fun isProjectPublic(gitlabId: Long): Boolean
    fun getPublicProjectsIdsList(): List<UUID>
    fun getPublicProjectsGitlabIdsList(): List<Long>
    fun getPublicProjectsIdsList(page: Pageable): Page<UUID>
    fun getPublicProjectsGitlabIdsList(page: Pageable): Page<Long>
}

@Service
class RedisPublicProjectsCacheService(
    publicProjectsRepository: PublicProjectsRepository,
    private val codeProjectRepository: CodeProjectRepository,
    private val dataProjectsRepository: DataProjectRepository,
    private val gitlabClient: GitlabRestClient
) : PublicProjectsCacheService {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private val initializedProjectsRepository: PublicProjectsRepository by lazy {
        val publicProjectsList = gitlabClient.unauthenticatedGetAllPublicProjects()
        val projectsList = publicProjectsList.map {
            val projectInDb = (
                codeProjectRepository.findByGitlabId(it.id)
                    ?: dataProjectsRepository.findByGitlabId(it.id)
                ) as? AuditEntity?
            PublicProjectHash(it.id, projectInDb?.id)
        }
        publicProjectsRepository.saveAll(projectsList)
        publicProjectsRepository
    }

    @PostConstruct
    fun onCreate() {
        log.debug("Redis public projects cache creation...")
    }

    override fun onMessage(message: Message, pattern: ByteArray?) {
        try {
            log.debug("Got a message: ${String(message.body)}")
            val projectId = UUID.fromString(String(message.body, Charsets.UTF_8).substring(7))
            refreshProjectInCache(projectId)
        } catch (ex: Exception) {
            log.error("Cannot update project in cache. Exception: $ex. Message: ${String(message.body)}")
        }
    }

    override fun isProjectPublic(projectId: UUID) = initializedProjectsRepository.findByProjectId(projectId) != null

    override fun isProjectPublic(gitlabId: Long) = initializedProjectsRepository.findByIdOrNull(gitlabId) != null

    override fun getPublicProjectsIdsList(): List<UUID> {
        return getProjectList(null)
            .content
            .map { it.projectId }
            .filterNotNull()
            .toList()
    }

    override fun getPublicProjectsGitlabIdsList(): List<Long> {
        return getProjectList(null)
            .content
            .map { it.gitlabId }
            .toList()
    }

    override fun getPublicProjectsIdsList(page: Pageable): Page<UUID> {
        return getProjectList(page).map { it.projectId }
    }

    override fun getPublicProjectsGitlabIdsList(page: Pageable): Page<Long> {
        return getProjectList(page).map { it.gitlabId }
    }

    private fun getProjectList(page: Pageable?): Page<PublicProjectHash> {
        if (page != null) {
            return initializedProjectsRepository.findAll(page)
        } else {
            val list = initializedProjectsRepository.findAll().toMutableList()
            return PageImpl(list)
        }
    }

    private fun refreshProjectInCache(projectId: UUID) {
        val projectAny = (
            codeProjectRepository.findByIdOrNull(projectId)
                ?: dataProjectsRepository.findByIdOrNull(projectId)
            ) as Any?

        if (projectAny == null) {
            val projectHash = initializedProjectsRepository.findByProjectId(projectId)
            if (projectHash != null) initializedProjectsRepository.delete(projectHash)
            return
        }

        val projectInDb = projectAny as MLProject
        val projectWithId = projectAny as AuditEntity

        var projectInGitlab: GitlabProject?

        try {
            projectInGitlab = gitlabClient.adminGetProject(projectInDb.gitlabId)
        } catch (nfex: GitlabNotFoundException) {
            projectInGitlab = null
        }

        if (projectInGitlab == null || projectInGitlab.visibility != GitlabVisibility.PUBLIC) {
            val projectHash = initializedProjectsRepository.findByIdOrNull(projectInDb.gitlabId)
            if (projectHash != null)
                initializedProjectsRepository.delete(projectHash)
        } else {
            val projectHash = initializedProjectsRepository.findByIdOrNull(projectInDb.gitlabId)
                ?: PublicProjectHash(projectInDb.gitlabId, projectWithId.id)
            initializedProjectsRepository.save(projectHash)
        }
    }
}