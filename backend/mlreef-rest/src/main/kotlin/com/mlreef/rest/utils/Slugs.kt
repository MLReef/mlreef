package com.mlreef.rest.utils

object Slugs {
    const val MAX_SLUG_LENGTH = 40
    const val validPattern = """[a-z0-9\-+]{3,40}"""

    val validPatternRegex = validPattern.toRegex()
    val replacePatternRegexDash = """[^a-z0-9\-+]""".toRegex()

    fun isValid(string: String, maxLength: Int? = null): Boolean {
        val pattern = maxLength?.let { """[a-z0-9\-+]{3,$it}""" }?.toRegex() ?: validPatternRegex
        return pattern.matches(string)
    }

    fun toSlug(string: String, maxLength: Int? = null): String {
        return cutToValidLength(
            replacePatternRegexDash.replace(string.toLowerCase(), "-"),
            maxLength,
        )
    }

    fun cutToValidLength(slug: String, length: Int? = null): String {
        return if (slug.length > (length ?: MAX_SLUG_LENGTH)) slug.substring(0, (length ?: MAX_SLUG_LENGTH)) else slug
    }
}