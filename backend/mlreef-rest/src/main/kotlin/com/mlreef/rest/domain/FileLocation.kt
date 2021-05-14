package com.mlreef.rest.domain

import java.util.UUID
import java.util.UUID.randomUUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

enum class FileLocationType {
    @Deprecated("This option is not should be replaced, not specific enough")
    PATH,
    PATH_FILE,
    PATH_FOLDER,
    URL,
    AWS_ID;

    companion object {
        fun fromString(value: String) = when (value.toUpperCase()) {
            PATH_FILE.name -> PATH_FILE
            PATH_FOLDER.name -> PATH_FOLDER
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

    val location: String

) {

    companion object {
        fun fromDto(location: String, locationType: String): FileLocation {
            return FileLocation(
                id = randomUUID(),
                location = location,
                locationType = FileLocationType.fromString(locationType)
            )
        }

        fun fromPath(location: String): FileLocation {
            return FileLocation(
                id = randomUUID(),
                location = location,
                locationType = FileLocationType.PATH
            )
        }
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
        location = this.location
    )

    fun toYamlString() = "$locationType:$location"
}
