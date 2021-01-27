package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.Account
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.exceptions.DataProcessorIncorrectStructureException
import org.springframework.core.io.ClassPathResource
import java.util.stream.Collectors


const val PIPELINE_TOKEN_SECRET = "EPF_BOT_SECRET"
const val GIT_PUSH_USER = "GIT_PUSH_USER"
const val GIT_PUSH_TOKEN = "GIT_PUSH_TOKEN"

const val EPF_IMAGE_TAG = "%EPF_IMAGE_TAG%"
const val EPF_GITLAB_HOST = "%EPF_GITLAB_HOST%"
const val EPF_PIPELINE_URL = "%EPF_PIPELINE_URL%"
const val EPF_PIPELINE_SECRET = "%EPF_PIPELINE_SECRET%"
const val CONF_EMAIL = "%CONF_EMAIL%"
const val CONF_NAME = "%CONF_NAME%"
const val SOURCE_BRANCH = "%SOURCE_BRANCH%"
const val TARGET_BRANCH = "%TARGET_BRANCH%"
const val PIPELINE_STRING = "%PIPELINE_STRING%"
const val ARTIFACTS_PATH = "%ARTIFACTS_PATH%"
const val NEWLINE = "\n"

internal object YamlFileGenerator {
    val template: String = ClassPathResource("mlreef-file-template.yml")
        .inputStream.bufferedReader().use {
            it.lines().collect(Collectors.joining(NEWLINE))
        }

    fun renderYaml(
        author: Account,
        epfPipelineSecret: String,
        epfPipelineUrl: String,
        epfGitlabUrl: String,
        epfImageTag: String,
        sourceBranch: String,
        targetBranch: String,
        dataProcessors: List<DataProcessorInstance>,
    ): String = template
        .replace(CONF_EMAIL, newValue = author.email)
        .replace(CONF_NAME, newValue = author.username)
        .replace(SOURCE_BRANCH, newValue = sourceBranch)
        .replace(TARGET_BRANCH, newValue = targetBranch)
        .replace(EPF_IMAGE_TAG, newValue = epfImageTag)
        .replace(EPF_PIPELINE_SECRET, newValue = epfPipelineSecret)
        .replace(EPF_GITLAB_HOST, normilizeGitlabHost(epfGitlabUrl)
            .removePrefix("http://")
            .removePrefix("https://")
            .substringBefore("/"))
        .replace(EPF_PIPELINE_URL,
            if (epfPipelineUrl.startsWith("http://")
                || epfPipelineUrl.startsWith("https://")) {
                epfPipelineUrl
            } else { "http://$epfPipelineUrl" }
        )
        .replace(
            PIPELINE_STRING,
            getExecutableCommand(dataProcessors)
        )
        .replace(
            ARTIFACTS_PATH, newValue = if (dataProcessors.isNullOrEmpty()) "output" else (dataProcessors.last().parameterInstances.firstOrNull { it.name == "output-path" })?.value
            ?: "output"
        )

    //FIXME: For the moment the experiment yaml file contains PORT hardcoded in the script.
    // The best way is to move it from yml generation to the backend
    private fun normilizeGitlabHost(host: String): String {
        val hostAndPort = host.split(":")
        return if (hostAndPort.size > 2) "${hostAndPort[0]}:${hostAndPort[1]}" else host
    }

    private fun getExecutableCommand(dataProcessors: List<DataProcessorInstance>): String {
        return dataProcessors.joinToString(NEWLINE) { dpInstance ->
            if (dpInstance.processorVersion.command.isNotBlank()) {
                getCommandLineFromCommand(dpInstance)
            } else if (!dpInstance.processorVersion.path.isNullOrBlank()) {
                getCommandLineFromPath(dpInstance)
            } else {
                throw DataProcessorIncorrectStructureException("Dataprocessor has neither command nor scrypt file path")
            }
        }
    }

    private fun getCommandLineFromCommand(dpInstance: DataProcessorInstance): String {
        val path = when (dpInstance.dataProcessor.type) {
            DataProcessorType.ALGORITHM -> "/epf/model/"
            DataProcessorType.OPERATION -> "/epf/pipelines/"
            DataProcessorType.VISUALIZATION -> "/epf/visualisation/"
        }
        // the 4 space indentation is necessary for the yaml syntax
        return "    python $path${dpInstance.processorVersion.command}.py " +
            dpInstance.parameterInstances
                .joinToString(" ") { "--${it.name} ${it.value}" }
    }

    private fun getCommandLineFromPath(dpInstance: DataProcessorInstance): String {
        // the 4 space indentation is necessary for the yaml syntax
        return "    python ${dpInstance.processorVersion.path}" +
            dpInstance.parameterInstances
                .joinToString(" ") { "--${it.name} ${it.value}" }
    }

}
