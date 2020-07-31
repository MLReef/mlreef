package com.mlreef.rest.feature.data_processors.dsl

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.Subject
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull


fun <T> ensureData(author: Subject, token: String, action: DSLContextBuilder.() -> T): DSLContextBuilder {
    val context = DSLContextBuilder(author, token)
    action.invoke(context)
    return context
}

class DSLContextBuilder(val owner: Subject, val userToken: String) {

    val log = LoggerFactory.getLogger(this.javaClass)

    var codeProjects: ArrayList<CodeProjectBuilder> = arrayListOf()
    var processors: ArrayList<DataProcessorBuilder> = arrayListOf()
    var tags: ArrayList<SearchableTagBuilder> = arrayListOf()

    fun tag(action: SearchableTagBuilder.() -> Unit): SearchableTagBuilder {
        val builder = SearchableTagBuilder()
        action.invoke(builder)
        tags.add(builder)
        return builder
    }

    fun codeProject(action: CodeProjectBuilder.() -> Unit): CodeProjectBuilder {
        val builder = CodeProjectBuilder()
        action.invoke(builder)
        builder.owner = owner
        codeProjects.add(builder)
        return builder
    }

    fun operation(action: DataProcessorBuilder.() -> Unit) = dataProcessor(DataProcessorType.OPERATION, action)
    fun visualization(action: DataProcessorBuilder.() -> Unit) = dataProcessor(DataProcessorType.VISUALIZATION, action)
    fun model(action: DataProcessorBuilder.() -> Unit) = dataProcessor(DataProcessorType.ALGORITHM, action)

    private fun dataProcessor(processorType: DataProcessorType, action: DataProcessorBuilder.() -> Unit): DataProcessorBuilder {
        val builder = DataProcessorBuilder(processorType)
        action.invoke(builder)
        builder.author = owner
        processors.add(builder)
        return builder
    }


    fun buildTags() = tags.map { it.build() }

    fun buildCodeProjects() = codeProjects.map { it.build() }

    fun buildProcessorVersions() = processors.map { it.buildVersion(it.buildProcessor()) }

    fun mergeSave(repository: DataProcessorRepository,
                  items: List<DataProcessor>
    ) = items.map { mergeSave(repository, it) }

    fun mergeSave(repository: DataProcessorRepository,
                  item: DataProcessor): DataProcessor {

        log.info("CREATE/MERGE DataProcessor: $item")
        val existing = repository.findByIdOrNull(item.id) ?: return repository.save(item)

        log.info("MERGE DataProcessor: ${item.toString()}")

        return when (existing) {
            is DataOperation -> repository.save(existing.copy(
                codeProjectId = item.codeProjectId,
                slug = item.slug,
                name = item.name,
                inputDataType = item.inputDataType,
                outputDataType = item.outputDataType,
                visibilityScope = item.visibilityScope,
                description = item.description,
                author = item.author,
                termsAcceptedById = item.termsAcceptedById,
                termsAcceptedAt = item.termsAcceptedAt,
                licenceName = item.licenceName,
                licenceText = item.licenceText,
                lastPublishedAt = item.lastPublishedAt
            ))
            is DataAlgorithm -> repository.save(existing.copy(
                codeProjectId = item.codeProjectId,
                slug = item.slug,
                name = item.name,
                inputDataType = item.inputDataType,
                outputDataType = item.outputDataType,
                visibilityScope = item.visibilityScope,
                description = item.description,
                author = item.author,
                termsAcceptedById = item.termsAcceptedById,
                termsAcceptedAt = item.termsAcceptedAt,
                licenceName = item.licenceName,
                licenceText = item.licenceText,
                lastPublishedAt = item.lastPublishedAt
            ))
            is DataVisualization -> repository.save(existing.copy(
                codeProjectId = item.codeProjectId,
                slug = item.slug,
                name = item.name,
                inputDataType = item.inputDataType,
                outputDataType = item.outputDataType,
                visibilityScope = item.visibilityScope,
                description = item.description,
                author = item.author,
                termsAcceptedById = item.termsAcceptedById,
                termsAcceptedAt = item.termsAcceptedAt,
                licenceName = item.licenceName,
                licenceText = item.licenceText,
                lastPublishedAt = item.lastPublishedAt
            ))
            else -> {
                log.warn("Could not mergePersist DataProcessor: ${item.toString()}")
                throw IllegalArgumentException("Cannot use this type: $item")
            }
        }
    }

