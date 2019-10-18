package com.mlreef.rest

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication(scanBasePackages = ["com.mlreef.domain", "com.mlreef.rest"])
open class RestApplication

fun main(args: Array<String>) {
    runApplication<RestApplication>(*args)
}
