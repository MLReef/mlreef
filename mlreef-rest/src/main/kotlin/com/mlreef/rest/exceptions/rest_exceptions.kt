package com.mlreef.rest.exceptions

enum class Error(val errorCode: Int, val errorName: String) {
    UserAlreadyExisting(2001, "User already exists"),
    UserNotExisting(2002, "User does not exist")
}

open class RestException(
    val errorCode: Int,
    val errorName: String,
    msg: String? = null,
    cause: Throwable? = null) : Throwable(msg, cause) {

    constructor(error: Error) : this(error.errorCode, error.errorName)
    constructor(error: Error, msg: String) : this(error.errorCode, error.errorName, msg)
}

class UserAlreadyExistsException(username: String, email: String) : RestException(Error.UserAlreadyExisting, "User ($username/$email) already exists and cant be created")
class UserNotExistsException(username: String, email: String) : RestException(Error.UserNotExisting, "User ($username/$email) does not exist")
