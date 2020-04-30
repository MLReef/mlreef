package com.mlreef.rest.api.v1

import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.PipelineConfig
import com.mlreef.rest.PipelineConfigRepository
import com.mlreef.rest.PipelineInstance
import com.mlreef.rest.PipelineInstanceRepository
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.api.v1.dto.PipelineConfigDto
import com.mlreef.rest.api.v1.dto.PipelineInstanceDto
import com.mlreef.rest.api.v1.dto.toDto
import com.mlreef.rest.exceptions.MethodNotAllowedException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.feature.pipeline.PipelineService
import org.springframework.data.repository.findByIdOrNull
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import java.util.logging.Logger

@RestController
@RequestMapping("/api/v1/pipelines")
class PipelineController(
    val pipelineService: PipelineService,
    val currentUserService: CurrentUserService,
    val dataProjectRepository: DataProjectRepository,
    val pipelineConfigRepository: PipelineConfigRepository,
    val pipelineInstanceRepository: PipelineInstanceRepository
) {
    private val log: Logger = Logger.getLogger(ExperimentsController::class.simpleName)

    private fun beforeGetPipelineConfig(id: UUID): PipelineConfig {
        return pipelineConfigRepository.findByIdOrNull(id)
            ?: throw NotFoundException("PipelineConfig was not found")
    }

    @GetMapping
    fun getAllPipelineConfigs(): List<PipelineConfigDto> {
        val list: List<PipelineConfig> = pipelineConfigRepository.findAll().toList()
        return list.map(PipelineConfig::toDto)
    }

    @GetMapping("/{id}")
    fun getPipelineConfig(@PathVariable id: UUID): PipelineConfigDto {
        val findOneByDataProjectIdAndId = beforeGetPipelineConfig(id)
        return findOneByDataProjectIdAndId.toDto()
    }

    @GetMapping("/{pid}/instances")
    fun getAllPipelineInstancesFromConfig(@PathVariable pid: UUID): List<PipelineInstanceDto> {
        beforeGetPipelineConfig(pid)
        val instances = pipelineInstanceRepository.findAllByPipelineConfigId(pid)
        return instances.map(PipelineInstance::toDto)
    }

    @GetMapping("/{pid}/instances/{id}")
    fun getOnePipelineInstanceFromConfig(@PathVariable pid: UUID, @PathVariable id: UUID): PipelineInstanceDto {
        beforeGetPipelineConfig(pid)
        val instance = beforeGetPipelineInstance(pid, id)

        return instance.toDto()
    }

    @PostMapping("/{pid}/instances")
    fun createPipelineInstanceForConfig(@PathVariable pid: UUID): PipelineInstanceDto {
        val pipelineConfig = beforeGetPipelineConfig(pid)
        val instances = pipelineInstanceRepository.findAllByPipelineConfigId(pid)

        val nextNumber = if (instances.isEmpty()) {
            log.info("No PipelineInstances so far, start with 1 as first iteration ")
            1
        } else {
            instances.map { it.number }.max()!! + 1
        }

        val createInstance = pipelineInstanceRepository.save(pipelineConfig.createInstance(nextNumber))
        log.info("Created new Instance $createInstance for Pipeline $createInstance")
        return createInstance.toDto()
    }

    @PutMapping("/{pid}/instances/{id}/{action}")
    fun updatePipelineInstanceFromConfig(@PathVariable pid: UUID, @PathVariable id: UUID, @PathVariable action: String): PipelineInstanceDto {
        val pipelineConfig = beforeGetPipelineConfig(pid)
        val instance = beforeGetPipelineInstance(pid, id)

        val account = currentUserService.account()
        val dataProject = dataProjectRepository.findByIdOrNull(pipelineConfig.dataProjectId)
            ?: throw NotFoundException("dataProject not found for this Pipeline")
        val userToken = currentUserService.permanentToken()
        val adaptedInstance = when (action) {
            "start" -> pipelineService.startInstance(account, userToken, dataProject.gitlabId, instance, secret = pipelineService.createSecret())
            "archive" -> pipelineService.archiveInstance(instance)
            else -> throw MethodNotAllowedException("No valid action: '$action'")
        }
        return adaptedInstance.toDto()
    }

    private fun beforeGetPipelineInstance(pid: UUID, id: UUID) =
        (pipelineInstanceRepository.findOneByPipelineConfigIdAndId(pid, id)
            ?: throw NotFoundException("PipelineInstance was not found"))

    @DeleteMapping("/{pid}/instances/{id}")
    fun deletePipelineInstanceFromConfig(@PathVariable pid: UUID, @PathVariable id: UUID) {
        beforeGetPipelineConfig(pid)

        val instance = beforeGetPipelineInstance(pid, id)

        val dataProject = dataProjectRepository.findByIdOrNull(instance.dataProjectId)
            ?: throw NotFoundException("DataProject was not found")

        val userToken = currentUserService.permanentToken()
        pipelineService.deletePipelineInstance(userToken, dataProject.gitlabId, instance.targetBranch)
        pipelineInstanceRepository.delete(instance)
    }
}


