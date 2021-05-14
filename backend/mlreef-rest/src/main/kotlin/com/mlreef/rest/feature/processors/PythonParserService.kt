package com.mlreef.rest.feature.processors

import com.mlreef.rest.ParametersRepository
import com.mlreef.rest.domain.CodeProject
import com.mlreef.rest.domain.MetricsSchema
import com.mlreef.rest.domain.Parameter
import com.mlreef.rest.domain.Processor
import com.mlreef.rest.domain.repositories.MetricTypesRepository
import com.mlreef.rest.domain.repositories.ParameterTypesRepository
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.IncorrectProjectType
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.ProjectPublicationException
import com.mlreef.rest.exceptions.PythonFileParsingErrors
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.parser.PythonParser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.InputStream
import java.net.URL
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList

@Service
class PythonParserService(
    private val repositoryService: RepositoryService,
    private val parametersRepository: ParametersRepository,
    private val projectResolverService: ProjectResolverService,
    private val parameterTypesRepository: ParameterTypesRepository,
    private val metricTypesRepository: MetricTypesRepository,
    private val processorsService: ProcessorsService,
) {
    val log = LoggerFactory.getLogger(this::class.java)

    fun findAndParseDataProcessorInProject(mainFilePath: String?, project: CodeProject? = null, projectId: UUID?=null): Processor {
        val currentProject = project ?: projectResolverService.resolveProject(projectId = projectId)
            ?: throw NotFoundException(ErrorCode.NotFound, "Project $projectId not found")

        if (currentProject !is CodeProject) throw IncorrectProjectType("Code project is accepted only")

        val files = repositoryService.getFilesContentOfRepository(currentProject.gitlabId, mainFilePath, mainFilePath == null)

        val errorMessagesMap = ConcurrentHashMap<String, List<String>>()

        val processors = files.filterNot { it.content == null }.map {
            log.debug(it.content)
            val errorMessages = CopyOnWriteArrayList<String>()
            val processor = parsePythonFile(it.content!!, it.path, errorMessages) //it.content!! is covered by filterNot function before this lambda
            if (errorMessages.size > 0) {
                errorMessagesMap.put(it.path, errorMessages)
            }
            processor
        }.filterNotNull()

        if (errorMessagesMap.size > 0) throw PythonFileParsingErrors(errorMessagesMap)
        if (processors.size > 1) throw ProjectPublicationException(ErrorCode.Conflict, "More than 1 data processor found in the project. Please selected a main file")
        if (processors.size == 0) throw ProjectPublicationException(ErrorCode.DataProcessorNotUsable, "No any data processor found in the project or incorrect main file. Candidate files found: ${files.size}")

        return processors[0]
    }

    fun parsePythonFile(pythonCode: String, filePath: String? = null, errorMessages: MutableList<String>? = null) = parsePythonFile(pythonCode.byteInputStream(), filePath, errorMessages)

    fun parsePythonFile(url: URL, errorMessages: MutableList<String>? = null): Processor? {
        log.info("Parsing url $url for DataProcessors and annotations")
        return parsePythonFile(url.openStream(), null, errorMessages)
    }

    private fun parsePythonFile(stream: InputStream, filePath: String? = null, errorMessages: MutableList<String>? = null): Processor? {
        val parser = getParser()
        val visitor = parser.parsePython(stream, errorMessages)
        val annotations = visitor.mlAnnotations
        val processors = annotations.filterIsInstance(Processor::class.java)
        val parameters = annotations.filterIsInstance(Parameter::class.java)
        val metricSchemas = annotations.filterIsInstance(MetricsSchema::class.java)
        log.info("Parsing: Found ${annotations.size} annotation")
        log.info("Parsing: Found ${processors.size} processors")

        if (processors.isEmpty()) {
            log.warn("Found zero DataProcessors, nothing to do")
            return null
        } else if (processors.size > 1) {
            log.warn("Found too much DataProcessors, this is unexpected")
            throw IllegalArgumentException("Only one DataProcessor per file is allowed! Found: ${processors.size}")
        }

        val processor = processors.first()

        return processor.copy(
            mainScriptPath = filePath,
            parameters = parameters.map { it.copy(processor = processor) }.toMutableSet(),
            metricSchema = metricSchemas.firstOrNull()
        )
    }

    fun parseAndSave(url: URL): Processor =
        this.parsePythonFile(url)
            ?.let {
                val parameters = listOf(*it.parameters.toTypedArray())
                processorsService.saveProcessor(it.copy(parameters = mutableSetOf()))
                parametersRepository.saveAll(parameters) //Stupid hibernate, need to save it separately
                it
            }
            ?: throw IllegalArgumentException("Could not find a DataProcessor at this url")


    private fun getParser(): PythonParser {
        return PythonParser(parameterTypesRepository, metricTypesRepository)
    }
}
