package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.project.DataProjectService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.util.*
import java.util.logging.Logger
import javax.validation.Valid
import javax.validation.constraints.NotEmpty

@RestController
@RequestMapping("/api/v1/data-projects")
class DataProjectsController(
    val dataProjectRepository: DataProjectRepository,
    val dataProjectService: DataProjectService,
    val currentUserService: CurrentUserService
) {
    private val log: Logger = Logger.getLogger(DataProjectsController::class.simpleName)

    fun assertFindExisting(projectUUID: UUID) =
        dataProjectRepository.findOneByOwnerIdAndId(currentUserService.person().id, projectUUID)
            ?: throw NotFoundException("Data project not found")

    @GetMapping
    fun getAllDataProjects(): List<DataProjectDto> {
        val userId = currentUserService.person().id
        val findAllByOwnerId = dataProjectRepository.findAllByOwnerId(userId)
        return findAllByOwnerId.map(DataProject::toDto)
    }

    @GetMapping("/{id}")
    fun getDataProjectById(@PathVariable id: UUID): DataProjectDto {
        val dataProject = assertFindExisting(id)
        return dataProject.toDto()
    }

    @PostMapping
    fun createDataProject(@Valid @RequestBody dataProjectCreateRequest: DataProjectCreateRequest): DataProjectDto {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        val dataProject = dataProjectService.createProject(
            userToken = userToken,
            ownerId = ownerId,
            projectSlug = dataProjectCreateRequest.slug,
            projectNamespace = dataProjectCreateRequest.namespace,
            projectName = dataProjectCreateRequest.name)

        return dataProject.toDto()
    }

    @PutMapping("/{id}")
    fun updateDataProject(@PathVariable id: UUID, @Valid @RequestBody dataProjectUpdateRequest: DataProjectUpdateRequest): DataProjectDto {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        assertFindExisting(id)
        val dataProject = dataProjectService.updateProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id,
            projectName = dataProjectUpdateRequest.name)

        return dataProject.toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteDataProject(@PathVariable id: UUID) {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        dataProjectService.deleteProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id)
    }
}

class DataProjectCreateRequest(
    @NotEmpty val slug: String,
    @NotEmpty val namespace: String,
    @NotEmpty val name: String
)

class DataProjectUpdateRequest(
    @NotEmpty val name: String
)
