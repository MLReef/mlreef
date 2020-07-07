package com.mlreef.rest

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Embedded
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table

/**
 * An Instance of DataOperation or DataVisualisation contains instantiated values of Parameters
 */
@Entity
@Table(name = "data_processor_instance")
data class DataProcessorInstance(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,

    @OneToOne(fetch = FetchType.EAGER)
    @Fetch(value = FetchMode.JOIN)
    @JoinColumn(
        name = "data_processor_id",
        referencedColumnName = "id",
        foreignKey = ForeignKey(name = "dataprocessorinstance_dataprocessor_data_processor_id_fkey"))
    val dataProcessor: DataProcessor,

    @Column(name = "data_processor_id", insertable = false, updatable = false)
    val dataProcessorId: UUID = dataProcessor.id,
    @Column(name = "data_processor_version", insertable = false, updatable = false)
    val dataProcessorVersion: Long? = dataProcessor.version,
    val slug: String = dataProcessor.slug,
    val name: String = dataProcessor.name,
    val command: String = dataProcessor.command,
    @Enumerated(EnumType.STRING)
    @Column(name = "processor_type", updatable = false)
    val type: DataProcessorType = dataProcessor.type,
    @Embedded
    @Column(name = "metric_schema_")
    val metricSchema: MetricSchema = dataProcessor.metricSchema,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(
        name = "data_processor_instance_id",
        foreignKey = ForeignKey(name = "parameterinstances_data_processor_instance_id_fkey"))
    val parameterInstances: MutableList<ParameterInstance> = arrayListOf(),

    @Column(name = "parent_id")
    val parentId: UUID? = null,

    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.MERGE, CascadeType.PERSIST])
    @JoinColumn(
        name = "parent_id",
        foreignKey = ForeignKey(name = "dataprocessorinstance_dataprocessorinstance_parent_id_fkey"))
    val children: MutableList<DataProcessorInstance> = arrayListOf(),

    @Column(name = "experiment_pre_processing_id")
    var experimentPreProcessingId: UUID? = null,

    @Column(name = "experiment_post_processing_id")
    var experimentPostProcessingId: UUID? = null,

    @Column(name = "experiment_processing_id")
    var experimentProcessingId: UUID? = null,

    @Column(name = "data_instance_id")
    val dataInstanceId: UUID? = null,

    @Column(name = "pipeline_config_id")
    val pipelineConfigId: UUID? = null

) {
    init {
        validate()
    }

    fun addParameterInstances(processorParameter: ProcessorParameter, value: String): ParameterInstance {
        val parameterInstance = ParameterInstance(randomUUID(), processorParameter, this.id, value)
        this.parameterInstances.add(parameterInstance)
        return parameterInstance
    }

    fun duplicate(
        experimentPreProcessingId: UUID? = null,
        experimentPostProcessingId: UUID? = null,
        experimentProcessingId: UUID? = null,
        dataInstanceId: UUID? = null,
        pipelineConfigId: UUID? = null
    ): DataProcessorInstance {
        val newId = randomUUID()

        val parameterInstances = this.parameterInstances.map {
            it.copy(id = randomUUID(), dataProcessorInstanceId = newId)
        }.toMutableList()

        return DataProcessorInstance(
            id = newId,
            dataProcessor = this.dataProcessor,
            dataProcessorId = this.dataProcessorId,
            dataProcessorVersion = this.dataProcessorVersion,
            slug = this.slug,
            name = this.name,
            command = this.command,
            metricSchema = this.metricSchema,
            parameterInstances = parameterInstances,
            parentId = this.parentId,
            children = this.children,
            experimentPreProcessingId = experimentPreProcessingId,
            experimentPostProcessingId = experimentPostProcessingId,
            experimentProcessingId = experimentProcessingId,
            dataInstanceId = dataInstanceId,
            pipelineConfigId = pipelineConfigId
        )
    }

    final fun validate(): DataProcessorInstance {
        var assigns = 0
        this.experimentPreProcessingId?.let { assigns++ }
        this.experimentPostProcessingId?.let { assigns++ }
        this.experimentProcessingId?.let { assigns++ }
        this.dataInstanceId?.let { assigns++ }
        this.pipelineConfigId?.let { assigns++ }
        if (assigns <= 1) {
            return this
        } else {
            throw IllegalStateException("Too many relationsships defined for DataProcessorInstance: $assigns")
        }
    }
}
