package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.AccessLevel
import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataProject
import com.mlreef.rest.DataType
import com.mlreef.rest.Experiment
import com.mlreef.rest.Project
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.helpers.DataClassWithId
import com.mlreef.rest.helpers.ProjectOfUser
import com.mlreef.rest.marketplace.SearchableTag
import com.mlreef.rest.marketplace.SearchableType
import org.springframework.data.domain.Persistable
import java.util.UUID

@JsonInclude(JsonInclude.Include.NON_NULL)
open class ProjectDto(
    override val id: UUID?,
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
    open val inputDataTypes: List<DataType>,
    open val outputDataTypes: List<DataType>,
    open val searchableType: SearchableType,
    open val dataProcessor: DataProcessorDto?
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
    override val inputDataTypes: List<DataType>,
    override val outputDataTypes: List<DataType>,
    override val searchableType: SearchableType,
    override val dataProcessor: DataProcessorDto?,
    val experiments: List<ExperimentDto> = listOf()
) : ProjectDto(
    id, slug, url, ownerId, name,
    gitlabNamespace, gitlabPath, gitlabId,
    globalSlug, visibilityScope, description,
    tags, starsCount, forksCount,
    inputDataTypes, outputDataTypes,
    searchableType, dataProcessor)

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
    override val inputDataTypes: List<DataType>,
    override val outputDataTypes: List<DataType>,
    override val searchableType: SearchableType,
    override val dataProcessor: DataProcessorDto?
) : ProjectDto(
    id, slug, url, ownerId, name,
    gitlabNamespace, gitlabPath, gitlabId,
    globalSlug, visibilityScope, description,
    tags, starsCount, forksCount,
    inputDataTypes, outputDataTypes,
    searchableType, dataProcessor)

internal fun ProjectOfUserDto.toDomain() = ProjectOfUser(
    id = this.id,
    name = this.name,
    accessLevel = this.accessLevel
)

@Suppress("UNCHECKED_CAST")
fun Project.toDto(): ProjectDto {
    val id = (this as? Persistable<UUID>)?.id
    return object : ProjectDto(
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
        this.inputDataTypes.toList(),
        this.outputDataTypes.toList(),
        searchableType,
        this.dataProcessor?.toDto()
    ) {}
}

internal fun DataProject.toDto(): DataProjectDto {
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
        inputDataTypes = this.inputDataTypes.toList(),
        outputDataTypes = this.outputDataTypes.toList(),
        searchableType = searchableType,
        dataProcessor = null,
        experiments = this.experiments.map(Experiment::toDto)
    )
}

internal fun CodeProject.toDto() =
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
        inputDataTypes = this.inputDataTypes.toList(),
        outputDataTypes = this.outputDataTypes.toList(),
        searchableType = searchableType,
        dataProcessor = this.dataProcessor?.toDto()
    )
