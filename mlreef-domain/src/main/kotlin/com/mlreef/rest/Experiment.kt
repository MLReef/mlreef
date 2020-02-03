package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.ZonedDateTime
import java.util.*
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table

/**
 * An Experiment is a instance of a ProcessingChain with Data
 */
@Entity
@Table(name = "experiment")
data class Experiment(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,
    @Column(name = "data_project_id")
    val dataProjectId: UUID,

    @Column(name = "source_branch")
    val sourceBranch: String,

    @Column(name = "target_branch")
    val targetBranch: String,

    @Embedded
    val performanceMetrics: PerformanceMetrics = PerformanceMetrics(),

    @OneToMany(fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "experiment_id")
    val outputFiles: List<OutputFile> = arrayListOf(),

    /**
     * Has DataOps and DataVisuals
     */
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "experimentPreProcessingId")
    val preProcessing: MutableList<DataProcessorInstance> = arrayListOf(),
    /**
     * Has DataOps and maybe DataVisuals
     */
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "experimentPostProcessingId")
    val postProcessing: MutableList<DataProcessorInstance> = arrayListOf(),
    /**
     * Contains exactly 1 Algorithm (could be implement as DataExecutionInstance as well)
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "experimentProcessingId")
    protected var processing: DataProcessorInstance? = null,

    @Enumerated(EnumType.STRING)
    val status: ExperimentStatus = ExperimentStatus.CREATED

) {

    fun addPreProcessor(processorInstance: DataProcessorInstance) {
        preProcessing.add(processorInstance)
        processorInstance.experimentPreProcessingId = this.id
    }

    fun addPostProcessor(processorInstance: DataProcessorInstance) {
        postProcessing.add(processorInstance)
        processorInstance.experimentPostProcessingId = this.id
    }

    fun setProcessor(processorInstance: DataProcessorInstance) {
        processing = (processorInstance)
        processorInstance.experimentProcessingId = this.id
    }

    fun getProcessor() = this.processing

    fun smartCopy(
        sourceBranch: String? = null,
        targetBranch: String? = null,
        performanceMetrics: PerformanceMetrics? = null,
        outputFiles: List<OutputFile>? = null,
        preProcessing: MutableList<DataProcessorInstance>? = null,
        postProcessing: MutableList<DataProcessorInstance>? = null,
        processing: DataProcessorInstance? = null,
        status: ExperimentStatus? = null
    ): Experiment {
        return Experiment(
            id = id,
            dataProjectId = dataProjectId,
            sourceBranch = sourceBranch ?: this.sourceBranch,
            targetBranch = targetBranch ?: this.targetBranch,
            performanceMetrics = performanceMetrics ?: this.performanceMetrics,
            outputFiles = outputFiles ?: this.outputFiles,
            preProcessing = preProcessing ?: this.preProcessing,
            postProcessing = postProcessing ?: this.postProcessing,
            processing = processing ?: this.processing,
            status = status ?: this.status
        )
    }
}


enum class ExperimentStatus(private val stage: Int) {
    CREATED(1),
    PENDING(2),
    RUNNING(3),
    SKIPPED(3),
    SUCCESS(4),
    FAILED(4),
    CANCELED(4),
    ARCHIVED(5);

    fun isDone() {
        this == SUCCESS || this == FAILED
    }

    fun canUpdateTo(next: ExperimentStatus): Boolean {
        return next.stage > this.stage
    }
}

@Embeddable
class PerformanceMetrics(
    @Column(name = "job_started_at")
    var jobStartedAt: ZonedDateTime? = null,
    @Column(name = "job_updated_at")
    var jobUpdatedAt: ZonedDateTime? = null,
    @Column(name = "job_finished_at")
    var jobFinishedAt: ZonedDateTime? = null,
    @Column(name = "json_blob")
    var jsonBlob: String = ""
)
