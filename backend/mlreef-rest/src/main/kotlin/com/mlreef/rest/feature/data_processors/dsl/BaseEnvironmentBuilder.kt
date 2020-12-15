package com.mlreef.rest.feature.data_processors.dsl

import com.mlreef.rest.BaseEnvironments
import com.mlreef.rest.PublishingMachineType
import java.util.UUID

class BaseEnvironmentBuilder {
    lateinit var id: UUID
    lateinit var title: String
    lateinit var dockerImage: String
    var description: String = ""
    var requirements: String? = null
    var machineType: PublishingMachineType = PublishingMachineType.default()
    var sdkVersion: String? = null

    fun build() = BaseEnvironments(
        id = this.id,
        title = this.title,
        dockerImage = this.dockerImage,
        description = description,
        requirements = this.requirements,
        machineType = this.machineType,
        sdkVersion = this.sdkVersion,
    )
}
