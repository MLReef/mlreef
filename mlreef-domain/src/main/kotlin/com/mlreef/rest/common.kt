package com.mlreef.rest

import java.time.ZoneId
import java.time.ZonedDateTime

object I18N {
    fun dateTime() = ZonedDateTime.now(ZoneId.of("UTC"))
}

enum class VisibilityScope {
    PRIVATE,
    PUBLIC,
    INTERNAL;

    fun toGitlabString(): String {
        return this.name.toLowerCase()
    }

    companion object {
        fun default(): VisibilityScope = PUBLIC
    }
}


interface EPFAnnotation


