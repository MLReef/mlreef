package com.mlreef.rest.aspects

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.annotations.RefreshUserInformation
import com.mlreef.rest.api.CurrentUserService
import com.mlreef.rest.helpers.DataClassWithId

import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.After
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.reflect.MethodSignature
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.expression.AnnotatedElementKey
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.repository.findByIdOrNull
import org.springframework.expression.EvaluationContext
import org.springframework.stereotype.Component
import java.lang.reflect.Method
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

    private val stringEvaluator: ExpressionEvaluator<String> = ExpressionEvaluator()
    private val listEvaluator: ExpressionEvaluator<List<DataClassWithId>> = ExpressionEvaluator()

    @PostConstruct
    fun init() {
        log.debug("Refresh user token aspect created")
    }

    @After("@annotation(refreshUserInformation)")
    fun refreshUserInformation(joinPoint: JoinPoint, refreshUserInformation: RefreshUserInformation) {
        val userId: String? = getStringValue(joinPoint, refreshUserInformation.userId)
        val usersList: List<DataClassWithId>? = getListValue(joinPoint, refreshUserInformation.list)

        val usernames = ArrayList<String?>()
        if (userId != null) {
            val user = UUID.fromString(userId)
            usernames.add(accountRepository.findByIdOrNull(user)?.username)
        } else if (usersList != null) {
            usernames.addAll(
                usersList
                    .mapNotNull { it.id }
                    .map {
                        accountRepository.findByIdOrNull(it)?.username
                            ?: accountRepository.findAccountByPersonId(it)?.username
                    }
            )
        } else {
            usernames.add(currentUserService.accountOrNull()?.username)
        }

        usernames.filterNotNull().forEach {
            redisTemplate.convertAndSend(topic.topic, it)
            log.debug("User $it was sent to topic ${topic.topic}")
        }
    }

    private fun getStringValue(joinPoint: JoinPoint, condition: String?): String? {
        return if (condition.isNullOrBlank()) {
            null
        } else {
            getStringValue(joinPoint.target, joinPoint.args,
                joinPoint.target.javaClass,
                (joinPoint.signature as MethodSignature).getMethod(), condition)
        }
    }

    private fun getStringValue(obj: Any, args: Array<Any>?, clazz: Class<*>, method: Method, condition: String): String? {
        if (args == null) {
            return null
        }
        val evaluationContext: EvaluationContext = stringEvaluator.createEvaluationContext(obj, clazz, method, args)
        val methodKey = AnnotatedElementKey(method, clazz)
        return stringEvaluator.condition(condition, methodKey, evaluationContext, String::class.java)
    }

    private fun getListValue(joinPoint: JoinPoint, condition: String?): List<DataClassWithId>? {
        return if (condition.isNullOrBlank()) {
            null
        } else {
            getListValue(joinPoint.target, joinPoint.args,
                joinPoint.target.javaClass,
                (joinPoint.signature as MethodSignature).getMethod(), condition)
        }
    }

    private fun getListValue(obj: Any, args: Array<Any>?, clazz: Class<*>, method: Method, condition: String): List<DataClassWithId>? {
        if (args == null) {
            return null
        }
        val evaluationContext: EvaluationContext = stringEvaluator.createEvaluationContext(obj, clazz, method, args)
        val methodKey = AnnotatedElementKey(method, clazz)
        return listEvaluator.condition(condition, methodKey, evaluationContext)
    }
}
