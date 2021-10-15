package com.mlreef.rest.feature.system

import com.mlreef.rest.FilePurposesRepository
import com.mlreef.rest.FilesManagementConfiguration
import com.mlreef.rest.MlreefFilesRepository
import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.FilePurpose
import com.mlreef.rest.domain.MlreefFile
import com.mlreef.rest.exceptions.*
import com.mlreef.rest.feature.auth.UserResolverService
import org.slf4j.LoggerFactory
import org.springframework.core.io.ByteArrayResource
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.util.StringUtils
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.*
import javax.annotation.PostConstruct

@Service
class FilesManagementService(
    private val filesRepository: MlreefFilesRepository,
    private val filePurposesRepository: FilePurposesRepository,
    private val userResolverService: UserResolverService,
    private val filesManagementConfiguration: FilesManagementConfiguration,
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)

        private const val STORAGE_ON_DISK = "disk"
        private const val STORAGE_IN_DB = "db"
        private const val STORAGE_IN_DATABASE = "database"
        private const val STORAGE_IN_MEMORY = "memory"

        val USER_AVATAR_PURPOSE_ID = UUID.fromString("d7fa34ee-9cc8-474e-87e0-095050ea7457")
        val PROJECT_COVER_PURPOSE_ID = UUID.fromString("4814d73e-0043-4aac-8443-fb0cff859491")
        val UNDEFINED_PURPOSE_ID = UUID.fromString("145be80f-4352-4a89-a7a3-cd20ebc03352")
    }

    private val fileStorageLocation: Path? by lazy {
        if (filesManagementConfiguration.uploadDir.isNullOrBlank()) {
            Paths.get(filesManagementConfiguration.uploadDir!!).toAbsolutePath().normalize()
        } else null
    }

    private val inMemoryFiles by lazy {
        mutableMapOf<String, ByteArray>()
    }

    private val isDiskStorage: Boolean
        get() = filesManagementConfiguration.storagePlace.equals(STORAGE_ON_DISK, ignoreCase = true)

    private val isDatabaseStorage: Boolean
        get() = (filesManagementConfiguration.storagePlace.equals(STORAGE_IN_DB, ignoreCase = true) || filesManagementConfiguration.storagePlace.equals(STORAGE_IN_DATABASE, ignoreCase = true))

    private val isMemoryStorage: Boolean
        get() = filesManagementConfiguration.storagePlace.equals(STORAGE_IN_MEMORY, ignoreCase = true)

    @PostConstruct
    fun init() {
        try {
            if (isDiskStorage) {
                fileStorageLocation?.let {
                    log.info("Directories ${it.toAbsolutePath()} creation... ")
                    Files.createDirectories(it)
                } ?: throw InternalException("If storage type is set $STORAGE_ON_DISK then 'upload-dir' must be defined")
            }
        } catch (ex: Exception) {
            log.error("Could not create the directory where the uploaded files will be stored. Exception: $ex")
            throw InternalException("Could not create the directory ${fileStorageLocation?.toAbsolutePath()} where the uploaded files will be stored. Exception: $ex")
        }
    }

    fun saveFile(file: MultipartFile, owner: Account? = null, ownerId: UUID? = null, purposeId: UUID?, description: String?): MlreefFile {
        // Normalize file name
        val originalFileName: String = StringUtils.cleanPath(file.originalFilename ?: "")

        val filePurpose = filePurposesRepository.findByIdOrNull(purposeId ?: UNDEFINED_PURPOSE_ID)
            ?: throw NotFoundException("File purpose $purposeId not found")

        val ownerAccount = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        if (filePurpose.maxFileSize > 0 && file.size > filePurpose.maxFileSize)
            throw LimitExceedException("Could not save file $originalFileName. File size exceed max allowed size ${filePurpose.maxFileSize}")

        val savedFile = try {
            if (originalFileName.contains("..")) {
                throw FileSavingException("Filename contains invalid path sequence $originalFileName")
            }

            val fileExtension = originalFileName.substringAfterLast(".").takeIf { it.isNotEmpty() }?.let { ".$it" }
                ?: ""

            val fileNameForStorage = "${ownerId}_${filePurpose.purposeName}_${UUID.randomUUID()}$fileExtension"

            val uploadedFile = MlreefFile(
                id = UUID.randomUUID(),
                owner = ownerAccount,
                storageFileName = fileNameForStorage,
                fileFormat = file.contentType,
                fileSize = file.size,
                uploadDir = filesManagementConfiguration.uploadDir ?: "",
                description = description,
                purpose = filePurpose,
            )

            // Copy file to the target location (Replacing existing file with the same name)
            if (isDiskStorage) {
                val targetLocation = fileStorageLocation!!.resolve(fileNameForStorage)

                Files.copy(file.inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING)
            } else if (isDatabaseStorage) {
                uploadedFile.content = file.bytes
            } else if (isMemoryStorage) {
                inMemoryFiles.put(fileNameForStorage, file.bytes)
            }

            filesRepository.save(uploadedFile)
        } catch (ex: IOException) {
            throw FileSavingException("Could not save file $originalFileName. Exception: $ex")
        }

        return savedFile.copy(downloadLink = getDownloadLinkForFile(savedFile))
    }

    fun getDownloadLinkForFile(file: MlreefFile?): String? {
        if (file == null) return null
        return (filesManagementConfiguration.downloadDomain ?: "").trimEnd('/') +
                "/" +
                (filesManagementConfiguration.downloadPath ?: "").trim('/') +
                "/" +
                file.id.toString()
    }

    fun resolveFile(fileId: UUID?, fileName: String?): MlreefFile? {
        return fileId?.let { filesRepository.findByIdOrNull(it) }
            ?: fileName?.let { filesRepository.findByStorageFileName(it) }
    }

    fun loadContentOfFile(file: MlreefFile? = null, fileId: UUID? = null, fileName: String? = null, owner: Account? = null, ownerId: UUID? = null, skipOwnerCheck: Boolean = false): Resource {
        val uploadedFile = getAndCheckMlreefFile(file, fileId, fileName, owner, ownerId, skipOwnerCheck)

        return resolveFileOnDisk(uploadedFile)
            ?: resolveFileInMemory(uploadedFile)
            ?: resolveFileInDatabase(uploadedFile)
            ?: throw NotFoundException("File not found ${fileId ?: fileName}")
    }

    fun updateFile(file: MlreefFile, owner: Account?, ownerId: UUID?, skipOwnerCheck: Boolean): MlreefFile {
        getAndCheckMlreefFile(file, owner = owner, ownerId = ownerId, skipOwnerCheck = skipOwnerCheck)

        return filesRepository.save(file)
    }

    @Transactional
    fun deleteFile(file: MlreefFile? = null, fileId: UUID? = null, fileName: String? = null, owner: Account? = null, ownerId: UUID? = null, skipOwnerCheck: Boolean = false) {
        val fileForDelete = getAndCheckMlreefFile(file, fileId, fileName, owner, ownerId, skipOwnerCheck)

        if (resolveFileOnDisk(fileForDelete) != null) {
            Files.deleteIfExists(fileStorageLocation!!.resolve(fileForDelete.storageFileName!!).normalize())
        } else if (resolveFileInDatabase(fileForDelete) != null) {
            fileForDelete.content = null
        } else if (resolveFileInMemory(fileForDelete) != null) {
            inMemoryFiles.remove(fileForDelete.storageFileName!!)
        }

        filesRepository.delete(fileForDelete)
    }

    fun findFileForAccountAndPurpose(owner: Account? = null, ownerId: UUID? = null, purpose: FilePurpose? = null, purposeId: UUID? = null): List<MlreefFile> {
        val filePurposeInDb = purpose ?: purposeId?.let { filePurposesRepository.findByIdOrNull(it) }
        ?: throw NotFoundException("File purpose $purposeId not found")

        val ownerAccount = owner
            ?: userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(userId = ownerId)

        return filesRepository.findByOwnerAndPurpose(ownerAccount, filePurposeInDb)
    }

    private fun getAndCheckMlreefFile(
        file: MlreefFile? = null,
        fileId: UUID? = null,
        fileName: String? = null,
        owner: Account? = null,
        ownerId: UUID? = null,
        skipOwnerCheck: Boolean = false
    ): MlreefFile {
        val uploadedFile = file ?: resolveFile(
            fileId = fileId,
            fileName = fileName,
        ) ?: throw NotFoundException("Uploaded file ${fileId ?: fileName ?: ""} not found")

        if (!skipOwnerCheck) {
            val ownerAccount = owner
                ?: userResolverService.resolveAccount(userId = ownerId)
                ?: throw UserNotFoundException(userId = ownerId)

            if (uploadedFile.owner != ownerAccount) {
                log.error("User ${ownerAccount.username} (${ownerAccount.id}) has no access to file ${uploadedFile.id} ${uploadedFile.storageFileName}")
                throw AccessDeniedException("User ${ownerAccount.username} has no access to file")
            }
        }

        return uploadedFile
    }

    private fun resolveFileOnDisk(uploadedFile: MlreefFile): Resource? {
        return try {
            val filePath = fileStorageLocation!!.resolve(uploadedFile.storageFileName!!).normalize()
            val resource: Resource = UrlResource(filePath.toUri())
            if (resource.exists()) {
                resource
            } else {
                null
            }
        } catch (ex: Exception) {
            null
        }
    }

    private fun resolveFileInMemory(uploadedFile: MlreefFile): Resource? {
        return try {
            val ba = inMemoryFiles[uploadedFile.storageFileName!!]!!
            ByteArrayResource(ba)
        } catch (ex: Exception) {
            null
        }
    }

    private fun resolveFileInDatabase(uploadedFile: MlreefFile): Resource? {
        return try {
            ByteArrayResource(uploadedFile.content!!)
        } catch (ex: Exception) {
            null
        }
    }
}