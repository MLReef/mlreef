package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.domain.FileLocation
import com.mlreef.rest.domain.FileLocationType
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.UUID.randomUUID

class FileLocationTest {
    lateinit var entity: FileLocation

    @BeforeEach
    fun prepare() {
        entity = FileLocation(randomUUID(), FileLocationType.PATH, "path")
    }

    @Test
    fun `duplicate changes parameterInstances ID `() {
        val oldParam = entity.copy()
        val newParam = oldParam.duplicate()
        Assertions.assertThat(newParam.locationType).isEqualTo(oldParam.locationType)
        Assertions.assertThat(newParam.location).isEqualTo(oldParam.location)
        Assertions.assertThat(newParam.id).isNotEqualTo(oldParam.id)
    }

}
