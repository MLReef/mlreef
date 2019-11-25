package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.RestExceptionResponse
import com.mlreef.rest.exceptions.RestException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
import java.time.LocalDateTime

@ControllerAdvice
class RestExceptionHandler : ResponseEntityExceptionHandler() {

    @ExceptionHandler(RestException::class)
    fun handleException(exception: RestException): ResponseEntity<RestExceptionResponse> {
        val error = RestExceptionResponse(exception, LocalDateTime.now())
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

}


