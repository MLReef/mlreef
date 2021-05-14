package com.mlreef.rest.annotations

import org.hibernate.CallbackException
import org.hibernate.boot.Metadata
import org.hibernate.engine.spi.SessionFactoryImplementor
import org.hibernate.event.service.spi.EventListenerRegistry
import org.hibernate.event.spi.EventType
import org.hibernate.event.spi.FlushEntityEvent
import org.hibernate.event.spi.FlushEntityEventListener
import org.hibernate.integrator.spi.Integrator
import org.hibernate.service.spi.SessionFactoryServiceRegistry
import org.springframework.core.annotation.AnnotationUtils
import org.springframework.stereotype.Service
import org.springframework.util.ReflectionUtils.getUniqueDeclaredMethods
import java.lang.reflect.InvocationTargetException
import java.lang.reflect.Method
import java.util.concurrent.ConcurrentHashMap


@Target(
    AnnotationTarget.TYPE,
    AnnotationTarget.FUNCTION,
)
@Retention(AnnotationRetention.RUNTIME)
@Deprecated("Not working. to be deleted")
annotation class PreCollectionChange()

@Deprecated("Not working. to be deleted")
@Service
class IntegratorImpl : Integrator {
    private val preCollectionChangeMethods: MutableMap<Class<*>, List<Method>>

    override fun disintegrate(sessionFactory: SessionFactoryImplementor?, serviceRegistry: SessionFactoryServiceRegistry?) {

    }

    override fun integrate(metadata: Metadata?, sessionFactory: SessionFactoryImplementor, serviceRegistry: SessionFactoryServiceRegistry?) {
        val registry = sessionFactory.serviceRegistry.getService(EventListenerRegistry::class.java)
        registry.getEventListenerGroup(EventType.FLUSH_ENTITY).appendListener(PreCollectionChangeFlushEntityEventListener())
    }

    private inner class PreCollectionChangeFlushEntityEventListener : FlushEntityEventListener {
        override fun onFlushEntity(event: FlushEntityEvent) {
            val entityClass = event.entity.javaClass
            if (!preCollectionChangeMethods.containsKey(entityClass)) {
                val uniqueDeclaredMethods = getUniqueDeclaredMethods(entityClass)
                val methods = uniqueDeclaredMethods
                    .filter { method -> AnnotationUtils.findAnnotation(method, PreCollectionChange::class.java) != null }
                    .map { method ->
                        method.isAccessible = true
                        method
                    }

                // Place leaf methods in the end to correspond to constructors order.
                preCollectionChangeMethods[entityClass] = methods.reversed()
            }
            val methods = preCollectionChangeMethods[entityClass]!!
            for (method in methods) {
                try {
                    method.invoke(event.entity, null as Array<Any?>?)
                } catch (e: IllegalAccessException) {
                    throw CallbackException(e)
                } catch (e: InvocationTargetException) {
                    throw CallbackException(e)
                }
            }
        }
    }

    init {
        preCollectionChangeMethods = ConcurrentHashMap<Class<*>, List<Method>>()
    }
}