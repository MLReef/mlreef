package com.mlreef.rest.api.v1

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/")
class RootController {
    @RequestMapping(method = [RequestMethod.GET, RequestMethod.POST])
    @ResponseStatus(HttpStatus.OK)
    fun makeRootRequest() {
        //Do nothing! The url is being requested by k8s for health-check
    }
}