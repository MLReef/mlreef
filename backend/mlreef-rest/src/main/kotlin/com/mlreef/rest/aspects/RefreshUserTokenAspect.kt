package com.mlreef.rest.aspects

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.annotations.RefreshUserInformation
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
class RefreshUserTokenAspect(
    private val currentUserService: CurrentUserService,
    private val redisTemplate: RedisTemplate<String, Any>,
    private val accountRepository: AccountRepository,
    @Qualifier("refreshUserInformation") private val topic: ChannelTopic
) {
    companion object {
        private val log = LoggerFactory.getLogger(this::class.java)
    }

    private val stringEvaluator: ExpressionEvaluator<String> = ExpressionEvaluator(String::class.java)
    private val listEvaluator: ExpressionEvaluator<DataClassWithId> = ExpressionEvaluator(DataClassWithId::class.java)

    @PostConstruct
    fun init() {
        log.debug("Refresh user token aspect created")
    }

    @After("@annotation(refreshUserInformation)")
    fun refreshUserInformation(joinPoint: JoinPoint, refreshUserInformation: RefreshUserInformation) {
        val userId: String? = stringEvaluator.getValue(joinPoint, refreshUserInformation.userId)
        val gitlabUserId: String? = stringEvaluator.getValue(joinPoint, refreshUserInformation.gitlabId)
        val username: String? = stringEvaluator.getValue(joinPoint, refreshUserInformation.username)
        val usersList: List<DataClassWithId>? = listEvaluator.getCollectionValue(joinPoint, refreshUserInformation.list)?.toList()

        val usernames = ArrayList<String?>()
        if (!userId.isNullOrBlank()) {
            val uuid = UUID.fromString(userId)
            val user = accountRepository.findByIdOrNull(uuid)
            usernames.add(user?.username)
        } else if (usersList != null) {
            usernames.addAll(
                usersList
                    .mapNotNull { it.id }
                    .map {
                        accountRepository.findByIdOrNull(it)?.username
                    }
            )
        } else if (!gitlabUserId.isNullOrBlank()) {
            val gitlabId = gitlabUserId.toLongOrNull()
            if (gitlabId != null) {
                val user = accountRepository.findAccountByGitlabId(gitlabId)
                usernames.add(user?.username)
            }
        } else if (!username.isNullOrBlank()) {
            usernames.add(username)
        } else {
            usernames.add(currentUserService.accountOrNull()?.username)
        }

        usernames.filterNotNull().forEach {
            redisTemplate.convertAndSend(topic.topic, it)
            log.debug("User $it was sent to topic ${topic.topic}")
        }
    }
}
