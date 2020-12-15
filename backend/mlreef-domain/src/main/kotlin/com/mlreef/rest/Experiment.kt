package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Embeddable
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table

/**
 * An Experiment is a instance of a ProcessingChain with Data
 */
@Entity
@Table(name = "experiment")
data class Experiment(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @Column(name = "data_project_id")
    val dataProjectId: UUID,

    @Column(name = "data_pipeline_instance_id")
    val dataInstanceId: UUID?,

    val slug: String,
    val name: String,
    val number: Int?,

    @Column(name = "source_branch")
    val sourceBranch: String,

    @Column(name = "target_branch")
    val targetBranch: String,

    /**
     * Contains exactly 1 Algorithm (could be implement as DataExecutionInstance as well)
     */
    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(
        name = "experiment_processing_id",
        foreignKey = ForeignKey(name = "dataprocessorinstance_experiment_processing_id_fkey")
    )
    protected var processing: DataProcessorInstance? = null,

    /**
     * Has DataOps and maybe DataVisuals
     */
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(
        name = "experiment_post_processing_id",
        foreignKey = ForeignKey(name = "dataprocessorinstance_experiment_post_processing_id_fkey")
    )
    val postProcessing: MutableList<DataProcessorInstance> = arrayListOf(),

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinTable(
        name = "experiment_input_files",
        joinColumns = [JoinColumn(
            name = "experiment_id",
            referencedColumnName = "id",
            foreignKey = ForeignKey(name = "filelocation_experiment_experiment_id_fkey")
        )],
        inverseJoinColumns = [JoinColumn(
            name = "file_location_id",
            referencedColumnName = "id",
            foreignKey = ForeignKey(name = "filelocation_experiment_file_location_id_fkey")

        )]
    )
    val inputFiles: List<FileLocation> = arrayListOf(),

    @OneToMany(fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(
        name = "experiment_id",
        foreignKey = ForeignKey(name = "outputfile_experiment_experiment_id_fkey")
    )
    val outputFiles: List<OutputFile> = arrayListOf(),

    @Column(name = "json_blob")
    var jsonBlob: String = "",

    @Embedded
    val pipelineJobInfo: PipelineJobInfo? = null,

    @Enumerated(EnumType.STRING)
    val status: ExperimentStatus = ExperimentStatus.CREATED

) {

    companion object {
        val log = LoggerFactory.getLogger(this::class.java)
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
        return next.stage >= this.stage
    }
}

/**
 * Stores the information of a Gitlab Pipeline.
 * Dates are stored locally and most could be null.
 *
 * Has to store commit ref, branch, pipeline id (called job id here) and web url
 */
@Embeddable
data class PipelineJobInfo(
    @Column(name = "gitlab_id")
    var gitlabId: Long? = null,

    @Column(name = "gitlab_commit_sha")
    var commitSha: String,

    @Column(name = "gitlab_ref")
    var ref: String? = null,

    @Column(name = "gitlab_hash")
    var secret: String? = null,

    @Column(name = "gitlab_created_at")
    var createdAt: ZonedDateTime? = null,

    @Column(name = "gitlab_updated_at")
    var updatedAt: ZonedDateTime? = null,

    @Column(name = "gitlab_started_at")
    var startedAt: ZonedDateTime? = null,

    @Column(name = "gitlab_committed_at")
    var committedAt: ZonedDateTime? = null,

    @Column(name = "gitlab_finished_at")
    var finishedAt: ZonedDateTime? = null
)
