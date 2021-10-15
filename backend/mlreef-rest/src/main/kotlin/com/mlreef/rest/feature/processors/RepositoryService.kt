package com.mlreef.rest.feature.processors

import com.mlreef.rest.domain.CommitOperations
import com.mlreef.rest.domain.Project
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTree
import com.mlreef.rest.utils.RandomUtils
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.time.Instant
import java.util.Base64
import java.util.UUID

@Service
class RepositoryService(
    private val gitlabRestClient: GitlabRestClient,
) {
    companion object {
        val processingExtensions = setOf("py")
        val log = LoggerFactory.getLogger(this::class.java)
        private const val GITLAB_PATH_SEPARATOR = "/"
        private val DEFAULT_BRANCH = "master"
    }

    data class RepositoryFileContent(
        val path: String,
        val content: String?,
        val sha256: String?,
        val lastCommitId: String?,
    )

    fun getElementsListInRepository(gitlabId: Long, branch: String, startPath: String? = null, deep: Int = 0) = getElementsListInRepository(gitlabId, branch, null, startPath, deep)

    fun getFoldersListInRepository(gitlabId: Long, branch: String, startPath: String? = null, deep: Int = 0) = getElementsListInRepository(gitlabId, branch, RepositoryTreeType.TREE, startPath, deep)

    fun getFilesListInRepository(gitlabId: Long, branch: String, startPath: String? = null, deep: Int = 0) = getElementsListInRepository(gitlabId, branch, RepositoryTreeType.BLOB, startPath, deep)

    fun getElementsListInRepositoryDeep(gitlabId: Long, branch: String, startPath: String? = null) = getElementsListInRepository(gitlabId, branch, null, startPath, -1)

    fun getFilesListInRepositoryDeep(gitlabId: Long, branch: String, startPath: String?) = getElementsListInRepository(gitlabId, branch, RepositoryTreeType.BLOB, startPath, -1)

    fun getFoldersListInRepositoryDeep(gitlabId: Long, branch: String, startPath: String?) = getElementsListInRepository(gitlabId, branch, RepositoryTreeType.TREE, startPath, -1)


    fun getElementsNamesListInRepository(gitlabId: Long, branch: String, startPath: String? = null, deep: Int = 0) = getElementsPathsListInRepository(gitlabId, branch, null, startPath, deep)

    fun getFoldersNamesListInRepository(gitlabId: Long, branch: String, startPath: String? = null, deep: Int = 0) = getElementsPathsListInRepository(gitlabId, branch, RepositoryTreeType.TREE, startPath, deep)

    fun getFilesNamesListInRepository(gitlabId: Long, branch: String, startPath: String? = null, deep: Int = 0) = getElementsPathsListInRepository(gitlabId, branch, RepositoryTreeType.BLOB, startPath, deep)

    fun getFilesNamesListInRepositoryDeep(gitlabId: Long, branch: String, startPath: String?) = getElementsPathsListInRepository(gitlabId, branch, RepositoryTreeType.BLOB, startPath, -1)

    fun getFoldersNamesListInRepositoryDeep(gitlabId: Long, branch: String, startPath: String?) = getElementsPathsListInRepository(gitlabId, branch, RepositoryTreeType.TREE, startPath, -1)

    private fun getElementsPathsListInRepository(gitlabId: Long, branch: String, type: RepositoryTreeType? = null, startPath: String? = null, deep: Int = 0, parent: RepositoryTree? = null): List<String> {
        val isItFolder = parent?.let { it.type == RepositoryTreeType.TREE } ?: isItFolder(gitlabId, branch, startPath)

        val folder = if (isItFolder) {
            parent?.path ?: startPath
        } else {
            (parent?.path ?: startPath)?.substringBeforeLast(GITLAB_PATH_SEPARATOR)
        }

        var filesList = gitlabRestClient.adminGetProjectTree(gitlabId, folder, branch = branch)
        val result = mutableListOf<String>()

        while (filesList.page <= filesList.totalPages) {
            result.addAll(
                filesList.content?.flatMap {
                    val element = if (type == null || it.type == type) {
                        it.path
                    } else null

                    val listInDeep = if (it.type == RepositoryTreeType.TREE && (deep == -1 || deep > 0)) {
                        getElementsPathsListInRepository(gitlabId, branch, type, deep = if (deep == -1) -1 else deep - 1, parent = it)
                    } else {
                        listOf()
                    }

                    listInDeep + (element?.let { listOf(it) } ?: listOf())
                } ?: listOf()
            )

            if (!(filesList.page < filesList.totalPages)) break

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, folder, pageNumber = filesList.page + 1, branch = branch)
        }

        return result
    }

    private fun getElementsListInRepository(gitlabId: Long, branch: String, type: RepositoryTreeType? = null, startPath: String? = null, deep: Int = 0, parent: RepositoryTree? = null): List<RepositoryTree> {
        val isItFolder = parent?.let { it.type == RepositoryTreeType.TREE } ?: isItFolder(gitlabId, branch, startPath)

        val folder = if (isItFolder) {
            parent?.path ?: startPath
        } else {
            (parent?.path ?: startPath)?.substringBeforeLast(GITLAB_PATH_SEPARATOR)
        }

        var elementsList = gitlabRestClient.adminGetProjectTree(gitlabId, folder, branch = branch)
        val result = mutableListOf<RepositoryTree>()

        while (elementsList.page <= elementsList.totalPages) {
            result.addAll(
                elementsList.content?.flatMap {
                    val element = if (type == null || it.type == type) {
                        it
                    } else null

                    val listInDeep = if (it.type == RepositoryTreeType.TREE && (deep == -1 || deep > 0)) {
                        getElementsListInRepository(gitlabId, branch, type, deep = if (deep == -1) -1 else deep - 1, parent = it)
                    } else {
                        listOf()
                    }

                    listInDeep + (element?.let { listOf(it) } ?: listOf())
                } ?: listOf()
            )

            if (!(elementsList.page < elementsList.totalPages)) break

            elementsList = gitlabRestClient.adminGetProjectTree(gitlabId, folder, pageNumber = elementsList.page + 1, branch = branch)
        }

        return result
    }


    fun findFileInRepository(gitlabId: Long, filePath: String, branch: String? = null) = searchElementsInRepository(gitlabId, filePath, branch, type = RepositoryTreeType.BLOB, maxResult = 1).firstOrNull()

    fun findFolderInRepository(gitlabId: Long, folderPath: String, branch: String? = null) = searchElementsInRepository(gitlabId, folderPath, branch, type = RepositoryTreeType.TREE, maxResult = 1).firstOrNull()

    fun findElementsInRepository(gitlabId: Long, path: String, branch: String? = null) = searchElementsInRepository(gitlabId, path, branch, type = null, maxResult = 2).firstOrNull()

    private fun searchElementsInRepository(
        gitlabId: Long,
        path: String,
        branch: String? = null,
        deep: Int = 0,
        type: RepositoryTreeType? = null,
        maxResult: Int = 1,
        previousResultsSize: Int = 0,
    ): List<RepositoryTree> {
        val finalMaxResult = if (maxResult <= 0) Int.MAX_VALUE else maxResult
        val folder = path.substringBeforeLast(GITLAB_PATH_SEPARATOR).takeIf { extracted -> path != extracted }
        val elementName = path.substringAfterLast(GITLAB_PATH_SEPARATOR)

        var filesList = gitlabRestClient.adminGetProjectTree(gitlabId, folder, branch = branch)
        val result = mutableListOf<RepositoryTree>()
        val foldersPath = mutableListOf<String>()

        while ((result.size + previousResultsSize) < finalMaxResult && filesList.page <= filesList.totalPages) {
            val searchingElements = filesList.content?.filter { it.name == elementName && (type == null || it.type == type) }

            searchingElements?.takeIf { it.isNotEmpty() }?.let { result.addAll(it) }

            if ((result.size + previousResultsSize) >= finalMaxResult) break

            foldersPath.addAll(filesList.content?.filter { it.type == RepositoryTreeType.TREE }?.map { it.path } ?: listOf())

            if (!(filesList.page < filesList.totalPages)) break

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, folder, pageNumber = filesList.page + 1, branch = branch)
        }

        if ((result.size + previousResultsSize) < finalMaxResult && (deep == -1 || deep > 0)) {
            val foldersIterator = foldersPath.iterator()
            while ((result.size + previousResultsSize) < finalMaxResult && foldersIterator.hasNext()) {
                result.addAll(
                    searchElementsInRepository(gitlabId, foldersIterator.next(), branch, if (deep == -1) -1 else deep - 1, type, maxResult, result.size)
                )
            }
        }

        return result
    }

    fun getFilesContentOfRepository(gitlabId: Long, path: String? = null, filterByExt: Boolean = true, processAsFile: Boolean = true, branch: String? = null): List<RepositoryFileContent> {
        val allFiles = mutableListOf<RepositoryFileContent?>()
        var filesList = gitlabRestClient.adminGetProjectTree(gitlabId, path, branch = branch)

        if (path != null && filesList.content?.size == 0 && processAsFile) {
            val splitedFolderAndFile = getPathWithoutFileName(path)

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, normalizeGitlabFolder(splitedFolderAndFile?.first), branch = branch)

            filesList.content?.find { it.name == splitedFolderAndFile?.second }?.let {
                if (it.type == RepositoryTreeType.TREE) {
                    allFiles.addAll(getFilesContentOfRepository(gitlabId, it.path, filterByExt, false, branch))
                } else {
                    it.let {
                        allFiles.add(getFileContent(gitlabId, it.path, branch ?: DEFAULT_BRANCH))
                    }
                }
            }

            return allFiles.filterNotNull()
        }

        while (filesList.page <= filesList.totalPages) {
            filesList.content
                ?.forEach {
                    if (it.type == RepositoryTreeType.TREE) {
                        allFiles.addAll(getFilesContentOfRepository(gitlabId, it.path, filterByExt, false, branch))
                    } else {
                        if (!filterByExt || processingExtensions.contains(getFilenameExtension(it.name))) {
                            allFiles.add(getFileContent(gitlabId, it.path, branch ?: DEFAULT_BRANCH))
                        }
                    }
                }

            if (!(filesList.page < filesList.totalPages)) break

            filesList = gitlabRestClient.adminGetProjectTree(gitlabId, path, pageNumber = filesList.page + 1, branch = branch)
        }

        return allFiles.filterNotNull()
    }

    fun commitFilesToGitlab(
        project: Project,
        token: String,
        userId: UUID,
        branch: String,
        action: CommitOperations,
        files: Collection<MultipartFile>,
        commitMessage: String?,
        path: String?,
        newPath: String?,
        newName: String?,
        originalFileName: String?
    ): Commit {
        when {
            action in listOf(CommitOperations.RENAME, CommitOperations.UPDATE) && files.size > 1 -> throw  BadRequestException("Only one file/folder is allowed for RENAME and UPDATE operations")
            action == CommitOperations.MOVE && newPath == null -> throw  BadRequestException("No destination path for MOVE operation was provided")
            action == CommitOperations.RENAME && newName == null -> throw  BadRequestException("No new name for RENAME operation was provided")
            action in listOf(CommitOperations.CREATE, CommitOperations.UPDATE) && files.find { it.bytes == null } != null -> throw  BadRequestException("No content is provided for CREATE/UPDATE operation")
        }

        val finalNewPath = newPath?.let {
            if (it.endsWith("/")) it else "$it/"
        } ?: ""

        val finalNewName = newName?.substringAfterLast("/") //No need to provide full path for rename, use move for that instead

        var finalOperation = action

        val filesToCommit = files.filter { it.originalFilename != null }.flatMap {
            val isFolderOperation = if (action in listOf(CommitOperations.RENAME, CommitOperations.MOVE, CommitOperations.DELETE)) {
                isItFolder(project.gitlabId, branch, it.originalFilename)
            } else false

            if (isFolderOperation) {
                getFilesNamesListInRepositoryDeep(project.gitlabId, branch, it.originalFilename).map { pathInRepo ->
                    val partToLeaveAfter = pathInRepo.substringAfter(it.originalFilename!!)
                    val partToRename = it.originalFilename?.substringAfterLast("/") ?: ""
                    val partToLeaveBefore = it.originalFilename?.substringBeforeLast("/")?.takeIf { extracted -> extracted != partToRename }?.let { "$it/" } ?: ""

                    when (action) {
                        CommitOperations.RENAME -> {
                            finalOperation = CommitOperations.MOVE
                            "$partToLeaveBefore$finalNewName$partToLeaveAfter" to pathInRepo
                        }
                        CommitOperations.MOVE -> {
                            finalOperation = CommitOperations.MOVE
                            "$finalNewPath$partToRename$partToLeaveAfter" to pathInRepo
                        }
                        CommitOperations.DELETE -> {
                            finalOperation = CommitOperations.DELETE
                            pathInRepo to null
                        }
                        else -> throw InternalException("Incorrect implementation of folder operation")
                    }
                }
            } else {
                val nameToOperate = if (action == CommitOperations.UPDATE && originalFileName != null) originalFileName else it.originalFilename

                val finalPath = (path ?: nameToOperate?.substringBeforeLast("/")?.takeIf { extractedName -> nameToOperate != extractedName })?.let {
                    if (it.endsWith("/")) it else "$it/"
                } ?: ""

                val finalFileName = nameToOperate?.substringAfterLast("/") ?: RandomUtils.generateRandomAlphaNumeric(10)

                val content = when (action) {
                    CommitOperations.DELETE, CommitOperations.CHMOD, CommitOperations.MOVE -> null
                    else -> Base64.getEncoder().encodeToString(it.bytes ?: ByteArray(0))
                }

                when (action) {
                    CommitOperations.MOVE -> listOf("$finalNewPath$finalFileName" to "$finalPath$finalFileName")
                    CommitOperations.RENAME -> listOf("$finalPath$finalNewName" to "$finalPath$finalFileName")
                    else -> listOf("$finalPath$finalFileName" to content)
                }
            }
        }.toMap()

        return gitlabRestClient.commitFiles(
            token = token,
            projectId = project.gitlabId,
            targetBranch = branch,
            commitMessage = commitMessage ?: "$action action by $userId at ${Instant.now()}",
            fileContents = filesToCommit,
            action = finalOperation.toGitlabCommitOperation(),
            isBase64 = true
        )
    }

    fun isItFolder(projectId: Long, branch: String, path: String?): Boolean {
        return path?.let {
            findFolderInRepository(projectId, it, branch) != null
        } ?: true
    }

    private fun getFileContent(gitlabId: Long, filePath: String, branch: String): RepositoryFileContent? {
        val file = gitlabRestClient.adminGetRepositoryFileContentAndInformation(gitlabId, filePath, branch)
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