package com.mlreef.rest

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

object ApplicationProfiles {
    const val TEST = "test"
    const val DEV = "dev"
    const val PROD = "prod"
}

@SpringBootApplication(scanBasePackages = ["com.mlreef", "com.mlreef.rest"])
class RestApplication

fun main(args: Array<String>) {
    runApplication<RestApplication>(*args)
}


