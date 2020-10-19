package com.mlreef.rest.feature.data_processors

import com.mlreef.rest.Project
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

    fun getFilesContentOfRepository(project: Project, path: String? = null, filterByExt: Boolean = true): List<String> {
        var filesList = gitlabRestClient.adminGetProjectTree(project.gitlabId, path)
        val allFiles = mutableListOf<String>()

        while (filesList.page <= filesList.totalPages) {
            val contents = filesList.content
                ?.flatMap {
                    if (it.type == RepositoryTreeType.TREE) {
                        getFilesContentOfRepository(project, it.path, filterByExt)
                    } else {
                        if (!filterByExt || processingExtensions.contains(getFilenameExtension(it.name))) {
                            val file = gitlabRestClient.adminGetRepositoryFileContent(project.gitlabId, it.id)
                            try {
                                listOf(String(Base64.getDecoder().decode(file.content)))
                            } catch (ex: Exception) {
                                log.error("Cannot decode file ${it.name}")
                                listOf()
                            }
                        } else listOf()
                    }
                }
            allFiles.addAll(contents ?: listOf())

            if (filesList.page >= filesList.totalPages) break

            filesList = gitlabRestClient.adminGetProjectTree(project.gitlabId, path, pageNumber = filesList.page + 1)
        }

        return allFiles
    }

    private fun getFilenameExtension(filename: String): String? {
        return filename.substring(filename.lastIndexOf(".") + 1).trim()
    }
}