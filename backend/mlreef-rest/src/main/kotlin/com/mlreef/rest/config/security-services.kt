package com.mlreef.rest.config

import java.util.UUID
import kotlin.random.Random

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

fun String?.maskSecret(showFirst: Int = 3, showLast: Int = 3, randomMaskLength: Boolean = true): String? {
    if (this == null)
        return null

    if (this.length <= (showFirst + showLast)) return randomizeMaskLength("*".repeat(this.length), randomMaskLength)

    val firstStr = if (this.length > showFirst) this.substring(0, showFirst) else "*".repeat(this.length)
    val lastStr = if (this.length >= (showFirst + showLast)) this.substring(this.length - showLast, this.length) else "*".repeat(firstStr.length - this.length)
    val middle = if (this.length > (showFirst + showLast)) "*".repeat(this.length - (showFirst + showLast)) else ""

    return "$firstStr${randomizeMaskLength(middle, randomMaskLength)}$lastStr"
}

private fun randomizeMaskLength(mask: String, randomMaskLength: Boolean): String {
    if (!randomMaskLength || mask.length <= 3) return mask

    val newMaskLength = Random.nextInt(mask.length / 2, mask.length + mask.length / 2)

    return "*".repeat(newMaskLength)
}



