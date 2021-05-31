package com.mlreef.rest.aspects

import org.aspectj.lang.JoinPoint
import org.aspectj.lang.reflect.MethodSignature
import org.springframework.aop.support.AopUtils
import org.springframework.context.expression.AnnotatedElementKey
import org.springframework.context.expression.CachedExpressionEvaluator
import org.springframework.context.expression.MethodBasedEvaluationContext
import org.springframework.core.DefaultParameterNameDiscoverer
import org.springframework.core.ParameterNameDiscoverer
import org.springframework.expression.EvaluationContext
import org.springframework.expression.Expression
import java.lang.reflect.Method
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentMap


class ExpressionEvaluator<T>(private val targetClass: Class<T>) : CachedExpressionEvaluator() {
    // shared param discoverer since it caches data internally
    private val paramNameDiscoverer: ParameterNameDiscoverer = DefaultParameterNameDiscoverer()
    private val conditionCache: Map<ExpressionKey, Expression> = ConcurrentHashMap<ExpressionKey, Expression>(64)
    private val targetMethodCache: ConcurrentMap<AnnotatedElementKey, Method?> = ConcurrentHashMap<AnnotatedElementKey, Method>(64)

    companion object {
        private const val RETURN_OBJECT_SPEL_NAME_KEY = "returnObject"
        private const val RETURN_OBJECT_SPEL_NAME_KEY_2 = "result"
    }

    fun getValue(joinPoint: JoinPoint, condition: String?, result: Any? = null): T? {
        return if (condition.isNullOrBlank()) {
            null
        } else {
            getValue(
                joinPoint.target,
                joinPoint.args,
                joinPoint.target.javaClass,
                (joinPoint.signature as MethodSignature).getMethod(),
                condition,
                result,
            )
        }
    }

    private fun getValue(obj: Any, args: Array<Any>?, clazz: Class<*>, method: Method, condition: String, result: Any?): T? {
        if (args == null) {
            return null
        }
        val evaluationContext: EvaluationContext = this.createEvaluationContext(obj, clazz, method, args, result)
        val methodKey = AnnotatedElementKey(method, clazz)
        return this.condition(condition, methodKey, evaluationContext, targetClass)
    }

    fun getCollectionValue(joinPoint: JoinPoint, condition: String?, result: Any? = null): Collection<T>? {
        return if (condition.isNullOrBlank()) {
            null
        } else {
            getCollectionValue(
                joinPoint.target, joinPoint.args,
                joinPoint.target.javaClass,
                (joinPoint.signature as MethodSignature).getMethod(), condition, result
            )
        }
    }

    private fun getCollectionValue(obj: Any, args: Array<Any>?, clazz: Class<*>, method: Method, condition: String, result: Any?): Collection<T>? {
        if (args == null) {
            return null
        }
        val evaluationContext: EvaluationContext = this.createEvaluationContext(obj, clazz, method, args, result)
        val methodKey = AnnotatedElementKey(method, clazz)
        return this.conditionCollection(condition, methodKey, evaluationContext)
    }

    /**
     * Create the suitable [EvaluationContext] for the specified event handling
     * on the specified method.
     */
    fun createEvaluationContext(obj: Any, targetClass: Class<*>, method: Method, args: Array<Any>, result: Any?): EvaluationContext {
        val targetMethod: Method = getTargetMethod(targetClass, method)
        val root = ExpressionRootObject(obj, args)
        val context = MethodBasedEvaluationContext(root, targetMethod, args, paramNameDiscoverer)
        context.setVariable(RETURN_OBJECT_SPEL_NAME_KEY, result)
        context.setVariable(RETURN_OBJECT_SPEL_NAME_KEY_2, result)
        return context
    }

    /**
     * Specify if the condition defined by the specified expression matches.
     */
    fun condition(conditionExpression: String, elementKey: AnnotatedElementKey, evalContext: EvaluationContext, clazz: Class<T>?): T? {
        return getExpression(conditionCache, elementKey, conditionExpression).getValue(evalContext, clazz)
    }

    @Suppress("UNCHECKED_CAST")
    fun condition(conditionExpression: String, elementKey: AnnotatedElementKey, evalContext: EvaluationContext): T? {
        return getExpression(conditionCache, elementKey, conditionExpression).getValue(evalContext) as? T?
    }

    @Suppress("UNCHECKED_CAST")
    fun conditionCollection(conditionExpression: String, elementKey: AnnotatedElementKey, evalContext: EvaluationContext): Collection<T>? {
        return getExpression(conditionCache, elementKey, conditionExpression).getValue(evalContext) as? Collection<T>?
    }

    private fun getTargetMethod(targetClass: Class<*>, method: Method): Method {
        val methodKey = AnnotatedElementKey(method, targetClass)
        var targetMethod: Method? = targetMethodCache[methodKey]
        if (targetMethod == null) {
            targetMethod = AopUtils.getMostSpecificMethod(method, targetClass)
            if (targetMethod == null) {
                targetMethod = method
            }
            targetMethodCache[methodKey] = targetMethod
        }
        return targetMethod
    }
}

class ExpressionRootObject(val obj: Any, val args: Array<Any>)