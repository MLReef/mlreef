package com.mlreef.rest.domain

import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table(name = "parameter_instances")
data class ParameterInstance(
    @Id
    @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parameter_id")
    val parameter: Parameter, //TODO: Make it nullable because in database it is nullable ('SET NULL' option if parent is removed)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "processor_instance_id")
    val processorInstance: ProcessorInstance,

    val value: String,
    val name: String = parameter.name,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    val parameterType: ParameterType? = null, //we save duplication of name and type just in case if parent parameter is deleted
) {
    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is ParameterInstance -> false
            else -> this.id == other.id
        }
    }

    override fun toString(): String {
        return "ParameterInstance(id=$id, parameter=${parameter.id}, processorInstance=${processorInstance.id}, value='$value', name='$name')"
    }
}