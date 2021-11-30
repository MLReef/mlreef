package com.mlreef.rest.feature.experiment

import com.mlreef.rest.*
import com.mlreef.rest.annotations.SaveRecentProject
import com.mlreef.rest.domain.*
import com.mlreef.rest.exceptions.*
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.auth.UserResolverService
import com.mlreef.rest.feature.pipeline.PipelineService
import com.mlreef.rest.feature.pipeline.YamlFileGenerator
import com.mlreef.rest.feature.processors.ProcessorsService
import com.mlreef.rest.feature.project.ProjectResolverService
import com.mlreef.rest.utils.Slugs
import lombok.RequiredArgsConstructor
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.*
import java.util.UUID.randomUUID
import javax.annotation.PostConstruct
import kotlin.math.absoluteValue
import kotlin.random.Random

@Service
@RequiredArgsConstructor
class ExperimentService(
    private val conf: ApplicationConfiguration,
    private val experimentRepository: ExperimentRepository,
    private val projectResolverService: ProjectResolverService,
    private val processorsRepository: ProcessorsRepository,
    private val pipelineInstanceRepository: PipelinesRepository,
    private val parametersRepository: ParametersRepository,
    private val yamlFileGenerator: YamlFileGenerator,
    private val processorsService: ProcessorsService,
    private val gitlabRestClient: GitlabRestClient,
    private val pipelineService: PipelineService,
    private val userResolverService: UserResolverService,
) {
    @PostConstruct
    fun init() {
        if (conf.epf.experimentImagePath.isNullOrBlank()) throw IncorrectApplicationConfiguration("No experiment image path was provided")
    }

    val log: Logger = LoggerFactory.getLogger(this::class.java)
    val synchedExperimentNumber: Any = Object()

    fun getExperimentsForProject(projectId: UUID): List<Experiment> {
        val dataProject = projectResolverService.resolveDataProject(projectId)
            ?: throw NotFoundException("Project $projectId not found")
        return experimentRepository.findAllByDataProject(dataProject)
    }

    fun getExperimentById(projectId: UUID, experimentId: UUID): Experiment? {
        val dataProject = projectResolverService.resolveDataProject(projectId)
            ?: throw NotFoundException("Project $projectId not found")

        return experimentRepository.findOneByDataProjectAndId(dataProject, experimentId)
    }

    /**
     * Creates an Experiment with the given Parameters in MLReef domain.
     * If a dataInstanceId is provided, the dataInstance must exist!
     */
    @SaveRecentProject(projectId = "#dataProjectId", userId = "#authorId", operation = "createExperiment")
    fun createExperiment(
        authorId: UUID,
        dataProjectId: UUID,
        pipelineId: UUID?,
        slug: String,
        name: String,
        sourceBranch: String,
        targetBranch: String,
        postProcessors: List<ProcessorInstance> = listOf(),
        inputFiles: List<FileLocation>,
        processorInstance: ProcessorInstance,
    ): Experiment {
        val author = userResolverService.resolveAccount(userId = authorId)
            ?: throw PipelineCreateException(ErrorCode.PipelineCreationOwnerMissing, "Owner is missing!")

        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw ExperimentCreateException(ErrorCode.ExperimentCreationOwnerMissing, "Project $dataProjectId not found for experiment!")

        val pipeline = pipelineId?.let {
            pipelineInstanceRepository.findByIdOrNull(it)
                ?: throw ExperimentCreateException(ErrorCode.ExperimentCreationDataInstanceMissing, "DataPipelineInstance with that Id is missing:$it")
        }

        require(!name.isBlank()) { "name is missing!" }
        require(!sourceBranch.isBlank()) { "sourceBranch is missing!" }
        require(!inputFiles.isEmpty()) { "inputFiles is missing!" }

        val validSlug = if (slug.isBlank()) Slugs.toSlug(name) else Slugs.toSlug(slug)

        require(!validSlug.isBlank() && Slugs.isValid(validSlug)) { "slug name is not valid!" }

        require(targetBranch.isNotBlank()) { "targetBranch is missing!" }

        return synchronized(synchedExperimentNumber) {
            val experiment = Experiment(
                id = randomUUID(),
                dataProject = dataProject,
                pipeline = pipeline,
                slug = validSlug,
                name = name,
                number = (experimentRepository.maxNumberByDataProjectId(dataProject) ?: 0) + 1,
                inputFiles = inputFiles,
                sourceBranch = sourceBranch,
                targetBranch = targetBranch,
                creator = author,
            )

            postProcessors.forEach { experiment.addPostProcessor(it) }
            experiment.setProcessor(processorInstance)
            experimentRepository.save(experiment)
        }
    }

    @SaveRecentProject(projectId = "#result.dataProject.id", userId = "#runnerId", operation = "startExperiment")
    fun startExperiment(experiment: Experiment, token: String, runnerId: UUID): Experiment {
        val secret = pipelineService.createSecret()

        val finalTargetBranch = getTargetBranchForExperiment(experiment)

        val fileContent = this.createExperimentFile(
            experiment = experiment,
            author = experiment.creator ?: throw InconsistentStateOfObject("Experiment has no author"),
            secret = secret,
            overrideTargetBranch = finalTargetBranch
        )

        val pipelineJobInfo = pipelineService.createStartGitlabPipeline(
            userToken = token,
            projectGitlabId = experiment.dataProject?.gitlabId ?: throw InconsistentStateOfObject("Experiment is not attached to data project"),
            targetBranch = finalTargetBranch,
            fileContent = fileContent,
            sourceBranch = experiment.sourceBranch,
            secret = secret
        )

        return this.savePipelineInfo(experiment, pipelineJobInfo, finalTargetBranch)
    }

    fun cancelExperiment(dataProjectId: UUID, experimentId: UUID): Experiment {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Data project $dataProjectId was not found")

        val experiment = experimentRepository.findByIdOrNull(experimentId)?.takeIf { it.dataProject?.id == dataProjectId }
            ?: throw NotFoundException("Experiment $experimentId was not found or it is not in Data project $dataProjectId")

        experiment.pipelineJobInfo?.gitlabId?.let {
            try {
                gitlabRestClient.adminCancelPipeline(dataProject.gitlabId, it)
            } catch (ex: Exception) {
                log.error("Cannot cancel pipeline #${experiment.pipelineJobInfo?.gitlabId} in gitlab for experiment $experimentId: Exception: $ex")
            }
        }

        return experimentRepository.save(
            experiment.copy(status = ExperimentStatus.CANCELED)
        )
    }

    fun deleteExperiment(dataProjectId: UUID, experimentId: UUID) {
        val dataProject = projectResolverService.resolveDataProject(dataProjectId)
            ?: throw NotFoundException("Data project $dataProjectId was not found")

        val canceledExperiment = cancelExperiment(dataProjectId, experimentId)
//        It's required to keep the pipeline now, since we want to have the jobs list for other purposes.
//        doc: https://gitlab.com/mlreef/mlreef/-/issues/1148
//        canceledExperiment.pipelineJobInfo?.gitlabId?.let {
//            try {
//                gitlabRestClient.adminDeletePipeline(dataProject.gitlabId, it)
//            } catch (ex: Exception) {
//                log.error("Cannot delete pipeline #${canceledExperiment.pipelineJobInfo?.gitlabId} in gitlab for experiment $experimentId: Exception: $ex")
//            }
//        }

        dataProject.experiments.remove(canceledExperiment) //To disable cascade undelete reversal operation
        experimentRepository.deleteById(canceledExperiment.id)
    }

    private inline fun require(value: Boolean, lazyMessage: () -> Any): Unit {
        if (!value) {
            val message = lazyMessage()
            throw ExperimentCreateException(ErrorCode.ExperimentSlugAlreadyInUse, message.toString())
        }
    }

    fun createExperimentFile(author: Account, experiment: Experiment, secret: String, overrideTargetBranch: String? = null): String {
        val processors: MutableList<ProcessorInstance> = arrayListOf()
        experiment.getProcessor()?.let { processors.add(it) }
        processors.addAll(experiment.postProcessing)

        require(experiment.inputFiles.isNotEmpty()) { "Experiment must have at least 1 input file before yaml can be created" }
        require(processors.isNotEmpty()) { "Experiment must have at least 1 DataProcessor before yaml can be created" }

        return yamlFileGenerator.renderYaml(
            author = author,
            epfPipelineSecret = secret,
            epfPipelineUrl = "${conf.epf.backendUrl}$EPF_CONTROLLER_PATH/experiments/${experiment.id}",
            epfGitlabUrl = conf.epf.gitlabUrl,
            baseImagePath = getExperimentImagePath(),
            epfImageTag = conf.epf.imageTag,
            sourceBranch = experiment.sourceBranch,
            targetBranch = overrideTargetBranch ?: experiment.targetBranch,
            processorsInstances = processors,
            retries = conf.epf.retriesForPipeline,
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

    fun newProcessorInstance(id: UUID? = null, slug: String? = null, codeProjectId: UUID? = null, branch: String? = null, version: String? = null): ProcessorInstance {
        val processor = processorsService.resolveProcessor(id, slug, codeProjectId, branch, version)
            ?.takeIf { it.status in listOf(PublishStatus.PUBLISHED, PublishStatus.PUBLISH_FINISHING) }
            ?: throw NotFoundException("Processor ${id ?: slug ?: codeProjectId?.let { "$it ${branch} ${version}" }} not found or is in unpublished/failed state")

        return processor.let { ProcessorInstance(randomUUID(), it) }
    }


    fun addParameterInstance(processorInstance: ProcessorInstance, name: String, value: String): ParameterInstance =
        parametersRepository
            .findByProcessorAndName(processorInstance.processor, name)
            ?.let { processorInstance.createParameterInstances(it, value) }
            ?: throw ExperimentCreateException(ErrorCode.ProcessorParameterNotUsable, "Parameter does not exist: $name")


    fun savePipelineInfo(experiment: Experiment, pipelineJobInfo: PipelineJobInfo, targetBranch: String? = null): Experiment {
        experiment.status = ExperimentStatus.PENDING
        experiment.pipelineJobInfo = pipelineJobInfo
        experiment.targetBranch = if (targetBranch == null || experiment.targetBranch == targetBranch) {
            experiment.targetBranch
        } else {
            targetBranch
        }
        return experimentRepository.save(experiment)
    }

    private fun getExperimentImagePath(): String {
        return conf.epf.experimentImagePath!!
    }

    private fun getTargetBranchForExperiment(experiment: Experiment): String {
        experiment.dataProject ?: throw InconsistentStateOfObject("Experiment ${experiment.id} is not attached to data project")
        if (!branchExists(experiment.dataProject!!.gitlabId, experiment.targetBranch)) {
            return experiment.targetBranch
        }

        for (i in 1..100) {
            val branchWithNumber = "${experiment.targetBranch}-$i"

            if (!branchExists(experiment.dataProject!!.gitlabId, branchWithNumber)) {
                return branchWithNumber
            }
        }

        val branchWithNumber = "${experiment.targetBranch}-${Random.nextLong().absoluteValue}"

        if (!branchExists(experiment.dataProject!!.gitlabId, branchWithNumber)) {
            return branchWithNumber
        }

        throw InternalException("Cannot create any branch for experiment ${experiment.slug} (${experiment.id})")
    }

    private fun branchExists(projectId: Long, branch: String): Boolean {
        return try {
            gitlabRestClient.adminGetBranch(projectId = projectId, branch = branch)
            true
        } catch (ex: Exception) {
            false
        }
    }


}
