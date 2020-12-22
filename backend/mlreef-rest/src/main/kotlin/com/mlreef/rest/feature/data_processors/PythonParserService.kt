package com.mlreef.rest.feature.data_processors

import com.mlreef.parsing.parsePython3
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
import java.util.UUID

@Service
class PythonParserService(
    private val repositoryService: RepositoryService,
    private val dataProcessorService: DataProcessorService,
    private val projectResolverService: ProjectResolverService,
) {
    val log = LoggerFactory.getLogger(this::class.java)

    fun findAndParseDataProcessorInProject(projectId: UUID, mainFilePath: String?): ProcessorVersion {
        val project = projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        val files = repositoryService.getFilesContentOfRepository(project.gitlabId, mainFilePath, mainFilePath == null)

        val processors = files.filterNot { it.content == null }.map {
            log.debug(it.content)
            parsePythonFile(it.content!!, it.path)?.copy(contentSha256 = it.sha256) //it.content!! is covered by filterNot function before this lambda
        }.filterNotNull()

        if (processors.size > 1) throw ProjectPublicationException(ErrorCode.Conflict, "More than 1 data processor found in the project. Please selected a main file")
        if (processors.size == 0) throw ProjectPublicationException(ErrorCode.DataProcessorNotUsable, "No any data processor found in the project or incorrect main file. Candidate files found: ${files.size}")

        return processors[0]
    }

    fun parsePythonFile(pythonCode: String, filePath: String? = null) = parsePythonFile(pythonCode.byteInputStream(), filePath)

    fun parsePythonFile(url: URL): ProcessorVersion? {
        log.info("Parsing url $url for DataProcessors and annotations")
        return parsePythonFile(url.openStream())
    }

    private fun parsePythonFile(stream: InputStream, filePath: String? = null): ProcessorVersion? {
        val annotations = parsePython3(stream).mlAnnotations
        val dataProcessors = annotations.filterIsInstance(DataProcessor::class.java)
        val parameters = annotations.filterIsInstance(ProcessorParameter::class.java)
        val metricSchemas = annotations.filterIsInstance(MetricSchema::class.java)
        log.info("Parsing: Found ${annotations.size} annotation")
        log.info("Parsing: Found ${dataProcessors.size} DataProcessors")

        if (dataProcessors.isEmpty()) {
            log.warn("Found zero DataProcessors, nothing to do")
            return null
        } else if (dataProcessors.size > 1) {
            log.warn("Found too much DataProcessors, this is unexpected")
            throw IllegalArgumentException("Only one DataProcessor per file is allowed! Found: ${dataProcessors.size}")
        }

        val metricSchema = if (metricSchemas.isNotEmpty()) {
            metricSchemas.first()
        } else {
            MetricSchema(MetricType.UNDEFINED)
        }

        return ProcessorVersion(
            id = dataProcessors.first().id,
            dataProcessor = dataProcessors.first(),
            branch = "master",
            baseEnvironment = null,
            number = 1,
            command = "",
            parameters = parameters.filter { it.processorVersionId == dataProcessors.first().id },
            metricSchema = metricSchema,
            path = filePath,
        )
    }

    fun parseAndSave(url: URL): ProcessorVersion =
        this.parsePythonFile(url)
            ?.let { dataProcessorService.saveDataProcessor(it) }
            ?: throw IllegalArgumentException("Could not find a DataProcessor at this url")
}
