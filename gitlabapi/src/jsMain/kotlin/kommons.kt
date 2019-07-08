package com.mlreef
import kotlinx.coroutines.*

actual fun <T> runTest(block: suspend () -> T): dynamic =
    throw NullPointerException()
// promise { block() }
