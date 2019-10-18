package com.mlreef.rest

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

@Service
class TestService {

}
