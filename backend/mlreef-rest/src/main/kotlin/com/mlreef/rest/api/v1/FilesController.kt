package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.MlreefFileDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.config.tryToUUID
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.external_api.gitlab.TokenDetails
import com.mlreef.rest.feature.system.FilesManagementService
import org.slf4j.LoggerFactory
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.util.*
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/api/v1/files")
class FilesController(
    private val filesManagementService: FilesManagementService,
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    @GetMapping("/download/{fileId}")
    fun downloadFile(
        @PathVariable fileId: String,
        token: TokenDetails,
        request: HttpServletRequest
    ): ResponseEntity<Resource> {
        val parsedFileId = fileId.tryToUUID()
        val fileName = if (parsedFileId == null) fileId else null

        val userFile = filesManagementService.resolveFile(parsedFileId, fileName)
            ?: throw NotFoundException("File $fileId not found")

        val uploadedFileResource =
            filesManagementService.loadContentOfFile(file = userFile, ownerId = token.accountId, skipOwnerCheck = true)

        val contentType = try {
            request.getServletContext().getMimeType(uploadedFileResource.getFile().getAbsolutePath())
        } catch (ex: IOException) {
            log.info("Could not determine file type for file ${uploadedFileResource.filename}")
            "application/octet-stream"
        }

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"${uploadedFileResource.getFilename()}\"")
            .body<Resource>(uploadedFileResource)
    }

    @PostMapping("/upload")
    fun uploadFile(
        @RequestParam("file") file: MultipartFile,
        @RequestParam("type", required = false) filePurpose: UUID? = null,
        @RequestParam("desc") description: String?,
        token: TokenDetails,
    ): MlreefFileDto {
        return filesManagementService.saveFile(
            file,
            ownerId = token.accountId,
            purposeId = filePurpose,
            description = description,
        ).toDto()
    }
}