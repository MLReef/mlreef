package com.mlreef.rest.external_api.gitlab.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import java.io.Serializable
import java.time.ZonedDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class Commit(
    val authorEmail: String? = null,
    val authorName: String? = null,
    val authoredDate: ZonedDateTime? = null,
    val committerEmail: String? = null,
    val committerName: String? = null,
    val committedDate: ZonedDateTime? = null,
    val title: String = "",
    val message: String = "",
    val id: String = "",
    val shortId: String = "",
    val status: String? = null,
    val stats: CommitStats? = null,
    val lastPipeline: CommitLastPipeline? = null,
) : Serializable

@JsonIgnoreProperties(ignoreUnknown = true)
data class CommitLastPipeline(
    val id: Long,
    val ref: String,
    val sha: String,
    val status: String
)
