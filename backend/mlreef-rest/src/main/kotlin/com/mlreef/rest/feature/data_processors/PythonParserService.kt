package com.mlreef.rest.feature.data_processors

import com.mlreef.parsing.MLPython3Parser
import com.mlreef.rest.BaseEnvironment
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.MetricSchema
import com.mlreef.rest.MetricType
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.ProjectPublicationException
import com.mlreef.rest.feature.project.ProjectResolverService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.InputStream
import java.net.URL
import java.time.ZonedDateTime
import java.util.UUID

@Service
class PythonParserService(
    private val repositoryService: RepositoryService,
    private val dataProcessorService: DataProcessorService,
    private val projectResolverService: ProjectResolverService,
) {
    val parser = MLPython3Parser()

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    fun findAndParseDataProcessorInProject(projectId: UUID, mainFilePath: String?): ProcessorVersion {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val files = repositoryService.getFilesContentOfRepository(project, mainFilePath, mainFilePath == null)

        val processors = files.mapNotNull {
            parsePythonFile(it)
        }

        if (processors.size > 1) throw ProjectPublicationException(ErrorCode.Conflict, "More than 1 data processor found in the project. Please selected a main file")
        if (processors.size == 0) throw ProjectPublicationException(ErrorCode.DataProcessorNotUsable, "No any data processor found in the project or incorrect main file. Candidate files found: ${files.size}")

        return processors[0]
    }

    fun parsePythonFile(pythonCode: String) = parsePythonFile(pythonCode.byteInputStream())

    fun parsePythonFile(url: URL): ProcessorVersion? {
        log.info("Parsing url $url for DataProcessors and annotations")
        return parsePythonFile(url.openStream())
    }

    private fun parsePythonFile(stream: InputStream): ProcessorVersion? {
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
        val ownParameters = parameters.filter { it.processorVersionId == dataProcessor.id }
        val processorVersion = ProcessorVersion(
            id = dataProcessor.id,
            dataProcessor = dataProcessor,
            branch = "master",
            baseEnvironment = BaseEnvironment.UNDEFINED,
            number = 1,
            publisher = null,
            publishedAt = ZonedDateTime.now(),
            command = "",
            parameters = ownParameters,
            metricSchema = metricSchema
        )
        return processorVersion
    }

    fun parseAndSave(url: URL): ProcessorVersion {
        val dataProcessor = this.parsePythonFile(url)
            ?: throw IllegalArgumentException("Could not find a DataProcessor at this url")
        return dataProcessorService.saveDataProcessor(dataProcessor)
    }
}