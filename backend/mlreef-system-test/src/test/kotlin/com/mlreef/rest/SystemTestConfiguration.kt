package com.mlreef.rest

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties

@EnableConfigurationProperties
@ConfigurationProperties(prefix = "systemtest")
class SystemTestConfiguration {
    lateinit var backendUrl: String
//    lateinit var gitlabUrl: String
//    lateinit var adminUsername: String
//    lateinit var adminPassword: String
//    lateinit var adminUserToken: String
}