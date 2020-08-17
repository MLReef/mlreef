package com.mlreef.rest.feature.data_processors

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.Person
import com.mlreef.rest.PersonRepository
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.SearchableTagRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.GitlabVisibility
import com.mlreef.rest.external_api.gitlab.dto.GitlabProject
import com.mlreef.rest.external_api.gitlab.dto.GitlabUser
import com.mlreef.rest.persistence.AbstractRepositoryTest
import com.mlreef.rest.utils.RandomUtils
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.slot
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.fail
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.annotation.Commit
import java.util.UUID
import javax.transaction.Transactional

@Transactional
@Commit
class InitialDataLoaderTest : AbstractRepositoryTest() {

    lateinit var author: Person
    lateinit var token: String

    lateinit var initialDataLoader: InitialDataLoader

    @Autowired
    private lateinit var codeProjectRepository: CodeProjectRepository

    @Autowired
    private lateinit var dataProcessorRepository: DataProcessorRepository

    @Autowired
    private lateinit var processorVersionRepository: ProcessorVersionRepository


    @Autowired
    private lateinit var searchableTagRepository: SearchableTagRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @MockkBean(relaxed = true, relaxUnitFun = true)
    private lateinit var restClient: GitlabRestClient

    @BeforeEach
    @Transactional
    fun prepare() {
        truncateDbTables(listOf("subject", "marketplace_tag", "data_processor", "mlreef_project"), cascade = true)

        author = personRepository.save(Person(id = UUID.randomUUID(), slug = "user-demo", name = "Author1", gitlabId = RandomUtils.randomGitlabId()))
        token = "token"
        initialDataLoader = InitialDataLoader()

        val slugSlot = slot<String>()
        val projectNameSlot = slot<String>()
        val visibilitySlot = slot<String>()
        var gitlabId_projects = 0L
        every {
            restClient.createProject(
                token = any(),
                slug = capture(slugSlot),
                name = capture(projectNameSlot),
                defaultBranch = any(),
                nameSpaceId = any(),
                description = any(),
                visibility = capture(visibilitySlot),
                initializeWithReadme = any()
            )
        } answers {
            GitlabProject(
                gitlabId_projects++,
                projectNameSlot.captured,
                "test-name-withnamespace$gitlabId_projects",
                slugSlot.captured,
                "tes-path-with-namespace$gitlabId_projects",
                GitlabUser(1L, "testusername", "testuser"),
                1L,
                visibility = GitlabVisibility.valueOf(visibilitySlot.captured.toUpperCase())
            )
        }
    }

    @Transactional
    @Test
    fun `initialDataLoader can prepare`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjects = buildContext.codeProjects
        val processors = buildContext.processors

