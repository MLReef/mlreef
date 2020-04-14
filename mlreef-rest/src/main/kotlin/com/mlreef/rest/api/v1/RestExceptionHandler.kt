package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.RestExceptionDto
import com.mlreef.rest.api.v1.dto.ValidationFailureDto
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.exceptions.ValidationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus
import java.time.LocalDateTime


@ControllerAdvice
class RestExceptionHandler {

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFoundException(exception: NotFoundException): ResponseEntity<RestExceptionDto> {
        val error = RestExceptionDto(exception)
        return ResponseEntity(error, HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(RestException::class)
    fun handleException(exception: RestException): ResponseEntity<RestExceptionDto> {
        val error = RestExceptionDto(exception)
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    fun validationError(ex: MethodArgumentNotValidException): ValidationFailureDto {
        val result = ex.bindingResult
        val fieldErrors = result.fieldErrors
        val arrayOfFieldErrors = fieldErrors.toTypedArray() as Array<FieldError?>
        return ValidationFailureDto(ValidationException(arrayOfFieldErrors), LocalDateTime.now())
    }

}


