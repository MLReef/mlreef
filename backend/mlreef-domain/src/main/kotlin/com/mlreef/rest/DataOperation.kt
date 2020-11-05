package com.mlreef.rest

import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.DiscriminatorValue
import javax.persistence.Entity

/**
 * DataOperation perform on Data and create Data.
 * Therefore they must be chainable
 */
@Entity
@DiscriminatorValue("OPERATION")
class DataOperation(
    id: UUID,
    slug: String,
    name: String,
    inputDataType: DataType,
    outputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default(),
    description: String = "",
    author: Subject? = null,
    codeProject: CodeProject? = null,
    codeProjectId: UUID? = codeProject?.id,
    termsAcceptedById: UUID? = null,
    termsAcceptedAt: ZonedDateTime? = null,
    licenceName: String? = null,
    licenceText: String? = null,
    lastPublishedAt: ZonedDateTime? = null,
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : DataProcessor(
    id = id,
    slug = slug,
    name = name,
    author = author,
    inputDataType = inputDataType,
    outputDataType = outputDataType,
    type = DataProcessorType.OPERATION,
    visibilityScope = visibilityScope,
    description = description,
    codeProject = codeProject,
    codeProjectId = codeProject?.id ?: codeProjectId,
    termsAcceptedById = termsAcceptedById,
    termsAcceptedAt = termsAcceptedAt,
    licenceName = licenceName,
    licenceText = licenceText,
    lastPublishedAt = lastPublishedAt,
    version = version,
    createdAt = createdAt,
    updatedAt = updatedAt
) {
    override fun isChainable(): Boolean = true

    override fun copy(
        slug: String,
        name: String,
        codeProject: CodeProject?,
        codeProjectId: UUID?,
        inputDataType: DataType,
        outputDataType: DataType,
        visibilityScope: VisibilityScope,
        description: String,
        author: Subject?,
        termsAcceptedById: UUID?,
        termsAcceptedAt: ZonedDateTime?,
        licenceName: String?,
        licenceText: String?,
        lastPublishedAt: ZonedDateTime?,
    ): DataOperation = DataOperation(
        id = id,
        slug = slug,
        name = name,
        description = description,
        author = author,
        inputDataType = inputDataType,
        outputDataType = outputDataType,
        visibilityScope = visibilityScope,
        codeProject = codeProject,
        codeProjectId = codeProjectId,
        termsAcceptedById = termsAcceptedById ?: this.termsAcceptedById,
        termsAcceptedAt = termsAcceptedAt ?: this.termsAcceptedAt,
        licenceName = licenceName ?: this.licenceName,
        licenceText = licenceText ?: this.licenceText,
        lastPublishedAt = lastPublishedAt ?: this.lastPublishedAt,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )
}
