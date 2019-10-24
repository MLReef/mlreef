package com.mlreef.rest

import com.mlreef.rest.config.AuthService
import com.mlreef.rest.external_api.gitlab.GitlabUserDetails
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Controller
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody

@Controller
class TestController {

    @RequestMapping("/")
    @ResponseBody
    fun greeting(): String {
        return "Hello World"
    }

}

@Controller
class UserController {

    @Autowired
    lateinit var authService: AuthService

    @RequestMapping("/api/user")
    fun userDetails(authenticator: Authentication): GitlabUserDetails {
        val user = authenticator.principal
        return user as GitlabUserDetails
    }
}

@Service
class TestService {

}
