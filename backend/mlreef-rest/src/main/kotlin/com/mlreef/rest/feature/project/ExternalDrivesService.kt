package com.mlreef.rest.feature.project

import com.mlreef.rest.DriveExternalRepository
import com.mlreef.rest.EpfConfiguration
import com.mlreef.rest.domain.DataProject
import com.mlreef.rest.domain.DriveExternal
import com.mlreef.rest.domain.Project
import com.mlreef.rest.exceptions.AccessDeniedException
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.InternalException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.RequestCannotBeProcessedException
import com.mlreef.rest.exceptions.UserNotFoundException
import com.mlreef.rest.external_api.aws.AwsClient
import com.mlreef.rest.external_api.dvc.DvcClient
import com.mlreef.rest.external_api.gitlab.RepositoryTreeType
import com.mlreef.rest.external_api.gitlab.dto.RepositoryTree
import com.mlreef.rest.feature.auth.UserResolverService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.util.FileSystemUtils
import java.io.File
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID
import javax.annotation.PostConstruct
import kotlin.math.absoluteValue
import kotlin.random.Random

enum class ExternalDriveType {
    AWS,
    GCS,
}

@Service
class ExternalDrivesService(
    private val driveExternalRepository: DriveExternalRepository,
    private val projectResolverService: ProjectResolverService,
    private val userResolverService: UserResolverService,
    private val epfConfiguration: EpfConfiguration,
) {
    companion object {
        const val DEFAULT_REGION_NAME = "eu-central-1"
    }

    private val dvcLocation: Path = epfConfiguration.dvcWorkingDir.takeIf { it.isNotBlank() }?.let { Paths.get(it).toAbsolutePath().normalize() }
        ?: throw InternalException("Cannot build path ${epfConfiguration.dvcWorkingDir}")

    @PostConstruct
    fun init() {
        dvcLocation.let {
            Files.createDirectories(it)
        }
    }

    fun resolveExternalDrive(driveId: UUID? = null, ownerId: UUID? = null, driveAlias: String? = null): DriveExternal? {
        val account = ownerId?.let {
            userResolverService.resolveAccount(userId = it)
                ?: throw UserNotFoundException(ownerId)
        }

        return driveId?.let { driveExternalRepository.findByIdOrNull(it) }
            ?: driveAlias?.let {
                driveExternalRepository.findByAccountAndAlias(
                    account ?: throw BadRequestException("Missing owner parameter"),
                    it
                )
            }
    }

    fun getAvailableRegions(driveType: ExternalDriveType): List<String> {
        return when (driveType) {
            ExternalDriveType.AWS -> getAwsAvailableRegions()
            else -> throw RequestCannotBeProcessedException("Regions request is not supported for ${driveType.name} drive type")
        }
    }

    fun getBucketsListForDrive(ownerId: UUID, driveId: UUID?, driveAlias: String?): List<String> {
        driveId ?: driveAlias ?: throw BadRequestException("Either drive id or drive alias must be provided")

        val drive = resolveExternalDrive(driveId, ownerId, driveAlias)
            ?: throw NotFoundException("Drive ${driveId ?: driveAlias} not found for current user")

        return when (drive.driveType) {
            ExternalDriveType.AWS -> getAwsBucketsList(drive)
            else -> throw RequestCannotBeProcessedException("Buckets request is not supported for ${drive.driveType.name} drive type")
        }
    }

    @Transactional
    fun addExternalDriveInformation(project: Project?, alias: String?, driveTypeName: ExternalDriveType, ownerId: UUID, path: String? = null, mask: String? = null, region: String? = null, vararg keys: String?): DriveExternal {
        val account = userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(ownerId)

        val result = driveExternalRepository.save(
            DriveExternal(
                UUID.randomUUID(),
                driveTypeName,
                alias ?: "$driveTypeName-${Random.nextLong().absoluteValue}",
                region ?: epfConfiguration.awsDefaultRegion ?: DEFAULT_REGION_NAME,
                account,
                project?.let { mutableListOf(it) } ?: mutableListOf(),
                keys.getOrNull(0),
                keys.getOrNull(1),
                keys.getOrNull(2),
                keys.getOrNull(3),
                keys.getOrNull(4),
                null,
                path,
                mask
            )
        )

        connectDrive(account.username, result.alias)

        return result
    }

    @Transactional
    fun updateExternalDriveInformation(ownerId: UUID, driveId: UUID?, driveAlias: String?, project: Project?, alias: String?, path: String? = null, mask: String? = null, region: String? = null, vararg keys: String?): DriveExternal {
        driveId ?: driveAlias ?: throw BadRequestException("Either drive id or drive alias must be provided")

        val account = userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(ownerId)

        val drive = resolveExternalDrive(driveId, ownerId, driveAlias)
            ?: throw NotFoundException("Drive ${driveId ?: driveAlias} not found for current user")

        if (account != drive.account) {
            throw AccessDeniedException("User $ownerId has no rights for updating non own drive ${drive.id}")
        }

        if (project != null && drive.projects.contains(project)) throw BadRequestException("Drive ${drive.id} is already connected to project ${project.id}")

        val result = driveExternalRepository.save(
            drive.copy(
                alias = alias ?: drive.alias,
                region = (region ?: drive.region)?.takeIf { it.isNotBlank() },
                projects = project?.let { drive.projects.apply { add(it) } } ?: drive.projects,
                key1 = (keys.getOrNull(0) ?: drive.key1)?.takeIf { it.isNotBlank() },
                key2 = (keys.getOrNull(1) ?: drive.key2)?.takeIf { it.isNotBlank() },
                key3 = (keys.getOrNull(2) ?: drive.key3)?.takeIf { it.isNotBlank() },
                key4 = (keys.getOrNull(3) ?: drive.key4)?.takeIf { it.isNotBlank() },
                key5 = (keys.getOrNull(4) ?: drive.key5)?.takeIf { it.isNotBlank() },
                path = (path ?: drive.path)?.takeIf { it.isNotBlank() },
                mask = (mask ?: drive.mask)?.takeIf { it.isNotBlank() }
            )
        )

        connectDrive(account.username, result.alias)

        return result
    }

    @Transactional
    fun deleteExternalDriveFromProject(ownerId: UUID, driveId: UUID?, driveAlias: String?, project: Project): DriveExternal {
        driveId ?: driveAlias ?: throw BadRequestException("Either drive id or drive alias must be provided")

        val account = userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(ownerId)

        val drive = resolveExternalDrive(driveId, ownerId, driveAlias)
            ?: throw NotFoundException("Drive ${driveId ?: driveAlias} not found for current user")

        if (account != drive.account) {
            throw AccessDeniedException("User $ownerId has no rights for deleting non own drive ${drive.id}")
        }

        if (!drive.projects.contains(project)) throw BadRequestException("Drive ${drive.id} is not connected to project ${project.id}")

        return driveExternalRepository.save(
            drive.copy(
                projects = drive.projects.apply { remove(project) },
            )
        )
    }

    @Transactional
    fun deleteExternalDriveInformation(ownerId: UUID, driveId: UUID?, driveAlias: String?) {
        driveId ?: driveAlias ?: throw BadRequestException("Either drive id or drive alias must be provided")

        val account = userResolverService.resolveAccount(userId = ownerId)
            ?: throw UserNotFoundException(ownerId)

        val drive = resolveExternalDrive(driveId, ownerId, driveAlias)
            ?: throw NotFoundException("Drive ${driveId ?: driveAlias} not found for current user")

        if (account != drive.account) {
            throw AccessDeniedException("User $ownerId has no rights for deleting non own drive ${drive.id}")
        }

        driveExternalRepository.delete(drive)

        disconnectDrive(account.username, drive.alias)
    }

    fun getElementsListInExternalDrive(project: Project, startPath: String? = null, deep: Int = 0): List<RepositoryTree> {
        return (project as? DataProject)?.externalDrives?.flatMap { getElementsListInExternalDrive(it, startPath = startPath, deep = deep) } ?: listOf()
    }

    private fun getElementsListInExternalDrive(externalDrive: DriveExternal, type: RepositoryTreeType? = null, startPath: String? = null, deep: Int = 0, parent: RepositoryTree? = null): List<RepositoryTree> {
        return when (externalDrive.driveType) {
            ExternalDriveType.AWS -> getElementsListInAwsDrive(externalDrive, type, startPath, deep)
            else -> listOf()
        }
    }

    private fun getElementsListInAwsDrive(externalDrive: DriveExternal, type: RepositoryTreeType? = null, startPath: String? = null, deep: Int = 0, parent: AwsClient? = null): List<RepositoryTree> {
        val awsClient = parent ?: AwsClient(
            externalDrive.key1!!,
            externalDrive.key2!!,
            externalDrive.region,
        )

        val finalStartPath = startPath?.removeSuffix("/")

        val result = awsClient
            .getObjectsKeysInBucket(awsClient.parseBucketName(externalDrive.path ?: ""), finalStartPath)
            .map { it.removePrefix(finalStartPath?.let { "$it/" } ?: "") }
            .filter { it.isNotEmpty() }
            .map { it.substringBefore("/") to it.substringAfter("/") }
            .groupBy({ it.first }, { it.second })
            .entries.map {
                val itemType = if (it.value.size == 1 && it.value[0] == it.key) RepositoryTreeType.BLOB else RepositoryTreeType.TREE
                val path = finalStartPath?.let { "$it/" } ?: ""
                RepositoryTree("", it.key, itemType, "$path${it.key}", "")
            }

        return result + if (deep > 0) {
            result.filter { it.type == RepositoryTreeType.TREE }.flatMap { getElementsListInAwsDrive(externalDrive, type, it.path, deep - 1, awsClient) }
        } else listOf()
    }

    private fun connectDrive(username: String, alias: String) {
        val path = dvcLocation.resolve(Paths.get("$username${File.separator}$alias"))

        val workingDir = Files.createDirectories(path)

        val dvcClient = DvcClient(workingDir)
        dvcClient.init()
    }

    private fun disconnectDrive(username: String, alias: String) {
        val path = dvcLocation.resolve(Paths.get("$username${File.separator}$alias"))

        if (path.toFile().exists()) {
            val dvcClient = DvcClient(path)
            dvcClient.destroy()
        }

        FileSystemUtils.deleteRecursively(path)
    }

    private fun getAwsAvailableRegions(): List<String> {
        return AwsClient.getRegions().map { it.getName() }
    }

    private fun getAwsBucketsList(drive: DriveExternal): List<String> {
        val awsClient = AwsClient(
            drive.key1!!,
            drive.key2!!,
            drive.region,
        )

        return awsClient.getBuckets().map { it.name }
    }
}