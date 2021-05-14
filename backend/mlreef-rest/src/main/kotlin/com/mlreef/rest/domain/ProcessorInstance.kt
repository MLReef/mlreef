package com.mlreef.rest.domain

import com.mlreef.rest.domain.converters.PairListConverter
import java.time.Instant
import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Convert
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table

/**
 * An Instance of DataOperation or DataVisualisation contains instantiated values of Parameters
 */
@Entity
@Table(name = "processor_instances")
data class ProcessorInstance(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_id")
    val processor: Processor,

    val slug: String? = processor.slug,
    val name: String? = processor.name,
    val command: String? = null,

    @OneToMany(mappedBy = "processorInstance", fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    val parameterInstances: MutableList<ParameterInstance> = arrayListOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    val parent: ProcessorInstance? = null,

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val children: MutableList<ProcessorInstance> = arrayListOf(),

    @OneToOne(mappedBy = "processorInstance", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    protected var experiment: Experiment? = null,

    @Column(name = "experiment_pre_processing_id")
    var experimentPreProcessingId: UUID? = null,

    @Column(name = "experiment_post_processing_id")
    var experimentPostProcessingId: UUID? = null,

    @Column(name = "experiment_processing_id")
    var experimentProcessingId: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id")
    val pipeline: Pipeline? = null,

    @ManyToOne(fetch = FetchType.LAZY) //, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinColumn(name = "pipeline_config_id")
    var pipelineConfiguration: PipelineConfiguration? = null,

    @Convert(converter = PairListConverter::class)
    val log: MutableList<Pair<String, String>> = mutableListOf(),
) {
    init {
        validate()
    }

    fun createParameterInstances(processorParameter: Parameter, value: String): ParameterInstance {
        val parameterInstance = ParameterInstance(
            randomUUID(),
            processorParameter,
            processorInstance = this,
            value = value,
            name = processorParameter.name,
            parameterType = processorParameter.parameterType
        )
        this.parameterInstances.add(parameterInstance)
        return parameterInstance
    }

    fun createPipelineConfiguration(
        name: String? = null,
        type: PipelineType? = null,
        slug: String? = null,
        dataProject: DataProject? = null,
        sourceBranch: String? = null,
        targetBranchPattern: String? = null,
        inputFiles: MutableList<FileLocation>? = null,
    ): PipelineConfiguration {
        this.pipelineConfiguration = this.pipelineConfiguration
            ?: PipelineConfiguration(
                id = randomUUID(),
                pipelineType = type,
                slug = slug ?: this.slug ?: this.processor.slug ?: dataProject?.slug ?: "slug-${this.name ?: ""}",
                name = name ?: this.name ?: this.processor.name ?: dataProject?.name ?: "pipeline-config-${this.name}",
                dataProject = dataProject,
                sourceBranch = sourceBranch ?: "master",
                targetBranchPattern = targetBranchPattern ?: "",
                processorInstances = mutableSetOf(this),
                inputFiles = inputFiles?.toMutableSet() ?: mutableSetOf(),
            )

        dataProject?.pipelineConfigurations?.let {
            if (!it.contains(this.pipelineConfiguration)) it.add(this.pipelineConfiguration!!)
        }

        return this.pipelineConfiguration!!
    }

    fun attachToPipeline(pipeline: Pipeline): ProcessorInstance {
        return duplicate(pipeline = pipeline)
    }

    fun duplicate(
        experimentPreProcessingId: UUID? = null,
        experimentPostProcessingId: UUID? = null,
        experimentProcessingId: UUID? = null,
        pipeline: Pipeline? = null,
        pipelineConfiguration: PipelineConfiguration? = null
    ): ProcessorInstance {
        val newProcessorInstance = ProcessorInstance(
            id = randomUUID(),
            processor = this.processor,
            slug = this.slug,
            name = this.name,
            command = this.command,
            parent = this.parent,
            children = this.children,
            experimentPreProcessingId = experimentPreProcessingId,
            experimentPostProcessingId = experimentPostProcessingId,
            experimentProcessingId = experimentProcessingId,
            pipelineConfiguration = pipelineConfiguration,
            pipeline = pipeline,
        )

        val parameterInstances = this.parameterInstances.map {
            it.copy(id = randomUUID(), processorInstance = newProcessorInstance)
        }.toMutableList()

        newProcessorInstance.parameterInstances.addAll(parameterInstances)

        return newProcessorInstance
    }

    final fun validate(): ProcessorInstance {
        var assigns = 0
        this.experimentPreProcessingId?.let { assigns++ }
        this.experimentPostProcessingId?.let { assigns++ }
        this.experimentProcessingId?.let { assigns++ }
        this.pipelineConfiguration?.let { assigns++ }
        if (assigns <= 1) {
            return this
        } else {
            throw IllegalStateException("Too many relations defined for ProcessorInstance: $assigns")
        }
    }

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is ProcessorInstance -> false
            else -> this.id == other.id
        }
    }

    override fun toString(): String {
        return "ProcessorInstance(id=$id, processor=${processor.id}, slug=$slug, name=$name, command=$command, parameterInstances=${
            parameterInstances.map { it.id }.joinToString("; ")
        }}, parent=${parent?.id}, children=${
            children.map { it.id }.joinToString("; ")
        }}, experimentPreProcessingId=$experimentPreProcessingId, experimentPostProcessingId=$experimentPostProcessingId, experimentProcessingId=$experimentProcessingId, pipeline=${pipeline?.id}, pipelineConfiguration=${pipelineConfiguration?.id})"
    }

    fun addLog(logMessage: String) {
        this.log.add(Instant.now().toString() to logMessage)
    }
}
