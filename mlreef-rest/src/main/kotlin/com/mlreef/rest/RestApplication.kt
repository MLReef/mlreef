package com.mlreef.rest

import com.mlreef.rest.feature.auth.AuthService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.stereotype.Component
import java.util.*


@SpringBootApplication(scanBasePackages = ["com.mlreef", "com.mlreef.rest"])
open class RestApplication

fun main(args: Array<String>) {
    runApplication<RestApplication>(*args)
}

@Component
class CommandLineAppStartupRunner : CommandLineRunner {
    @Autowired
    lateinit var dataPopulator: DataPopulator

    @Throws(Exception::class)
    override fun run(vararg args: String) {
        logger.info("Application started with command-line arguments: {} . \n To kill this application, press Ctrl + C.", Arrays.toString(args))
        dataPopulator.init()
    }

    companion object {
        private val logger = LoggerFactory.getLogger(CommandLineAppStartupRunner::class.java)
    }
}

@Component
class DataPopulator(
    @Autowired
    val authService: AuthService
) {
    fun init() {
        try {
            authService.registerUser("password", "mlreef", "mlreef@example.com")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}