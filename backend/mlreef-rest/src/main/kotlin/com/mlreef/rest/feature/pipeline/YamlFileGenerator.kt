package com.mlreef.rest.feature.pipeline

import com.mlreef.rest.Account
import com.mlreef.rest.DataProcessorInstance
import com.mlreef.rest.DataProcessorType
import com.mlreef.rest.DataProject
import com.mlreef.rest.ParameterInstance
import org.springframework.core.io.ClassPathResource
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.stream.Collectors

object GitlabVariables {
    const val EPF_BOT_SECRET = "EPF_BOT_SECRET"
    const val GIT_PUSH_USER = "GIT_PUSH_USER"
    const val GIT_PUSH_TOKEN = "GIT_PUSH_TOKEN"
}

internal class YamlFileGenerator(
    private val epfImageTag: String = "latest"
) {

    companion object {
        const val EPF_IMAGE_TAG = "%EPF_IMAGE_TAG%"
        const val EPF_GITLAB_HOST = "%EPF_GITLAB_HOST%"
        const val EPF_PIPELINE_URL = "%EPF_PIPELINE_URL%"
        const val EPF_PIPELINE_SECRET = "%EPF_PIPELINE_SECRET%"
        const val GITLAB_GROUP = "%GITLAB_GROUP%"
        const val GITLAB_PROJECT = "%GITLAB_PROJECT%"
        const val CONF_EMAIL = "%CONF_EMAIL%"
        const val CONF_NAME = "%CONF_NAME%"
        const val SOURCE_BRANCH = "%SOURCE_BRANCH%"
        const val TARGET_BRANCH = "%TARGET_BRANCH%"
        const val PIPELINE_STRING = "%PIPELINE_STRING%"
        const val INPUT_FILE_LIST = "%INPUT_FILE_LIST%"
        const val NEWLINE = "\n"

        fun writeInstances(list: List<DataProcessorInstance>): List<String> {
            return list.map { writeInstance(it) }
        }

        private fun writeInstance(instance: DataProcessorInstance): String {
            // /epf/pipelines
            //  let line = `- python ${path}/${dataOperation.command}.py --images-path#directoriesAndFiles`;
            return try {
                val path = when (instance.dataProcessor.type) {
                    DataProcessorType.ALGORITHM -> "/epf/model/"
                    DataProcessorType.OPERATION -> "/epf/pipelines/"
                    DataProcessorType.VISUALIZATION -> "/epf/visualisation/"
                }
                "python $path${instance.processorVersion.command}.py " + writeParameters(instance.parameterInstances)
            } catch (e: Exception) {
                "# could not parse dataprocessor: ${e.message}"
            }
        }

        private fun writeParameters(parameterInstances: List<ParameterInstance>): String {
            return parameterInstances.joinToString(" ") { writeParameter(it) }
        }

        private fun writeParameter(it: ParameterInstance): String {
            return "--${it.name} ${it.value}"
        }
    }

    val input: String
    var output: String

    init {
        output = ""

        val classPathResource = ClassPathResource("mlreef-file-template.yml")
        val inputStream = classPathResource.inputStream
        try {
            val reader = BufferedReader(InputStreamReader(inputStream))
            val lines = reader.lines()
            input = lines.collect(Collectors.joining(NEWLINE))
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
        output = input
    }

    fun generateYamlFile(
        author: Account,
        dataProject: DataProject,
        epfPipelineSecret: String,
        epfPipelineUrl: String,
        epfGitlabUrl: String,
        sourceBranch: String,
        targetBranch: String,
        processors: List<DataProcessorInstance>,
        inputFileList: List<String>
    ): String {
        val inputFileListString = inputFileList.joinToString(",")
        replaceAllSingleStrings(
            epfTag = epfImageTag,
            epfPipelineSecret = epfPipelineSecret,
            epfPipelineUrl = epfPipelineUrl,
            confEmail = author.email,
            confName = author.username,
            gitlabNamespace = dataProject.gitlabNamespace,
            epfGitlabUrl = epfGitlabUrl,
            gitlabPath = dataProject.gitlabPath,
            sourceBranch = sourceBranch,
            targetBranch = targetBranch,
            inputFileList = inputFileListString
        )
        replacePipeline(processors)

        return output
    }

    fun replacePipeline(list: List<DataProcessorInstance> = listOf()): YamlFileGenerator {
        val pipelineStrings = writeInstances(list)
        val indexOf = input.indexOf("- git add .")
        val lineBegin = input.indexOf(NEWLINE, indexOf)
        val dash = input.indexOf("-", lineBegin)
        val indent = dash - lineBegin - 1
        val prefix = " ".repeat(indent) + "-"

        val indentedStrings = pipelineStrings.joinToString(NEWLINE) { "$prefix $it" }
        output = output.replace(PIPELINE_STRING, indentedStrings)
        return this
    }

    fun replaceAllSingleStrings(
        epfTag: String = "",
        epfPipelineSecret: String = "",
        epfPipelineUrl: String = "",
        epfGitlabUrl: String = "",
        gitlabNamespace: String = "",
        gitlabPath: String = "",
        confEmail: String = "",
        confName: String = "",
        sourceBranch: String = "",
        targetBranch: String = "",
        inputFileList: String = ""

    ): YamlFileGenerator {
        output = output
            .replace(EPF_IMAGE_TAG, epfTag)
            .replace(EPF_PIPELINE_SECRET, epfPipelineSecret)
            .replace(EPF_PIPELINE_URL, epfPipelineUrl)
            .replace(EPF_GITLAB_HOST, epfGitlabUrl.replace("http://", "").replace("https://", ""))
            .replace(GITLAB_GROUP, gitlabNamespace)
            .replace(GITLAB_PROJECT, gitlabPath)
            .replace(CONF_EMAIL, confEmail)
            .replace(CONF_NAME, confName)
            .replace(SOURCE_BRANCH, sourceBranch)
            .replace(TARGET_BRANCH, targetBranch)
            .replace(INPUT_FILE_LIST, inputFileList)
        return this
    }
}
