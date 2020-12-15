package com.mlreef.rest

import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.Table

enum class PublishingMachineType {
    CPU,
    GPU,
    ;

    companion object {
        fun default() = CPU
    }
}


/**
 * An Instance of DataOperation or DataVisualisation contains instantiated values of Parameters
 */
@Entity
@Table(name = "base_environments")
data class BaseEnvironments(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false) val id: UUID,

    val title: String,
    val dockerImage: String,
    val description: String? = null,
    val requirements: String? = null,

    @Enumerated(EnumType.STRING)
    val machineType: PublishingMachineType = PublishingMachineType.default(),

    val sdkVersion: String? = null,
) {
    override fun hashCode() = id.hashCode()

    override fun equals(other: Any?): Boolean {
        return when {
            this === other -> true
            other == null -> false
            other !is BaseEnvironments -> false
            else -> this.id == other.id
        }
    }

    override fun toString(): String {
        return "${this.javaClass.simpleName}: id=$id; title=$title; dockerImage=$dockerImage, machineType=$machineType"
    }
}
