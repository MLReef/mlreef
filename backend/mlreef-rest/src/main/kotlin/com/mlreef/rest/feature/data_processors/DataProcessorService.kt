package com.mlreef.rest.feature.data_processors

import com.mlreef.rest.CodeProject
import com.mlreef.rest.DataAlgorithm
import com.mlreef.rest.DataOperation
import com.mlreef.rest.DataProcessor
import com.mlreef.rest.DataProcessorRepository
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataProcessorType.ALGORITHM
import com.mlreef.rest.DataProcessorType.OPERATION
import com.mlreef.rest.DataProcessorType.VISUALIZATION
import com.mlreef.rest.DataType
import com.mlreef.rest.DataVisualization
import com.mlreef.rest.ProcessorParameter
import com.mlreef.rest.ProcessorVersion
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.Subject
import com.mlreef.rest.VisibilityScope
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class DataProcessorService(
    private val dataProcessorRepository: DataProcessorRepository,
    private val processorVersionRepository: ProcessorVersionRepository,
) {
    val log = LoggerFactory.getLogger(this::class.java)

    fun getProcessorByProjectId(projectId: UUID): DataProcessor? {
        return dataProcessorRepository.findAllByCodeProjectId(projectId).firstOrNull()
    }

    fun saveDataProcessor(dataProcessor: ProcessorVersion): ProcessorVersion {
        dataProcessorRepository.save(dataProcessor.dataProcessor)
        return processorVersionRepository.save(dataProcessor)
    }

    fun createForCodeProject(
        id: UUID,
        codeProject: CodeProject,
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

        val codeProjectId = codeProject.id
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
            ALGORITHM -> DataAlgorithm(id, slug, name, inputDataType, outputDataType, visibilityScope, description, author, codeProject)
            OPERATION -> DataOperation(id, slug, name, inputDataType, outputDataType, visibilityScope, description, author, codeProject)
            VISUALIZATION -> DataVisualization(id, slug, name, inputDataType, visibilityScope, description, author, codeProject)
        }

        return dataProcessorRepository.save(newProcessor)
    }
}
