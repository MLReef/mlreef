package com.mlreef.rest.feature.processors

import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.ProcessorsRepository
import com.mlreef.rest.api.v1.SearchProcessorRequest
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.domain.*
import com.mlreef.rest.domain.repositories.DataTypesRepository
import com.mlreef.rest.domain.repositories.MetricTypesRepository
import com.mlreef.rest.domain.repositories.ParameterTypesRepository
import com.mlreef.rest.domain.repositories.ProcessorTypeRepository
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.auth.UserResolverService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.utils.QueryBuilder
import com.mlreef.rest.utils.Slugs
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID
import javax.persistence.EntityManager

@Service
class ProcessorsService(
    private val projectResolverService: ProjectResolverService,
    private val processorsRepository: ProcessorsRepository,
    private val parameterTypesRepository: ParameterTypesRepository,
    private val metricTypesRepository: MetricTypesRepository,
    private val processorTypeRepository: ProcessorTypeRepository,
    private val dataTypesRepository: DataTypesRepository,
    private val environmentsRepository: BaseEnvironmentsRepository,
    private val entityManager: EntityManager,
    private val userResolverService: UserResolverService,
) {
    private val maxAttemptForPessimisticLockFails = 10
    private val pauseBetweenPessimisticLockAttemptsSec = 5L

    fun searchProcessor(request: SearchProcessorRequest, pageable: Pageable, token: TokenDetails?): Page<Processor> {
        val builder = QueryBuilder(entityManager, Processor::class.java)

        builder.joinInner<CodeProject>("codeProject", alias = "project")

        val finalVisibility = if (token == null || token.isVisitor) {
            VisibilityScope.PUBLIC
        } else {
            request.visibility
        }

        val processorTypes = request.processorTypesOr?.map {
            processorTypeRepository.findByNameIgnoreCase(it) ?: throw NotFoundException("Processor type $it not found")
        }
        val inputTypes = request.inputDataTypes?.map {
            dataTypesRepository.findByNameIgnoreCase(it) ?: throw NotFoundException("Data type $it not found")
        }
        val outputTypes = request.outputDataTypes?.map {
            dataTypesRepository.findByNameIgnoreCase(it) ?: throw NotFoundException("Data type $it not found")
        }
        val inputTypesOr = request.inputDataTypesOr?.map {
            dataTypesRepository.findByNameIgnoreCase(it) ?: throw NotFoundException("Data type $it not found")
        }
        val outputTypesOr = request.outputDataTypesOr?.map {
            dataTypesRepository.findByNameIgnoreCase(it) ?: throw NotFoundException("Data type $it not found")
        }

        val publishers = request.publishersOr?.map {
            val userId = it.tryToUUID()
            val username = if (userId == null) it else null
            userResolverService.resolveAccount(username, userId)
                ?: throw NotFoundException("User $it not found")
        }

        val environments = request.environmentsOr?.flatMap {
            val envId = it.tryToUUID()
            val envTitleOrDocker = if (envId == null) it else null
            when {
                envId != null -> listOf(environmentsRepository.findByIdOrNull(envId))
                envTitleOrDocker != null -> listOf(environmentsRepository.findByTitle(envTitleOrDocker)) +
                        environmentsRepository.findByDockerImage(envTitleOrDocker)
                else -> listOf()
            }.filterNotNull().apply { if (this.size == 0) throw NotFoundException("Environment $it not found") }
        }

        if (finalVisibility == VisibilityScope.PRIVATE) {
            builder
                .and()
                .openBracket()
                .equals("visibilityScope", VisibilityScope.PRIVATE, "project")
                .and()
                .`in`("id", token?.projects?.map { it.key } ?: listOf(), "project")
                .closeBracket()
        } else if (finalVisibility == null) {
            builder
                .and()
                .openBracket()
                .openBracket()
                .equals("visibilityScope", VisibilityScope.PRIVATE, "project")
                .and()
                .`in`("id", token?.projects?.map { it.key } ?: listOf(), "project")
                .closeBracket()
                .or()
                .equals("visibilityScope", VisibilityScope.PUBLIC, "project")
                .closeBracket()
        } else {
            builder.and().equals("visibilityScope", VisibilityScope.PUBLIC, "project")
        }

        request.processorIdsOr?.let { builder.and().`in`("id", it) }
        request.projectIdsOr?.let { builder.and().`in`("id", it, "project") }
        processorTypes?.let { builder.and().`in`("processorType", it, "project") }
        inputTypes?.let { builder.and().containsAll("inputDataTypes", it, "project") }
        outputTypes?.let { builder.and().containsAll("outputDataTypes", it, "project") }
        inputTypesOr?.let { builder.and().containsAny("inputDataTypes", it, "project") }
        outputTypesOr?.let { builder.and().containsAny("outputDataTypes", it, "project") }
        publishers?.let { builder.and().`in`("publisher", it) }
        environments?.let { builder.and().`in`("baseEnvironment", it) }
        request.modelTypeOr?.let { builder.and().`in`("modelType", it, "project", caseSensitive = false) }
        request.mlCategoryOr?.let { builder.and().`in`("mlCategory", it, "project", caseSensitive = false) }
        request.slug?.let { builder.and().like("slug", "%$it%", caseSensitive = false) }
        request.slugExact?.let { builder.and().equals("slug", it, caseSensitive = false) }
        request.name?.let { builder.and().like("name", "%$it%", caseSensitive = false) }
        request.nameExact?.let { builder.and().equals("name", it, caseSensitive = false) }
        request.branch?.let { builder.and().like("branch", "%$it%", caseSensitive = false) }
        request.branchExact?.let { builder.and().equals("branch", it, caseSensitive = false) }
        request.statusesOr?.let { builder.and().`in`("status", it, caseSensitive = false) }

        return builder.select(pageable, true) //use distinct because with connect ManyToMany SearchableTags table
    }

    fun getProcessorsForProjectAndBranchOrVersion(
        codeProjectId: UUID,
        branch: String? = null,
        version: String? = null,
        page: Pageable? = null
    ): Iterable<Processor> {
        val project = projectResolverService.resolveCodeProject(codeProjectId)
            ?: throw NotFoundException("Project $codeProjectId not found")

        return when {
            branch != null && version != null -> {
                val processor = this.getProcessorForProjectAndBranchAndVersion(project, branch, version)
                processor?.let {
                    if (page != null) PageImpl(listOf(it), page, 1) else listOf(it)
                } ?: if (page != null) Page.empty() else listOf()
            }
            branch != null -> {
                if (page != null) {
                    processorsRepository.getByCodeProjectAndBranch(project, branch, page)
                } else {
                    processorsRepository.getByCodeProjectAndBranch(project, branch)
                }
            }
            version != null -> {
                if (page != null) {
                    processorsRepository.getByCodeProjectAndVersion(project, version, page)
                } else {
                    processorsRepository.getByCodeProjectAndVersion(project, version)
                }
            }
            else -> {
                if (page != null) {
                    processorsRepository.getByCodeProject(project, page)
                } else {
                    processorsRepository.getByCodeProject(project)
                }
            }
        }
    }

    @Transactional
    fun getProcessorsForProjectAndBranchAndStatuses(
        codeProjectId: UUID,
        branch: String? = null,
        statuses: List<PublishStatus>,
    ): List<Processor> {
        val project = projectResolverService.resolveCodeProject(codeProjectId)
            ?: throw NotFoundException("Project $codeProjectId not found")

        return if (branch == null) {
            processorsRepository.getByCodeProjectAndStatusIn(project, statuses)
        } else {
            processorsRepository.getByCodeProjectAndBranchAndStatusIn(project, branch, statuses)
        }
    }

    fun getProcessorsByPublishStatuses(
        statuses: Collection<PublishStatus>,
        updatedLessThanTimes: Int? = null,
    ): List<Processor> {
        return if (updatedLessThanTimes == null) {
            processorsRepository.getByStatusIn(statuses)
        } else {
            processorsRepository.getByStatusInAndUpdatedTimesLessThan(statuses, updatedLessThanTimes)
        }
    }

    fun getProjectsWithProcessorsExceedNumber(limit: Int, statuses: List<PublishStatus>? = null, forBranch: String? = null, notForBranch: String? = null): List<Triple<UUID, String, Long>> {
        val projects = if (statuses == null) {
            processorsRepository.getProjectIdWithProcessorsExceedNumber(limit.toLong())
        } else {
            processorsRepository.getProjectIdWithProcessorsExceedNumberAndStatuses(limit.toLong(), statuses)
        }

        return projects.map {
            val projectId = it.getOrNull(0) as? UUID
            val branch = it.getOrNull(1) as? String
            val count = it.getOrNull(2) as? Long

            if (projectId != null && branch != null && count != null) {
                Triple(projectId, branch, count)
            } else null
        }
            .filterNotNull()
            .filter { if (forBranch != null) it.second == forBranch else true }
            .filter { if (notForBranch != null) it.second != forBranch else true }
    }

    @Transactional
    fun getProcessorForProjectAndBranchAndVersion(
        codeProject: CodeProject,
        branch: String,
        version: String,
    ): Processor? {
        return processorsRepository.getByCodeProjectAndBranchAndVersionIgnoreCase(codeProject, branch, version)
    }

    fun findProcessor(id: UUID? = null, slug: String? = null, codeProjectId: UUID? = null, branch: String? = null, version: String? = null): Processor? {
        return when {
            id != null -> this.getProcessorById(id)
            slug != null -> this.getProcessorBySlug(slug)
            codeProjectId != null && branch != null && version != null -> this.getProcessorByProjectIdBranchAndVersion(codeProjectId, branch, version)
            else -> throw BadRequestException("Either processor id or slug or code project id + branch + version must be present")
        }
    }

    fun resolveProcessor(id: UUID? = null, slug: String? = null, codeProjectId: UUID? = null, branch: String? = null, version: String? = null): Processor? {
        if (id == null && slug == null && (codeProjectId == null || branch == null || version == null)) throw BadRequestException("Either processor id or slug or code project id + branch + version must be present")
        return id?.let { this.getProcessorById(it) }
            ?: slug?.let { this.getProcessorBySlug(it) }
            ?: codeProjectId?.takeIf { branch != null && version != null }?.let { this.getProcessorByProjectIdBranchAndVersion(it, branch!!, version!!) }
    }

    @Transactional
    fun getProcessorById(id: UUID): Processor? {
        return processorsRepository.findByIdOrNull(id)
    }

    @Transactional
    fun getProcessorByProjectIdBranchAndVersion(projectId: UUID, branch: String, version: String): Processor? {
        return this.getProcessorForProjectAndBranchAndVersion(
            projectResolverService.resolveCodeProject(projectId) ?: throw NotFoundException("Project $projectId not found"),
            branch,
            version
        )
    }

    @Transactional
    fun getProcessorBySlug(slug: String): Processor? {
        return processorsRepository.findExactBySlug(slug)
    }

    fun saveProcessor(processor: Processor): Processor {
        return processorsRepository.save(processor)
    }

    fun deleteProcessor(processor: Processor) {
        return processorsRepository.delete(processor)
    }

    fun getParameterTypeByName(name: String): ParameterType {
        return parameterTypesRepository.findByNameIgnoreCase(name)
            ?: throw NotFoundException(ErrorCode.NotFound, "Parameter type $name not found")
    }

    @Transactional
    fun createProcessorForCodeProject(
        codeProject: CodeProject,
        slug: String? = null,
        name: String? = null,
        branch: String,
        version: String,
        description: String? = null,
        mainScriptPath: String? = null,
        author: Account,
        parameters: Collection<Parameter> = listOf()
    ): Processor {
        return processorsRepository.save(
            Processor(
                UUID.randomUUID(),
                codeProject,
                mainScriptPath,
                null,
                name,
                slug ?: Slugs.toSlug("${codeProject.slug}-$branch-$version"),
                description,
                branch,
                version,
                publisher = author,
                status = PublishStatus.PUBLISH_CREATED,
                parameters = parameters.toMutableSet(),
                publishedAt = Instant.now(),
            )
        )
    }


}