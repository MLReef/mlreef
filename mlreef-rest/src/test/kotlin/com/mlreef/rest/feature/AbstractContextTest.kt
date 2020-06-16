package com.mlreef.rest.feature

import com.mlreef.rest.AccountRepository
import com.mlreef.rest.ApplicationProfiles
import com.mlreef.rest.CodeProjectRepository
import com.mlreef.rest.DataProjectRepository
import com.mlreef.rest.external_api.gitlab.GitlabRestClient
import com.mlreef.rest.feature.caches.RedisPublicProjectsCacheService
import com.mlreef.rest.feature.caches.repositories.PublicProjectsRepository
import com.mlreef.rest.feature.system.MlReefSessionsService
import com.mlreef.rest.security.MlReefSessionRegistry
import com.mlreef.rest.testcommons.PropertiesReader
import com.ninjasquad.springmockk.MockkBean
import com.ninjasquad.springmockk.SpykBean
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import redis.embedded.RedisServer
import redis.embedded.RedisServerBuilder

@SpringBootTest
@ActiveProfiles(ApplicationProfiles.SPRING_CONTEXT_TEST)
@ExtendWith(value=[MockKExtension::class])
abstract class AbstractContextTest {
    companion object {
        protected lateinit var redisServer: RedisServer
        protected val propertyReader = PropertiesReader("application-spring-context-test.yml")

        @BeforeAll
        @JvmStatic
        fun setupGlobal() {
            redisServer = RedisServerBuilder().port(propertyReader.getProperty("spring.redis.port")?.toInt()).setting("maxmemory 256M").build()
            redisServer.start()
        }

        @AfterAll
        @JvmStatic
        fun tearDownGlobal() {
            redisServer.stop()
        }
    }

    @SpykBean
    protected lateinit var sessionService: MlReefSessionsService

    @Autowired
    protected lateinit var publicProjectsCacheService: RedisPublicProjectsCacheService

    @SpykBean
    protected lateinit var sessionRegistry: MlReefSessionRegistry

    @SpykBean
    protected lateinit var dataProjectRepository: DataProjectRepository

    @SpykBean
    protected lateinit var accountRepository: AccountRepository

    @SpykBean
    protected lateinit var publicProjectRepository: PublicProjectsRepository

    @MockkBean(relaxed = true)
    protected lateinit var gitlabRestClient: GitlabRestClient

    @SpykBean
    protected lateinit var codeProjectRepository: CodeProjectRepository

}

