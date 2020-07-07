package com.mlreef.rest.config.http

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.session.FindByIndexNameSessionRepository
import org.springframework.session.Session
import org.springframework.session.data.redis.MlReefSessionsRepository
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession
import org.springframework.session.web.context.AbstractHttpSessionApplicationInitializer

@Configuration
@EnableRedisHttpSession
class SessionConfig(
    private val sessionRepository: FindByIndexNameSessionRepository<out Session>
) : AbstractHttpSessionApplicationInitializer() {

    @Bean("mlreefSessionRepository")
    @Primary
    fun sessionRepository(): FindByIndexNameSessionRepository<out Session> {
        return MlReefSessionsRepository(sessionRepository)
    }
}
