package com.mlreef.rest.config

import com.mlreef.rest.feature.caches.PublicProjectsCacheService
import com.mlreef.rest.feature.project.RecentProjectService
import com.mlreef.rest.feature.system.SessionsService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter
import javax.annotation.PostConstruct

@Configuration
class MessagingConfig(
    private val sessionService: SessionsService,
    private val connectionFactory: RedisConnectionFactory,
    private val publicProjectsCacheService: PublicProjectsCacheService,
    private val recentProjectService: RecentProjectService,
    private val redisMessageListenerContainer: RedisMessageListenerContainer,
) {
    companion object {
        private val log = LoggerFactory.getLogger(MessagingConfig::class.java)
        const val REFRESH_USER_INFORMATION_TOPIC = "pubsub:queue:mlreef:userupdate"
        const val REFRESH_GROUP_INFORMATION_TOPIC = "pubsub:queue:mlreef:groupupdate"
        const val REFRESH_PROJECT_TOPIC = "pubsub:queue:mlreef:projectupdate"
        const val RECENT_PROJECT_TOPIC = "pubsub:queue:mlreef:recentproject"

        const val PUB_SUB_FIELD_SEPARATOR = "|"
    }

    @PostConstruct
    fun create() {
        log.debug("Messaging configuration is being created...")

        redisMessageListenerContainer.addMessageListener(userInformationMessageListenerAdapter(), refreshUserTopic())
        redisMessageListenerContainer.addMessageListener(userInformationMessageListenerAdapter(), refreshGroupTopic())
        redisMessageListenerContainer.addMessageListener(projectMessageListenerAdapter(), refreshProjectTopic())
        redisMessageListenerContainer.addMessageListener(recentProjectMessageListenerAdapter(), saveRecentProjectTopic())
    }

    @Bean
    fun userInformationMessageListenerAdapter(): MessageListenerAdapter {
        return MessageListenerAdapter(sessionService)
    }

    @Bean
    fun projectMessageListenerAdapter(): MessageListenerAdapter {
        return MessageListenerAdapter(publicProjectsCacheService)
    }

    @Bean
    fun recentProjectMessageListenerAdapter(): MessageListenerAdapter {
        val adapter = MessageListenerAdapter(recentProjectService)
        return adapter
    }

    @Bean
    @Qualifier("refreshUserInformation")
    fun refreshUserTopic(): ChannelTopic {
        return ChannelTopic(REFRESH_USER_INFORMATION_TOPIC)
    }

    @Bean
    @Qualifier("refreshGroupInformation")
    fun refreshGroupTopic(): ChannelTopic {
        return ChannelTopic(REFRESH_GROUP_INFORMATION_TOPIC)
    }

    @Bean
    @Qualifier("refreshProject")
    fun refreshProjectTopic(): ChannelTopic {
        return ChannelTopic(REFRESH_PROJECT_TOPIC)
    }

    @Bean
    @Qualifier("recentProject")
    fun saveRecentProjectTopic(): ChannelTopic {
        return ChannelTopic(RECENT_PROJECT_TOPIC)
    }

//    @Bean
//    @ConditionalOnMissingBean
//    fun redisContainer(): RedisMessageListenerContainer {
//        val container = RedisMessageListenerContainer()
//        container.connectionFactory = connectionFactory
//        container.addMessageListener(userInformationMessageListenerAdapter(), refreshUserTopic())
//        container.addMessageListener(userInformationMessageListenerAdapter(), refreshGroupTopic())
//        container.addMessageListener(projectMessageListenerAdapter(), refreshProjectTopic())
//        container.addMessageListener(recentProjectMessageListenerAdapter(), saveRecentProjectTopic())
//        return container
//    }
}