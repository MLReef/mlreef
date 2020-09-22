package com.mlreef.rest.feature

import com.mlreef.rest.exceptions.PipelineStartException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Service
import java.util.stream.Collectors

const val TARGET_BRANCH = "master"
const val COMMIT_MESSAGE = "Adding Dockerfile for publishing"
const val DOCKERFILE_NAME = "Dockerfile"
const val NEWLINE = "\n"

@Service
internal class PublishingService(
    private val gitlabRestClient: GitlabRestClient,
) {
    val log: Logger = LoggerFactory.getLogger(this::class.java)

    val dockerfileTemplate: String = ClassPathResource("code-publishing-dockerfile-template")
        .inputStream.bufferedReader().use {
            it.lines().collect(Collectors.joining(NEWLINE))
        }

    fun startPublishing(userToken: String, projectId: Long) = try {
        gitlabRestClient.commitFiles(
            token = userToken,
            projectId = projectId,
            targetBranch = TARGET_BRANCH,
            commitMessage = COMMIT_MESSAGE,
            fileContents = mapOf(DOCKERFILE_NAME to dockerfileTemplate),
            action = "create"
        ).also { log.info("Committed Dockerfiles for project $projectId in commit ${it.shortId}") }
    } catch (e: RestException) {
        throw PipelineStartException("Cannot commit $DOCKERFILE_NAME file to branch $TARGET_BRANCH for project $projectId: ${e.errorName}")
    }
}
