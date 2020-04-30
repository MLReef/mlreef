package com.mlreef.rest

import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.UUID

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

/**
 * Symbolize a Gitlab repository which is used in the context of MLReef.
 * Most properties are transient, semantic will be added
 */
interface MLProject {
    val slug: String
    val url: String
    val name: String
    val ownerId: UUID
    val gitlabGroup: String
    val gitlabPathWithNamespace: String
    val gitlabProject: String
    val gitlabId: Long
}


interface EPFAnnotation
