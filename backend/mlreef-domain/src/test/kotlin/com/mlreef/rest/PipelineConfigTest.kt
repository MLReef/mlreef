package com.mlreef.rest

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.UUID.randomUUID

class PipelineConfigTest {

    private lateinit var entity: PipelineConfig

    @BeforeEach
    fun prepare() {
        entity = PipelineConfig(
            id = randomUUID(),
            pipelineType = PipelineType.DATA, slug = "slug", name = "name",
            dataProjectId = randomUUID(),
            sourceBranch = "source",
            targetBranchPattern = "target",
            dataOperations = arrayListOf(),
        )
    }

    @Test
    fun `inputFiles are added`() {
        val fileLocation = FileLocation(randomUUID(), FileLocationType.PATH, "path")

        Assertions.assertThat(entity.inputFiles).isEmpty()

        entity.addInputFile(fileLocation = fileLocation)
        Assertions.assertThat(entity.inputFiles).isNotEmpty()
    }

    @Test
    fun `added inputFile has a set pipelineConfigId`() {
        val fileLocation = FileLocation(randomUUID(), FileLocationType.PATH, "path")

        val inputFile = entity.addInputFile(fileLocation = fileLocation)
        Assertions.assertThat(inputFile.id).isEqualTo(fileLocation.id)
    }

    @Test
    fun `added inputFile changes only pipelineConfigId`() {
        val fileLocation = FileLocation(randomUUID(), FileLocationType.PATH, "path")

        val inputFile = entity.addInputFile(fileLocation = fileLocation)

        // no changes
        Assertions.assertThat(inputFile.id).isEqualTo(fileLocation.id)
        Assertions.assertThat(inputFile.locationType).isEqualTo(fileLocation.locationType)
        Assertions.assertThat(inputFile.location).isEqualTo(fileLocation.location)
    }
}
