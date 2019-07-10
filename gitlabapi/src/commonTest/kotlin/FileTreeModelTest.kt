package com.mlreef.gitlabapi.v4

import com.mlreef.gitlabapi.v4.FileModes.blob
import kotlinx.serialization.ImplicitReflectionSerializer
import kotlinx.serialization.UnstableDefault
import kotlinx.serialization.parseList
import kotlin.test.Test
import kotlin.test.assertEquals

@UnstableDefault
class FileTreeModelTest {

    @UseExperimental(ImplicitReflectionSerializer::class)
    @Test fun canDeserializeSingleFile() = runTest {
        val file: TreeItem = gitlabSerializer.parse(
            TreeItem.serializer(),
            singleFileJson
        )

        assertEquals(actual = file.id,  expected = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391")
        assertEquals(actual = file.name,  expected = "__init__.py")
        assertEquals(actual = file.type, expected = blob)
        assertEquals(actual = file.isDirectory, expected = false)
        assertEquals(actual = file.isFile, expected = true)
        assertEquals(actual = file.path,  expected = "sources/__init__.py")
        assertEquals(actual = file.mode,  expected = 100644)
    }


    @UseExperimental(ImplicitReflectionSerializer::class)
    @Test fun canDeserializeListOfGroups() = runTest {
        val files: List<TreeItem> = gitlabSerializer.parseList(fileListJson)

        assertEquals(actual = files.size, expected = 5)

        assertEquals(actual = files[0].id, expected = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391")
        assertEquals(actual = files[0].name,  expected = "__init__.py")
        assertEquals(actual = files[0].type, expected = blob)
        assertEquals(actual = files[0].path,  expected = "sources/__init__.py")
        assertEquals(actual = files[0].mode,  expected = 100644)
    }
}

internal val singleFileJson: String = """
    |{
    |  "id": "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391",
    |  "name": "__init__.py",
    |  "type": "blob",
    |  "path": "sources/__init__.py",
    |  "mode": "100644"
    |}
""".trimMargin()

internal val fileListJson: String = """
[
    {
        "id": "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391",
        "name": "__init__.py",
        "type": "blob",
        "path": "sources/__init__.py",
        "mode": "100644"
    },
    {
        "id": "618031b7f531c4fa076118079c68f2733c516c76",
        "name": "features.py",
        "type": "blob",
        "path": "sources/features.py",
        "mode": "100644"
    },
    {
        "id": "e83dd577fb59d59dde52768bb9a286449638fd94",
        "name": "image.py",
        "type": "blob",
        "path": "sources/image.py",
        "mode": "100644"
    },
    {
        "id": "57c26cfdce88a56f72379cac0f334c35fc5e78b4",
        "name": "labeled_image.py",
        "type": "blob",
        "path": "sources/labeled_image.py",
        "mode": "100644"
    },
    {
        "id": "9d64583dc8a47b3db0521981e9f9a44ba6c79e7e",
        "name": "mnist.py",
        "type": "blob",
        "path": "sources/mnist.py",
        "mode": "100644"
    }
]
    """.trimMargin()
