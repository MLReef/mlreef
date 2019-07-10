package com.mlreef.gitlabapi.v4

import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.promise

actual fun <T> runTest(block: suspend () -> T): dynamic =
    GlobalScope.promise { block() }


