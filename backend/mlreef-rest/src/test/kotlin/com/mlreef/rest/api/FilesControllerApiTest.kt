package com.mlreef.rest.api

import com.mlreef.rest.api.v1.dto.MlreefFileDto
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.data.repository.findByIdOrNull
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.annotation.Rollback
import javax.transaction.Transactional

class FilesControllerApiTest : AbstractRestApiTest() {
    val rootUrl = "/api/v1/files"

    @Test
    @Transactional
    @Rollback
    fun `Can upload and download file`() {
        val existingUser = createMockUser()
        mockUserAuthentication(forAccount = existingUser)

        val fis = "Some text data inside file".byteInputStream(Charsets.UTF_8)
        val multipartFile = MockMultipartFile("file", fis)

        var usersFiles = filesRepository.findByOwner(existingUser)

        assertThat(usersFiles.size).isEqualTo(0)

        //--- Upload

        val uploadUrl = "$rootUrl/upload"

        val uploadResult = this.performPostMultipart(uploadUrl, multipartFile, null, "jwt-access-token")
            .returns(MlreefFileDto::class.java)

        val fileInDb = filesRepository.findByIdOrNull(uploadResult.id)

        assertThat(fileInDb).isNotNull()

        usersFiles = filesRepository.findByOwner(existingUser)

        assertThat(usersFiles.size).isEqualTo(1)

        //--- Download

        val downloadUrl = "$rootUrl/download/${uploadResult.id}"

        val result = this.performGet(downloadUrl, "jwt-access-token")
            .expectOk()
            .document("download-file")
            .returnsFile()

        assertThat(result).isNotNull()
    }
}