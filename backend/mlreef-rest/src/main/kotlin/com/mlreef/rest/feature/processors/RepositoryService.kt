package com.mlreef.rest.feature.processors

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTree
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.Base64

@Service
class RepositoryService(
    private val gitlabRestClient: GitlabRestClient,
) {
    companion object {
        val processingExtensions = setOf("py")
        val log = LoggerFactory.getLogger(this::class.java)
        private const val GITLAB_PATH_SEPARATOR = "/"
    }

    data class RepositoryFileContent(
        val path: String,
        val content: String?,
        val sha256: String?,
        val lastCommitId: String?,
    )

    fun findFileInRepository(gitlabId: Long, filePath: String?, branch: String? = null): RepositoryTree? {
        val splitedFolderAndFile = getPathWithoutFileName(filePath)
        var filesList = gitlabRestClient.adminGetProjectTree(gitlabId, splitedFolderAndFile?.first, branch = branch)

        while (filesList.page <= filesList.totalPages) {
            val searchingFile = filesList.content?.find { it.name == splitedFolderAndFile?.second && it.type == RepositoryTreeType.BLOB }

            if (searchingFile != null) return searchingFile
            if (!(filesList.page < filesList.totalPages)) break

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, splitedFolderAndFile?.first, pageNumber = filesList.page + 1, branch = branch)
        }

        return null
    }

    fun getFilesContentOfRepository(gitlabId: Long, path: String? = null, filterByExt: Boolean = true, processAsFile: Boolean = true, branch: String? = null): List<RepositoryFileContent> {
        val allFiles = mutableListOf<RepositoryFileContent?>()
        var filesList = gitlabRestClient.adminGetProjectTree(gitlabId, path, branch = branch)

        if (path != null && filesList.content?.size == 0 && processAsFile) {
            val splitedFolderAndFile = getPathWithoutFileName(path)

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, normalizeGitlabFolder(splitedFolderAndFile?.first), branch = branch)

            filesList.content?.find { it.name == splitedFolderAndFile?.second }?.let {
                if (it.type == RepositoryTreeType.TREE) {
                    allFiles.addAll(getFilesContentOfRepository(gitlabId, it.path, filterByExt, false))
                } else {
                    it.let {
                        allFiles.add(getFileContent(gitlabId, it.path))
                    }
                }
            }

            return allFiles.filterNotNull()
        }

        while (filesList.page <= filesList.totalPages) {
            filesList.content
                ?.forEach {
                    if (it.type == RepositoryTreeType.TREE) {
                        allFiles.addAll(getFilesContentOfRepository(gitlabId, it.path, filterByExt, false))
                    } else {
                        if (!filterByExt || processingExtensions.contains(getFilenameExtension(it.name))) {
                            allFiles.add(getFileContent(gitlabId, it.path))
                        }
                    }
                }

            if (!(filesList.page < filesList.totalPages)) break

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, path, pageNumber = filesList.page + 1, branch = branch)
        }

        return allFiles.filterNotNull()
    }

    private fun getFileContent(gitlabId: Long, filePath: String): RepositoryFileContent? {
        val file = gitlabRestClient.adminGetRepositoryFileContentAndInformation(gitlabId, filePath)
        return try {
            RepositoryFileContent(
                path = filePath,
                content = String(Base64.getDecoder().decode(file.content)),
                sha256 = file.contentSha256,
                lastCommitId = file.lastCommitId,
            )
        } catch (ex: Exception) {
            log.error("Cannot decode file $filePath")
            null
        }
    }

    private fun normalizeGitlabFolder(folder: String?): String? {
        return if (folder?.startsWith("/") ?: false) folder?.substring(1, folder.length) else folder
    }

    private fun getFilenameExtension(filename: String): String {
        return filename.substring(filename.lastIndexOf(".") + 1).trim()
    }

    private fun getPathWithoutFileName(filename: String?): Pair<String?, String?>? {
        return filename?.let {
            val pathParts = it.split(GITLAB_PATH_SEPARATOR)
            if (pathParts.size > 1) {
                Pair(
                    pathParts.subList(0, pathParts.size - 1).joinToString(GITLAB_PATH_SEPARATOR), //folder
                    pathParts[pathParts.size - 1] //filename
                )
            } else {
                Pair(null, it) //folder is null, only filename
            }
        }
    }
}