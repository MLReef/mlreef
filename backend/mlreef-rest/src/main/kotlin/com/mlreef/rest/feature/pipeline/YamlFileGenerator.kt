package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.domain.Account
import com.mlreef.rest.domain.ProcessorInstance
import com.mlreef.rest.exceptions.DataProcessorIncorrectStructureException
import org.springframework.context.annotation.Scope
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Service
import java.util.stream.Collectors


const val PIPELINE_TOKEN_SECRET = "EPF_BOT_SECRET"
const val GIT_PUSH_USER = "GIT_PUSH_USER"
const val GIT_PUSH_TOKEN = "GIT_PUSH_TOKEN"

const val INPUT_PATH_PARAM_NAME = "input-path"
const val OUTPUT_PATH_PARAM_NAME = "output-path"

const val MOUNT_POINTS_PREFIX = "/builds/\$CI_PROJECT_PATH/"
const val INPUT_MOUNT_POINT_VAR_NAME = "INPUT_MOUNT_POINT"
const val OUTPUT_MOUNT_POINT_VAR_NAME = "OUTPUT_MOUNT_POINT"

const val EPF_IMAGE_TAG = "%EPF_IMAGE_TAG%"
const val EPF_GITLAB_HOST = "%EPF_GITLAB_HOST%"
const val EPF_PIPELINE_URL = "%EPF_PIPELINE_URL%"
const val EPF_PIPELINE_SECRET = "%EPF_PIPELINE_SECRET%"
const val CONF_EMAIL = "%CONF_EMAIL%"
const val CONF_NAME = "%CONF_NAME%"
const val SOURCE_BRANCH = "%SOURCE_BRANCH%"
const val TARGET_BRANCH = "%TARGET_BRANCH%"
const val PIPELINE_STRING = "%PIPELINE_STRING%"
const val ARTIFACTS_PATHS = "%ARTIFACTS_PATHS%"
const val INPUT_MOUNT_POINTS = "%INPUT_MOUNT_POINTS%"
const val OUTPUT_MOUNT_POINTS = "%OUTPUT_MOUNT_POINTS%"
const val FINAL_OUTPUT_PATH = "%FINAL_OUTPUT_PATH%"
const val IS_ALGORITHM = "%IS_ALGORITHM%"
const val BASE_IMAGE_PATH = "%BASE_IMAGE_PATH%"
const val MAX_RETRIES = "%MAX_RETRIES%"

val NEWLINE = System.lineSeparator()

@Service
@Scope("prototype")
class YamlFileGenerator {
    val template: String = ClassPathResource("mlreef-file-template.yml")
        .inputStream.bufferedReader().use {
            it.lines().collect(Collectors.joining(NEWLINE))
        }

    private val algorithmName = "ALGORITHM" //TODO: Change to entity instance

    fun renderYaml(
        author: Account,
        epfPipelineSecret: String,
        epfPipelineUrl: String,
        epfGitlabUrl: String,
        baseImagePath: String,
        epfImageTag: String,
        sourceBranch: String,
        targetBranch: String,
        processorsInstances: List<ProcessorInstance>,
        retries: Int = 0
    ): String {
        val inputFolders = processorsInstances.mapIndexed { index, it ->
            fixFolder(
                it.parameterInstances.firstOrNull { it.name.equals(INPUT_PATH_PARAM_NAME, true) }?.value
            ) ?: "input$index"
        }

        val outputFolders = processorsInstances.mapIndexed { index, it ->
            fixFolder(
                it.parameterInstances.firstOrNull { it.name.equals(OUTPUT_PATH_PARAM_NAME, true) }?.value
            ) ?: "output$index"
        }

        return template
            .replace(CONF_EMAIL, newValue = author.email)
            .replace(CONF_NAME, newValue = author.username)
            .replace(SOURCE_BRANCH, newValue = sourceBranch)
            .replace(TARGET_BRANCH, newValue = targetBranch)
            .replace(EPF_IMAGE_TAG, newValue = epfImageTag)
            .replace(BASE_IMAGE_PATH, newValue = baseImagePath)
            .replace(EPF_PIPELINE_SECRET, newValue = epfPipelineSecret)
            .replace(EPF_GITLAB_HOST, normilizeGitlabHost(epfGitlabUrl)
                .removePrefix("http://")
                .removePrefix("https://")
                .substringBefore("/"))
            .replace(EPF_PIPELINE_URL,
                if (epfPipelineUrl.startsWith("http://")
                    || epfPipelineUrl.startsWith("https://")) {
                    epfPipelineUrl
                } else {
                    "http://$epfPipelineUrl"
                }
            )
            .replace(
                PIPELINE_STRING,
                getExecutableCommand(processorsInstances, inputFolders, outputFolders)
            )
            .replace(ARTIFACTS_PATHS, newValue = getArtifactPathsVariableLine(outputFolders))
            .replace(INPUT_MOUNT_POINTS, newValue = getInputMountPointsVariableLine(inputFolders))
            .replace(OUTPUT_MOUNT_POINTS, newValue = getOutputMountPointsVariableLine(outputFolders))
            .replace(FINAL_OUTPUT_PATH, newValue = outputFolders.lastOrNull() ?: "")
            .replace(
                IS_ALGORITHM, newValue = (processorsInstances
                    .filter { it.processor.type?.name?.equals(algorithmName, true) == true }.isNotEmpty()).toString()
            )
            .replace(MAX_RETRIES, newValue = retries.toString())
    }


