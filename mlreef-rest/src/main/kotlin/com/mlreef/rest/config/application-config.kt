package com.mlreef.rest.config

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.PropertyNamingStrategy
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.slf4j.LoggerFactory
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.concurrent.ConcurrentMapCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories
import javax.annotation.PostConstruct


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
@EnableRedisRepositories(basePackages = ["com.mlreef.rest.feature.caches.repositories"])
class RedisRepositoriesConfig(
    private val connectionFactory: RedisConnectionFactory
) {
    companion object {
        private val log = LoggerFactory.getLogger(RedisRepositoriesConfig::class.java)
    }

    @PostConstruct
    fun onCreate() {
        log.debug("Redis repositories configuring...")
    }

    @Bean
    fun redisTemplate(): RedisTemplate<String, Any> {
        val template = RedisTemplate<String, Any>()
        template.connectionFactory = connectionFactory
        return template
    }

//    @Bean
//    fun connectionFactory(): RedisConnectionFactory {
//        return JedisConnectionFactory()
//    }

//    @Bean
//    fun redisTemplate(): RedisTemplate<*, *> {
//        return RedisTemplate<ByteArray, ByteArray>()
//    }
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
        this.registerModule(JavaTimeModule())
        this.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        this.configure(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES, true)
        this.enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS)
        this.propertyNamingStrategy = PropertyNamingStrategy.SNAKE_CASE //Don't delete it. Plz see file com.mlreef.rest.external_api.gitlab.GitlabRestClient
    }

    override fun copy(): ObjectMapper {
        return MLReefObjectMapper()
    }
}
