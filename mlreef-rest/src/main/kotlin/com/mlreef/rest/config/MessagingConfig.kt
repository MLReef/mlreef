package com.mlreef.rest.config

import com.mlreef.rest.feature.system.SessionsService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter
import javax.annotation.PostConstruct

@Configuration
class MessagingConfig(private val sessionService: SessionsService,
                      private val connectionFactory: RedisConnectionFactory) {
    companion object {
        private val log = LoggerFactory.getLogger(MessagingConfig::class.java)
        const val REFRESH_USER_INFORMATION_TOPIC = "pubsub:queue:mlreef:userupdate"
    }

    @PostConstruct
    fun create() {
        log.debug("Messaging configuration is being created...")
    }

    @Bean
    fun redisTemplate(): RedisTemplate<String, Any> {
        val template = RedisTemplate<String, Any>()
        template.connectionFactory = connectionFactory
        return template
    }

    @Bean
    fun userInformationMessageListenerAdapter(): MessageListenerAdapter? {
        return MessageListenerAdapter(sessionService)
    }

    @Bean
    @Qualifier("refreshUserInformation")
    fun refreshUserTopic(): ChannelTopic? {
        return ChannelTopic(REFRESH_USER_INFORMATION_TOPIC)
    }

    @Bean
    fun redisContainer(): RedisMessageListenerContainer? {
        val container = RedisMessageListenerContainer()
        container.connectionFactory = connectionFactory
        container.addMessageListener(userInformationMessageListenerAdapter(), refreshUserTopic())
        return container
    }
}