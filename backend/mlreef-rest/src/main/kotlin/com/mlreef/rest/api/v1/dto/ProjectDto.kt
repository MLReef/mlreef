package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.domain.AccessLevel
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.Project
import com.mlreef.rest.domain.PublishStatus
import com.mlreef.rest.domain.VisibilityScope
import com.mlreef.rest.domain.helpers.DataClassWithId
import com.mlreef.rest.domain.helpers.ProjectOfUser
import com.mlreef.rest.domain.marketplace.SearchableTag
import com.mlreef.rest.domain.marketplace.SearchableType
import java.time.Instant
import java.util.UUID

//TODO: Optimize forked by user field, as it request all forked projects list, but can request a single one

@JsonInclude(JsonInclude.Include.NON_NULL)
open class ProjectDto(
    override val id: UUID,
    open val slug: String,
    open val url: String,
    open val ownerId: UUID,
    open val name: String,
    open val gitlabNamespace: String,
    open val gitlabPath: String,
    open val gitlabId: Long,
    open val globalSlug: String?,
    open val visibilityScope: VisibilityScope,
    open val description: String,
    open val tags: List<SearchableTagDto>,
    open val starsCount: Int,
    open val forksCount: Int,
    open val inputDataTypes: List<String>,
    open val outputDataTypes: List<String>? = null,
    open val searchableType: SearchableType,
    open val processors: List<ProcessorDto>?,
    open val published: Boolean?,
    open val forkedByUser: Boolean,
    open val processorType: String? = null,
    open val modelType: String? = null,
    open val mlCategory: String? = null,
    open val experiments: List<ExperimentDto>? = null,
    open val forkedFrom: UUID? = null,
) : DataClassWithId

@JsonInclude(JsonInclude.Include.NON_NULL)
open class ProjectShortDto(
    override val id: UUID,
    open val slug: String,
    open val owner: Boolean,
    open val name: String,
    open val searchableType: SearchableType,
    open val published: Boolean?,
) : DataClassWithId

// FIXME: Coverage says: missing tests
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ProjectOfUserDto(
    override val id: UUID,
    val name: String,
    val accessLevel: AccessLevel?
) : DataClassWithId

