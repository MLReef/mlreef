package com.mlreef.rest.config

import java.util.UUID

fun String?.censor(): String? {
    if (this == null)
        return null
    val censoringShortener = 3
    return if (this.length >= censoringShortener) {
        val censoringBegin = this.length / censoringShortener
        this.replaceRange(censoringBegin, this.length - 1, "*****")
    } else {
        "**"
    }
}

fun String?.tryToUUID(): UUID? {
    return this?.let {
        try {
            UUID.fromString(it)
        } catch (ex: Exception) {
            null
        }
    }
}





