package com.mlreef.rest.api.v1

import com.mlreef.rest.CodeProject
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.CodeProjectDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.project.CodeProjectService
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
@RequestMapping("/api/v1/code-projects")
class CodeProjectsController(
    val codeProjectRepository: CodeProjectRepository,
    val codeProjectService: CodeProjectService,
    val currentUserService: CurrentUserService
) {
    private val log: Logger = Logger.getLogger(CodeProjectsController::class.simpleName)

    fun assertFindExisting(projectUUID: UUID) =
        codeProjectRepository.findOneByOwnerIdAndId(currentUserService.person().id, projectUUID)
            ?: throw NotFoundException("Data project not found")

    @GetMapping
    fun getAllCodeProjects(): List<CodeProjectDto> {
        return codeProjectRepository.findAllByOwnerId(currentUserService.person().id).map(CodeProject::toDto)
    }

    @GetMapping("/{id}")
    fun getCodeProjectById(@PathVariable id: UUID): CodeProjectDto {
        val codeProject = assertFindExisting(id)
        return codeProject.toDto()
    }

    @PostMapping
    fun createCodeProject(@Valid @RequestBody dataProjectCreateRequest: DataProjectCreateRequest): CodeProjectDto {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        val codeProject = codeProjectService.createProject(
            userToken = userToken,
            ownerId = ownerId,
            projectPath = dataProjectCreateRequest.path,
            projectName = dataProjectCreateRequest.name)

        return codeProject.toDto()
    }

    @PutMapping("/{id}")
    fun updateCodeProject(@PathVariable id: UUID, @Valid @RequestBody codeProjectCreateRequest: CodeProjectCreateRequest): CodeProjectDto {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        val findExisting = assertFindExisting(id)
        val codeProject = codeProjectService.updateProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id,
            projectName = codeProjectCreateRequest.name)

        return codeProject.toDto()
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteCodeProject(@PathVariable id: UUID) {
        val userToken = currentUserService.token()
        val ownerId = currentUserService.person().id
        codeProjectService.deleteProject(
            userToken = userToken,
            ownerId = ownerId,
            projectUUID = id)
    }
}

class CodeProjectCreateRequest(
    @NotEmpty val path: String,
    @NotEmpty val name: String
)
