package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.util.UUID
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
 * An PipelineConfig is a abstract tool to create a DataInstance of VisualInstance of a certain branch
 *
 * There Pipelines used for DataInstances and ones uses for visualisations
 *
 */
@Entity
@Table(name = "pipeline_config")
data class PipelineConfig(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @Column(name = "data_project_id")
    val dataProjectId: UUID,

    @Enumerated(EnumType.STRING)
    val pipelineType: PipelineType,

    val slug: String,
    val name: String,

    @Column(name = "source_branch")
    val sourceBranch: String,

    @Column(name = "target_branch_pattern")
    val targetBranchPattern: String = "",

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "pipeline_config_id")
    val inputFiles: MutableList<FileLocation> = arrayListOf(),

    /**
     * Has DataOperations and optional DataVisualisations.
     * Must contain at least 1 DataOperation
     */
    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @Fetch(value = FetchMode.SUBSELECT)
    @JoinColumn(name = "pipeline_config_id")
    val dataOperations: MutableList<DataProcessorInstance> = arrayListOf()

) {

    override fun toString(): String {
        return "[PipelineConfig: $id $pipelineType $slug $targetBranchPattern dataProjectId: $dataProjectId]"
    }

    fun addProcessor(processorInstance: DataProcessorInstance): DataProcessorInstance {
        val element = processorInstance.copy(pipelineConfigId = this.id)
        dataOperations.add(element)
        return element
    }

    fun addInputFile(fileLocation: FileLocation): FileLocation {
        val element = fileLocation.copy(pipelineConfigId = this.id)
        inputFiles.add(element)
        return element
    }

    fun createInstance(number: Int): PipelineInstance {
        val instanceId = randomUUID()

        val inputFiles = this.inputFiles.map {
            it.duplicate(dataInstanceId = instanceId, pipelineConfigId = null)
        }.toMutableList()

        val dataOperations = this.dataOperations.map {
            it.duplicate(dataInstanceId = instanceId, pipelineConfigId = null)
        }.toMutableList()

        val targetBranch = this.createTargetBranchName(instanceId, number)
        return PipelineInstance(
            id = instanceId,
            dataProjectId = this.dataProjectId,
            pipelineConfigId = this.id,
            pipelineType = this.pipelineType,
            sourceBranch = sourceBranch,
            inputFiles = inputFiles,
            dataOperations = dataOperations,
            commit = null,
            slug = "$slug-$number",
            name = name,
            number = number,
            targetBranch = targetBranch,
            status = PipelineStatus.CREATED
        )
    }

    fun createTargetBranchName(instanceId: UUID, number: Int): String {
        val replace = targetBranchPattern
            .replace("\$PID", id.toString())
            .replace("\$ID", instanceId.toString())
            .replace("\$NUM", number.toString())
            .replace("\$SLUG", slug)

        return if (replace.isBlank()) {
            "datainstance-$id-$number"
        } else {
            replace
        }
    }
}

enum class PipelineType {
    DATA,
    VISUALISATION;

    companion object {
        fun fromString(value: String): PipelineType {
            return when (value.toUpperCase()) {
                DATA.name -> DATA
                VISUALISATION.name -> VISUALISATION
                "VISUAL" -> VISUALISATION
                else -> throw IllegalArgumentException("Not a valid PipelineType: $value")
            }
        }
    }

}
