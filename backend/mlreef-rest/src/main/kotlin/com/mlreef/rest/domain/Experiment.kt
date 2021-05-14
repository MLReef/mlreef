package com.mlreef.rest.domain

import com.mlreef.rest.domain.converters.PairListConverter
import org.slf4j.LoggerFactory
import java.time.Instant
import java.util.UUID
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
import javax.persistence.OneToOne
import javax.persistence.Table

/**
 * An Experiment is a instance of a ProcessingChain with Data
 */
@Entity
@Table(name = "experiments")
data class Experiment(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @ManyToOne(fetch = FetchType.LAZY) //, cascade = [CascadeType.MERGE, CascadeType.PERSIST])
    @JoinColumn(name = "data_project_id")
    val dataProject: DataProject? = null, //TODO: make it dynamic through processorInstance->pipeline (pipeline cannot be null)

    @ManyToOne(fetch = FetchType.LAZY) //, cascade = [CascadeType.MERGE, CascadeType.PERSIST])
    @JoinColumn(name = "pipeline_id")
    val pipeline: Pipeline? = null, //Old 'dataInstance'

    val slug: String,
    val name: String,
    val number: Int?,

    @Column(name = "source_branch")
    val sourceBranch: String, //TODO: make dynamic through processorInstance->pipeline (pipeline cannot be null)

    @Column(name = "target_branch")
    var targetBranch: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    val creator: Person? = null,

    @OneToOne(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "processor_instance_id")
    protected var processorInstance: ProcessorInstance? = null, //Old 'processing'

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinColumn(name = "experiment_post_processing_id")
    val postProcessing: MutableList<ProcessorInstance> = arrayListOf(),

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    @JoinTable(
        name = "experiment_files",
        joinColumns = [JoinColumn(name = "experiment_id")],
        inverseJoinColumns = [JoinColumn(name = "file_location_id")]
    )
    val inputFiles: List<FileLocation> = arrayListOf(),

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "experiments_id")
    val outputFiles: List<OutputFile> = arrayListOf(),

    @Column(name = "json_blob")
    var jsonBlob: String = "",

    @Embedded
    var pipelineJobInfo: PipelineJobInfo? = null,

    @Enumerated(EnumType.STRING)
    var status: ExperimentStatus = ExperimentStatus.CREATED,

    @Column(name = "log")
    @Convert(converter = PairListConverter::class)
    val log: MutableList<Pair<String, String>> = mutableListOf(),
) {

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
    }

    fun addPostProcessor(processorInstance: ProcessorInstance) {
        postProcessing.add(processorInstance)
        processorInstance.experimentPostProcessingId = this.id
    }

    fun setProcessor(processorInstance: ProcessorInstance) {
        this.processorInstance = processorInstance
        processorInstance.experimentProcessingId = this.id
    }

    fun getProcessor() = this.processorInstance

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is Experiment -> false
            else -> this.id == other.id
        }
    }

    override fun toString(): String {
        return "Experiment(id=$id, dataProject=${dataProject?.id}, pipeline=${pipeline?.id}, slug='$slug', name='$name', number=$number, sourceBranch='$sourceBranch', targetBranch='$targetBranch', processorInstance=${processorInstance?.id}, postProcessing=$postProcessing, inputFiles=${
            inputFiles.map { it.id }.joinToString("; ")
        }}, outputFiles=${outputFiles.map { it.id }.joinToString("; ")}}, jsonBlob='$jsonBlob', pipelineJobInfo=$pipelineJobInfo, status=$status)"
    }

    fun addLog(logMessage: String) {
        this.log.add(Instant.now().toString() to logMessage)
    }
}




