package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProject
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.DataProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.project.DataProjectService
import com.mlreef.rest.findById2
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

    @GetMapping
    fun getAllDataProjects(): List<DataProjectDto> {
        return dataProjectRepository.findAllByOwnerId(currentUserService.person().id).map(DataProject::toDto)
    }

    @GetMapping("/{id}")
    fun getDataProjectById(@PathVariable id: UUID): DataProjectDto {
        val dataProject = dataProjectRepository.findById2(id)
            ?: throw NotFoundException("Data project not found")

        if (dataProject.ownerId != currentUserService.person().id)
            throw NotFoundException("Data project not found")

        return dataProject.toDto()
    }

    @PostMapping
    fun createDataProject(@Valid @RequestBody projectCreateRequest: ProjectCreateRequest): DataProjectDto {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        val dataProject = dataProjectService.createDataProject(
            userToken = userToken,
            ownerId = ownerId,
            projectPath = projectCreateRequest.path,
            projectName = projectCreateRequest.name)

        return dataProject.toDto()
    }

    @PutMapping("/{id}")
    fun updateDataProject(@PathVariable id: UUID, @Valid @RequestBody projectCreateRequest: ProjectCreateRequest): DataProjectDto {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        val dataProject = dataProjectService.updateDataProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id,
            projectName = projectCreateRequest.name)

        return dataProject.toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteDataProject(@PathVariable id: UUID) {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        dataProjectService.deleteDataProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id)
    }
}

class ProjectCreateRequest(
    @NotEmpty val path: String,
    @NotEmpty val name: String
)