        assertThat(codeProjects).isNotEmpty
        assertThat(processors).isNotEmpty
    }

    private fun checkState(withVersions: Boolean = true) {
        assertThat(codeProjectRepository.findByIdOrNull(initialDataLoader.augment_projectId)).isNotNull
        assertThat(codeProjectRepository.findByIdOrNull(initialDataLoader.leeFilter_projectId)).isNotNull
        assertThat(codeProjectRepository.findByIdOrNull(initialDataLoader.randomCrop_projectId)).isNotNull
        assertThat(codeProjectRepository.findByIdOrNull(initialDataLoader.resnet50_projectId)).isNotNull
        assertThat(codeProjectRepository.findByIdOrNull(initialDataLoader.dummy_projectId)).isNotNull

        assertThat(dataProcessorRepository.findByIdOrNull(initialDataLoader.augment_id)).isNotNull
        assertThat(dataProcessorRepository.findByIdOrNull(initialDataLoader.leeFilter_id)).isNotNull
        assertThat(dataProcessorRepository.findByIdOrNull(initialDataLoader.randomCrop_id)).isNotNull
        assertThat(dataProcessorRepository.findByIdOrNull(initialDataLoader.resnet50_id)).isNotNull
        assertThat(dataProcessorRepository.findByIdOrNull(initialDataLoader.dummy_id)).isNotNull

        if (withVersions) {
            assertThat(processorVersionRepository.findByIdOrNull(initialDataLoader.augment_id)).isNotNull
            assertThat(processorVersionRepository.findByIdOrNull(initialDataLoader.leeFilter_id)).isNotNull
            assertThat(processorVersionRepository.findByIdOrNull(initialDataLoader.randomCrop_id)).isNotNull
            assertThat(processorVersionRepository.findByIdOrNull(initialDataLoader.resnet50_id)).isNotNull
            assertThat(processorVersionRepository.findByIdOrNull(initialDataLoader.dummy_id)).isNotNull
        }
    }

    @Transactional
    @Test
    fun `initialDataLoader produces saveable codeProjects`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        codeProjectRepository.saveAll(codeProjects)
    }

    @Transactional
    @Test
    fun `initialDataLoader produces saveable tags`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val tagBuilders = buildContext.tags
        val tags = tagBuilders.map { it.build() }
        searchableTagRepository.saveAll(tags)
    }

    @Transactional
    @Test
    @Disabled
    fun `initialDataLoader produces saveable codeProjects & processors`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors

        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        val processors = processorBuilders.map { it.buildProcessor() }
        codeProjectRepository.saveAll(codeProjects)
        dataProcessorRepository.saveAll(processors)
    }

    @Transactional
    @Test
    fun `initialDataLoader produces saveable processors & versions`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors

        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        codeProjectRepository.saveAll(codeProjects)
        dataProcessorRepository.saveAll(versions.map { it.dataProcessor })
        processorVersionRepository.saveAll(versions)
        checkState()
    }

    @Transactional
    @Test
    fun `initialDataLoader merge-saves new processors `() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors
        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        codeProjectRepository.saveAll(codeProjects)

        val processors = processorBuilders.map { it.buildProcessor() }
        buildContext.mergeSave(dataProcessorRepository, processors)
        checkState(withVersions = false)
    }

    @Transactional
    @Test
    fun `initialDataLoader merge-saves existing processors `() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors
        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        val processors = processorBuilders.map { it.buildProcessor() }
        codeProjectRepository.saveAll(codeProjects)
        dataProcessorRepository.saveAll(processors)

        buildContext.mergeSave(dataProcessorRepository, processors)
        checkState(withVersions = false)
    }

    @Transactional
    @Test
    fun `initialDataLoader merge-saves new versions`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors
        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        val processors = processorBuilders.map { it.buildProcessor() }
        codeProjectRepository.saveAll(codeProjects)
        dataProcessorRepository.saveAll(processors)

        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        buildContext.mergeSave(processorVersionRepository, versions)
        checkState()
    }

    @Transactional
    @Test
    @Disabled
    fun `initialDataLoader merge-saves existing versions`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors
        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        val processors = versions.map { it.dataProcessor }

        buildContext.mergeSave(restClient, codeProjectRepository, codeProjects)
        buildContext.mergeSave(dataProcessorRepository, processors)

        processorVersionRepository.saveAll(versions)

        buildContext.mergeSave(processorVersionRepository, versions)
        checkState()
    }

    @Transactional
    @Test
    fun `initialDataLoader merge-saves everything new`() {
        val buildContext = initialDataLoader.prepare(author, token)
        buildContext.mergeSaveEverything(restClient, codeProjectRepository, dataProcessorRepository, processorVersionRepository)
        checkState()
    }

    @Transactional
    @Test
    fun `initialDataLoader merge-saves everything existing`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors
        var mockGitlabId = 0L
        codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        versions.map { it.dataProcessor }

        buildContext.mergeSaveEverything(restClient, codeProjectRepository, dataProcessorRepository, processorVersionRepository)
        checkState()
    }

    @Transactional
    @Test
    fun `initialDataLoader uses new unique UUIDS (except processor-version pairs)`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val codeProjectsBuilders = buildContext.codeProjects
        val processorBuilders = buildContext.processors
        var mockGitlabId = 0L
        val codeProjects = codeProjectsBuilders.map { it.build().copy<CodeProject>(gitlabId = mockGitlabId++) }
        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        val processors = versions.map { it.dataProcessor }

        val codeProjectsIds = hashMapOf<UUID, String>().apply { putAll(codeProjects.map { it.id to "${it.id}-${it.slug}" }) }
        val processorIds = hashMapOf<UUID, String>().apply { putAll(processors.map { it.id to "${it.id}-${it.slug}" }) }
        val paramIds = hashMapOf<UUID, String>()

        versions.forEach {
            it.parameters.map { it.id to "${it.id}-${it.name}" }
                .forEach { paramIds.put(it.first, it.second) }
        }

        hashMapOf<UUID, String>()
            .let { insertOrFail(it, codeProjectsIds) }
            .let { insertOrFail(it, processorIds) }
            .let { insertOrFail(it, paramIds) }

    }

    @Transactional
    @Test
    fun `initialDataLoader uses same id for DataProcessor and its ProcessorVersion`() {
        val buildContext = initialDataLoader.prepare(author, token)
        val processorBuilders = buildContext.processors
        val versions = processorBuilders.map { it.buildVersion(it.buildProcessor()) }
        val processors = versions.map { it.dataProcessor }

        val processorIds = hashMapOf<UUID, String>().apply { putAll(processors.map { it.id to "${it.id}-${it.slug}" }) }
        val versionIds = hashMapOf<UUID, String>().apply { putAll(versions.map { it.id to "${it.id}-${it.dataProcessor.slug}" }) }

        assertThat(processorIds.keys).containsAll(versionIds.keys)
        assertThat(versionIds.keys).containsAll(processorIds.keys)
    }

    private fun insertOrFail(source: Map<UUID, String>, append: Map<UUID, String>): MutableMap<UUID, String> {
        append.keys.forEach {
            if (source.containsKey(it)) {
                val old = source[it]
                val new = append[it]
                fail("DUPLICATE UUIDs on elements: $old and $new")
            }
        }
        return source.toMutableMap().apply { putAll(append) }
    }
}
