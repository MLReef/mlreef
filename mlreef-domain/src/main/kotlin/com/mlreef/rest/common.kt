package com.mlreef.rest

import java.time.ZoneId
import java.time.ZonedDateTime

object I18N {
    fun dateTime() = ZonedDateTime.now(ZoneId.of("UTC"))
}
