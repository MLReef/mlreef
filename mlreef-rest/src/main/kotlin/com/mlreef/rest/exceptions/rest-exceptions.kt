package com.mlreef.rest.exceptions

import org.springframework.http.HttpStatus
import org.springframework.validation.FieldError
import org.springframework.web.bind.annotation.ResponseStatus

enum class Error(val errorCode: Int, val errorName: String) {
    // authentication and general errors: 1xxx
    NotFound(1404, "Entity not found"),
    // specific user management errors 2xxx
    UserAlreadyExisting(2001, "User already exists"),
    UserNotExisting(2002, "User does not exist"),

    // Business errors: 3xxx
    ValidationFailed(3000, "ValidationFailed"),
    // Creating Experiments 31xx
    DataProcessorNotUsable(3101, "DataProcessor cannot be used"),
    ProcessorParameterNotUsable(3102, "ProcessorParameter cannot be used"),
}

@ResponseStatus(code = HttpStatus.BAD_REQUEST, reason = "Operation cannot be executed due to malformed input or invalid states.")
open class RestException(
    val errorCode: Int,
    val errorName: String,
    msg: String? = null,
    cause: Throwable? = null) : RuntimeException(msg, cause) {

    constructor(error: Error) : this(error.errorCode, error.errorName)
    constructor(error: Error, msg: String) : this(error.errorCode, error.errorName, msg)
}

class ValidationException(val validationErrors: Array<FieldError?>) : RestException(Error.ValidationFailed, validationErrors.joinToString("\n") { it.toString() })

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Entity not found")
class NotFoundException(message: String) : RestException(Error.NotFound, message)

class UserAlreadyExistsException(username: String, email: String) : RestException(Error.UserAlreadyExisting, "User ($username/$email) already exists and cant be created")
class UserNotExistsException(username: String, email: String) : RestException(Error.UserNotExisting, "User ($username/$email) does not exist")

class CreateExperimentException(error: Error, parameterName: String) : RestException(error, "Name/Slug: '$parameterName'")


