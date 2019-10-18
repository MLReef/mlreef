package com.mlreef.rest

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
class TestServiceTest {

    @Autowired
    lateinit var service: TestService

    @SpringBootApplication
    open class TestConfiguration {

    }

    @Test
    fun `context loads`() {
        assertThat(service).isNotNull()
    }
}
