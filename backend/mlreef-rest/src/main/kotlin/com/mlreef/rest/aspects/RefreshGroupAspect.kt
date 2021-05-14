package com.mlreef.rest.aspects

import com.mlreef.rest.GroupRepository
import com.mlreef.rest.annotations.RefreshGroupInformation
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.domain.helpers.DataClassWithId
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.After
import org.aspectj.lang.annotation.Aspect
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import java.util.ArrayList
import java.util.UUID
import javax.annotation.PostConstruct


@Aspect
@Component
class RefreshGroupAspect(
    private val currentUserService: CurrentUserService,
    private val redisTemplate: RedisTemplate<String, Any>,
    private val groupRepository: GroupRepository,
    @Qualifier("refreshGroupInformation") private val topic: ChannelTopic
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private val stringEvaluator: ExpressionEvaluator<String> = ExpressionEvaluator(String::class.java)
    private val listEvaluator: ExpressionEvaluator<DataClassWithId> = ExpressionEvaluator(DataClassWithId::class.java)

    @PostConstruct
    fun init() {
        log.debug("Refresh group token aspect created")
    }

    @After("@annotation(refreshGroupInformation)")
    fun refreshGroupInformation(joinPoint: JoinPoint, refreshGroupInformation: RefreshGroupInformation) {
        val groupId: String? = stringEvaluator.getValue(joinPoint, refreshGroupInformation.groupId)
        val gitlabGroupId: String? = stringEvaluator.getValue(joinPoint, refreshGroupInformation.gitlabId)
        val groupsList: List<DataClassWithId>? = listEvaluator.getCollectionValue(joinPoint, refreshGroupInformation.list)?.toList()

        val groups = ArrayList<String?>()
        if (!groupId.isNullOrBlank()) {
            val uuid = UUID.fromString(groupId)
            val group = groupRepository.findByIdOrNull(uuid)
            groups.add(group?.id?.toString())
        } else if (groupsList != null) {
            groups.addAll(
                groupsList
                    .mapNotNull { it.id }
                    .map {
                        groupRepository.findByIdOrNull(it)?.id?.toString()
                    }
            )
        } else if (!gitlabGroupId.isNullOrBlank()) {
            val gitlabId = gitlabGroupId.toLongOrNull()
            if (gitlabId!=null) {
                val group = groupRepository.findByGitlabId(gitlabId)
                groups.add(group?.id?.toString())
            }
        }

        groups.filterNotNull().forEach {
            redisTemplate.convertAndSend(topic.topic, it)
            log.debug("Group $it was sent to topic ${topic.topic}")
        }
    }
}
