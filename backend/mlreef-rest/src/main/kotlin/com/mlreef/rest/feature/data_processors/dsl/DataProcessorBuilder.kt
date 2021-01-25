package com.mlreef.rest.feature.data_processors.dsl

import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.MetricSchema
import com.mlreef.rest.ParameterType
import com.mlreef.rest.PipelineJobInfo
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.PublishingInfo
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import com.mlreef.rest.defaults
import java.time.ZonedDateTime
import java.util.UUID

class DataProcessorBuilder(val processorType: DataProcessorType) {
    lateinit var id: UUID
    lateinit var slug: String
    lateinit var name: String
    lateinit var inputDataType: DataType
    lateinit var outputDataType: DataType
    lateinit var command: String
    var visibilityScope: VisibilityScope = VisibilityScope.default()
    var description: String = ""
    var author: Subject? = null
    var publisher: Subject? = null
    var number: Long = 0
    var branch: String = defaults.branchName()
    var baseEnvironmentId: UUID? = null
    var metricSchema: MetricSchema = MetricSchema.undefined()
    var pipelineJobInfo: PipelineJobInfo? = null
    var publishedAt: ZonedDateTime = ZonedDateTime.now()
    var codeProjectId: UUID? = null
    var termsAcceptedById: UUID? = null
    var termsAcceptedAt: ZonedDateTime? = null
    var licenceName: String? = null
    var licenceText: String? = null
    var lastPublishedAt: ZonedDateTime? = null
    var version: Long? = null
    var createdAt: ZonedDateTime? = null
    var updatedAt: ZonedDateTime? = null

    private var dataProcessor: DataProcessor? = null

    fun buildVersion(dataProcessor: DataProcessor? = null) = ProcessorVersion(
        id = id,
        metricSchema = metricSchema,
        branch = branch,
        dataProcessor = dataProcessor ?: this.buildProcessor(),
        command = command,
        number = number,
        baseEnvironmentId = baseEnvironmentId,
        pipelineJobInfo = pipelineJobInfo,
        parameters = buildParameters(dataProcessor ?: this.buildProcessor()),
        publishingInfo = PublishingInfo(publisher = publisher, publishedAt = publishedAt)
    )

    private fun buildParameters(dataProcessor: DataProcessor): List<ProcessorParameter> {
        return parameters.map {
            ProcessorParameter(
                id = it.id, processorVersionId = dataProcessor.id,
                description = it.description, defaultValue = it.defaultValue,
                name = it.name, type = it.type, group = it.group,
                order = it.order, required = it.required
            )
        }
    }

    fun buildProcessor(): DataProcessor {
        if (dataProcessor != null) return dataProcessor!!

        dataProcessor = when (processorType) {
            DataProcessorType.ALGORITHM -> buildModel()
            DataProcessorType.OPERATION -> buildOperation()
            DataProcessorType.VISUALIZATION -> buildVisualization()
        }

        return dataProcessor!!
    }

    private fun buildOperation() = DataOperation(
        slug = slug,
        name = name,
        inputDataType = inputDataType,
        outputDataType = outputDataType,
        visibilityScope = visibilityScope,
        description = description,
        author = author,
        id = id,
        codeProjectId = codeProjectId,
        termsAcceptedById = termsAcceptedById,
        termsAcceptedAt = termsAcceptedAt,
        licenceName = licenceName,
        licenceText = licenceText,
        lastPublishedAt = lastPublishedAt,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )

    private fun buildModel() = DataAlgorithm(
        slug = slug,
        name = name,
        inputDataType = inputDataType,
        outputDataType = outputDataType,
        visibilityScope = visibilityScope,
        description = description,
        author = author,
        id = id,
        codeProjectId = codeProjectId,
        termsAcceptedById = termsAcceptedById,
        termsAcceptedAt = termsAcceptedAt,
        licenceName = licenceName,
        licenceText = licenceText,
        lastPublishedAt = lastPublishedAt,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt)

    private fun buildVisualization() = DataVisualization(
        slug = slug,
        name = name,
        inputDataType = inputDataType,
        visibilityScope = visibilityScope,
        description = description,
        author = author,
        id = id,
        codeProjectId = codeProjectId,
        termsAcceptedById = termsAcceptedById,
        termsAcceptedAt = termsAcceptedAt,
        licenceName = licenceName,
        licenceText = licenceText,
        lastPublishedAt = lastPublishedAt,
        version = this.version,
        createdAt = this.createdAt,
        updatedAt = this.updatedAt)

    private var parameters: ArrayList<ParameterBuild> = arrayListOf()

    fun parameters(action: DataProcessorBuilder.() -> Unit): List<ParameterBuild> {
        action.invoke(this)
        return parameters
    }

    fun linkToCodeProject(useCodeProject: CodeProjectBuilder) {
        id = useCodeProject.id
        slug = useCodeProject.slug
        name = useCodeProject.name
        description = useCodeProject.description
        author = useCodeProject.owner
        codeProjectId = useCodeProject.id
    }

    fun linkToEnvironments(environmentBuilder: BaseEnvironmentBuilder) {
        baseEnvironmentId = environmentBuilder.id
    }

    fun param(type: ParameterType, action: ParameterBuild.() -> Unit): ParameterBuild {
        val param = ParameterBuild()
        param.order = parameters.size
        param.type = type
        action.invoke(param)
        parameters.add(param)
        return param
    }

    fun STRING(action: ParameterBuild.() -> Unit) = param(ParameterType.STRING, action)
    fun FLOAT(action: ParameterBuild.() -> Unit) = param(ParameterType.FLOAT, action)
    fun BOOLEAN(action: ParameterBuild.() -> Unit) = param(ParameterType.BOOLEAN, action)
    fun INTEGER(action: ParameterBuild.() -> Unit) = param(ParameterType.INTEGER, action)
    fun DICTIONARY(action: ParameterBuild.() -> Unit) = param(ParameterType.DICTIONARY, action)
    fun COMPLEX(action: ParameterBuild.() -> Unit) = param(ParameterType.COMPLEX, action)
    fun LIST(action: ParameterBuild.() -> Unit) = param(ParameterType.LIST, action)
    fun OBJECT(action: ParameterBuild.() -> Unit) = param(ParameterType.OBJECT, action)
    fun UNDEFINED(action: ParameterBuild.() -> Unit) = param(ParameterType.UNDEFINED, action)
    fun TUPLE(action: ParameterBuild.() -> Unit) = param(ParameterType.TUPLE, action)

}

class ParameterBuild {
    lateinit var id: UUID
    lateinit var processorVersionId: UUID
    lateinit var name: String
    lateinit var type: ParameterType
    lateinit var defaultValue: String
    var order: Int = 0
    var required: Boolean = true
    var group: String = ""
    var description: String? = null
}
