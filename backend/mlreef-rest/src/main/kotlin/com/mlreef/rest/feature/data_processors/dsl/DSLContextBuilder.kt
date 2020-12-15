package com.mlreef.rest.feature.data_processors.dsl

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.BaseEnvironmentsRepository
import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
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
    var environments: ArrayList<BaseEnvironmentBuilder> = arrayListOf()

    fun tag(action: SearchableTagBuilder.() -> Unit): SearchableTagBuilder {
        val builder = SearchableTagBuilder()
        action.invoke(builder)
        tags.add(builder)
        return builder
    }

    fun environment(action: BaseEnvironmentBuilder.() -> Unit): BaseEnvironmentBuilder {
        val builder = BaseEnvironmentBuilder()
        action.invoke(builder)
        environments.add(builder)
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

    fun mergeSave(
        repository: DataProcessorRepository,
        items: List<DataProcessor>,
    ) = items.map { mergeSave(repository, it) }

    fun mergeSave(
        repository: DataProcessorRepository,
        item: DataProcessor,
    ): DataProcessor =
        when (val existing = repository.findByIdOrNull(item.id)) {
            null -> {
                log.info("CREATE DataProcessor: $item")
                repository.save(item)
            }
            else -> {
                log.info("MERGE DataProcessor: ${item.toString()}")
                repository.save(existing.copy(
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
            }
        }

    fun mergeSave(
        repository: ProcessorVersionRepository,
        author: Subject,
        items: List<ProcessorVersion>,
    ) = items.map { mergeSave(repository, author, it) }

    private fun mergeSave(
        repository: ProcessorVersionRepository,
        author: Subject,
        item: ProcessorVersion,
    ): ProcessorVersion {
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

    fun mergeSave(
        restClient: GitlabRestClient,
        repository: CodeProjectRepository,
        author: Subject,
        items: List<CodeProject>,
    ) = items.map { mergeSave(restClient, repository, author, it) }

    private fun mergeSave(
        restClient: GitlabRestClient,
        repository: CodeProjectRepository,
        author: Subject,
        item: CodeProject,
    ): CodeProject {
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
        val refreshed = refreshWithGitlab(restClient, author, merged)

        return if (refreshed == null) {
            log.error("STRANGE: Cannot create project and did also not find in Gitlab with slug ${item.slug}")
            log.error("STRANGE: Saving a detached CodeProject: ${item.slug}")
            // 9/100 < x < 99/100 of MAX_VALUE
            val randomHighInt = ((9.0 / 10.0 * Int.MAX_VALUE) * (Math.random() + 0.1)).toLong()
            log.error("DANGEROUS: gilabId must still be unique!... so inventing a random one: $randomHighInt")
            repository.save(merged.copy(gitlabId = randomHighInt))
        } else {
            log.info("WITH GITLAB CodeProject: ${item.toString()}")
            repository.save(refreshed)
        }
    }

    fun mergeSave(
        repository: BaseEnvironmentsRepository,
        items: List<BaseEnvironments>,
    ) = items.map { mergeSave(repository, it) }

    fun mergeSave(
        repository: BaseEnvironmentsRepository,
        item: BaseEnvironments,
    ): BaseEnvironments =
        when (val existing = repository.findByIdOrNull(item.id)) {
            null -> {
                log.info("CREATE Base Environment: $item")
                repository.save(item)
            }
            else -> {
                log.info("MERGE Base Environment: ${item}")
                repository.save(existing.copy(
                    title = item.title,
                    dockerImage = item.dockerImage,
                    description = item.description,
                    requirements = item.requirements,
                    machineType = item.machineType,
                    sdkVersion = item.sdkVersion,
                ))
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
        visibilityScope = new.visibilityScope,
    )


    private fun refreshWithGitlab(
        restClient: GitlabRestClient,
        author: Subject,
        item: CodeProject,
    ): CodeProject? {
        val projects1 = restClient.adminGetUserProjects(author.gitlabId!!)
        val projects2 = restClient.adminGetProjects(search = item.slug).filter { it.path == item.slug }

        val projects = arrayListOf<GitlabProject>().apply {
            addAll(projects1)
            addAll(projects2)
        }
        val candidates = projects.filter { it.path == item.slug }

        val gitLabProject: GitlabProject? = if (candidates.isNotEmpty()) {
            val first = candidates.first()
            log.info("Retrieved existing project ${first.path} from Gitlab")
            first
        } else {
            try {
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
                null
            }
        }

        return if (gitLabProject == null) {
            null
        } else {
            item.copy(
                slug = gitLabProject.path,
                url = gitLabProject.webUrl,
                name = gitLabProject.name,
                description = gitLabProject.description ?: item.description,
                gitlabPath = gitLabProject.path,
                gitlabPathWithNamespace = gitLabProject.pathWithNamespace,
                gitlabNamespace = gitLabProject.pathWithNamespace.split("/")[0],
                gitlabId = gitLabProject.id
            )
        }
    }

    fun mergeSaveEverything(
        restClient: GitlabRestClient,
        codeProjectRepository: CodeProjectRepository,
        dataProcessorRepository: DataProcessorRepository,
        processorVersionRepository: ProcessorVersionRepository,
        baseEnvironmentsRepository: BaseEnvironmentsRepository,
        author: Subject
    ) {
        val codeProjectsBuilders = this.codeProjects
        val processorBuilders = this.processors
        val environmentsBuilders = this.environments

        val environments = environmentsBuilders.map { it.build() }
        val codeProjects = codeProjectsBuilders.map { it.build() }
        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        val processors = versions.map { it.dataProcessor }

        executeLogged("2a. ENVIRONMENTS") {
            mergeSave(baseEnvironmentsRepository, environments)
        }
        executeLogged("2b. CODE PROJECTS") {
            mergeSave(restClient, codeProjectRepository, author, codeProjects)
        }
        executeLogged("2c. DATA PROCESSORS") {
            mergeSave(dataProcessorRepository, processors)
        }
        executeLogged("2d. PROCESSOR VERSIONS & PARAMETERS") {
            mergeSave(processorVersionRepository, author, versions)
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


