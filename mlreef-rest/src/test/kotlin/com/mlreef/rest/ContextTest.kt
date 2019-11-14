package com.mlreef.rest

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
class ContextTest {

    @Autowired
    lateinit var service: TestService


    @Test
    fun `context loads`() {
        assertThat(service).isNotNull
    }
}

