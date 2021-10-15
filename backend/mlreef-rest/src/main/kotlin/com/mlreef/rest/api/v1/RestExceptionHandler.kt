package com.mlreef.rest.api.v1

import com.mlreef.rest.api.v1.dto.RestExceptionDto
import com.mlreef.rest.api.v1.dto.ValidationFailureDto
import com.mlreef.rest.exceptions.BadRequestException
import com.mlreef.rest.exceptions.ConflictException
import com.mlreef.rest.exceptions.ErrorCode
import com.mlreef.rest.exceptions.ForbiddenContentException
import com.mlreef.rest.exceptions.NotFoundException
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.exceptions.ValidationException
import org.hibernate.exception.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.validation.FieldError
import org.springframework.web.HttpRequestMethodNotSupportedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.ResponseStatus
import java.time.LocalDateTime


@ControllerAdvice
class RestExceptionHandler(
    @Value("\${mlreef.system.debug:false}")
    private val debugMode: Boolean = false
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFoundException(exception: NotFoundException): ResponseEntity<RestExceptionDto> {
        val error = RestExceptionDto(exception)
        return ResponseEntity(error, HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolationException(exception: ConstraintViolationException): ResponseEntity<RestExceptionDto> {
        val error = RestExceptionDto(RestException(ErrorCode.Conflict, "Group already exists"))
        return ResponseEntity(error, HttpStatus.CONFLICT)
    }

    @ExceptionHandler(RestException::class)
    fun handleException(exception: RestException): ResponseEntity<RestExceptionDto> {
        val error = RestExceptionDto(exception)
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(BadRequestException::class)
    fun handleException(exception: BadRequestException): ResponseEntity<RestExceptionDto> {
        return ResponseEntity(RestExceptionDto(exception), HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(ConflictException::class)
    fun handleException(exception: ConflictException): ResponseEntity<RestExceptionDto> {
        return ResponseEntity(RestExceptionDto(exception), HttpStatus.CONFLICT)
    }

    @ExceptionHandler(ForbiddenContentException::class)
    fun handleException(exception: ForbiddenContentException): ResponseEntity<RestExceptionDto> {
        return ResponseEntity(RestExceptionDto(exception), HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS)
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

    @ExceptionHandler(value = [HttpMessageNotReadableException::class])
    fun handleRestRequestException(exception: HttpMessageNotReadableException): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)

        val msg = extractClassName(exception)
            ?: extractMissingFieldName(exception)
            ?: extractMissingBody(exception)
            ?: exception.cause?.message
            ?: exception.message
            ?: "Missing mandatory field"

        val restException = RestException(ErrorCode.BadParametersRequest.errorCode, HttpStatus.BAD_REQUEST.name, msg)

        val error = RestExceptionDto(restException)

        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(value = [HttpRequestMethodNotSupportedException::class])
    fun handleMethodNotSupportedException(exception: HttpRequestMethodNotSupportedException): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)
        val restException = RestException(ErrorCode.MethodNotSupportedError.errorCode, HttpStatus.METHOD_NOT_ALLOWED.name, exception.message)
        val error = RestExceptionDto(restException)
        return ResponseEntity(error, HttpStatus.METHOD_NOT_ALLOWED)
    }

    @ExceptionHandler(Exception::class)
    fun handleException(exception: Exception): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)
        val messageToShow = if (debugMode) {
            exception.printStackTrace()
            exception.message ?: exception.localizedMessage
        } else "Internal server error"
        val restException = RestException(ErrorCode.InternalError.errorCode, HttpStatus.INTERNAL_SERVER_ERROR.name, messageToShow)
        val error = RestExceptionDto(restException)
        return ResponseEntity(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException::class)
    fun handleBadCredentialsException(exception: org.springframework.security.authentication.BadCredentialsException): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)
        val restException = RestException(ErrorCode.UserBadCredentials.errorCode, HttpStatus.UNAUTHORIZED.name, "Bad credentials or user not found")
        val error = RestExceptionDto(restException)
        return ResponseEntity(error, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(value = [AccessDeniedException::class])
    fun handleAccessDeniedException(exception: AccessDeniedException): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)
        val restException = RestException(ErrorCode.AccessDenied.errorCode, HttpStatus.FORBIDDEN.name, exception.message)
        val error = RestExceptionDto(restException)
        return ResponseEntity(error, HttpStatus.FORBIDDEN)
    }

    @ExceptionHandler(value = [com.mlreef.rest.exceptions.AccessDeniedException::class])
    fun handleAccessDeniedException(exception: com.mlreef.rest.exceptions.AccessDeniedException): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)
        val restException = RestException(ErrorCode.AccessDenied.errorCode, HttpStatus.FORBIDDEN.name, exception.message)
        val error = RestExceptionDto(restException)
        return ResponseEntity(error, HttpStatus.FORBIDDEN)
    }

    @ExceptionHandler(value = [org.springframework.security.access.AccessDeniedException::class])
    fun handleAccessDeniedException(exception: org.springframework.security.access.AccessDeniedException): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)
        val restException = RestException(ErrorCode.AccessDenied.errorCode, HttpStatus.FORBIDDEN.name, exception.localizedMessage)
        val error = RestExceptionDto(restException)
        return ResponseEntity(error, HttpStatus.FORBIDDEN)
    }

    @ExceptionHandler(value = [DataIntegrityViolationException::class])
    fun handleDbConstraintsException(exception: DataIntegrityViolationException): ResponseEntity<RestExceptionDto> {
        log.error(exception.message)
        val restException = RestException(ErrorCode.Conflict.errorCode, HttpStatus.CONFLICT.name, "Violation exception: already exists")
        val error = RestExceptionDto(restException)
        return ResponseEntity(error, HttpStatus.CONFLICT)
    }

    //--------------------------------------------

    private fun extractClassName(exception: Exception): String? {
        val message = exception.cause?.message ?: exception.message
        val classPosition = message?.indexOf("(class")
        return classPosition?.takeIf { it >= 0 }?.let {
            message.substring(0, it)
        }
    }

    private fun extractMissingFieldName(exception: Exception): String? {
        val fieldStartText = "for JSON property"
        val message = exception.cause?.message ?: exception.message
        val fieldNamePositionStart = message?.indexOf(fieldStartText) ?: -1
        val fieldNamePositionEnd = if (fieldNamePositionStart >= 0) {
            message?.indexOf("due", fieldNamePositionStart + fieldStartText.length) ?: -1
        } else {
            -1
        }
        return if (fieldNamePositionStart >= 0 && fieldNamePositionEnd >= 0) {
            val fieldName = message?.substring(fieldNamePositionStart + fieldStartText.length, fieldNamePositionEnd)
            "Missing mandatory field $fieldName"
        } else null
    }

    private fun extractMissingBody(exception: Exception): String? {
        val searchText = "body is missing"
        val message = exception.cause?.message ?: exception.message
        return message?.indexOf(searchText)?.takeIf { it >= 0 }?.let { "Request body is missing" }
    }
}


