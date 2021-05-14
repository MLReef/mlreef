package com.mlreef.rest.domain

import com.mlreef.rest.domain.converters.PairListConverter
import java.time.Instant
import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Convert
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table
import kotlin.random.Random

/**
 * An DataInstance is a special branch of a DataProject.
 *
 * A DataInstance as a configuration it was created with a list of files.
 * It points to a certain branch in gitlab.
 */
@Entity
@Table(name = "pipelines")
data class Pipeline(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pipeline_config_id")
    val pipelineConfiguration: PipelineConfiguration? = null,

    @OneToMany(mappedBy = "pipeline", fetch = FetchType.EAGER)
    val experiments: MutableSet<Experiment> = mutableSetOf(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_type_id")
    val pipelineType: PipelineType?,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    var creator: Person? = null,

    val slug: String,
    val name: String,
    val number: Int,
    val sourceBranch: String,
    val targetBranch: String,
    val commit: String? = null,

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinTable(
        name = "pipeline_files",
        joinColumns = [JoinColumn(name = "pipeline_id")],
        inverseJoinColumns = [JoinColumn(name = "file_location_id")]
    )
    val inputFiles: MutableList<FileLocation> = arrayListOf(),

    @OneToMany(mappedBy = "pipeline", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val processorInstances: MutableList<ProcessorInstance> = arrayListOf(),

    @Enumerated(EnumType.STRING)
    var status: PipelineStatus = PipelineStatus.CREATED,

    @Embedded
    var pipelineJobInfo: PipelineJobInfo? = null,

    @Convert(converter = PairListConverter::class)
    val log: MutableList<Pair<String, String>> = mutableListOf(),


    ) : InstanceDescriptor {

    override fun toString(): String {
        return "[PipelineInstance: $id $pipelineType $slug $targetBranch pipelineId: ${pipelineConfiguration?.id}]"
    }

    fun createExperiment(
        number: Int? = null,
        slug: String? = null,
        name: String? = null,
        sourceBranch: String? = null,
        targetBranch: String? = null,
        dataProject: DataProject? = null,
        inputFiles: Collection<FileLocation>? = null,
        processorInstance: ProcessorInstance? = null,
    ): Experiment {
        val experiment = Experiment(
            id = randomUUID(),
            pipeline = this,
            dataProject = dataProject ?: this.dataProject, //FIXME: Why it is taken not from Pipeline??? And not from pipeline config?
            slug = slug ?: "${this.slug}-experiment",
            name = name ?: "${this.name} Experiment",
            number = number ?: Random.nextInt(),
            sourceBranch = sourceBranch ?: this.sourceBranch,
            targetBranch = targetBranch ?: this.targetBranch,
            processorInstance = processorInstance, //FIXME: Why it is taken not from Pipeline??? And not from pipeline config?
            postProcessing = mutableListOf(),
            inputFiles = inputFiles?.toList() ?: listOf() //FIXME: Why it is taken not from Pipeline??? And not from pipeline config?
        )

        this.experiments.add(experiment)

        return experiment
    }

    fun duplicate(): Pipeline {
        val newPipeline = this.copy(
            id = randomUUID(),
            inputFiles = mutableListOf(),
            processorInstances = mutableListOf()
        )

        val newInputFiles = this.inputFiles.map {
            it.duplicate(dataInstanceId = newPipeline.id, pipelineConfigId = null)
        }.toMutableList()

        val newProcessorInstances = this.processorInstances.map {
            it.duplicate(pipeline = newPipeline)
        }.toMutableList()

        newPipeline.processorInstances.addAll(newProcessorInstances)
        newPipeline.inputFiles.addAll(newInputFiles)

        return newPipeline
    }

    val dataProject: DataProject?
    get() = this.pipelineConfiguration?.dataProject

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is Pipeline -> false
            else -> this.id == other.id
        }
    }

    fun addLog(logMessage: String) {
        this.log.add(Instant.now().toString() to logMessage)
    }
}




