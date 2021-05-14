package com.mlreef.rest.domain

import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table

/**
 * A Parameter describes a native data type (e.g. floating number in python), with a title and descriptions.
 * To support more features, nullable and defaultValues could be provided
 */
@Entity
@Table(name = "parameters")
data class Parameter(
    @Id
    @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    val name: String,

    @Column(name = "parameter_order")
    val order: Int,
    val defaultValue: String,
    val required: Boolean = false,

    @Column(name = "parameter_group")
    val group: String = "",

    val description: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_id")
    var processor: Processor?,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    val parameterType: ParameterType?,

    @OneToMany(mappedBy = "parameter", fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    val instances: Set<ParameterInstance> = setOf(),
) : EPFAnnotation {
    override fun toString(): String {
        return "Parameter(id=$id, name='$name', order=$order, defaultValue='$defaultValue', required=$required, group='$group', description=$description, processor=${processor?.id}, parameterType=${parameterType?.name}, instances=${instances.map { it.id }.joinToString("; ")})"
    }

    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is Parameter -> false
            else -> this.id == other.id
        }
    }


}


