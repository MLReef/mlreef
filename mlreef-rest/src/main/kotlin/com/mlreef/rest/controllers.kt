package com.mlreef.rest

import com.mlreef.rest.config.AuthService
import com.mlreef.rest.external_api.gitlab.TokenDetails
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Controller
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@Controller
class TestController {

    @RequestMapping("/")
    @ResponseBody
    fun greeting(): String {
        return "Hello World"
    }

}

@RestController
class UserController {

    @Autowired
    lateinit var authService: AuthService

    @GetMapping("/api/user", produces = ["application/json"])
    @ResponseBody
    fun userDetails(authenticator: Authentication): TokenDetails {
        val user = authenticator.principal
        return user as TokenDetails
    }
}

@Service
class TestService {

}
