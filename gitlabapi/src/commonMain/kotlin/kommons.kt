package com.mlreef

expect fun <T> runTest(block: suspend () -> T)
