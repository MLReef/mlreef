package com.mlreef.rest.domain

import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import javax.persistence.Column
import javax.persistence.Embeddable

object defaults {
    fun branchName() = "master"
}

object I18N {
    fun dateTime() = ZonedDateTime.now(ZoneId.of("UTC"))
}

/**
 * Stores the information of a Gitlab Pipeline.
 * Dates are stored locally and most could be null.
 *
 * Has to store commit ref, branch, pipeline id (called job id here) and web url
 */
@Embeddable
data class PipelineJobInfo(
    @Column(name = "gitlab_id")
    var gitlabId: Long? = null,

    @Column(name = "gitlab_commit_sha")
    var commitSha: String,

    @Column(name = "gitlab_ref")
    var ref: String? = null,

    @Column(name = "gitlab_hash")
    var secret: String? = null,

    @Column(name = "gitlab_created_at")
    var createdAt: Instant? = null,

    @Column(name = "gitlab_updated_at")
    var updatedAt: Instant? = null,

    @Column(name = "gitlab_started_at")
    var startedAt: Instant? = null,

    @Column(name = "gitlab_committed_at")
    var committedAt: Instant? = null,

    @Column(name = "gitlab_finished_at")
    var finishedAt: Instant? = null
)





