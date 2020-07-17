package com.mlreef.rest.feature.experiment

import com.mlreef.rest.Account
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.ExperimentStatus
import com.mlreef.rest.FileLocation
import com.mlreef.rest.ParameterInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.PipelineJobInfo
import com.mlreef.rest.ProcessorParameterRepository
import com.mlreef.rest.ProcessorVersionRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.ExperimentCreateException
import com.mlreef.rest.exceptions.ExperimentUpdateException
import com.mlreef.rest.feature.pipeline.YamlFileGenerator
import com.mlreef.utils.Slugs
import lombok.RequiredArgsConstructor
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.UUID.randomUUID

@Service
@RequiredArgsConstructor
class ExperimentService(
    private val experimentRepository: ExperimentRepository,
    private val subjectRepository: SubjectRepository,
    private val dataProjectRepository: DataProjectRepository,
    private val processorVersionRepository: ProcessorVersionRepository,
    private val pipelineInstanceRepository: PipelineInstanceRepository,
    private val processorParameterRepository: ProcessorParameterRepository,
    @Value("\${mlreef.gitlab.root-url}") val gitlabRootUrl: String,
    @Value("\${mlreef.epf.backend-url}") val epfBackendUrl: String,
    @Value("\${mlreef.epf.gitlab-url}") val epfGitlabUrl: String,
    @Value("\${mlreef.epf.image-tag}") val epfImageTag: String
) {

    val log = LoggerFactory.getLogger(this::class.java)

    /**
     * Creates an Experiment with the given Parameters in MLReef domain.
     *
     * If a dataInstanceId is provided, the dataInstance must exist!
     *
     */
    fun createExperiment(
        authorId: UUID,
        dataProjectId: UUID,
        dataInstanceId: UUID?,
        slug: String,
        name: String,
        sourceBranch: String,
        targetBranch: String,
        postProcessors: List<DataProcessorInstance> = listOf(),
        inputFiles: List<FileLocation>,
        processorInstance: DataProcessorInstance
    ): Experiment {

        subjectRepository.findByIdOrNull(authorId)
            ?: throw ExperimentCreateException(ErrorCode.ExperimentCreationOwnerMissing, "Owner is missing!")
        dataProjectRepository.findByIdOrNull(dataProjectId)
            ?: throw ExperimentCreateException(ErrorCode.ExperimentCreationProjectMissing, "DataProject is missing!")

        dataInstanceId?.let {
            pipelineInstanceRepository.findByIdOrNull(dataInstanceId)
                ?: throw ExperimentCreateException(ErrorCode.ExperimentCreationDataInstanceMissing, "DataPipelineInstance with that Id is missing:$dataInstanceId")
        }

        require(!name.isBlank()) { "name is missing!" }
        require(!sourceBranch.isBlank()) { "sourceBranch is missing!" }
        require(!inputFiles.isEmpty()) { "inputFiles is missing!" }

        val validSlug = if (slug.isBlank()) Slugs.toSlug(name) else Slugs.toSlug(slug)

        require(!validSlug.isBlank() && Slugs.isValid(validSlug)) { "slug name is not valid!" }

//        require(!targetBranch.isBlank()) { "targetBranch is missing!" }

        val id = randomUUID()
        val experiment = Experiment(
            id,
            dataProjectId = dataProjectId,
            dataInstanceId = dataInstanceId,
            slug = validSlug,
            name = name,
            inputFiles = inputFiles,
            sourceBranch = sourceBranch,
            targetBranch = targetBranch
        )

        postProcessors.forEach {
            experiment.addPostProcessor(it)
        }
        processorInstance.let {
            experiment.setProcessor(it)
        }

        return experimentRepository.save(experiment)
    }

    private inline fun require(value: Boolean, lazyMessage: () -> Any): Unit {
        if (!value) {
            val message = lazyMessage()
            throw ExperimentCreateException(ErrorCode.ExperimentSlugAlreadyInUse, message.toString())
        }
    }

    fun createExperimentFile(author: Account, experiment: Experiment, secret: String): String {
        val dataProject = dataProjectRepository.findByIdOrNull(experiment.dataProjectId)
            ?: throw ExperimentCreateException(ErrorCode.ExperimentCreationProjectMissing, "DataProject is missing!")

        val processors: MutableList<DataProcessorInstance> = arrayListOf()
        experiment.getProcessor()?.let { processors.add(it) }
        processors.addAll(experiment.postProcessing)

        val epfPipelineUrl = "$epfBackendUrl/api/v1/epf/experiments/${experiment.id}"
        require(experiment.inputFiles.isNotEmpty()) { "Experiment must have at least 1 input file before yaml can be created" }
        require(processors.isNotEmpty()) { "Experiment must have at least 1 DataProcessor before yaml can be created" }

        val fileLocation = experiment.inputFiles.first().location
        val fileList = experiment.inputFiles.map(FileLocation::toYamlString)
        return YamlFileGenerator(epfImageTag).generateYamlFile(
            author = author,
            dataProject = dataProject,
            epfPipelineSecret = secret,
            epfPipelineUrl = epfPipelineUrl,
            epfGitlabUrl = epfGitlabUrl,
            gitlabRootUrl = gitlabRootUrl,
            sourceBranch = experiment.sourceBranch,
            targetBranch = experiment.targetBranch,
            processors = processors,
            inputFile = fileLocation,
            inputFileList = fileList
        )
    }

    fun guardStatusChange(experiment: Experiment, newStatus: ExperimentStatus) {
        if (experiment.status.canUpdateTo(newStatus)) {
            log.info("Update status of Experiment to $newStatus")
        } else {
            log.warn("Update status of Experiment to $newStatus not possible, already has ${experiment.status}")
            throw ExperimentUpdateException("Cannot increase ExperimentStatus to $newStatus")
        }
    }

    fun newDataProcessorInstance(processorSlug: String): DataProcessorInstance {
        val findBySlug = processorVersionRepository.findAllBySlug(processorSlug, PageRequest.of(0, 1)).firstOrNull()
            ?: throw ExperimentCreateException(ErrorCode.DataProcessorNotUsable, processorSlug)
        return DataProcessorInstance(randomUUID(), findBySlug, parameterInstances = arrayListOf())
    }

    fun addParameterInstance(processorInstance: DataProcessorInstance, name: String, value: String): ParameterInstance {
        val processorParameter = processorParameterRepository.findByProcessorVersionIdAndName(processorInstance.processorVersion.id, name)
            ?: throw ExperimentCreateException(ErrorCode.ProcessorParameterNotUsable, name)
        return processorInstance.addParameterInstances(processorParameter, value)
    }

    fun savePipelineInfo(experiment: Experiment, pipelineJobInfo: PipelineJobInfo): Experiment {
        return experimentRepository.save(experiment.copy(
            status = ExperimentStatus.PENDING,
            pipelineJobInfo = pipelineJobInfo
        ))
    }
}
