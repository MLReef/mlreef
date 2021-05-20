package com.mlreef.rest.aspects

import com.mlreef.rest.annotations.RefreshProject
import com.mlreef.rest.domain.AuditEntity
import com.mlreef.rest.domain.helpers.DataClassWithId
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.AfterReturning
import org.aspectj.lang.annotation.AfterThrowing
import org.aspectj.lang.annotation.Aspect
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.stereotype.Component


@Aspect
@Component
class RefreshProjectAspect(
    private val redisTemplate: RedisTemplate<String, Any>,
    @Qualifier("refreshProject") private val topic: ChannelTopic
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private val stringEvaluator: ExpressionEvaluator<String> = ExpressionEvaluator(String::class.java)
    private val listEvaluator: ExpressionEvaluator<DataClassWithId> = ExpressionEvaluator(DataClassWithId::class.java)

    @AfterReturning("@annotation(refreshProject)", returning = "result")
    fun refreshProject(joinPoint: JoinPoint, refreshProject: RefreshProject, result: Any?) {
        val projectId: String? = stringEvaluator.getValue(joinPoint, refreshProject.projectId)
        val projectsList: List<DataClassWithId> = listEvaluator.getCollectionValue(joinPoint, refreshProject.list)?.toList() ?: listOf()
        val resultProjectId = if (refreshProject.projectId.isBlank() && refreshProject.list.isBlank()) {
            (result as? AuditEntity)?.id?.toString()
        } else {
            null
        }

        val projectsIds = projectsList
            .map { it.id.toString() }
            .toMutableList()
            .apply {
                projectId?.let { add(it) }
                resultProjectId?.let { add(it) }
            }

        projectsIds.forEach {
            redisTemplate.convertAndSend(topic.topic, it)
            log.debug("Project $it was sent to topic ${topic.topic}")
        }
    }

    /*
        We should try to refresh projects in any way. The project could be changed and the exception throwed does not
        relate to the project but to other process
     */
    @AfterThrowing("@annotation(refreshProject)")
    fun refreshProjectAfterException(joinPoint: JoinPoint, refreshProject: RefreshProject) {
        refreshProject(joinPoint, refreshProject, null)
    }
}