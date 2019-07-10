package com.mlreef.gitlabapi.v4

import com.mlreef.gitlabapi.v4.LogLevel.DEBUG
import com.mlreef.gitlabapi.v4.LogLevel.ERROR
import com.mlreef.gitlabapi.v4.LogLevel.INFO
import com.mlreef.gitlabapi.v4.LogLevel.TRACE
import com.mlreef.gitlabapi.v4.LogLevel.WARN

expect fun <T> runTest(block: suspend () -> T)

var logLevel: LogLevel = TRACE

enum class LogLevel(
    val verbosity: Int
) {
    QUIET(0),
    ERROR(1),
    WARN(2),
    INFO(3),
    DEBUG(4),
    TRACE(5)
}

fun error(message: String) {
    if (logLevel.verbosity >= ERROR.verbosity) println(message)
}

fun warn(message: String) {
    if (logLevel.verbosity >= WARN.verbosity) println(message)
}

fun info(message: String) {
    if (logLevel.verbosity >= INFO.verbosity) println(message)
}

fun debug(message: String) {
    if (logLevel.verbosity >= DEBUG.verbosity) println(message)
}

fun trace(message: String) {
    if (logLevel.verbosity >= TRACE.verbosity) println(message)
}


