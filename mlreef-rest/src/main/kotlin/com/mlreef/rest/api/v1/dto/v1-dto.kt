package com.mlreef.rest.api.v1.dto

import com.mlreef.rest.FileLocation
import com.mlreef.rest.I18N
import com.mlreef.rest.exceptions.RestException
import com.mlreef.rest.exceptions.ValidationException
import org.springframework.validation.FieldError
import java.time.LocalDateTime
import java.time.ZonedDateTime

data class RestExceptionDto(
    val errorCode: Int,
    val errorName: String,
    val errorMessage: String,
    val time: ZonedDateTime = I18N.dateTime()
) {
    constructor(
        restException: RestException,
        time: ZonedDateTime = I18N.dateTime()
    ) : this(
        restException.errorCode,
        restException.errorName,
        restException.message.orEmpty(),
        time
    )
}

// FIXME: Coverage says: missing tests
class ValidationFailureDto(
    val errorCode: Int,
    val errorName: String,
    val errorMessage: String,
    val validationErrors: Array<FieldError?>,
    val time: LocalDateTime = LocalDateTime.now()
) {
    constructor(
        restException: ValidationException,
        time: LocalDateTime = LocalDateTime.now()
    ) : this(
        restException.errorCode,
        restException.errorName,
        restException.message.orEmpty(),
        restException.validationErrors,
        time
    )
}


class FileLocationDto(
    val location: String,
    val locationType: String = "PATH"
) {
    constructor(location: String) : this(location, "PATH")
}

internal fun FileLocation.toDto(): FileLocationDto =
    FileLocationDto(
        location = this.location,
        locationType = this.locationType.name
    )

