package com.mlreef.rest.feature.caches

import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.AuditEntity
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.feature.caches.domain.PublicProjectHash
import com.mlreef.rest.feature.caches.repositories.PublicProjectsRepository
import com.mlreef.rest.feature.project.ProjectResolverService
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Lazy
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
    fun getPublicProjectsIdsMap(): Map<UUID, AccessLevel>
    fun getPublicProjectsGitlabIdsList(): List<Long>
    fun getPublicProjectsIdsList(page: Pageable): Page<UUID>
    fun getPublicProjectsGitlabIdsList(page: Pageable): Page<Long>
}

@Service
class RedisPublicProjectsCacheService(
    publicProjectsRepository: PublicProjectsRepository,
    private val gitlabClient: GitlabRestClient,
    @Lazy
    private val projectResolverService: ProjectResolverService,
) : PublicProjectsCacheService {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    init {
        log.info("Public project service run...")
    }

    private val initializedProjectsRepository: PublicProjectsRepository by lazy {
        val publicProjectsList = gitlabClient.unauthenticatedGetAllPublicProjects()
        val projectsList = publicProjectsList.map {
            val projectInDb = projectResolverService.resolveProject(projectGitlabId = it.id)
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

    override fun getPublicProjectsIdsMap(): Map<UUID, AccessLevel> =
        getPublicProjectsIdsList().map { it to AccessLevel.VISITOR }.toMap()

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
        val projectAny = projectResolverService.resolveProject(projectId)

        if (projectAny == null) {
            val projectHash = initializedProjectsRepository.findByProjectId(projectId)
            if (projectHash != null) deleteProjectFromCache(projectHash)
            return
        }

        val projectInDb = projectAny
        val projectWithId = projectAny as AuditEntity

        var projectInGitlab: GitlabProject?

        try {
            projectInGitlab = gitlabClient.adminGetProject(projectInDb.gitlabId)
        } catch (nfex: NotFoundException) {
            projectInGitlab = null
        }

        if (projectInGitlab == null || projectInGitlab.visibility != GitlabVisibility.PUBLIC) {
            val projectHash = initializedProjectsRepository.findByIdOrNull(projectInDb.gitlabId)
            if (projectHash != null)
                deleteProjectFromCache(projectHash)
        } else {
            val projectHash = initializedProjectsRepository.findByIdOrNull(projectInDb.gitlabId)
                ?: PublicProjectHash(projectInDb.gitlabId, projectWithId.id)
            saveProjectToCache(projectHash)
        }
    }

    private fun saveProjectToCache(hash: PublicProjectHash) {
        initializedProjectsRepository.save(hash)
    }

    private fun deleteProjectFromCache(hash: PublicProjectHash) {
        initializedProjectsRepository.delete(hash)
    }

}