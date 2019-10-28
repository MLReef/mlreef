package com.mlreef.rest


import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status


@RunWith(SpringRunner::class)
@SpringBootTest(classes = [RestApplication::class])
@AutoConfigureMockMvc
class AuthenticationSessionTest {

    @Autowired
    private val mockMvc: MockMvc? = null

    @Test
    @Throws(Exception::class)
    fun `allow unprotected endpoints`() {
        this.mockMvc!!.perform(get("/"))
                .andExpect(status().isOk)
    }

    @Test
    @Throws(Exception::class)
    fun `forbid protected endpoints`() {
        this.mockMvc!!.perform(get("/api/user"))
                .andExpect(status().isUnauthorized)
    }
}
