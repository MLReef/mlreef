package com.mlreef.rest.feature.data_processors

import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTree
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTreePaged
import com.mlreef.rest.feature.AbstractContextTest
import com.ninjasquad.springmockk.SpykBean
import io.mockk.confirmVerified
import io.mockk.every
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.util.UUID.randomUUID

internal class RepositoryServiceContextTest : AbstractContextTest() {
    @SpykBean
    private lateinit var service: RepositoryService

    @BeforeEach
    fun setUp() {
    }

    @Test
    internal fun `Test get a page with repository files - flat structure`() {
        every {
            gitlabRestClient.adminGetProjectTree(any(), any())
        } answers {
            val file1 = RepositoryTree(randomUUID().toString(), "file1.py", RepositoryTreeType.BLOB, "file1.py", "rw")
            val file2 = RepositoryTree(randomUUID().toString(), "file2.py", RepositoryTreeType.BLOB, "file2.py", "rw")
            val file3 = RepositoryTree(randomUUID().toString(), "file3.py", RepositoryTreeType.BLOB, "file3.py", "rw")
            RepositoryTreePaged(
                content = listOf(file1, file2, file3),
                page = 1,
                totalPages = 1,
                totalElements = 3,
                perPage = 10
            )
        }

        val result = service.getFilesContentOfRepository(1L, filterByExt = true)

        assertThat(result.size).isEqualTo(3)
        assertThat(result.keys).containsExactlyInAnyOrderElementsOf(listOf("file1.py", "file2.py", "file3.py"))

        verify(exactly = 1) {
            gitlabRestClient.adminGetProjectTree(any(), any())
        }

        verify(exactly = 3) {
            gitlabRestClient.adminGetRepositoryFileContent(any(), any())
        }

        verify(exactly = 1) {
            service.getFilesContentOfRepository(any(), any(), any())
        }

        confirmVerified(gitlabRestClient)
    }

    @Test
    internal fun `Test get a page with repository files - with folder`() {
        val file1 = RepositoryTree(randomUUID().toString(), "file1.py", RepositoryTreeType.BLOB, "file1.py", "rw")
        val file2 = RepositoryTree(randomUUID().toString(), "file2.py", RepositoryTreeType.BLOB, "file2.py", "rw")
        val file3 = RepositoryTree(randomUUID().toString(), "file3.py", RepositoryTreeType.BLOB, "file3.py", "rw")
        val folder1 = RepositoryTree(randomUUID().toString(), "fodler1", RepositoryTreeType.TREE, "folder1", "rw")
        val file4 = RepositoryTree(randomUUID().toString(), "file4.py", RepositoryTreeType.BLOB, "file4.py", "rw")
        val folder2 = RepositoryTree(randomUUID().toString(), "fodler1", RepositoryTreeType.TREE, "folder1/folder2", "rw")
        val file5 = RepositoryTree(randomUUID().toString(), "file1.py", RepositoryTreeType.BLOB, "file5.py", "rw")
        val file6 = RepositoryTree(randomUUID().toString(), "file1.py", RepositoryTreeType.BLOB, "file6.py", "rw")

        every {
            gitlabRestClient.adminGetProjectTree(any(), isNull())
        } answers {
            RepositoryTreePaged(
                content = listOf(file1, file2, file3, folder1),
                page = 1,
                totalPages = 1,
                totalElements = 3,
                perPage = 10
            )
        }

        every {
            gitlabRestClient.adminGetProjectTree(any(), eq("folder1"))
        } answers {
            RepositoryTreePaged(
                content = listOf(file4, folder2),
                page = 1,
                totalPages = 1,
                totalElements = 3,
                perPage = 10
            )
        }

        every {
            gitlabRestClient.adminGetProjectTree(any(), eq("folder1/folder2"))
        } answers {
            RepositoryTreePaged(
                content = listOf(file5, file6),
                page = 1,
                totalPages = 1,
                totalElements = 3,
                perPage = 10
            )
        }

        val result = service.getFilesContentOfRepository(1L, filterByExt = true)

        assertThat(result.size).isEqualTo(6)
        assertThat(result.keys).containsExactlyInAnyOrderElementsOf(
            listOf("file1.py", "file2.py", "file3.py", "file4.py", "file5.py", "file6.py")
        )

        verify(exactly = 3) {
            gitlabRestClient.adminGetProjectTree(any(), any())
        }

        verify(exactly = 6) {
            gitlabRestClient.adminGetRepositoryFileContent(any(), any())
        }

        verify(exactly = 1) {
            service.getFilesContentOfRepository(any(), any(), any())
        }

        confirmVerified(gitlabRestClient)
    }

