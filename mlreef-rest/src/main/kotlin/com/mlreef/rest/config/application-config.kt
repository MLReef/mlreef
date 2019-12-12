package com.mlreef.rest.config

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import java.util.*


@Configuration
@EnableConfigurationProperties
@ConfigurationProperties("application")
@EnableJpaAuditing
class YAMLConfig {
    private val name: String? = null
    private val environment: String? = null
    private val servers = ArrayList<String>()
}

@Configuration
@EnableCaching
class CachingConfig {

    @Bean
    fun cacheManager(): CacheManager {
        return ConcurrentMapCacheManager("addresses")
    }
}

@Configuration
class BeansConfig {
    @Bean
    fun objectMapper(): ObjectMapper {
        return MLReefObjectMapper()
    }
}

class MLReefObjectMapper : ObjectMapper() {

    init {
        this.registerKotlinModule()
        this.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, true)

//        this.registerModule(JavaTimeModule())
    }

    override fun copy(): ObjectMapper {
        return MLReefObjectMapper()
    }
}
