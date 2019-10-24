package com.mlreef.rest.config

import java.util.ArrayList
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration


@Configuration
@EnableConfigurationProperties
@ConfigurationProperties("application")
open class YAMLConfig {

    private val name: String? = null
    private val environment: String? = null
    private val servers = ArrayList<String>()

    // standard getters and setters

}
