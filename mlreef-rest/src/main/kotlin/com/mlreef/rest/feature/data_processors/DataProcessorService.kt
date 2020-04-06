package com.mlreef.rest.feature.data_processors

import com.mlreef.parsing.MLPython3Parser
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataProcessorType.*
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.MetricSchema
import com.mlreef.rest.MetricType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import lombok.RequiredArgsConstructor
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.net.URL
import java.util.*

@Service
@RequiredArgsConstructor
class DataProcessorService(
    private val dataProcessorRepository: DataProcessorRepository
) {

    val parser = MLPython3Parser()
    val log = LoggerFactory.getLogger(this::class.java)

    fun parsePythonFile(url: URL): DataProcessor? {
        log.info("Parsing url $url for DataProcessors and annotations")
        val stream = url.openStream()
        val parse = parser.parse(stream)

        val annotations = parse.mlAnnotations
        val dataProcessors = annotations.filterIsInstance(DataProcessor::class.java)
        val parameters = annotations.filterIsInstance(ProcessorParameter::class.java)
        val metricSchemas = annotations.filterIsInstance(MetricSchema::class.java)

        log.info("Parsing: Found ${annotations.size} annotation")
        log.info("Parsing: Found ${dataProcessors.size} DataProcessors")
        if (dataProcessors.isEmpty()) {
            log.warn("Found zero DataProcessors, nothing to do")
            return null
        }

        val metricSchema = if (metricSchemas.isNotEmpty()) {
            metricSchemas.first()
        } else {
            MetricSchema(MetricType.UNDEFINED)
        }
        if (dataProcessors.size > 1) {
            log.warn("Found too much DataProcessors, this is unexpected")
            throw IllegalArgumentException("Only one DataProcessor per file is allowed! Found: ${dataProcessors.size}")
        }
        val dataProcessor = dataProcessors.first()
        // check parameters for correct id
        val ownParameters = parameters.filter { it.dataProcessorId == dataProcessor.id }
        val withParameters = dataProcessor.withParameters(ownParameters, metricSchema)
        return withParameters
    }

    fun parseAndSave(url: URL): DataProcessor {
        val dataProcessor = this.parsePythonFile(url)
            ?: throw IllegalArgumentException("Could not find a DataProcessor at this url")
        return dataProcessorRepository.save(dataProcessor)
    }

    fun createForCodeProject(
        id: UUID,
        codeProjectId: UUID,
        slug: String,
        name: String,
        inputDataType: DataType,
        outputDataType: DataType,
        type: DataProcessorType,
        visibilityScope: VisibilityScope = VisibilityScope.PUBLIC,
        description: String = "",
        command: String = "",
        author: Subject?,
        parameters: List<ProcessorParameter> = arrayListOf()
    ): DataProcessor {

        log.info("Creating new DataProcessors with slug $slug for $codeProjectId")
        val findBySlug = dataProcessorRepository.findBySlug(slug)
        if (findBySlug != null) {
            if (findBySlug.codeProjectId != codeProjectId) {
                log.warn("DataProcessors slug exists, but not in this CodeProject")
            } else {
                throw IllegalArgumentException("DataProcessors slug exists in this CodeProject")
            }
        }

        val newProcessor = when (type) {
            ALGORITHM -> DataAlgorithm(id, slug, name, command, inputDataType, outputDataType, visibilityScope, description, author, codeProjectId, parameters)
            OPERATION -> DataOperation(id, slug, name, command, inputDataType, outputDataType, visibilityScope, description, author, codeProjectId, parameters)
            VISUALISATION -> DataVisualization(id, slug, name, command, inputDataType, visibilityScope, description, author, codeProjectId, parameters)
        }

        return dataProcessorRepository.save(newProcessor)
    }
}
