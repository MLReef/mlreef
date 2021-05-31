package com.mlreef.rest.aspects

import com.mlreef.rest.annotations.SaveRecentProject
import com.mlreef.rest.config.MessagingConfig.Companion.PUB_SUB_FIELD_SEPARATOR
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.AfterReturning
import org.aspectj.lang.annotation.Aspect
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.stereotype.Component


@Aspect
@Component
class SaveRecentProjectAspect(
    private val redisTemplate: RedisTemplate<String, Any>,
    @Qualifier("recentProject") private val topic: ChannelTopic
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private val stringEvaluator: ExpressionEvaluator<String> = ExpressionEvaluator(String::class.java)

    @AfterReturning(value = "@annotation(saveRecentProject)", returning = "result")
    fun refreshProject(joinPoint: JoinPoint, saveRecentProject: SaveRecentProject, result: Any?) {
        try {
            val projectId: String? = stringEvaluator.getValue(joinPoint, saveRecentProject.projectId, result)
            val userId: String? = stringEvaluator.getValue(joinPoint, saveRecentProject.userId, result)
            val operation = saveRecentProject.operation
            redisTemplate.convertAndSend(topic.topic, "$projectId$PUB_SUB_FIELD_SEPARATOR$userId$PUB_SUB_FIELD_SEPARATOR$operation")
            log.debug("Recent project $projectId sent to topic for subject $userId")
        } catch (ex: Exception) {
            ex.printStackTrace()
            log.error("Cannot save recent project. Exception: $ex. Project: $result")
        }
    }
}