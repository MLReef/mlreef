package com.mlreef.rest

import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

enum class FileLocationType {
    PATH,
    URL,
    AWS_ID;

    companion object {
        fun fromString(value: String) = when (value.toUpperCase()) {
            PATH.name -> PATH
            URL.name -> URL
            AWS_ID.name -> AWS_ID
            "AWS" -> AWS_ID
            else -> PATH
        }
    }
}

/**
 * Descriptor of an FileLocation, which could be a Path, or an Url.
 * Has a type which can be evaluated how to understand this url
 *
 * Can be included in DataInstances (chosen files), PipelineConfigurations (files to be chosen)
 * and soon Experiments (chosen files).
 *
 * Todo: therefore we need to support some kind of "generic relation" to all those entities
 */

@Entity
@Table(name = "file_location")
data class FileLocation(
    @Id @Column(name = "id", length = 16, unique = true, nullable = false)
    val id: UUID,

    @Column(name = "location_type")
    val locationType: FileLocationType,

    val location: String,

    // TODO: think about proper JPA generic relationships

    @Column(name = "experiment_id")
    val experimentId: UUID? = null,

    @Column(name = "data_instance_id")
    val dataInstanceId: UUID? = null,

    @Column(name = "pipeline_config_id")
    val pipelineConfigId: UUID? = null
) {

    companion object {
        fun fromDto(location: String, locationType: String): FileLocation {
            return FileLocation(
                id = randomUUID(),
                location = location,
                locationType = FileLocationType.fromString(locationType)
            )
        }
    }

    init {
        validate()
    }

    /**
     * Clone for a new Entity and set ONE of experimentId, dataInstanceId OR pipelineConfigId
     */
    fun duplicate(
        experimentId: UUID? = null,
        dataInstanceId: UUID? = null,
        pipelineConfigId: UUID? = null
    ) = FileLocation(
        id = randomUUID(),
        locationType = this.locationType,
        location = this.location,
        experimentId = experimentId,
        dataInstanceId = dataInstanceId,
        pipelineConfigId = pipelineConfigId

    )

    final fun validate(): FileLocation {
        var assigns = 0
        this.experimentId?.let { assigns++ }
        this.dataInstanceId?.let { assigns++ }
        this.pipelineConfigId?.let { assigns++ }
        if (assigns <= 1) {
            return this
        } else {
            throw IllegalStateException("Too many relationsships defined for FileLocation: $assigns")
        }
    }
}
