package com.mlreef.rest

import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.*

object I18N {
    fun dateTime() = ZonedDateTime.now(ZoneId.of("UTC"))
}

enum class VisibilityScope {
    PRIVATE,
    PUBLIC,
    TEAM;

    companion object {
        fun default(): VisibilityScope = TEAM
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
    val gitlabId: Int
}


interface EPFAnnotation