    @Test
    internal fun `Test get a page with repository files - paged`() {
        val file1 = RepositoryTree(randomUUID().toString(), "file1.py", RepositoryTreeType.BLOB, "file1.py", "rw")
        val file2 = RepositoryTree(randomUUID().toString(), "file2.py", RepositoryTreeType.BLOB, "file2.py", "rw")
        val file3 = RepositoryTree(randomUUID().toString(), "file3.py", RepositoryTreeType.BLOB, "file3.py", "rw")
        val file4 = RepositoryTree(randomUUID().toString(), "file4.py", RepositoryTreeType.BLOB, "file4.py", "rw")
        val file5 = RepositoryTree(randomUUID().toString(), "file5.py", RepositoryTreeType.BLOB, "file5.py", "rw")
        val file6 = RepositoryTree(randomUUID().toString(), "file6.py", RepositoryTreeType.BLOB, "file6.py", "rw")
        val file7 = RepositoryTree(randomUUID().toString(), "file7.py", RepositoryTreeType.BLOB, "file7.py", "rw")
        val file8 = RepositoryTree(randomUUID().toString(), "file8.py", RepositoryTreeType.BLOB, "file8.py", "rw")
        val file9 = RepositoryTree(randomUUID().toString(), "file9.py", RepositoryTreeType.BLOB, "file9.py", "rw")

        every {
            gitlabRestClient.adminGetProjectTree(any(), isNull())
        } answers {
            RepositoryTreePaged(
                content = listOf(file1, file2, file3),
                page = 1,
                totalPages = 3,
                totalElements = 9,
                perPage = 3
            )
        }

        every {
            gitlabRestClient.adminGetProjectTree(any(), any(), pageNumber = eq(2))
        } answers {
            RepositoryTreePaged(
                content = listOf(file4, file5, file6),
                page = 2,
                totalPages = 3,
                totalElements = 9,
                perPage = 3
            )
        }

        every {
            gitlabRestClient.adminGetProjectTree(any(), any(), pageNumber = eq(3))
        } answers {
            RepositoryTreePaged(
                content = listOf(file7, file8, file9),
                page = 3,
                totalPages = 3,
                totalElements = 9,
                perPage = 3
            )
        }

        val result = service.getFilesContentOfRepository(1L, filterByExt = true)

        assertThat(result.size).isEqualTo(9)
        assertThat(result.keys).containsExactlyInAnyOrderElementsOf(
            listOf("file1.py", "file2.py", "file3.py", "file4.py", "file5.py", "file6.py", "file7.py", "file8.py", "file9.py")
        )

        verify(exactly = 3) {
            gitlabRestClient.adminGetProjectTree(any(), any(), eq(100), any())
        }

        verify(exactly = 9) {
            gitlabRestClient.adminGetRepositoryFileContent(any(), any())
        }

        verify(exactly = 1) {
            service.getFilesContentOfRepository(any(), any(), any())
        }

        confirmVerified(gitlabRestClient)
    }

    @Test
    internal fun `Test get a page with repository files - filtered`() {
        val file1 = RepositoryTree(randomUUID().toString(), "file1.py", RepositoryTreeType.BLOB, "file1.py", "rw")
        val file2 = RepositoryTree(randomUUID().toString(), "file2.pyt", RepositoryTreeType.BLOB, "file2.pyt", "rw")
        val file3 = RepositoryTree(randomUUID().toString(), "file3.p", RepositoryTreeType.BLOB, "file3.p", "rw")
        val file4 = RepositoryTree(randomUUID().toString(), "file4", RepositoryTreeType.BLOB, "file4", "rw")
        val file5 = RepositoryTree(randomUUID().toString(), "file5.sh", RepositoryTreeType.BLOB, "file5.sh", "rw")
        val file6 = RepositoryTree(randomUUID().toString(), "file6.ppy", RepositoryTreeType.BLOB, "file6.ppy", "rw")
        val file7 = RepositoryTree(randomUUID().toString(), "py", RepositoryTreeType.BLOB, "py", "rw")
        val file8 = RepositoryTree(randomUUID().toString(), "file8.python.py", RepositoryTreeType.BLOB, "file8.python.py", "rw")
        val file9 = RepositoryTree(randomUUID().toString(), "file9.pyy", RepositoryTreeType.BLOB, "file9.pyy", "rw")

        every {
            gitlabRestClient.adminGetProjectTree(any(), isNull())
        } answers {
            RepositoryTreePaged(
                content = listOf(file1, file2, file3, file4, file5, file6, file7, file8, file9),
                page = 1,
                totalPages = 1,
                totalElements = 9,
                perPage = 10
            )
        }

        val result = service.getFilesContentOfRepository(1L, filterByExt = true)

        assertThat(result.size).isEqualTo(3)
        assertThat(result.keys).containsExactlyInAnyOrderElementsOf(
            listOf("file1.py", "py", "file8.python.py")
        )

        verify(exactly = 1) {
            gitlabRestClient.adminGetProjectTree(any(), any(), eq(100), any())
        }

        verify(exactly = 3) {
            gitlabRestClient.adminGetRepositoryFileContent(any(), any())
        }

        verify(exactly = 1) {
            service.getFilesContentOfRepository(any(), any(), any())
        }

        confirmVerified(gitlabRestClient)
    }
}