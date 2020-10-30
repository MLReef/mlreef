package com.mlreef.rest.feature.data_processors

import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
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
    }

    fun getFilesContentOfRepository(gitlabId: Long, path: String? = null, filterByExt: Boolean = true): Map<String, String> {
        var filesList = gitlabRestClient.adminGetProjectTree(gitlabId, path)
        val allFiles = mutableMapOf<String, String>()

        while (filesList.page <= filesList.totalPages) {
            filesList.content
                ?.forEach {
                    if (it.type == RepositoryTreeType.TREE) {
                        allFiles.putAll(getFilesContentOfRepository(gitlabId, it.path, filterByExt))
                    } else {
                        if (!filterByExt || processingExtensions.contains(getFilenameExtension(it.name))) {
                            val file = gitlabRestClient.adminGetRepositoryFileContent(gitlabId, it.id)
                            try {
                                allFiles.putAll(mapOf(it.path to String(Base64.getDecoder().decode(file.content))))
                            } catch (ex: Exception) {
                                log.error("Cannot decode file ${it.name}")
                            }
                        }
                    }
                }

            if (filesList.page >= filesList.totalPages) break

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, path, pageNumber = filesList.page + 1)
        }

        return allFiles
    }

    private fun getFilenameExtension(filename: String): String? {
        return filename.substring(filename.lastIndexOf(".") + 1).trim()
    }
}