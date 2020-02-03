package com.mlreef.rest

import java.util.*
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinColumns
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
    @JoinColumns(
        JoinColumn(name = "data_processor_id", referencedColumnName = "id"),
        JoinColumn(name = "data_processor_version", referencedColumnName = "version")
    )
    val dataProcessor: DataProcessor,
    val slug: String = dataProcessor.slug,
    val name: String = dataProcessor.name,

    @OneToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinColumn(name = "data_processor_instance_id")
    val parameterInstances: MutableList<ParameterInstance> = arrayListOf(),

    @Column(name = "parent_id")
    val parentId: UUID? = null,

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    val children: MutableList<DataProcessorInstance> = arrayListOf(),

    var experimentPreProcessingId: UUID? = null,

    var experimentPostProcessingId: UUID? = null,

    var experimentProcessingId: UUID? = null

) {

    fun addParameterInstances(processorParameter: ProcessorParameter, value: String): ParameterInstance {
        val parameterInstance = ParameterInstance(UUID.randomUUID(), processorParameter, this.id, value)
        this.parameterInstances.add(parameterInstance)
        return parameterInstance
    }
}
