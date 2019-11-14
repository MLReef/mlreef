package com.mlreef.rest.feature.experiment

import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.Experiment
import com.mlreef.rest.ExperimentRepository
import com.mlreef.rest.SubjectRepository
import com.mlreef.rest.api.v1.dto.ExperimentCreateRequest
import com.mlreef.rest.api.v1.dto.ExperimentCreateResponse
import com.mlreef.rest.findById2
import lombok.RequiredArgsConstructor
import org.springframework.stereotype.Service
import java.util.UUID.randomUUID

@Service
@RequiredArgsConstructor
open class ExperimentService(
    private val experimentRepository: ExperimentRepository,
    private val subjectRepository: SubjectRepository,
    private val dataProjectRepository: DataProjectRepository
) {

    open fun createExperiment(createExperimentRequest: ExperimentCreateRequest): ExperimentCreateResponse {
        val subject = subjectRepository.findById2(createExperimentRequest.ownerId)
            ?: throw IllegalArgumentException("Owner is missing!")
        val dataProject = dataProjectRepository.findById2(createExperimentRequest.dataProjectId)
            ?: throw IllegalArgumentException("DataProject is missing!")

        if (createExperimentRequest.branch.isBlank()) {
            throw IllegalArgumentException("branch name is missing!")
        }
        val experiment = Experiment(
            randomUUID(),
            dataProject = dataProject)

        experimentRepository.save(experiment)
        val fromDb = experimentRepository.findById2(experiment.id)!!

        return ExperimentCreateResponse(
            fromDb.id,
            subject.id,
            dataProject.id,
            "branch")
    }
}