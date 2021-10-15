package com.mlreef.rest.external_api.dvc

import java.io.BufferedReader
import java.io.InputStreamReader
import java.nio.file.Path
import java.util.concurrent.TimeUnit

class DvcClient(private val workingDir: Path? = null) {
    companion object {
        private const val DVC_APPLICATION_COMMAND_LINE = "dvc"
        private const val DVC_PROCESS_WAIT_TIMEOUT_SEC = 10L
    }

    fun init() {
        runDvc("init", "--no-scm")
    }

    fun destroy() {
        runDvcAndWait("destroy", "-f")
    }

    private fun runDvc(vararg params: String) {
        val process = getDvcProcess(*params)
        val reader = BufferedReader(InputStreamReader(process.inputStream))
    }

    private fun runDvcAndWait(vararg params: String) {
        val process = getDvcProcess(*params)

        process.waitFor(DVC_PROCESS_WAIT_TIMEOUT_SEC, TimeUnit.SECONDS)

        val reader = BufferedReader(InputStreamReader(process.inputStream))
    }

    private fun getDvcProcess(vararg params: String): Process {
        return ProcessBuilder(DVC_APPLICATION_COMMAND_LINE, *params)
            .apply {
                workingDir?.let { this.directory(it.toFile()) }
            }
            .start()
    }
}