@JsonInclude(JsonInclude.Include.NON_NULL)
data class DataProjectDto(
    override val id: UUID,
    override val slug: String,
    override val url: String,
    override val ownerId: UUID,
    override val name: String,
    override val gitlabNamespace: String,
    override val gitlabPath: String,
    override val gitlabId: Long,
    override val globalSlug: String?,
    override val visibilityScope: VisibilityScope,
    override val description: String,
    override val tags: List<SearchableTagDto>,
    override val starsCount: Int,
    override val forksCount: Int,
    override val inputDataTypes: List<String>,
    override val searchableType: SearchableType,
    override val experiments: List<ExperimentDto>? = listOf(),
    override val forkedFrom: UUID?,
    override val forkedByUser: Boolean,
) : ProjectDto(
    id, slug, url, ownerId, name,
    gitlabNamespace, gitlabPath, gitlabId,
    globalSlug, visibilityScope, description,
    tags, starsCount, forksCount,
    inputDataTypes, null, searchableType,
    null, null, forkedByUser, null, null, null,
    experiments, forkedFrom,
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class CodeProjectDto(
    override val id: UUID,
    override val slug: String,
    override val url: String,
    override val ownerId: UUID,
    override val name: String,
    override val gitlabNamespace: String,
    override val gitlabPath: String,
    override val gitlabId: Long,
    override val globalSlug: String?,
    override val visibilityScope: VisibilityScope,
    override val description: String,
    override val tags: List<SearchableTagDto>,
    override val starsCount: Int,
    override val forksCount: Int,
    override val inputDataTypes: List<String>,
    override val outputDataTypes: List<String>?,
    override val searchableType: SearchableType,
    override val processors: List<ProcessorDto>?,
    override val published: Boolean?,
    override val processorType: String? = null,
    override val modelType: String? = null,
    override val mlCategory: String? = null,
    override val forkedFrom: UUID?,
    override val forkedByUser: Boolean,
) : ProjectDto(
    id, slug, url, ownerId, name,
    gitlabNamespace, gitlabPath, gitlabId,
    globalSlug, visibilityScope, description,
    tags, starsCount, forksCount,
    inputDataTypes, outputDataTypes,
    searchableType, processors, published, forkedByUser, processorType, modelType, mlCategory, null,
    forkedFrom,
)

internal fun ProjectOfUserDto.toDomain() = ProjectOfUser(
    id = this.id,
    name = this.name,
    accessLevel = this.accessLevel
)

@Suppress("UNCHECKED_CAST")
fun Project.toDto(takeNumberFromList: Int? = 10, onlyPublishedProcessors: Boolean = true, forkedByUser: Boolean? = null) = ProjectDto(
    id,
    this.slug,
    this.url,
    this.ownerId,
    this.name,
    this.gitlabNamespace,
    this.gitlabPath,
    this.gitlabId,
    globalSlug,
    visibilityScope,
    description,
    this.tags.map(SearchableTag::toDto),
    starsCount,
    forksCount,
    this.inputDataTypes.map { it.name },
    if (this is CodeProject) this.outputDataTypes.map { it.name } else null,
    searchableType,
    if (this is CodeProject && ((takeNumberFromList ?: 1) > 0)) {
        this.processors
            .filter { if (onlyPublishedProcessors) (it.status == PublishStatus.PUBLISH_FINISHING || it.status == PublishStatus.PUBLISHED) else true }
            .sortedByDescending { it.publishedAt ?: Instant.now() }
            .apply {
                if (takeNumberFromList != null) this.take(takeNumberFromList)
            }
            .map { it.toDto() }
    } else null,
    if (this is CodeProject) this.wasPublished() else null,
    forkedByUser ?: false,
    if (this is CodeProject) (this.processorType.name) else null,
    if (this is CodeProject) (this.modelType) else null,
    if (this is CodeProject) (this.mlCategory) else null,
    if (this is DataProject && ((takeNumberFromList ?: 1) > 0)) {
        this.experiments
            .sortedByDescending { it.pipelineJobInfo?.startedAt ?: Instant.now() }
            .apply {
                if (takeNumberFromList != null) this.take(takeNumberFromList)
            }
            .map { it.toDto() }
    } else null,
    this.forkParent?.id,
)


@Suppress("UNCHECKED_CAST")
fun Project.toShortDto(requesterId: UUID? = null): ProjectShortDto {
    return ProjectShortDto(
        id,
        this.slug,
        this.ownerId == requesterId,
        this.name,
        searchableType,
        if (this is CodeProject) this.wasPublished() else null
    )
}

internal fun DataProject.toDto(takeNumberFromList: Int? = 10, forkedByUser: Boolean? = null): DataProjectDto {
    return DataProjectDto(
        id = this.id,
        slug = this.slug,
        url = this.url,
        ownerId = this.ownerId,
        name = this.name,
        gitlabNamespace = this.gitlabNamespace,
        gitlabPath = this.gitlabPath,
        gitlabId = this.gitlabId,
        globalSlug = this.globalSlug,
        visibilityScope = this.visibilityScope,
        description = this.description,
        tags = this.tags.map(SearchableTag::toDto),
        starsCount = this.starsCount,
        forksCount = this.forksCount,
        inputDataTypes = this.inputDataTypes.map { it.name },
        searchableType = searchableType,
        experiments = if ((takeNumberFromList ?: 1) > 0) {
            this.experiments
                .sortedByDescending { it.pipelineJobInfo?.startedAt ?: Instant.now() }
                .apply {
                    if (takeNumberFromList != null) this.take(takeNumberFromList)
                }
                .map { it.toDto() }
        } else null,
        forkedFrom = this.forkParent?.id,
        forkedByUser = forkedByUser ?: false,
    )
}

internal fun CodeProject.toDto(takeNumberFromList: Int? = 10, onlyPublishedProcessors: Boolean = true, forkedByUser: Boolean? = null) =
    CodeProjectDto(
        id = this.id,
        slug = this.slug,
        url = this.url,
        ownerId = this.ownerId,
        name = this.name,
        gitlabNamespace = this.gitlabNamespace,
        gitlabPath = this.gitlabPath,
        gitlabId = this.gitlabId,
        globalSlug = this.globalSlug,
        visibilityScope = this.visibilityScope,
        description = this.description,
        tags = this.tags.map(SearchableTag::toDto),
        starsCount = this.starsCount,
        forksCount = this.forksCount,
        inputDataTypes = this.inputDataTypes.map { it.name },
        outputDataTypes = this.outputDataTypes.map { it.name },
        processorType = this.processorType.name,
        searchableType = searchableType,
        processors = if ((takeNumberFromList ?: 1) > 0) {
            this.processors
                .filter { if (onlyPublishedProcessors) (it.status == PublishStatus.PUBLISH_FINISHING || it.status == PublishStatus.PUBLISHED) else true }
                .sortedByDescending { it.publishedAt ?: Instant.now() }
                .apply {
                    if (takeNumberFromList != null) this.take(takeNumberFromList)
                }
                .map { it.toDto() }
        } else null,
        published = this.wasPublished(),
        modelType = this.modelType,
        mlCategory = this.mlCategory,
        forkedFrom = this.forkParent?.id,
        forkedByUser = forkedByUser ?: false,
    )
