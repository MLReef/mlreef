package com.mlreef.rest.domain

import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table

/**
 * An PipelineConfig is a abstract tool to create a DataInstance of VisualInstance of a certain branch
 *
 * There Pipelines used for DataInstances and ones uses for visualisations
 *
 */
@Entity
@Table(name = "pipeline_configurations")
data class PipelineConfiguration(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_project_id")
    val dataProject: DataProject? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_type_id")
    val pipelineType: PipelineType?,

    val slug: String,
    val name: String,
    val sourceBranch: String,
    val targetBranchPattern: String = "",

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    val creator: Person? = null,

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinTable(
        name = "pipeline_configuration_files",
        joinColumns = [JoinColumn(name = "pipeline_config_id")],
        inverseJoinColumns = [JoinColumn(name = "file_location_id")]
    )
    val inputFiles: MutableSet<FileLocation> = mutableSetOf(),

    /**
     * Has DataOperations and optional DataVisualisations.
     * Must contain at least 1 DataOperation
     */
    @OneToMany(mappedBy = "pipelineConfiguration", fetch = FetchType.EAGER) //, cascade = [CascadeType.ALL])
    val processorInstances: MutableSet<ProcessorInstance> = mutableSetOf(),

    @OneToMany(mappedBy = "pipelineConfiguration", fetch = FetchType.EAGER)
    val pipelines: MutableSet<Pipeline> = mutableSetOf(),
) {

    override fun toString(): String {
        return "[PipelineConfig: $id ${pipelineType?.name} $slug $targetBranchPattern dataProjectId: ${this.dataProject?.id}]"
    }

    fun createProcessorInstance(
        processor: Processor,
        slug: String? = null,
        parameterInstances: Collection<ParameterInstance>? = null
    ): ProcessorInstance {
        val processorInstance = ProcessorInstance(
            randomUUID(),
            processor,
            slug = slug ?: "${processor.slug}-instance",
            parameterInstances = parameterInstances?.toMutableList() ?: arrayListOf(),
            pipelineConfiguration = this,
        )
        this.processorInstances.add(processorInstance)
        return processorInstance
    }

    fun addProcessorInstance(processorInstance: ProcessorInstance): ProcessorInstance {
        val element = processorInstance.copy(pipelineConfiguration = this)
        processorInstances.add(element)
        return element
    }

    fun addInputFile(fileLocation: FileLocation): FileLocation {
        val element = fileLocation.copy()
        inputFiles.add(element)
        return element
    }

    fun createPipeline(creator: Person, number: Int, slug: String? = null): Pipeline {
        val instanceId = randomUUID()

        val targetBranch = this.createTargetBranchName(instanceId, number)

        val newPipeline = Pipeline(
            id = instanceId,
            pipelineConfiguration = this,
            pipelineType = this.pipelineType,
            sourceBranch = sourceBranch,
            inputFiles = mutableListOf(),
            processorInstances = mutableListOf(),
            commit = null,
            slug = slug ?: "${this.slug}-$number",
            name = name,
            number = number,
            targetBranch = targetBranch,
            status = PipelineStatus.CREATED,
            creator = creator,
        )

        this.pipelines.add(newPipeline)

        val inputFiles = this.inputFiles.map {
            it.duplicate(dataInstanceId = instanceId, pipelineConfigId = null)
        }.toMutableList()

        val newProcessorInstances = this.processorInstances.map {
            it.duplicate(pipeline = newPipeline)
        }.toMutableList()

        newPipeline.processorInstances.addAll(newProcessorInstances)
        newPipeline.inputFiles.addAll(inputFiles)

        return newPipeline
    }

    fun createTargetBranchName(instanceId: UUID, number: Int): String {
        val replace = targetBranchPattern
            .replace("\$PID", id.toString())
            .replace("\$ID", instanceId.toString())
            .replace("\$NUMBER", number.toString())
            .replace("\$SLUG", slug)

        return replace
    }

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is PipelineConfiguration -> false
            else -> this.id == other.id
        }
    }


}


