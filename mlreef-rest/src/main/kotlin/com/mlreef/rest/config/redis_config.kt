package com.mlreef.rest.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisStandaloneConfiguration
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession
import org.springframework.session.web.context.AbstractHttpSessionApplicationInitializer

@EnableRedisHttpSession
@Configuration
open class RedisSessionConfig {

    @Value("\${spring.redis.host}")
    private var redisHost: String = ""

    @Value("\${spring.redis.port}")
    private var redisPort: Int = 0

    @Bean
    open fun jedisConnectionFactory(): JedisConnectionFactory {
        val hostname = redisHost
        val port = redisPort
        val redisStandaloneConfiguration = RedisStandaloneConfiguration(hostname, port)
        return JedisConnectionFactory(redisStandaloneConfiguration)
    }

    @Bean
    open fun redisTemplate(): RedisTemplate<String, Any> {
        val template = RedisTemplate<String, Any>()
        template.connectionFactory = jedisConnectionFactory()
        return template
    }
}

class RedisSessionInitializer : AbstractHttpSessionApplicationInitializer(RedisSessionConfig::class.java)