    //FIXME: For the moment the experiment yaml file contains PORT hardcoded in the script.
    // The best way is to move it from yml generation to the backend
    private fun normilizeGitlabHost(host: String): String {
        val hostAndPort = host.split(":")
        return if (hostAndPort.size > 3) "${hostAndPort[0]}:${hostAndPort[1]}" else host
    }

    private fun getInputMountPointsVariableLine(inputPaths: List<String>): String {
        return inputPaths.mapIndexed { index, path ->
            "  $INPUT_MOUNT_POINT_VAR_NAME$index: $MOUNT_POINTS_PREFIX$path"
        }.joinToString(NEWLINE)
    }

    private fun getOutputMountPointsVariableLine(outputPaths: List<String>): String {
        return outputPaths.mapIndexed { index, path ->
            "  $OUTPUT_MOUNT_POINT_VAR_NAME$index: $MOUNT_POINTS_PREFIX$path"
        }.joinToString(NEWLINE)
    }

    private fun getArtifactPathsVariableLine(outputPaths: List<String>): String {
        // Six spaces
        return outputPaths.mapIndexed { index, path ->
            "      - $path/*"
        }.joinToString(NEWLINE)
    }

    private fun getExecutableCommand(dataProcessors: List<ProcessorInstance>, inputPaths: List<String>?, outputPaths: List<String>?): String {
        return dataProcessors.mapIndexed { index, instance ->
            if (!instance.processor.mainScriptPath.isNullOrBlank() && !instance.processor.imageName.isNullOrBlank()) {
                getCommandLineFromPath(
                    instance,
                    inputPaths?.getOrNull(index),
                    outputPaths?.getOrNull(index),
                    index
                )
            } else {
                throw DataProcessorIncorrectStructureException("Processor has no either image or script file path. Possible it was not published correctly")
            }
        }.joinToString(NEWLINE)
    }

    private fun getCommandLineFromPath(instance: ProcessorInstance, inputPath: String?, outputPath: String?, index: Int): String {
        // the 4 space indentation is necessary for the yaml syntax
        return "    "
            .let {
                "$it\${DOCKER_COMMAND}"
            }
            .let {
                if (!inputPath.isNullOrBlank()) "$it -v \"\$$INPUT_MOUNT_POINT_VAR_NAME$index:/$inputPath\"" else it
            }
            .let {
                if (!outputPath.isNullOrBlank()) "$it -v \"\$$OUTPUT_MOUNT_POINT_VAR_NAME$index:/$outputPath\"" else it
            }
            .let {
                "$it ${instance.processor.imageName}"
            }
            .let {
                "$it python ${instance.processor.mainScriptPath}"
            }
            .let {
                "$it ${
                    instance.parameterInstances.joinToString(" ") {
                        if (it.name.equals(INPUT_PATH_PARAM_NAME, true)) {
                            if (!inputPath.isNullOrBlank()) "--${it.name} /$inputPath" else ""
                        } else if (it.name.equals(OUTPUT_PATH_PARAM_NAME, true)) {
                            if (!outputPath.isNullOrBlank()) "--${it.name} /$outputPath" else ""
                        } else {
                            "--${it.name} ${it.value}"
                        }
                    }
                }"
            }
    }

    private fun fixFolder(folder: String?): String? {
        return folder?.let {
            if (it.startsWith(".")) it.substring(1) else it
        }?.let {
            if (it.startsWith("/")) it.substring(1) else it
        }
    }

}
