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
    command: String,
    inputDataType: DataType,
    outputDataType: DataType,
    visibilityScope: VisibilityScope = VisibilityScope.default(),
    description: String = "",
    author: Subject? = null,
    codeProjectId: UUID? = null,
    parameters: List<ProcessorParameter> = listOf(),
    outputFiles: List<OutputFile> = listOf(),
    metricSchema: MetricSchema = MetricSchema(MetricType.UNDEFINED),
    version: Long? = null,
    createdAt: ZonedDateTime? = null,
    updatedAt: ZonedDateTime? = null
) : DataProcessor(id, slug, name, command, inputDataType, outputDataType, DataProcessorType.OPERATION,
    visibilityScope, description, codeProjectId, author, parameters, outputFiles, metricSchema, version, createdAt, updatedAt) {

    override fun isChainable(): Boolean = true

    fun copy(
        slug: String? = null,
        name: String? = null,
        command: String? = null,
        inputDataType: DataType? = null,
        outputDataType: DataType? = null,
        visibilityScope: VisibilityScope? = null,
        description: String? = null,
        author: Subject? = null,
        parameters: List<ProcessorParameter>? = null,
        outputFiles: List<OutputFile>? = null,
        metricSchema: MetricSchema? = null
    ): DataOperation = DataOperation(
        slug = slug ?: this.slug,
        name = name ?: this.name,
        command = command ?: this.command,
        inputDataType = inputDataType ?: this.inputDataType,
        outputDataType = outputDataType ?: this.outputDataType,
        visibilityScope = visibilityScope ?: this.visibilityScope,
        description = description ?: this.description,
        author = author ?: this.author,
        outputFiles = outputFiles ?: this.outputFiles,
        id = id,
        codeProjectId = codeProjectId ?: this.codeProjectId,
        metricSchema = metricSchema ?: this.metricSchema,
        parameters = parameters ?: this.parameters,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )

    override fun withParameters(parameters: List<ProcessorParameter>,
                                metricSchema: MetricSchema): DataOperation {
        return copy(parameters = parameters, metricSchema = metricSchema)
    }
}
