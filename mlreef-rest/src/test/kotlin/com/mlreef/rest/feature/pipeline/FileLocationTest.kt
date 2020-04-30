package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.FileLocation
import com.mlreef.rest.FileLocationType
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID.randomUUID

class FileLocationTest {
    lateinit var entity: FileLocation

    @BeforeEach
    fun prepare() {
        entity = FileLocation(randomUUID(), FileLocationType.PATH, "path")
    }

    @Test
    fun `duplicate changes parameterInstances ID `() {
        val oldParam = entity.copy(experimentId = randomUUID())
        val newParam = oldParam.duplicate()
        Assertions.assertThat(newParam.locationType).isEqualTo(oldParam.locationType)
        Assertions.assertThat(newParam.location).isEqualTo(oldParam.location)

        Assertions.assertThat(newParam.id).isNotEqualTo(oldParam.id)
    }

    @Test
    fun `duplicate changes relations to null `() {
        val oldParam = entity.copy(experimentId = randomUUID())
        val newParam = oldParam.duplicate()
        Assertions.assertThat(newParam.experimentId).isEqualTo(null)
        Assertions.assertThat(newParam.dataInstanceId).isEqualTo(null)
        Assertions.assertThat(newParam.pipelineConfigId).isEqualTo(null)
    }

    @Test
    fun `duplicate changes relations to null except explicit ones`() {
        val oldParam = entity.copy(experimentId = randomUUID())
        val newParam = oldParam.duplicate(experimentId = randomUUID())
        Assertions.assertThat(newParam.experimentId).isNotNull()
        Assertions.assertThat(newParam.dataInstanceId).isEqualTo(null)
        Assertions.assertThat(newParam.pipelineConfigId).isEqualTo(null)
    }

    @Test
    fun `validate throws IllegalStateException if more than 1 relations are set`() {
        assertThrows<IllegalStateException> {
            this.entity.copy(
                experimentId = randomUUID(),
                pipelineConfigId = randomUUID(),
                dataInstanceId = randomUUID()
            )
        }
    }

    @Test
    fun `validate returns if not more than 1 relations are set `() {
        val validate = this.entity.copy(
            experimentId = randomUUID(),
            pipelineConfigId = null,
            dataInstanceId = null
        ).validate()
        Assertions.assertThat(validate).isNotNull()
    }

    @Test
    fun `validate returns if 0 relations are set `() {
        val validate = this.entity.copy(
            experimentId = null,
            pipelineConfigId = null,
            dataInstanceId = null
        ).validate()
        Assertions.assertThat(validate).isNotNull()
    }
}
