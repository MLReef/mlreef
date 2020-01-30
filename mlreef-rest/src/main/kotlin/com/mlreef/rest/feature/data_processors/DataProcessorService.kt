package com.mlreef.rest.feature.data_processors

import com.mlreef.parsing.MLPython3Parser
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.MetricSchema
import com.mlreef.rest.MetricType
import com.mlreef.rest.ProcessorParameter
import lombok.RequiredArgsConstructor
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.net.URL

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
}
