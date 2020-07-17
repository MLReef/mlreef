package com.mlreef.rest

import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.ForeignKey
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.OneToOne
import javax.persistence.Table

/**
 * A Parameter describes a native data type (e.g. floating number in python), with a title and descriptions.
 * To support more features, nullable and defaultValues could be provided
 */
@Entity
@Table(name = "processor_parameter")
data class ProcessorParameter(
    @Id
    @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,
    @Column(name = "processor_version_id")
    val processorVersionId: UUID,
    val name: String,
    @Enumerated(EnumType.STRING)
    val type: ParameterType,
    @Column(name = "parameter_order")
    val order: Int,
    val defaultValue: String,
    @Column(name = "required")
    val required: Boolean = false,
    @Column(name = "parameter_group")
    val group: String = "",
    @Column(length = 1024)
    val description: String? = null


) : EPFAnnotation

@Entity
@Table(name = "parameter_instance")
data class ParameterInstance(
    @Id
    @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @OneToOne(fetch = FetchType.EAGER, cascade = [CascadeType.DETACH])
    @JoinColumn(
        name = "parameter_id",
        foreignKey = ForeignKey(name = "parameterinstance_processorparameter_parameter_id_fkey")
    )
    val processorParameter: ProcessorParameter,
    @Column(name = "data_processor_instance_id")
    val dataProcessorInstanceId: UUID,
    val value: String,
    val name: String = processorParameter.name,
    val type: ParameterType = processorParameter.type
)

/**
 * ParameterTypes are typical simple data types.
 * Lists and Objects should be supported, but cannot be interfered in a global scope.
 */
enum class ParameterType {
    BOOLEAN,
    STRING,
    INTEGER,
    COMPLEX,
    FLOAT,
    LIST,
    TUPLE,
    DICTIONARY,
    OBJECT,
    UNDEFINED;

    companion object {
        fun fromValue(value: String): ParameterType {
            val list = values().filter { value.equals(it.name, ignoreCase = true) }
            return when {
                list.isEmpty() -> throw IllegalArgumentException("Value not found")
                else -> list.first()
            }
        }
    }
}
