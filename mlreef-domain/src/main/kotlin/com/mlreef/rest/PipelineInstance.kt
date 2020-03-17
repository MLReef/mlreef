package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.util.*
import java.util.UUID.randomUUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.Table

/**
 * An DataInstance is a special branch of a DataProject.
 *
 * A DataInstance as a configuration it was created with a list of files.
 * It points to a certain branch in gitlab.
 */
@Entity
@Table(name = "pipeline_instance")
data class PipelineInstance(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @Column(name = "data_project_id")
    val dataProjectId: UUID,

    @Column(name = "pipeline_config_id")
    val pipelineConfigId: UUID,

    @Enumerated(EnumType.STRING)
    val pipelineType: PipelineType,

    val slug: String,
    val name: String,
    val number: Int,

    @Column(name = "source_branch")
    val sourceBranch: String,

    @Column(name = "target_branch")
    val targetBranch: String,

    val commit: String? = null,

    @OneToMany(fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "data_instance_id")
    val inputFiles: MutableList<FileLocation> = arrayListOf(),

    /**
     * Has DataOperations and optional DataVisualisations.
     * Must contain at least 1 DataOperation
     */
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "data_instance_id")
    val dataOperations: MutableList<DataProcessorInstance> = arrayListOf(),

    @Enumerated(EnumType.STRING)
    val status: PipelineStatus = PipelineStatus.CREATED

) : InstanceDescriptor {

    override fun toString(): String {
        return "[PipelineInstance: $id $pipelineType $slug $targetBranch pipelineId: $pipelineConfigId]"
    }

    fun duplicate(): PipelineInstance {
        val instanceId = randomUUID()
        val inputFiles = this.inputFiles.map {
            it.duplicate(dataInstanceId = instanceId, pipelineConfigId = null)
        }.toMutableList()

        val dataOperations = this.dataOperations.map {
            it.duplicate(dataInstanceId = instanceId, pipelineConfigId = null)
        }.toMutableList()

        return this.copy(
            id = instanceId,
            inputFiles = inputFiles,
            dataOperations = dataOperations
        )
    }
}

interface InstanceDescriptor


enum class PipelineStatus(private val stage: Int) {
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

    fun canUpdateTo(next: PipelineStatus): Boolean {
        return next.stage > this.stage
    }
}
