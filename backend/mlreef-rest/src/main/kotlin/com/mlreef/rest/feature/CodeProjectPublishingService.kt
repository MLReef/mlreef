package com.mlreef.rest.feature

import com.mlreef.rest.exceptions.PipelineStartException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.GitlabPipeline
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Service
import java.util.stream.Collectors

const val TARGET_BRANCH = "master"
const val COMMIT_MESSAGE = "Adding Dockerfile for publishing"
const val DOCKERFILE_NAME = "Dockerfile"
const val MLREEF_NAME = ".mlreef.yml"
const val NEWLINE = "\n"

val dockerfileTemplate: String = ClassPathResource("code-publishing-dockerfile-template")
    .inputStream.bufferedReader().use {
        it.lines().collect(Collectors.joining(NEWLINE))
    }

val mlreefTemplate: String = ClassPathResource("code-publishing-mlreef-file-template.yml")
    .inputStream.bufferedReader().use {
        it.lines().collect(Collectors.joining(NEWLINE))
    }

@Service
internal class PublishingService(
    private val gitlabRestClient: GitlabRestClient,
) {

    val log: Logger = LoggerFactory.getLogger(this::class.java)

    /**
     * A new code is "unpublished" (==> no mlreef.yml)
     * Start publishing creates a pipeline which will publish every new commit in "master" as "latest" version
     *   1. create mlreef.yml & Dockerfile
     *   2. parse data processor
     *   3. ... ?
     */
    fun startPublishing(userToken: String, projectId: Long): Commit =
        try {
            gitlabRestClient.commitFiles(
                token = userToken,
                projectId = projectId,
                targetBranch = TARGET_BRANCH,
                commitMessage = COMMIT_MESSAGE,
                fileContents = mapOf(
                    DOCKERFILE_NAME to dockerfileTemplate,
                        MLREEF_NAME to generateCodePublishingYAML()
                ),
                action = "create"
            )
        } catch (e: RestException) {
            throw PipelineStartException("Cannot commit $DOCKERFILE_NAME file to branch $TARGET_BRANCH for project $projectId: ${e.errorName}")
        }

}

fun generateCodePublishingYAML() = mlreefTemplate