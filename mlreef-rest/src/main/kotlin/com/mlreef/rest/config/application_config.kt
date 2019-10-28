package com.mlreef.rest.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.*


@Configuration
@EnableConfigurationProperties
@ConfigurationProperties("application")
open class YAMLConfig {

    private val name: String? = null
    private val environment: String? = null
    private val servers = ArrayList<String>()

    // standard getters and setters

}

@Configuration
@EnableCaching
open class CachingConfig {

    @Bean
    open fun cacheManager(): CacheManager {
        return ConcurrentMapCacheManager("addresses")
    }
}
