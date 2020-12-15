package com.mlreef.rest.api.v1.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.mlreef.rest.external_api.gitlab.dto.Commit
import com.mlreef.rest.external_api.gitlab.dto.CommitStats
import java.time.ZonedDateTime

@JsonInclude(JsonInclude.Include.NON_NULL)
data class CommitDto(
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
    val stats: CommitStats? = null
)

fun Commit.toCommitDto() = CommitDto(
    authorEmail = this.authorEmail,
    authorName = this.authorName,
    authoredDate = this.authoredDate,
    committerEmail = this.committerEmail,
    committerName = this.committerName,
    committedDate = this.committedDate,
    title = this.title,
    message = this.message,
    id = this.id,
    shortId = this.shortId,
    status = this.status,
    stats = this.stats
)