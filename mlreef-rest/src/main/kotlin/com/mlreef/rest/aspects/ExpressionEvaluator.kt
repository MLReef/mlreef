package com.mlreef.rest.aspects

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


class ExpressionEvaluator<T> : CachedExpressionEvaluator() {
    // shared param discoverer since it caches data internally
    private val paramNameDiscoverer: ParameterNameDiscoverer = DefaultParameterNameDiscoverer()
    private val conditionCache: Map<ExpressionKey, Expression> = ConcurrentHashMap<ExpressionKey, Expression>(64)
    private val targetMethodCache: ConcurrentMap<AnnotatedElementKey, Method?> = ConcurrentHashMap<AnnotatedElementKey, Method>(64)

    /**
     * Create the suitable [EvaluationContext] for the specified event handling
     * on the specified method.
     */
    fun createEvaluationContext(obj: Any, targetClass: Class<*>, method: Method, args: Array<Any>): EvaluationContext {
        val targetMethod: Method = getTargetMethod(targetClass, method)
        val root = ExpressionRootObject(obj, args)
        return MethodBasedEvaluationContext(root, targetMethod, args, paramNameDiscoverer)
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