    fun mergeSave(repository: ProcessorVersionRepository, items: List<ProcessorVersion>) = items.map { mergeSave(repository, it) }
    private fun mergeSave(repository: ProcessorVersionRepository, item: ProcessorVersion): ProcessorVersion {
        log.info("CREATE/MERGE processorVersion: ${item.toString()}")
        val existing = repository.findByIdOrNull(item.id) ?: return repository.save(item)
        log.info("MERGE processorVersion: ${item.toString()}")
        return repository.save(existing.copy(
            publisher = item.publisher,
            parameters = item.parameters,
            number = item.number,
            branch = item.branch,
            command = item.command,
            baseEnvironment = item.baseEnvironment,
            metricSchema = item.metricSchema,
            pipelineJobInfo = item.pipelineJobInfo,
            publishedAt = item.publishedAt
        ))
    }

    fun mergeSave(restClient: GitlabRestClient,
                  repository: CodeProjectRepository,
                  items: List<CodeProject>) = items.map { mergeSave(restClient, repository, it) }

    private fun mergeSave(restClient: GitlabRestClient,
                          repository: CodeProjectRepository,
                          item: CodeProject): CodeProject {
        log.info("CREATE/MERGE CodeProject: ${item.toString()}")
        val existing = repository.findByIdOrNull(item.id)

        // update existing or use new one
        val merged = if (existing != null) {
            log.info("MERGE CodeProject: ${item.toString()}")
            merge(existing, item)
        } else {
            log.info("CREATE CodeProject: ${item.toString()}")
            item
        }

        // create in gitlab or use gitlab current information for gitlab fields
        val refreshed = refreshWithGitlab(restClient, merged)

        if (refreshed == null) {
            log.error("STRANGE: Cannot create project and did also not find in Gitlab with slug ${item.slug}")
            log.error("STRANGE: Saving a detached CodeProject: ${item.slug}")
            return repository.save(merged)
        } else {
            log.info("WITH GITLAB CodeProject: ${item.toString()}")
            return repository.save(refreshed)
        }
    }

    private fun merge(existing: CodeProject, new: CodeProject) = existing.copy<CodeProject>(
        url = new.url,
        slug = new.slug,
        name = new.name,
        description = new.description,
        gitlabNamespace = new.gitlabNamespace,
        gitlabPathWithNamespace = new.gitlabPathWithNamespace,
        gitlabPath = new.gitlabPath,
        gitlabId = new.gitlabId,
        globalSlug = new.globalSlug,
        stars = new.stars,
        inputDataTypes = new.inputDataTypes,
        outputDataTypes = new.outputDataTypes,
        tags = new.tags,
        visibilityScope = new.visibilityScope
    )


    private fun refreshWithGitlab(restClient: GitlabRestClient, item: CodeProject): CodeProject? {
        val gitLabProject: GitlabProject? = try {
            restClient.createProject(
                token = userToken,
                slug = item.slug,
                name = item.name,
                defaultBranch = "master",
                nameSpaceId = null,
                initializeWithReadme = true,
                description = item.description,
                visibility = "public")
                .also {
                    log.info("Created project ${item.slug} in Gitlab")
                }
        } catch (e: Exception) {
            log.warn(e.message)
            val projects = restClient.adminGetProjects()
            val candidates = projects.filter { it.path == item.slug }
            if (candidates.isNotEmpty()) {
                candidates.first().also {
                    log.info("Retrieved existing project ${item.slug} from Gitlab")
                }
            } else {
                null
            }
        }

        return if (gitLabProject != null) {
            val pathWithNamespace = gitLabProject.pathWithNamespace
            val group = pathWithNamespace.split("/")[0]
            val codeProject = item.copy<CodeProject>(
                slug = gitLabProject.path,
                url = gitLabProject.webUrl,
                name = gitLabProject.name,
                description = gitLabProject.description ?: item.description,
                gitlabPath = gitLabProject.path,
                gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
                gitlabNamespace = group,
                gitlabId = gitLabProject.id
            )
            return codeProject
        } else {
            null
        }
    }

    fun mergeSaveEverything(restClient: GitlabRestClient, codeProjectRepository: CodeProjectRepository, dataProcessorRepository: DataProcessorRepository, processorVersionRepository: ProcessorVersionRepository) {
        val codeProjectsBuilders = this.codeProjects
        val processorBuilders = this.processors
        val codeProjects = codeProjectsBuilders.map { it.build() }
        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        val processors = versions.map { it.dataProcessor }

        executeLogged("2a. CODE PROJECTS") {
            mergeSave(restClient, codeProjectRepository, codeProjects)
        }
        executeLogged("2b. DATA PROCESSORS") {
            mergeSave(dataProcessorRepository, processors)
        }
        executeLogged("2c. PROCESSOR VERSIONS & PARAMETERS") {
            mergeSave(processorVersionRepository, versions)
        }
    }

    internal fun <T> executeLogged(message: String, f: () -> T): T {
        try {
            log.info("DataLoading: $message")
            val result = f.invoke()
            log.info("DataLoading: $message -> DONE")
            return result
        } catch (e: Exception) {
            log.error("DataLoading: $message -> FAIL (${e.message})")
            throw e
        }
    }
}


