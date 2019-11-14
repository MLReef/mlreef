package com.mlreef.rest.api.v1

import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.api.v1.dto.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.ExperimentCreateResponse
import com.mlreef.rest.feature.experiment.ExperimentService
import com.mlreef.rest.findById2
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*
import java.util.logging.Logger


@RestController
@RequestMapping("/api/v1/experiments", produces = ["application/json"], consumes = ["application/json"])
class ExperimentController {

    private val logger: Logger = Logger.getLogger(ExperimentController::class.simpleName)

    @Autowired
    lateinit var service: ExperimentService

    @Autowired
    lateinit var repo: ExperimentRepository

    @GetMapping("/{id}}")
    fun getOne(@PathVariable id: UUID): Experiment? {
        return repo.findById2(id)
    }

    @GetMapping
    fun getAll(): Iterable<Experiment> {
        val experiments = repo.findAll()
        return experiments
    }

    @PostMapping("/", consumes = ["application/json"])
    fun create(@RequestBody experimentCreateRequest: ExperimentCreateRequest): ExperimentCreateResponse {
        logger.info(experimentCreateRequest.toString())

        return service.createExperiment(experimentCreateRequest)
    }
}
